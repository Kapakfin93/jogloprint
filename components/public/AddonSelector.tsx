import { ProductAddon, AddonSelectionMode } from "@/lib/types/database";
import { formatCurrency } from "@/lib/services/pricing.service";

interface AddonSelectorProps {
  readonly addons: ProductAddon[];
  readonly selectedAddonIds: readonly string[];
  readonly selectionMode?: AddonSelectionMode;
  readonly unitLabel?: string | null;
  readonly onToggleAddon: (id: string) => void;
  readonly title?: string;
}

export default function AddonSelector({
  addons,
  selectedAddonIds,
  selectionMode = "single",
  unitLabel = "lembar",
  onToggleAddon,
  title,
}: AddonSelectorProps) {
  if (!addons || addons.length === 0) return null;

  const isMulti = selectionMode === "multi";
  const safeUnit = unitLabel || "lembar";

  const selectedAddons = addons.filter((a) => selectedAddonIds.includes(a.id));
  const totalAddonPrice = selectedAddons.reduce((sum, a) => sum + (a.price_flat || 0), 0);

  const defaultTitle = isMulti
    ? "2. Opsi Tambahan / Add-on (Bisa Pilih Banyak)"
    : "2. Lapisan Tambahan / Add-on";

  let headerBadge: string | null = null;
  if (isMulti) {
    headerBadge = selectedAddons.length > 0
      ? `${selectedAddons.length} opsi terpilih (+${formatCurrency(totalAddonPrice)}/${safeUnit})`
      : "Opsional (Bisa Pilih Banyak)";
  } else if (selectedAddons[0]) {
    const first = selectedAddons[0];
    const isFirstNotFinal = Boolean(first.description?.toUpperCase().includes("BELUM FINAL"));
    const priceStr = isFirstNotFinal
      ? "Hub. CS"
      : first.price_flat === 0
        ? "Gratis"
        : `+${formatCurrency(first.price_flat)}/${safeUnit}`;
    headerBadge = `${first.name} (${priceStr})`;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
          <span>{title || defaultTitle}</span>
        </span>
        {headerBadge && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {headerBadge}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {addons.map((a) => {
          const isSelected = selectedAddonIds.includes(a.id);
          const isNotFinal = Boolean(a.description?.toUpperCase().includes("BELUM FINAL"));
          const priceLabel = isNotFinal
            ? "Hub. CS"
            : a.price_flat === 0
              ? "+Rp 0 (Bawaan)"
              : `+${formatCurrency(a.price_flat)} / ${safeUnit}`;

          let badgeCls = "bg-emerald-50 text-emerald-700 border border-emerald-200";
          if (isSelected) {
            badgeCls = isNotFinal
              ? "bg-amber-400/25 text-amber-200 border border-amber-300/40"
              : "bg-white/20 text-white";
          } else if (isNotFinal) {
            badgeCls = "bg-amber-50 text-amber-800 border border-amber-200";
          } else if (a.price_flat === 0) {
            badgeCls = "bg-slate-100 text-slate-600";
          }

          const cleanDesc = a.description
            ? a.description.replace(/^BELUM FINAL - harga asli menyusul dari Joe\s*/i, "").trim() || a.description
            : null;

          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onToggleAddon(a.id)}
              className={`text-left p-3.5 rounded-2xl transition-all flex flex-col justify-between gap-2 border cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-xs"
              }`}
            >
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-start gap-2 w-full">
                  {isMulti && (
                    <div
                      className={`w-4 h-4 mt-0.5 rounded-md shrink-0 flex items-center justify-center text-[10px] font-black border transition-colors ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                  )}
                  <span className="font-extrabold text-sm leading-snug wrap-break-word">
                    {a.name}
                  </span>
                </div>
                <div>
                  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg ${badgeCls}`}>
                    {priceLabel}
                  </span>
                </div>
              </div>
              {cleanDesc && (
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs leading-relaxed line-clamp-2 ${
                    isSelected ? "text-slate-300" : "text-slate-500"
                  }`}>
                    {cleanDesc}
                  </span>
                  {isNotFinal && (
                    <span className={`text-[10px] font-semibold tracking-wide flex items-center gap-1 ${
                      isSelected ? "text-amber-300" : "text-amber-700"
                    }`}>
                      <span>⚠️</span> Harga belum final — konfirmasi via CS
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

