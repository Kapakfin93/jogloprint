import { ProductSpecificationItem } from "@/lib/types/database";

interface ProductSpecsProps {
  readonly productName: string;
  readonly specifications: ProductSpecificationItem[] | null;
}

export default function ProductSpecs({ productName, specifications }: ProductSpecsProps) {
  if (!specifications || !Array.isArray(specifications) || specifications.length === 0) {
    return null;
  }

  // Split specifications array into 2 columns
  const midpoint = Math.ceil(specifications.length / 2);
  const leftCol = specifications.slice(0, midpoint);
  const rightCol = specifications.slice(midpoint);

  return (
    <section className="w-full bg-white border-y border-slate-200/90 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-700">
              Transparansi Teknis
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Spesifikasi Detail {productName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column Card */}
            <div className="rounded-2xl bg-slate-50/70 p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
                <span className="text-xl text-amber-600">⚙️</span>
                <h3 className="text-base font-bold text-slate-800">
                  Dimensi & Karakteristik Bahan
                </h3>
              </div>
              <div className="divide-y divide-slate-200/60">
                {leftCol.map((item, idx) => (
                  <div key={idx} className="py-3 flex flex-col gap-0.5 first:pt-0 last:pb-0">
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Card */}
            <div className="rounded-2xl bg-slate-50/70 p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
                <span className="text-xl text-amber-600">🖨️</span>
                <h3 className="text-base font-bold text-slate-800">
                  Mesin Produksi & Format Desain
                </h3>
              </div>
              <div className="divide-y divide-slate-200/60">
                {rightCol.map((item, idx) => (
                  <div key={idx} className="py-3 flex flex-col gap-0.5 first:pt-0 last:pb-0">
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
