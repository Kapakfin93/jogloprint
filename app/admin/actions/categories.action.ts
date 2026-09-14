"use server";

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/repositories/categories.repository";
import { slugify } from "@/lib/services/slug.service";
import { revalidatePath } from "next/cache";

export interface CategoryActionResult {
  success: boolean;
  error?: string;
}

export async function saveCategoryAction(
  formData: FormData
): Promise<CategoryActionResult> {
  try {
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const rawSlug = formData.get("slug") as string;
    const description = (formData.get("description") as string) || null;
    const pricing_engine = (formData.get("pricing_engine") as string) || "sheet";
    const cover_image_url = (formData.get("cover_image_url") as string) || null;
    const icon_url = (formData.get("icon_url") as string) || null;
    const display_order = parseInt((formData.get("display_order") as string) || "0", 10);
    const is_active = formData.get("is_active") === "true";

    if (!name || name.trim() === "") {
      return { success: false, error: "Nama kategori wajib diisi" };
    }

    const slug = rawSlug && rawSlug.trim() !== "" ? slugify(rawSlug) : slugify(name);

    if (id && id.trim() !== "") {
      await updateCategory(id, {
        name,
        slug,
        description,
        pricing_engine,
        cover_image_url,
        icon_url,
        display_order,
        is_active,
      });
    } else {
      await createCategory({
        name,
        slug,
        description,
        pricing_engine,
        cover_image_url,
        icon_url,
        display_order,
        is_active,
      });
    }

    revalidatePath("/admin/kategori");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan kategori";
    return { success: false, error: message };
  }
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean): Promise<CategoryActionResult> {
  try {
    if (!id) {
      return { success: false, error: "ID Kategori tidak valid" };
    }

    const { toggleCategoryActive } = await import("@/lib/repositories/categories.repository");
    await toggleCategoryActive(id, isActive);

    revalidatePath("/admin/kategori");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengubah status aktif kategori";
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  try {
    if (!id) {
      return { success: false, error: "ID Kategori tidak valid" };
    }

    await deleteCategory(id);
    revalidatePath("/admin/kategori");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus kategori";
    return { success: false, error: message };
  }
}
