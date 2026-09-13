import { createClient } from "@/lib/supabase/server";
import { Product, ProductImage, ProductAddon, VariantPriceTier, ProductVariant } from "@/lib/types/database";
import { getLowestPriceFromVariants } from "@/lib/services/pricing.service";

export interface VariantDetailItem extends ProductVariant {
  price_tiers: VariantPriceTier[];
}

export interface ProductDetailPageData {
  product: Product;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImage[];
  variants: VariantDetailItem[];
  addons: ProductAddon[];
  lowest_price: number | null;
}

/**
 * Fetch complete product detail data including images, variants with price tiers, and addons by product slug
 */
export async function getProductDetailPageData(slug: string): Promise<ProductDetailPageData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories!inner(id, name, slug),
      product_images(*),
      product_variants(
        *,
        variant_price_tiers(*)
      ),
      product_addons(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  const rawImages = (data.product_images || []) as ProductImage[];
  const images = [...rawImages].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const rawVariants = (data.product_variants || []) as Array<ProductVariant & { variant_price_tiers?: VariantPriceTier[] }>;
  const variants: VariantDetailItem[] = rawVariants
    .sort((a, b) => a.display_order - b.display_order)
    .map((v) => {
      const rawTiers = v.variant_price_tiers || [];
      const sortedTiers = [...rawTiers].sort((a, b) => a.min_qty - b.min_qty);
      return {
        ...v,
        price_tiers: sortedTiers,
      };
    });

  const rawAddons = (data.product_addons || []) as ProductAddon[];
  const addons = [...rawAddons].sort((a, b) => a.display_order - b.display_order);

  const lowestPrice = getLowestPriceFromVariants(variants);

  const categoryObj = data.categories as unknown as { id: string; name: string; slug: string };

  const product: Product = {
    id: data.id,
    category_id: data.category_id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    unit_label: data.unit_label || null,
    pricing_model: data.pricing_model || "sheet",
    min_order_qty: data.min_order_qty ?? 1.0,
    specifications: Array.isArray(data.specifications) ? data.specifications : [],
    display_order: data.display_order,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  return {
    product,
    category: categoryObj,
    images,
    variants,
    addons,
    lowest_price: lowestPrice,
  };
}
