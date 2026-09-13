"use client";

import { calculateAreaM2 } from "@/lib/services/pricing.service";

interface DimensionInputProps {
  readonly lengthCm: number;
  readonly widthCm: number;
  readonly qty: number;
  readonly minAreaM2?: number;
  readonly onChangeLength: (val: number) => void;
  readonly onChangeWidth: (val: number) => void;
  readonly onChangeQty: (val: number) => void;
}

const COMMON_PRESETS = [
  { label: "1 x 1 m", l: 100, w: 100 },
  { label: "2 x 1 m", l: 200, w: 100 },
  { label: "3 x 1 m", l: 300, w: 100 },
  { label: "1.5 x 1.5 m", l: 150, w: 150 },
  { label: "2 x 3 m", l: 200, w: 300 },
];

export default function DimensionInput({
  lengthCm,
  widthCm,
  qty,
  minAreaM2 = 1.0,
  onChangeLength,
  onChangeWidth,
  onChangeQty,
}: DimensionInputProps) {
  const rawArea = calculateAreaM2(lengthCm, widthCm);
  const isBelowMin = rawArea > 0 && rawArea < minAreaM2;

  function handleLength(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number.parseFloat(e.target.value);
    onChangeLength(Number.isNaN(val) ? 0 : Math.max(0, val));
  }

  function handleWidth(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number.parseFloat(e.target.value);
    onChangeWidth(Number.isNaN(val) ? 0 : Math.max(0, val));
  }

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Ukuran & Kuantitas Cetak (Meteran / m²)
        </label>
        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
          Hitungan Luas Area (cm)
        </span>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] text-slate-500 font-medium mr-1">Preset Cepat:</span>
        {COMMON_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              onChangeLength(p.l);
              onChangeWidth(p.w);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
              lengthCm === p.l && widthCm === p.w
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Inputs for Length & Width in CM */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dim-length" className="block text-xs font-semibold text-slate-600 mb-1">
            Panjang (cm)
          </label>
          <div className="relative">
            <input
              id="dim-length"
              type="number"
              min="10"
              max="10000"
              step="1"
              value={lengthCm || ""}
              onChange={handleLength}
              placeholder="150"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">cm</span>
          </div>
        </div>

        <div>
          <label htmlFor="dim-width" className="block text-xs font-semibold text-slate-600 mb-1">
            Lebar / Tinggi (cm)
          </label>
          <div className="relative">
            <input
              id="dim-width"
              type="number"
              min="10"
              max="10000"
              step="1"
              value={widthCm || ""}
              onChange={handleWidth}
              placeholder="100"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">cm</span>
          </div>
        </div>
      </div>

      {/* Quantity & Area Summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/60">
        <div>
          <label htmlFor="dim-qty" className="block text-xs font-semibold text-slate-600 mb-1">
            Jumlah Spanduk (Pcs)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeQty(Math.max(1, qty - 1))}
              className="h-9 w-9 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
            >
              -
            </button>
            <input
              id="dim-qty"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => onChangeQty(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
              className="w-16 h-9 rounded-lg border border-slate-300 bg-white text-center text-sm font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onChangeQty(qty + 1)}
              className="h-9 w-9 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
            >
              +
            </button>
            <span className="text-xs font-semibold text-slate-500">pcs</span>
          </div>
        </div>

        {/* Live Area Calculator Badge */}
        <div className="bg-white rounded-xl p-2.5 border border-amber-200 text-right flex flex-col justify-center">
          <div className="text-[11px] text-slate-500">Total Luas per Pcs:</div>
          <div className="text-sm font-black text-amber-700">
            {rawArea.toFixed(2)} m²
            {isBelowMin && (
              <span className="block text-[10px] font-normal text-amber-600">
                (Minimal hitung {minAreaM2.toFixed(2)} m²)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
