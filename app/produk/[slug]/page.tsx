import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductDetailPageData } from "@/lib/repositories/product-detail.repository";
import { getCategories } from "@/lib/repositories/categories.repository";
import { getBusinessInfo } from "@/lib/repositories/business-info.repository";
import PublicHeader from "@/components/public/PublicHeader";
import ProductGallery from "@/components/public/ProductGallery";
import ProductDetailClient from "@/components/public/ProductDetailClient";
import ProductYieldGuide from "@/components/public/ProductYieldGuide";
import ProductSpecs from "@/components/public/ProductSpecs";
import PublicFooter from "@/components/public/PublicFooter";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  readonly params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const [data, allCategories, businessInfo] = await Promise.all([
    getProductDetailPageData(slug),
    getCategories(),
    getBusinessInfo(),
  ]);

  if (!data) {
    notFound();
  }

  const { product, category, images, variants, lowest_price } = data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        {/* Header */}
        <PublicHeader businessInfo={businessInfo} categories={allCategories} />

        <main className="pt-20 sm:pt-28 pb-16">
          {/* Breadcrumb Navigation Strip */}
          <div className="bg-white border-b border-slate-200/90 py-3 mb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
                <Link href="/" className="hover:text-amber-600 transition-colors">
                  Beranda
                </Link>
                <span>/</span>
                <Link href={`/kategori/${category.slug}`} className="hover:text-amber-600 transition-colors">
                  {category.name}
                </Link>
                <span>/</span>
                <span className="text-amber-700 font-bold">{product.name}</span>
              </nav>
            </div>
          </div>

          {/* Main Product Layout (2 Columns) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column: Product Visual Studio (5 cols) */}
              <div className="lg:col-span-5">
                <ProductGallery productName={product.name} images={images} />
              </div>

              {/* Right Column: Spec & Interactive Finishing Selector (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Product Title & Description Cluster */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold w-fit border border-amber-200">
                    <span>★</span>
                    <span>Pilihan UMKM Terpopuler</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {product.name}
                  </h1>
                  {product.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Client Component: Finishing Selector, Add-on Selector, Live Calculator & WhatsApp CTA */}
                <ProductDetailClient
                  productName={product.name}
                  productSlug={product.slug}
                  pricingModel={product.pricing_model}
                  minOrderQty={product.min_order_qty}
                  variants={variants}
                  addons={data.addons}
                  unitLabel={product.unit_label}
                  lowestPrice={lowest_price}
                  whatsappNumber={businessInfo?.whatsapp_number}
                />
              </div>
            </div>
          </div>

          {/* Section: Practical Sticker Yield Guide (Stiker Kemasan) */}
          <ProductYieldGuide />

          {/* Section: Detailed Structured Specifications (2 Kolom) */}
          <ProductSpecs
            productName={product.name}
            specifications={product.specifications}
          />
        </main>
      </div>

      {/* Footer */}
      <PublicFooter businessInfo={businessInfo} categories={allCategories} />
    </div>
  );
}
