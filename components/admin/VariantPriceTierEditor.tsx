"use client";

export interface FormTierItem {
  id?: string;
  min_qty: number;
  max_qty: number | null;
  price_per_unit: number;
  lead_time_days: string;
  discount_label: string;
  display_order: number;
}

interface VariantPriceTierEditorProps {
  readonly tiers: FormTierItem[];
  readonly onChange: (tiers: FormTierItem[]) => void;
  readonly pricingModel?: string;
  readonly unitLabel?: string;
}

export default function VariantPriceTierEditor({
  tiers,
  onChange,
  pricingModel = "sheet",
  unitLabel,
}: VariantPriceTierEditorProps) {
  const isArea = pricingModel === "area";
  const isMeterLari = pricingModel === "meter_lari";
  const isBundle = pricingModel === "bundle";

  const safeUnit = unitLabel ? unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1) : "Lembar";
  let qtyHeader = `Qty (${safeUnit})`;
  let priceHeader = `Harga per ${safeUnit} (Rp)`;
  let helperText = unitLabel
    ? `Tier grosir berlaku per kuantitas ${unitLabel} produk.`
    : "Tier grosir berlaku per kuantitas lembar A3+ / pcs produk.";

  if (isArea) {
    qtyHeader = "Qty (Pcs)";
    priceHeader = "Harga per m² (Rp)";
    helperText = "Kolom harga adalah tarif per meter persegi (m²). Tier berlaku per jumlah pcs pesanan.";
  } else if (isMeterLari) {
    qtyHeader = "Panjang (Meter)";
    priceHeader = "Harga per Meter (Rp)";
    helperText = "Kolom harga adalah tarif per 1 meter panjang kain. Tier berlaku per kuantitas panjang meter pesanan.";
  } else if (isBundle) {
    qtyHeader = "Qty (Buku/Rim)";
    priceHeader = "Harga per Buku/Rim (Rp)";
    helperText = "Tier grosir berlaku per jumlah buku / rim cetak.";
  }

  function handleAddRow() {
    const lastTier = tiers[tiers.length - 1];
    const nextMin = lastTier && lastTier.max_qty ? lastTier.max_qty + 1 : (lastTier ? lastTier.min_qty + 50 : 1);
    const nextTier: FormTierItem = {
      min_qty: nextMin,
      max_qty: null,
      price_per_unit: lastTier ? Math.max(0, lastTier.price_per_unit - 500) : 5000,
      lead_time_days: "1 Hari",
      discount_label: "",
      display_order: tiers.length,
    };
    onChange([...tiers, nextTier]);
  }

  function handleRemoveRow(index: number) {
    onChange(tiers.filter((_, i) => i !== index));
  }

  function handleChange<K extends keyof FormTierItem>(
    index: number,
    field: K,
    val: FormTierItem[K]
  ) {
    const updated = tiers.map((t, i) => {
      if (i === index) {
        return { ...t, [field]: val };
      }
      return t;
    });
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tabel Tier Harga Grosir
          </label>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">
            💡 {helperText}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition border border-amber-200 shrink-0"
        >
          + Tambah Tier Qty
        </button>
      </div>

      {tiers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
          Belum ada tier harga. Klik <strong>+ Tambah Tier Qty</strong> untuk menambahkan baris harga.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Min {qtyHeader}</th>
                <th className="px-3 py-2">Max {qtyHeader}</th>
                <th className="px-3 py-2">{priceHeader}</th>
                <th className="px-3 py-2">Estimasi</th>
                <th className="px-3 py-2">Label Diskon</th>
                <th className="px-2 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 bg-white">
              {tiers.map((tier, idx) => (
                <tr key={idx}>
                  <td className="px-2.5 py-2">
                    <input
                      type="number"
                      min={1}
                      value={tier.min_qty}
                      onChange={(e) => handleChange(idx, "min_qty", Number.parseInt(e.target.value, 10) || 1)}
                      className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-2.5 py-2">
                    <input
                      type="number"
                      placeholder="∞ (Tak terbatas)"
                      value={tier.max_qty ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        handleChange(idx, "max_qty", v === "" ? null : Number.parseInt(v, 10));
                      }}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-2.5 py-2">
                    <input
                      type="number"
                      min={0}
                      value={tier.price_per_unit}
                      onChange={(e) => handleChange(idx, "price_per_unit", Number.parseFloat(e.target.value) || 0)}
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-2.5 py-2">
                    <input
                      type="text"
                      placeholder="1 Hari"
                      value={tier.lead_time_days}
                      onChange={(e) => handleChange(idx, "lead_time_days", e.target.value)}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-2.5 py-2">
                    <input
                      type="text"
                      placeholder="Hemat 15%"
                      value={tier.discount_label}
                      onChange={(e) => handleChange(idx, "discount_label", e.target.value)}
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs"
                      title="Hapus tier"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
