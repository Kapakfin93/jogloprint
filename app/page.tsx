import { getHomeShowcaseCategories } from "@/lib/repositories/catalog.repository";
import { getCategories } from "@/lib/repositories/categories.repository";
import { getBusinessInfo } from "@/lib/repositories/business-info.repository";
import PublicHeader from "@/components/public/PublicHeader";
import HomeHero from "@/components/public/HomeHero";
import HomeHowToOrder from "@/components/public/HomeHowToOrder";
import CategoryShowcase from "@/components/public/CategoryShowcase";
import PublicFooter from "@/components/public/PublicFooter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [showcases, allCategories, businessInfo] = await Promise.all([
    getHomeShowcaseCategories(),
    getCategories(),
    getBusinessInfo(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        {/* Header & Sticky Nav */}
        <PublicHeader businessInfo={businessInfo} categories={allCategories} />

        {/* Main Content Area (padding-top for fixed header) */}
        <main className="pt-20 sm:pt-28">
          {/* Hero Section */}
          <HomeHero businessInfo={businessInfo} />

          {/* Quick How to Order Steps */}
          <HomeHowToOrder />

          {/* Catalog Showcase per Category */}
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

      {/* Footer */}
      <PublicFooter businessInfo={businessInfo} categories={allCategories} />
    </div>
  );
}
