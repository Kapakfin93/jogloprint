import Link from "next/link";
import { ProductPreviewItem } from "@/lib/repositories/catalog.repository";
import { formatCurrency } from "@/lib/services/pricing.service";
import { getThumbnailUrl } from "@/lib/services/image-url.service";

interface ProductCardProps {
  readonly product: ProductPreviewItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const finishingSummary = product.variant_names.length > 0
    ? product.variant_names.join(" • ")
    : "Pilihan Finishing Tersedia";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Product Image Thumbnail */}
        <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden">
          {product.primary_image_url ? (
            <img
              src={getThumbnailUrl(product.primary_image_url, 500)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
              <span className="text-3xl mb-1">🖼️</span>
              <span className="text-xs font-semibold">Joglo Print</span>
            </div>
          )}
          <span className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            Pilihan UMKM Terpopuler
          </span>
        </div>

        {/* Product Meta */}
        <div className="p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 line-clamp-1">
            <span className="text-emerald-600">✂️</span>
            <span>{finishingSummary}</span>
          </p>

          {/* Pricing Banner "Mulai Dari" */}
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl mb-1">
            <span className="text-[11px] text-slate-500 font-medium block">
              Mulai dari
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-amber-600">
                {product.lowest_price !== null ? formatCurrency(product.lowest_price) : "Hubungi CS"}
              </span>
              {product.unit_label && (
                <span className="text-[11px] text-slate-500 font-medium">
                  / {product.unit_label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Button Action */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
        <Link
          href={`/produk/${product.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-colors shadow-xs"
        >
          <span>Lihat Detail Produk</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
