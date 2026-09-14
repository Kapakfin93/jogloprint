import Link from "next/link";
import { Category } from "@/lib/types/database";

// Fallback: ambil 2 huruf awal nama kategori sebagai ikon teks
function getCategoryInitial(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// Warna background per initial untuk visual variety
const BG_COLORS = [
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-purple-100 text-purple-800",
  "bg-rose-100 text-rose-800",
  "bg-orange-100 text-orange-800",
];

function getCategoryColor(index: number): string {
  return BG_COLORS[index % BG_COLORS.length];
}

interface HomeCategoryIconsProps {
  readonly categories: Category[];
}

export default function HomeCategoryIcons({ categories }: HomeCategoryIconsProps) {
  if (categories.length === 0) return null;

  return (
    <section className="w-full bg-white border-b border-slate-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Desktop: grid wrap. Mobile: horizontal scroll */}
        <div
          className="flex items-start gap-2 sm:gap-3 overflow-x-auto sm:overflow-x-visible sm:flex-wrap sm:justify-center"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="flex flex-col items-center gap-1.5 shrink-0 group w-16 sm:w-20"
            >
              {/* Icon box */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-100 group-hover:border-amber-300 transition-all duration-200 shadow-xs group-hover:shadow-md group-hover:scale-105">
                {cat.icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.icon_url}
                    alt={cat.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                  />
                ) : (
                  <span className={`text-xs sm:text-sm font-black rounded-xl px-1 py-0.5 ${getCategoryColor(idx)}`}>
                    {getCategoryInitial(cat.name)}
                  </span>
                )}
              </div>
              {/* Label */}
              <span className="text-[10px] sm:text-xs font-semibold text-slate-600 text-center leading-tight group-hover:text-amber-700 transition-colors line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
