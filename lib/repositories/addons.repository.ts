import { createClient, requireAdminMutationClient } from "@/lib/supabase/server";
import { ProductAddon } from "@/lib/types/database";

/**
 * Repository for managing product addons (Data Layer)
 */

export async function getProductAddons(productId: string): Promise<ProductAddon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_addons")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true })
    .order("price_flat", { ascending: true });

  if (error) {
    console.error("Error fetching product addons:", error);
    return [];
  }

  return data as ProductAddon[];
}

export async function saveAddon(input: {
  id?: string;
  product_id: string;
  name: string;
  description?: string | null;
  price_flat: number;
  is_default: boolean;
  display_order: number;
}): Promise<ProductAddon> {
  const supabase = await requireAdminMutationClient();

  // If this addon is set as default, unset other defaults for this product
  if (input.is_default) {
    await supabase
      .from("product_addons")
      .update({ is_default: false })
      .eq("product_id", input.product_id);
  }

  const payload = {
    product_id: input.product_id,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    price_flat: Number(input.price_flat) || 0,
    is_default: Boolean(input.is_default),
    display_order: Number(input.display_order) || 0,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("product_addons")
      .update(payload)
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ProductAddon;
  }

  const { data, error } = await supabase
    .from("product_addons")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ProductAddon;
}

export async function deleteAddon(id: string): Promise<void> {
  const supabase = await requireAdminMutationClient();
  const { error } = await supabase.from("product_addons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
