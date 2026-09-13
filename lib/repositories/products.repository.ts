import { createClient } from "@/lib/supabase/server";
import { Product, ProductImage, ProductSpecificationItem } from "@/lib/types/database";

export interface ProductWithDetails extends Product {
  category_name?: string;
  category_slug?: string;
  images?: ProductImage[];
  primary_image_url?: string | null;
}

export async function getProducts(categoryId?: string): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(`
      *,
      categories!inner(name, slug),
      product_images(id, image_url, alt_text, is_primary, display_order)
    `)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return (data || []).map((item) => {
    const raw = item as unknown as Record<string, unknown>;
    const images: ProductImage[] = (raw.product_images as ProductImage[]) || [];
    const categoriesObj = raw.categories as { name?: string; slug?: string } | undefined;
    const primary = images.find((img) => img.is_primary) || images[0] || null;

    return {
      id: item.id,
      category_id: item.category_id,
      slug: item.slug,
      name: item.name,
      description: item.description,
      unit_label: item.unit_label ?? null,
      pricing_model: item.pricing_model || "sheet",
      min_order_qty: item.min_order_qty ?? 1.0,
      specifications: Array.isArray(item.specifications) ? item.specifications : [],
      display_order: item.display_order,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      category_name: categoriesObj?.name,
      category_slug: categoriesObj?.slug,
      images,
      primary_image_url: primary ? primary.image_url : null,
    };
  });
}

export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories!inner(name, slug),
      product_images(id, image_url, alt_text, is_primary, display_order)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch product by ID: ${error.message}`);
  }

  const images: ProductImage[] = data.product_images || [];
  const primary = images.find((img) => img.is_primary) || images[0] || null;

  return {
    ...data,
    specifications: Array.isArray(data.specifications) ? data.specifications : [],
    category_name: data.categories?.name,
    category_slug: data.categories?.slug,
    images,
    primary_image_url: primary ? primary.image_url : null,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories!inner(name, slug),
      product_images(id, image_url, alt_text, is_primary, display_order)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch product by slug: ${error.message}`);
  }

  const images: ProductImage[] = data.product_images || [];
  const primary = images.find((img) => img.is_primary) || images[0] || null;

  return {
    ...data,
    specifications: Array.isArray(data.specifications) ? data.specifications : [],
    category_name: data.categories?.name,
    category_slug: data.categories?.slug,
    images,
    primary_image_url: primary ? primary.image_url : null,
  };
}

export async function createProduct(product: {
  category_id: string;
  slug: string;
  name: string;
  description?: string | null;
  unit_label?: string | null;
  pricing_model?: string;
  min_order_qty?: number | null;
  specifications?: ProductSpecificationItem[] | null;
  display_order?: number;
  is_active?: boolean;
}): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
  return data;
}

export async function updateProduct(
  id: string,
  product: Partial<{
    category_id: string;
    slug: string;
    name: string;
    description: string | null;
    unit_label: string | null;
    pricing_model: string;
    min_order_qty: number | null;
    specifications: ProductSpecificationItem[] | null;
    display_order: number;
    is_active: boolean;
  }>
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_product_admin", { p_id: id });

  if (error) {
    // Fallback to direct delete if RPC not available
    const { error: fallbackError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (fallbackError) {
      throw new Error(`Failed to delete product: ${fallbackError.message}`);
    }
  }
}

/**
 * High-performance atomic product duplicate via PostgreSQL stored procedure (RPC)
 */
export async function duplicateProduct(
  sourceId: string,
  newName?: string,
  newSlug?: string
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("duplicate_product", {
    source_id: sourceId,
    p_name: newName || null,
    p_slug: newSlug || null,
  });

  if (error) {
    throw new Error(`Failed to duplicate product: ${error.message}`);
  }

  return data as string;
}

