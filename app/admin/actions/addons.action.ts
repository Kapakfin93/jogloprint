"use server";

import { revalidatePath } from "next/cache";
import { saveAddon, deleteAddon } from "@/lib/repositories/addons.repository";

/**
 * Server Actions for Product Add-ons (Layer 1 - Controller)
 */

export interface SaveAddonInput {
  id?: string;
  product_id: string;
  name: string;
  description?: string | null;
  price_flat: number;
  is_default: boolean;
  display_order: number;
}

export async function saveAddonAction(input: SaveAddonInput) {
  try {
    if (!input.name || input.name.trim() === "") {
      return { success: false, error: "Nama add-on wajib diisi" };
    }

    if (input.price_flat < 0) {
      return { success: false, error: "Harga tambahan tidak boleh negatif" };
    }

    const saved = await saveAddon(input);

    revalidatePath(`/admin/produk/${input.product_id}/addon`);
    revalidatePath(`/admin/produk/${input.product_id}/varian`);
    revalidatePath("/admin/produk");

    return { success: true, data: saved };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan add-on";
    return { success: false, error: message };
  }
}

export async function deleteAddonAction(productId: string, addonId: string) {
  try {
    await deleteAddon(addonId);

    revalidatePath(`/admin/produk/${productId}/addon`);
    revalidatePath("/admin/produk");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus add-on";
    return { success: false, error: message };
  }
}
