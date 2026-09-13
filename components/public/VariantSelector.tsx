import { VariantDetailItem } from "@/lib/repositories/product-detail.repository";

interface VariantSelectorProps {
  readonly variants: VariantDetailItem[];
  readonly selectedVariantId: string;
  readonly onSelectVariant: (id: string) => void;
  readonly title?: string;
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  title = "1. Jenis Finishing / Pilihan Varian",
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
          <span>{title}</span>
          <span className="text-red-500">*</span>
        </span>
        {selectedVariant && (
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {selectedVariant.variant_name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {variants.map((v) => {
          const isSelected = v.id === selectedVariant?.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVariant(v.id)}
              className={`text-left p-3.5 rounded-2xl transition-all flex flex-col gap-1 border ${
                isSelected
                  ? "bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-slate-50 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-extrabold text-sm leading-tight">
                  {v.variant_name}
                </span>
                {v.is_default && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                  }`}>
                    Default
                  </span>
                )}
              </div>
              <span className={`text-xs leading-relaxed line-clamp-2 ${
                isSelected ? "text-amber-100" : "text-slate-500"
              }`}>
                {v.description || "Finishing presisi standar percetakan"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
