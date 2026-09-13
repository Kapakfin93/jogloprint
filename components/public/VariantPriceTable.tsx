import { VariantPriceTier } from "@/lib/types/database";
import { formatCurrency } from "@/lib/services/pricing.service";

interface VariantPriceTableProps {
  readonly tiers: VariantPriceTier[];
  readonly unitLabel?: string | null;
}

export default function VariantPriceTable({
  tiers,
  unitLabel = "lembar",
}: VariantPriceTableProps) {
  const safeUnit = unitLabel || "lembar";

  if (!tiers || tiers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        Belum ada tabel tier harga untuk varian ini. Silakan hubungi CS untuk informasi harga.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Tabel Harga Grosir (Makin Banyak, Makin Hemat)
        </span>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          💰 Tier Grosir Aktif
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="grid grid-cols-4 bg-slate-100/80 py-2.5 px-4 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
          <div>Kuantitas</div>
          <div>Harga / {safeUnit}</div>
          <div>Estimasi Waktu</div>
          <div className="text-right">Keterangan</div>
        </div>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          {tiers.map((t, idx) => {
            const isLowestPrice = idx === tiers.length - 1;
            const isPopular = idx === Math.floor(tiers.length / 2);

            let qtyLabel = `${t.min_qty} - ${t.max_qty} ${safeUnit}`;
            if (!t.max_qty) {
              qtyLabel = `> ${t.min_qty} ${safeUnit}`;
            }

            return (
              <div
                key={t.id}
                className={`grid grid-cols-4 py-3 px-4 items-center transition-colors ${
                  isPopular
                    ? "bg-amber-50/50 hover:bg-amber-50"
                    : isLowestPrice
                    ? "bg-emerald-50/30 hover:bg-emerald-50/60"
                    : "hover:bg-slate-50/80"
                }`}
              >
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>{qtyLabel}</span>
                  {isPopular && (
                    <span className="hidden sm:inline-block text-[10px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded-md">
                      Favorit
                    </span>
                  )}
                </div>

                <div className={`font-extrabold ${isLowestPrice ? "text-emerald-700" : isPopular ? "text-amber-700" : "text-slate-900"}`}>
                  {formatCurrency(t.price_per_unit)}
                </div>

                <div className="text-slate-600 text-xs">
                  {t.lead_time_days || "1 - 2 Hari"}
                </div>

                <div className="text-right text-xs font-semibold">
                  {t.discount_label ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {t.discount_label}
                    </span>
                  ) : isLowestPrice ? (
                    <span className="text-emerald-700 font-bold">Harga Terbaik</span>
                  ) : (
                    <span className="text-slate-400 font-normal">Standar</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-50 p-3 px-4 text-[11px] text-slate-500 border-t border-slate-200/80 flex items-center gap-1.5">
          <span>ℹ️</span>
          <span>Harga di atas sudah termasuk cetak resolusi tinggi dan finishing potong otomatis.</span>
        </div>
      </div>
    </div>
  );
}
