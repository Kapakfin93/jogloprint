import { getHomeShowcaseCategories } from "@/lib/repositories/catalog.repository";
import { getCategories } from "@/lib/repositories/categories.repository";
import { getBusinessInfo } from "@/lib/repositories/business-info.repository";
import { getActiveBanners } from "@/lib/repositories/home-banners.repository";
import PublicHeader from "@/components/public/PublicHeader";
import HomeHero from "@/components/public/HomeHero";
import HomeCategoryIcons from "@/components/public/HomeCategoryIcons";
import HomeHowToOrder from "@/components/public/HomeHowToOrder";
import CategoryShowcase from "@/components/public/CategoryShowcase";
import PublicFooter from "@/components/public/PublicFooter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [showcases, allCategories, businessInfo, banners] = await Promise.all([
    getHomeShowcaseCategories(),
    getCategories(),
    getBusinessInfo(),
    getActiveBanners(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <PublicHeader businessInfo={businessInfo} categories={allCategories} />
        <main className="pt-28 sm:pt-28">
          <HomeHero businessInfo={businessInfo} banners={banners} />
          <HomeCategoryIcons categories={allCategories.filter((c) => c.is_active)} />
          <HomeHowToOrder />
          <div id="katalog-produk" className="space-y-6 pt-2 pb-10">
            {showcases.length === 0 ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                Belum ada produk aktif di katalog. Silakan input produk lewat Admin Panel.
              </div>
            ) : (
              showcases.map((sc) => (
                <CategoryShowcase key={sc.id} showcase={sc} />
              ))
            )}
          </div>
        </main>
      </div>
      <PublicFooter businessInfo={businessInfo} categories={allCategories} />
    </div>
  );
}