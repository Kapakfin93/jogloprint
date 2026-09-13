import { getCategories } from "@/lib/repositories/categories.repository";
import CategoryList from "@/components/admin/CategoryList";

export const dynamic = "force-dynamic";

export default async function AdminKategoriPage() {
  const categories = await getCategories();

  return <CategoryList initialCategories={categories} />;
}
