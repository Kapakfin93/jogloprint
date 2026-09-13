"use server";

import {
  saveVariantWithTiers,
  deleteVariant,
} from "@/lib/repositories/variants.repository";
import { FormTierItem } from "@/components/admin/VariantPriceTierEditor";
import { revalidatePath } from "next/cache";

export interface VariantActionResult {
  success: boolean;
  error?: string;
}

export async function saveVariantAction(payload: {
  id?: string;
  product_id: string;
  variant_name: string;
  description?: string | null;
  sku?: string | null;
  is_default?: boolean;
  display_order?: number;
  tiers: FormTierItem[];
}): Promise<VariantActionResult> {
  try {
    const {
      id,
      product_id,
      variant_name,
      description,
      sku,
      is_default = false,
      display_order = 0,
      tiers = [],
    } = payload;

    if (!variant_name || variant_name.trim() === "") {
      return { success: false, error: "Nama varian finishing wajib diisi" };
    }
    if (!product_id) {
      return { success: false, error: "ID Produk wajib ada" };
    }

    // Validate tiers
    for (const t of tiers) {
      if (t.min_qty < 1) {
        return { success: false, error: "Min Qty pada tier harus minimal 1" };
      }
      if (t.price_per_unit < 0) {
        return { success: false, error: "Harga satuan tidak boleh negatif" };
      }
    }

    await saveVariantWithTiers(
      {
        id,
        product_id,
        variant_name: variant_name.trim(),
        description: description || null,
        sku: sku || null,
        is_default,
        display_order,
      },
      tiers
    );

    revalidatePath(`/admin/produk/${product_id}/varian`);
    revalidatePath("/admin/produk");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan varian";
    return { success: false, error: message };
  }
}

export async function deleteVariantAction(
  productId: string,
  variantId: string
): Promise<VariantActionResult> {
  try {
    if (!variantId) {
      return { success: false, error: "ID Varian tidak valid" };
    }

    await deleteVariant(variantId);
    revalidatePath(`/admin/produk/${productId}/varian`);
    revalidatePath("/admin/produk");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus varian";
    return { success: false, error: message };
  }
}
