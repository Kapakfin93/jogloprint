import { formatCurrency } from "@/lib/services/pricing.service";

interface OrderPriceSummaryProps {
  readonly unitPrice: number;
  readonly addonFlat: number;
  readonly qty: number;
  readonly totalPerUnit: number;
  readonly grandTotal: number;
  readonly unitLabel?: string | null;
  readonly leadTimeDays?: string | null;
}

export default function OrderPriceSummary({
  unitPrice,
  addonFlat,
  qty,
  totalPerUnit,
  grandTotal,
  unitLabel = "lembar",
  leadTimeDays,
}: OrderPriceSummaryProps) {
  const safeUnit = unitLabel || "lembar";

  return (
    <div className="rounded-3xl bg-slate-900 text-white p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 block">
            Estimasi Biaya Transparan
          </span>
          <h4 className="text-base sm:text-lg font-extrabold text-white">
            Ringkasan Total Harga
          </h4>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Estimasi Selesai</span>
          <span className="text-xs font-bold text-emerald-400">
            ⏱️ {leadTimeDays || "1 - 2 Hari"}
          </span>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 text-xs sm:text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Harga Dasar Tier ({qty} {safeUnit}):</span>
          <span className="font-semibold text-white">{formatCurrency(unitPrice)} / {safeUnit}</span>
        </div>

        {addonFlat > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Biaya Tambahan Add-on:</span>
            <span className="font-semibold text-emerald-400">+{formatCurrency(addonFlat)} / {safeUnit}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Harga Bersih / {safeUnit}:</span>
          <span className="font-bold text-amber-300">{formatCurrency(totalPerUnit)} / {safeUnit}</span>
        </div>
      </div>

      {/* Grand Total Highlight */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
            Total Biaya Cetak ({qty} {safeUnit})
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
            {formatCurrency(grandTotal)}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl">
          {qty} {safeUnit} × {formatCurrency(totalPerUnit)}
        </span>
      </div>
    </div>
  );
}
