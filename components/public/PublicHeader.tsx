import Link from "next/link";
import { BusinessInfo, Category } from "@/lib/types/database";

interface PublicHeaderProps {
  readonly businessInfo: BusinessInfo | null;
  readonly categories?: Category[];
}

export default function PublicHeader({ businessInfo, categories = [] }: PublicHeaderProps) {
  const phone = businessInfo?.phone || "0812-3456-7890";
  const waNumber = businessInfo?.whatsapp_number || "628123456789";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">
              Buka Setiap Hari (08:00 - 02:00 WIB) • Workshop: {businessInfo?.address || "Jogoloyo, Wonosalam, Demak"}
            </span>
          </div>
          <div className="text-slate-400 font-medium shrink-0 ml-4">
            Pusat Cetak Cepat & Berkualitas UMKM Demak
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-linear-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-md group-hover:scale-105 transition-transform">
            JP
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-amber-600 transition-colors">
              JOGLO PRINT
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
              Percetakan Digital Demak
            </span>
          </div>
        </Link>

        {/* Categories Link Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
          >
            Beranda
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="px-3.5 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Contact WhatsApp Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau tanya order cetak...")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all hover:shadow-lg"
          >
            <span className="text-base">💬</span>
            <span className="hidden sm:inline">Chat CS: {phone}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}
