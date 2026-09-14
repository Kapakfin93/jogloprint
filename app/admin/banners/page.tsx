import { getAllBanners } from "@/lib/repositories/home-banners.repository";
import BannersAdminClient from "@/components/admin/BannersAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await getAllBanners();
  return <BannersAdminClient initialBanners={banners} />;
}
