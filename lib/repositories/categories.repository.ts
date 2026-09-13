import { createClient } from "@/lib/supabase/server";
import { Category } from "@/lib/types/database";

export interface CategoryWithStats extends Category {
  products_count?: number;
}

export async function getCategories(): Promise<CategoryWithStats[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return (data || []).map((item) => {
    const rawProducts = item.products as unknown as Array<{ count: number }> | undefined;
    const count = rawProducts && rawProducts.length > 0 ? rawProducts[0].count : 0;
    return {
      ...item,
      products_count: count,
    };
  });
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch category by ID: ${error.message}`);
  }
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch category by slug: ${error.message}`);
  }
  return data;
}

export async function createCategory(category: {
  slug: string;
  name: string;
  description?: string | null;
  pricing_engine?: string;
  cover_image_url?: string | null;
  display_order?: number;
  is_active?: boolean;
}): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }
  return data;
}

export async function updateCategory(
  id: string,
  category: Partial<{
    slug: string;
    name: string;
    description: string | null;
    pricing_engine: string;
    cover_image_url: string | null;
    display_order: number;
    is_active: boolean;
  }>
): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }
  return data;
}

export async function toggleCategoryActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle category status: ${error.message}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503" || error.message.includes("violates foreign key constraint")) {
      throw new Error(
        "Kategori tidak dapat dihapus karena masih memuat produk. Pindahkan atau hapus produk di dalamnya terlebih dahulu."
      );
    }
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}
