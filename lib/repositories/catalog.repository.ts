import { createClient } from "@/lib/supabase/server";
import { getLowestPriceFromVariants } from "@/lib/services/pricing.service";
import { Category } from "@/lib/types/database";

export interface ProductPreviewItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  unit_label: string | null;
  category_id: string;
  category_name: string;
  category_slug: string;
  primary_image_url: string | null;
  lowest_price: number | null;
  variant_names: string[];
}

export interface CategoryShowcase {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  products: ProductPreviewItem[];
}

interface RawProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  unit_label: string | null;
  display_order: number;
  is_active: boolean;
  product_images: Array<{ image_url: string; is_primary: boolean; display_order: number }>;
  product_variants: Array<{
    id: string;
    variant_name: string;
    display_order: number;
    variant_price_tiers: Array<{ price_per_unit: number }>;
  }>;
}

function mapProductToPreview(p: RawProductData, cat: { id: string; name: string; slug: string }): ProductPreviewItem {
  const sortedImages = [...(p.product_images || [])].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });
  const primaryImageUrl = sortedImages[0]?.image_url || null;

  const lowestPrice = getLowestPriceFromVariants(p.product_variants);
  const variantNames = (p.product_variants || [])
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((v) => v.variant_name);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    unit_label: p.unit_label || null,
    category_id: cat.id,
    category_name: cat.name,
    category_slug: cat.slug,
    primary_image_url: primaryImageUrl,
    lowest_price: lowestPrice,
    variant_names: variantNames,
  };
}

/**
 * Fetch active categories with preview products for the Homepage.
 */
export async function getHomeShowcaseCategories(): Promise<CategoryShowcase[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      display_order,
      is_active,
      products (
        id,
        name,
        slug,
        description,
        unit_label,
        display_order,
        is_active,
        product_images (image_url, is_primary, display_order),
        product_variants (id, variant_name, display_order, variant_price_tiers(price_per_unit))
      )
    `)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch home showcase categories:", error);
    return [];
  }

  const result: CategoryShowcase[] = [];

  for (const cat of data || []) {
    const rawProducts = (cat.products || []) as unknown as RawProductData[];
    const activeProducts = rawProducts
      .filter((p) => p.is_active)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

    if (activeProducts.length === 0) continue;

    const previewProducts = activeProducts.slice(0, 4).map((p) => mapProductToPreview(p, cat));

    result.push({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      display_order: cat.display_order,
      products: previewProducts,
    });
  }

  return result;
}

/**
 * Fetch all active products for a specific category page (/kategori/[slug])
 */
export async function getCategoryPageData(slug: string): Promise<{
  category: Category;
  products: ProductPreviewItem[];
} | null> {
  const supabase = await createClient();

  const { data: cat, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      pricing_engine,
      addon_selection_mode,
      cover_image_url,
      icon_url,
      display_order,
      is_active,
      created_at,
      updated_at,
      products (
        id,
        name,
        slug,
        description,
        unit_label,
        display_order,
        is_active,
        product_images (image_url, is_primary, display_order),
        product_variants (id, variant_name, display_order, variant_price_tiers(price_per_unit))
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !cat) {
    return null;
  }

  const rawProducts = (cat.products || []) as unknown as RawProductData[];
  const activeProducts = rawProducts
    .filter((p) => p.is_active)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const previewProducts = activeProducts.map((p) => mapProductToPreview(p, cat));

  return {
    category: {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      pricing_engine: cat.pricing_engine || "sheet",
      addon_selection_mode: cat.addon_selection_mode || "single",
      cover_image_url: cat.cover_image_url,
      icon_url: cat.icon_url ?? null,
      display_order: cat.display_order,
      is_active: cat.is_active,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
    },
    products: previewProducts,
  };
}
