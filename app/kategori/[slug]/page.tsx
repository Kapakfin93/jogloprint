import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryPageData } from "@/lib/repositories/catalog.repository";
import { getCategories } from "@/lib/repositories/categories.repository";
import { getBusinessInfo } from "@/lib/repositories/business-info.repository";
import PublicHeader from "@/components/public/PublicHeader";
import ProductCard from "@/components/public/ProductCard";
import PublicFooter from "@/components/public/PublicFooter";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryPageData(slug);
  if (!data) return {};

  const { category } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jogloweb.vercel.app";
  const title = `${category.name} Demak — Percetakan Murah & Cepat`;
  const description = category.description
    ? `${category.description.slice(0, 145)}...`
    : `Layanan cetak ${category.name} murah, cepat, dan berkualitas di Demak. Pesan online via WhatsApp di Joglo Print.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/kategori/${slug}`,
    },
    openGraph: {
      title: `${category.name} Demak | Joglo Print`,
      description,
      url: `${siteUrl}/kategori/${slug}`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [data, allCategories, businessInfo] = await Promise.all([
    getCategoryPageData(slug),
    getCategories(),
    getBusinessInfo(),
  ]);

  if (!data) {
    notFound();
  }

  const { category, products } = data;
  const waNumber = businessInfo?.whatsapp_number || "6281390286826";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jogloweb.vercel.app";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", url: siteUrl },
          { name: "Kategori", url: `${siteUrl}/#katalog-produk` },
          { name: category.name, url: `${siteUrl}/kategori/${slug}` },
        ]}
      />
      <div>
        {/* Header */}
        <PublicHeader businessInfo={businessInfo} categories={allCategories} />

        <main className="pt-28 sm:pt-28 pb-16">
          {/* Breadcrumbs & Category Header */}
          <section className="bg-white border-b border-slate-200/90 py-8 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
                <Link href="/" className="hover:text-amber-600 transition-colors">
                  Beranda
                </Link>
                <span>/</span>
                <span className="text-slate-400">Kategori</span>
                <span>/</span>
                <span className="text-amber-700">{category.name}</span>
              </nav>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    <span>🏷️</span>
                    <span>Katalog Kategori</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200">
                    {products.length} Produk Tersedia
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Product Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {products.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <span className="text-4xl mb-3 block">📦</span>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Belum Ada Produk di Kategori Ini
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Produk untuk kategori {category.name} sedang dalam proses persiapan oleh tim Joglo Print.
                </p>
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau tanya pesanan cetak untuk kategori " + category.name + "...")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <span>💬</span>
                  <span>Tanya CS via WhatsApp</span>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}

            {/* Custom Order Callout Banner */}
            <div className="mt-12 rounded-3xl bg-linear-to-r from-amber-700 via-amber-800 to-amber-900 p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold">
                  Butuh Ukuran, Bahan, atau Finishing Khusus?
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl leading-relaxed">
                  Konsultasikan spesifikasi cetak custom Anda secara langsung dengan customer service kami.
                </p>
              </div>
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau konsultasi cetak custom untuk kategori " + category.name + "...")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white text-amber-900 px-5 py-3 text-xs sm:text-sm font-bold shadow-md hover:bg-amber-50 transition"
              >
                <span>💬</span>
                <span>Konsultasi Custom WA</span>
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <PublicFooter businessInfo={businessInfo} categories={allCategories} />
    </div>
  );
}
