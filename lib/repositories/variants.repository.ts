import { createClient } from "@/lib/supabase/server";
import { ProductVariant, VariantPriceTier } from "@/lib/types/database";

export interface VariantWithTiers extends ProductVariant {
  price_tiers: VariantPriceTier[];
}

export async function getProductVariants(productId: string): Promise<VariantWithTiers[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(`
      *,
      variant_price_tiers(*)
    `)
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch variants: ${error.message}`);
  }

  return (data || []).map((v) => {
    const rawTiers = (v.variant_price_tiers as VariantPriceTier[]) || [];
    const sortedTiers = [...rawTiers].sort((a, b) => a.min_qty - b.min_qty);
    return {
      ...v,
      price_tiers: sortedTiers,
    };
  });
}

export async function saveVariantWithTiers(
  variant: {
    id?: string;
    product_id: string;
    variant_name: string;
    description?: string | null;
    sku?: string | null;
    is_default?: boolean;
    display_order?: number;
  },
  tiers: Array<{
    id?: string;
    min_qty: number;
    max_qty: number | null;
    price_per_unit: number;
    lead_time_days?: string | null;
    discount_label?: string | null;
    display_order?: number;
  }>
): Promise<ProductVariant> {
  const supabase = await createClient();
  let variantId = variant.id;

  if (variantId) {
    const { error } = await supabase
      .from("product_variants")
      .update({
        variant_name: variant.variant_name,
        description: variant.description || null,
        sku: variant.sku || null,
        is_default: variant.is_default ?? false,
        display_order: variant.display_order ?? 0,
      })
      .eq("id", variantId);

    if (error) throw new Error(`Failed to update variant: ${error.message}`);
  } else {
    const { data: newVar, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: variant.product_id,
        variant_name: variant.variant_name,
        description: variant.description || null,
        sku: variant.sku || null,
        is_default: variant.is_default ?? false,
        display_order: variant.display_order ?? 0,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create variant: ${error.message}`);
    variantId = newVar.id;
  }

  // Delete old tiers and insert updated tiers
  await supabase.from("variant_price_tiers").delete().eq("variant_id", variantId);

  if (tiers.length > 0) {
    const tierRows = tiers.map((t, idx) => ({
      variant_id: variantId,
      min_qty: t.min_qty,
      max_qty: t.max_qty,
      price_per_unit: t.price_per_unit,
      lead_time_days: t.lead_time_days || null,
      discount_label: t.discount_label || null,
      display_order: t.display_order ?? idx,
    }));

    const { error: tierError } = await supabase.from("variant_price_tiers").insert(tierRows);
    if (tierError) throw new Error(`Failed to save price tiers: ${tierError.message}`);
  }

  const { data: result } = await supabase
    .from("product_variants")
    .select()
    .eq("id", variantId)
    .single();

  return result;
}

export async function deleteVariant(variantId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) throw new Error(`Failed to delete variant: ${error.message}`);
}
