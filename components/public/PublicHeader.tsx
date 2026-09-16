"use client";

import { useState } from "react";
import Link from "next/link";
import { BusinessInfo, Category } from "@/lib/types/database";
import CategoryDropdown from "./CategoryDropdown";
import CategoryDrawer from "./CategoryDrawer";

interface PublicHeaderProps {
  readonly businessInfo: BusinessInfo | null;
  readonly categories?: Category[];
}

export default function PublicHeader({ businessInfo, categories = [] }: PublicHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const phone = businessInfo?.phone || "0813-9028-6826";
  const waNumber = businessInfo?.whatsapp_number || "6281390286826";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau tanya order cetak...")}`;

  const activeCategories = categories.filter((c) => c.is_active !== false);
  const primaryCategories = activeCategories.slice(0, 5);
  const overflowCategories = activeCategories.slice(5);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Top Ticker Bar — Desktop md+ only */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">
                Buka Setiap Hari (08:00 – 02:00 WIB) • Workshop:{" "}
                {businessInfo?.address || "Jogoloyo, Wonosalam, Demak"}
              </span>
            </div>
            <div className="text-slate-400 font-medium shrink-0 ml-4">
              Pusat Cetak Cepat &amp; Berkualitas UMKM Demak
            </div>
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Left: Mobile Hamburger / Kategori Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Buka Menu Kategori"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 text-slate-800 text-xs font-bold transition shadow-2xs active:scale-95"
            >
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Kategori</span>
            </button>
          </div>

          {/* Logo — compact inline */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-linear-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-md group-hover:scale-105 transition-transform">
              JP
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-amber-600 transition-colors">
                JOGLO PRINT
              </span>
              <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Percetakan Digital Demak
              </span>
            </div>
          </Link>

          {/* Desktop Categories Nav (>=768px / md+) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 flex-1 justify-center px-2">
            <Link
              href="/"
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition shrink-0 whitespace-nowrap"
            >
              Beranda
            </Link>

            {primaryCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}

            {overflowCategories.length > 0 && (
              <CategoryDropdown categories={overflowCategories} />
            )}
          </nav>

          {/* Right: WhatsApp CTA Button */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold shadow-md transition-all hover:shadow-lg shrink-0"
          >
            <span className="text-sm">💬</span>
            <span className="hidden sm:inline">Chat CS: {phone}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <CategoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={activeCategories}
        businessInfo={businessInfo}
      />
    </>
  );
}
