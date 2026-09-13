import { createClient } from "@/lib/supabase/server";
import { ProductImage } from "@/lib/types/database";

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch product images: ${error.message}`);
  }
  return data || [];
}

export async function addProductImage(
  productId: string,
  imageUrl: string,
  altText?: string,
  isPrimary = false,
  displayOrder = 0
): Promise<ProductImage> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      alt_text: altText || null,
      is_primary: isPrimary,
      display_order: displayOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add product image: ${error.message}`);
  }
  return data;
}

export async function syncProductImages(
  productId: string,
  images: Array<{
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
    display_order: number;
  }>
): Promise<void> {
  const supabase = await createClient();
  
  // Delete existing images for this product
  await supabase.from("product_images").delete().eq("product_id", productId);

  if (images.length === 0) return;

  const rows = images.map((img, idx) => ({
    product_id: productId,
    image_url: img.image_url,
    alt_text: img.alt_text || null,
    is_primary: img.is_primary ?? idx === 0,
    display_order: img.display_order ?? idx,
  }));

  const { error } = await supabase.from("product_images").insert(rows);
  if (error) {
    throw new Error(`Failed to sync product images: ${error.message}`);
  }
}

export async function deleteProductImageRecord(imageId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    throw new Error(`Failed to delete product image record: ${error.message}`);
  }
}
