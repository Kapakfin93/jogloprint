import { createClient } from "@/lib/supabase/server";
import { HomeBanner } from "@/lib/types/database";

/** Fetch only active banners ordered for public homepage display */
export async function getActiveBanners(): Promise<HomeBanner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw new Error(`Failed to fetch banners: ${error.message}`);
  return data || [];
}

/** Fetch all banners (for admin panel) */
export async function getAllBanners(): Promise<HomeBanner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banners")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw new Error(`Failed to fetch all banners: ${error.message}`);
  return data || [];
}

export async function createBanner(banner: {
  image_url: string;
  link_url?: string;
  alt_text?: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<HomeBanner> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banners")
    .insert(banner)
    .select()
    .single();

  if (error) throw new Error(`Failed to create banner: ${error.message}`);
  return data;
}

export async function updateBanner(
  id: string,
  banner: Partial<{
    image_url: string;
    link_url: string;
    alt_text: string;
    display_order: number;
    is_active: boolean;
  }>
): Promise<HomeBanner> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banners")
    .update({ ...banner, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update banner: ${error.message}`);
  return data;
}

export async function deleteBanner(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("home_banners").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete banner: ${error.message}`);
}
