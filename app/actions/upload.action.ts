"use server";

import { uploadProductImage, UploadImageResult } from "@/lib/services/cloudinary.service";

export interface UploadActionResult {
  success: boolean;
  data?: UploadImageResult;
  error?: string;
}

/**
 * Server Action for admin file upload
 * Processes multipart FormData server-side with signed credentials
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

    const result = await uploadProductImage(buffer, subfolder);

    return {
      success: true,
      data: result,
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
