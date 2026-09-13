import { notFound } from "next/navigation";
import { getProductById } from "@/lib/repositories/products.repository";
import { getProductAddons } from "@/lib/repositories/addons.repository";
import AddonManager from "@/components/admin/AddonManager";

export const dynamic = "force-dynamic";

interface AdminAddonPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function AdminAddonPage({ params }: AdminAddonPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const addons = await getProductAddons(id);

  return (
    <div className="space-y-6">
      <AddonManager product={product} addons={addons} />
    </div>
  );
}
