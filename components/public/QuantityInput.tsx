interface QuantityInputProps {
  readonly qty: number;
  readonly unitLabel?: string | null;
  readonly minQty?: number | null;
  readonly step?: number | null;
  readonly onChangeQty: (newQty: number) => void;
}

export default function QuantityInput({
  qty,
  unitLabel = "lembar",
  minQty = 1,
  step = 1,
  onChangeQty,
}: QuantityInputProps) {
  const safeUnit = unitLabel || "lembar";
  const effectiveMin = Math.max(1, minQty || 1);
  const effectiveStep = Math.max(1, step || 1);

  let presets = [5, 10, 50, 100];
  if (effectiveMin >= 50) {
    presets = [50, 100, 200, 500];
  } else if (effectiveMin >= 25) {
    presets = [25, 50, 100, 250];
  }

  function handleDecrement() {
    onChangeQty(Math.max(effectiveMin, qty - effectiveStep));
  }

  function handleIncrement() {
    onChangeQty(qty + effectiveStep);
  }

  function handleManualChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(val) || val < effectiveMin) {
      onChangeQty(effectiveMin);
    } else {
      onChangeQty(val);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label htmlFor="quantity-input" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
          <span>3. Jumlah Pesanan ({safeUnit})</span>
          <span className="text-red-500">*</span>
        </label>
        <span className="text-xs font-bold text-slate-500">
          Qty: <strong className="text-amber-700">{qty}</strong> {safeUnit}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Counter controls */}
        <div className="flex items-center rounded-2xl border border-slate-300 bg-white p-1 shadow-xs max-w-xs">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={qty <= effectiveMin}
            aria-label="Kurangi kuantitas"
            className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center transition disabled:opacity-40"
          >
            −
          </button>
          <input
            id="quantity-input"
            type="number"
            min={effectiveMin}
            step={effectiveStep}
            value={qty}
            onChange={handleManualChange}
            className="w-20 text-center font-black text-lg text-slate-900 focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={handleIncrement}
            aria-label="Tambah kuantitas"
            className="h-10 w-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg flex items-center justify-center transition shadow-xs"
          >
            +
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Pilih Cepat:</span>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChangeQty(p)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition border ${
                qty === p
                  ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              {p} {safeUnit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
