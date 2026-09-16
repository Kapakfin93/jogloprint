"use server";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
} from "@/lib/repositories/products.repository";
import { syncProductImages } from "@/lib/repositories/product-images.repository";
import { slugify } from "@/lib/services/slug.service";
import { ProductSpecificationItem } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

export interface ProductActionResult {
  success: boolean;
  error?: string;
  productId?: string;
}

export async function saveProductAction(payload: {
  id?: string;
  category_id: string;
  name: string;
  slug?: string;
  description?: string | null;
  unit_label?: string | null;
  pricing_model?: string;
  min_order_qty?: number | null;
  specifications?: ProductSpecificationItem[];
  display_order?: number;
  is_active?: boolean;
  images?: Array<{
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
    display_order: number;
    file_hash?: string | null;
  }>;
}): Promise<ProductActionResult> {
  try {
    const {
      id,
      category_id,
      name,
      slug: rawSlug,
      description,
      unit_label,
      pricing_model = "sheet",
      min_order_qty = 1.0,
      specifications = [],
      display_order = 0,
      is_active = true,
      images = [],
    } = payload;

    if (!name || name.trim() === "") {
      return { success: false, error: "Nama produk wajib diisi" };
    }
    if (!category_id) {
      return { success: false, error: "Kategori wajib dipilih" };
    }

    const slug = rawSlug && rawSlug.trim() !== "" ? slugify(rawSlug) : slugify(name);

    let savedProductId = id;

    if (id && id.trim() !== "") {
      await updateProduct(id, {
        category_id,
        name,
        slug,
        description: description || null,
        unit_label: unit_label?.trim() || null,
        pricing_model,
        min_order_qty,
        specifications,
        display_order,
        is_active,
      });
    } else {
      const created = await createProduct({
        category_id,
        name,
        slug,
        description: description || null,
        unit_label: unit_label?.trim() || null,
        pricing_model,
        min_order_qty,
        specifications,
        display_order,
        is_active,
      });
      savedProductId = created.id;
    }

    // Sync product images
    if (savedProductId) {
      await syncProductImages(savedProductId, images);
    }

    revalidatePath("/admin/produk");
    revalidatePath(`/admin/produk/${savedProductId}/varian`);
    revalidatePath("/admin/kategori");
    revalidatePath("/");

    return { success: true, productId: savedProductId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan produk";
    return { success: false, error: message };
  }
}

export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  try {
    if (!id) {
      return { success: false, error: "ID Produk tidak valid" };
    }

    await deleteProduct(id);
    revalidatePath("/admin/produk");
    revalidatePath("/admin/kategori");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus produk";
    return { success: false, error: message };
  }
}

export async function duplicateProductAction(
  sourceId: string,
  newName?: string,
  newSlug?: string
): Promise<ProductActionResult> {
  try {
    if (!sourceId) {
      return { success: false, error: "ID Produk sumber tidak valid" };
    }

    const newId = await duplicateProduct(sourceId, newName, newSlug);

    revalidatePath("/admin/produk");
    revalidatePath("/admin/kategori");
    return { success: true, productId: newId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menduplikasi produk";
    return { success: false, error: message };
  }
}

export async function toggleProductActiveAction(id: string, isActive: boolean): Promise<ProductActionResult> {
  try {
    if (!id) {
      return { success: false, error: "ID Produk tidak valid" };
    }

    const { toggleProductActive } = await import("@/lib/repositories/products.repository");
    await toggleProductActive(id, isActive);

    revalidatePath("/admin/produk");
    revalidatePath("/admin/kategori");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengubah status aktif produk";
    return { success: false, error: message };
  }
}

