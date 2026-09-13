import { ProductAddon } from "@/lib/types/database";
import { formatCurrency } from "@/lib/services/pricing.service";

interface AddonSelectorProps {
  readonly addons: ProductAddon[];
  readonly selectedAddonId: string;
  readonly unitLabel?: string | null;
  readonly onSelectAddon: (id: string) => void;
  readonly title?: string;
}

export default function AddonSelector({
  addons,
  selectedAddonId,
  unitLabel = "lembar",
  onSelectAddon,
  title = "2. Lapisan Tambahan / Add-on",
}: AddonSelectorProps) {
  if (!addons || addons.length === 0) return null;

  const selectedAddon = addons.find((a) => a.id === selectedAddonId) || addons[0];
  const safeUnit = unitLabel || "lembar";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
          <span>{title}</span>
        </span>
        {selectedAddon && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {selectedAddon.name} ({selectedAddon.price_flat === 0 ? "Gratis" : `+${formatCurrency(selectedAddon.price_flat)}/${safeUnit}`})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {addons.map((a) => {
          const isSelected = a.id === selectedAddon?.id;
          const priceLabel = a.price_flat === 0
            ? "+Rp 0 (Bawaan)"
            : `+${formatCurrency(a.price_flat)} / ${safeUnit}`;

          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelectAddon(a.id)}
              className={`text-left p-3.5 rounded-2xl transition-all flex flex-col justify-between gap-1.5 border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-extrabold text-sm leading-tight">
                  {a.name}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : a.price_flat === 0
                    ? "bg-slate-100 text-slate-600"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {priceLabel}
                </span>
              </div>
              {a.description && (
                <span className={`text-xs leading-relaxed line-clamp-2 ${
                  isSelected ? "text-slate-300" : "text-slate-500"
                }`}>
                  {a.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
