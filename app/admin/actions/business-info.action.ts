"use server";

import { updateBusinessInfo } from "@/lib/repositories/business-info.repository";
import { revalidatePath } from "next/cache";

export interface BusinessInfoActionResult {
  success: boolean;
  error?: string;
}

export async function saveBusinessInfoAction(
  formData: FormData
): Promise<BusinessInfoActionResult> {
  try {
    const id = formData.get("id") as string;
    if (!id) {
      return { success: false, error: "ID Business Info tidak ditemukan" };
    }

    const name = (formData.get("name") as string)?.trim();
    const tagline = (formData.get("tagline") as string)?.trim() || null;
    const address = (formData.get("address") as string)?.trim();
    const city = (formData.get("city") as string)?.trim() || "Demak";
    const postal_code = (formData.get("postal_code") as string)?.trim() || "59571";
    const whatsapp_number = (formData.get("whatsapp_number") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim() || null;
    const email = (formData.get("email") as string)?.trim() || null;
    const google_maps_url = (formData.get("google_maps_url") as string)?.trim() || null;

    if (!name || !address || !whatsapp_number) {
      return {
        success: false,
        error: "Nama bisnis, alamat workshop, dan nomor WhatsApp wajib diisi",
      };
    }

    // Parse opening hours per day
    const days = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];

    const opening_hours: Record<string, string> = {};
    for (const day of days) {
      const val = formData.get(`hours_${day}`) as string;
      opening_hours[day] = val?.trim() || "08:00 - 02:00 WIB";
    }

    // Parse shipping coverage (multi-line text)
    const rawCoverage = (formData.get("shipping_coverage") as string) || "";
    const shipping_coverage = rawCoverage
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    await updateBusinessInfo(id, {
      name,
      tagline,
      address,
      city,
      postal_code,
      whatsapp_number,
      phone,
      email,
      opening_hours,
      shipping_coverage,
      google_maps_url,
    });

    revalidatePath("/admin/info-bisnis");
    revalidatePath("/");
    revalidatePath("/kategori/[slug]", "page");
    revalidatePath("/produk/[slug]", "page");

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan info bisnis";
    return { success: false, error: message };
  }
}
