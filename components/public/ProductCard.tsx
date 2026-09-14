import Link from "next/link";
import { ProductPreviewItem } from "@/lib/repositories/catalog.repository";
import { formatCurrency } from "@/lib/services/pricing.service";
import { getThumbnailUrl } from "@/lib/services/image-url.service";

interface ProductCardProps {
  readonly product: ProductPreviewItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const finishingSummary =
    product.variant_names.length > 0
      ? product.variant_names.join(" - ")
      : "Pilihan Finishing Tersedia";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {product.primary_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
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
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
            <span className="text-emerald-600">✓</span>
            <span>{finishingSummary}</span>
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-100 px-2.5 py-2 rounded-xl">
          <span className="text-[10px] text-slate-500 font-medium block leading-none mb-0.5">
            Mulai dari
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-amber-600 leading-none">
              {product.lowest_price !== null
                ? formatCurrency(product.lowest_price)
                : "Hubungi CS"}
            </span>
            {product.unit_label && (
              <span className="text-[10px] text-slate-500 font-medium">
                / {product.unit_label}
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/produk/${product.slug}`}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors shadow-xs"
        >
          <span>Lihat Detail</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}