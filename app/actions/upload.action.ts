"use server";

import crypto from "node:crypto";
import { uploadProductImage, UploadImageResult } from "@/lib/services/cloudinary.service";
import { createClient } from "@/lib/supabase/server";

export interface UploadActionResult {
  success: boolean;
  data?: UploadImageResult;
  file_hash?: string;
  duplicate_warning?: string;
  error?: string;
}

/**
 * Server Action for admin file upload
 * Calculates SHA-256 hash before Cloudinary upload and checks for duplicates across products
 */
export async function uploadImageAction(formData: FormData): Promise<UploadActionResult> {
  try {
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("folder") as string) || "products";

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed" };
    }

    // Max 10MB file size
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Image size exceeds 10MB limit" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Calculate SHA-256 hash of file content
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 2. Check for duplicate image across all products
    let duplicateWarning: string | undefined;
    try {
      let supabase;
      try {
        supabase = await createClient();
      } catch {
        const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
        supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
      }

      const { data: existingImages } = await supabase
        .from("product_images")
        .select("product_id, products(name)")
        .eq("file_hash", fileHash)
        .limit(1);

      if (existingImages && existingImages.length > 0) {
        const prod = existingImages[0] as unknown as { products: { name: string } | null };
        const prodName = prod?.products?.name || "produk lain";
        duplicateWarning = `Foto ini kemungkinan duplikat dari produk "${prodName}"`;
      }
    } catch (checkErr) {
      console.warn("Failed to check duplicate image hash:", checkErr);
    }

    // 3. Upload to Cloudinary
    const result = await uploadProductImage(buffer, subfolder);

    return {
      success: true,
      data: result,
      file_hash: fileHash,
      duplicate_warning: duplicateWarning,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload action error:", error);
    return {
      success: false,
      error: message,
    };
  }
}

