"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BusinessInfo, Category } from "@/lib/types/database";

interface CategoryDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly categories: Category[];
  readonly businessInfo: BusinessInfo | null;
}

export default function CategoryDrawer({
  isOpen,
  onClose,
  categories,
  businessInfo,
}: CategoryDrawerProps) {
  const phone = businessInfo?.phone || "0813-9028-6826";
  const waNumber = businessInfo?.whatsapp_number || "6281390286826";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau tanya order cetak...")}`;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel (Slide from left) */}
      <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-linear-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              JP
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 leading-tight">JOGLO PRINT</div>
              <div className="text-[9px] font-semibold uppercase text-slate-500">Menu &amp; Kategori</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="h-8 w-8 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center text-sm font-bold transition shadow-2xs"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs hover:bg-amber-100 transition border border-amber-200/60"
          >
            <span className="text-base">🏠</span>
            <span>Beranda Utama</span>
          </Link>

          <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Semua Kategori Produk ({categories.length})
          </div>

          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              onClick={onClose}
              className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-700 transition border border-transparent hover:border-slate-100"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-6 w-6 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors">
                  {idx + 1}
                </span>
                <span className="truncate">{cat.name}</span>
              </div>
              <span className="text-xs text-slate-300 group-hover:text-amber-500 transition-colors ml-2 shrink-0">
                →
              </span>
            </Link>
          ))}
        </div>

        {/* Footer Contact Info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
          >
            <span>💬</span>
            <span>Chat CS ({phone})</span>
          </a>
          <div className="text-[10px] text-center text-slate-400 leading-tight">
            Buka Setiap Hari (08:00 – 02:00 WIB)
            <br />
            {businessInfo?.address || "Jogoloyo, Wonosalam, Demak"}
          </div>
        </div>
      </div>
    </div>
  );
}
