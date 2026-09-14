"use server";

import {
  createBanner,
  updateBanner,
  deleteBanner,
} from "@/lib/repositories/home-banners.repository";
import { revalidatePath } from "next/cache";

export interface BannerActionResult {
  success: boolean;
  error?: string;
}

export async function saveBannerAction(formData: FormData): Promise<BannerActionResult> {
  try {
    const id = formData.get("id") as string | null;
    const image_url = (formData.get("image_url") as string)?.trim();
    const link_url = (formData.get("link_url") as string)?.trim() || "/";
    const alt_text = (formData.get("alt_text") as string)?.trim() || "Banner Joglo Print";
    const display_order = Number.parseInt((formData.get("display_order") as string) || "0", 10);
    const is_active = formData.get("is_active") === "true";

    if (!image_url) return { success: false, error: "URL gambar banner wajib diisi" };

    if (id && id.trim() !== "") {
      await updateBanner(id, { image_url, link_url, alt_text, display_order, is_active });
    } else {
      await createBanner({ image_url, link_url, alt_text, display_order, is_active });
    }

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan banner";
    return { success: false, error: message };
  }
}

export async function deleteBannerAction(id: string): Promise<BannerActionResult> {
  try {
    if (!id) return { success: false, error: "ID banner tidak valid" };
    await deleteBanner(id);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus banner";
    return { success: false, error: message };
  }
}
