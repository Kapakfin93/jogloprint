import Link from "next/link";
import { CategoryShowcase as CategoryShowcaseType } from "@/lib/repositories/catalog.repository";
import ProductCard from "./ProductCard";

interface CategoryShowcaseProps {
  readonly showcase: CategoryShowcaseType;
}

export default function CategoryShowcase({ showcase }: CategoryShowcaseProps) {
  return (
    <section className="w-full py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Category Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200/90 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              🏷️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {showcase.name}
              </h2>
              {showcase.description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {showcase.description}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/kategori/${showcase.slug}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition group self-start sm:self-auto"
          >
            <span>Lihat Semua Produk</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Product Cards Grid (Top 4 Preview) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {showcase.products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  );
}
