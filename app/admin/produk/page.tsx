import { getProducts } from "@/lib/repositories/products.repository";
import { getCategories } from "@/lib/repositories/categories.repository";
import ProductList from "@/components/admin/ProductList";

export const dynamic = "force-dynamic";

interface AdminProdukPageProps {
  readonly searchParams: Promise<{ category?: string }>;
}

export default async function AdminProdukPage({ searchParams }: AdminProdukPageProps) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductList
      initialProducts={products}
      categories={categories}
      initialCategoryFilter={category || "ALL"}
    />
  );
}
