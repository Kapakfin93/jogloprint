import { createClient } from "@/lib/supabase/server";

export interface SitemapItem {
  slug: string;
  updated_at: string | null;
}

export async function getSitemapData(): Promise<{
  categories: SitemapItem[];
  products: SitemapItem[];
}> {
  const supabase = await createClient();

  const [categoriesRes, productsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true),
    supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true),
  ]);

  return {
    categories: (categoriesRes.data || []) as SitemapItem[],
    products: (productsRes.data || []) as SitemapItem[],
  };
}
