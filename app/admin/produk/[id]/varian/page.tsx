import { getProductById } from "@/lib/repositories/products.repository";
import { getProductVariants } from "@/lib/repositories/variants.repository";
import VariantManager from "@/components/admin/VariantManager";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function AdminProductVariantsPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const variants = await getProductVariants(id);

  return <VariantManager product={product} variants={variants} />;
}
