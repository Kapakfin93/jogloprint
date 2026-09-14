"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HomeBanner, BusinessInfo } from "@/lib/types/database";

interface HomeHeroProps {
  readonly businessInfo: BusinessInfo | null;
  readonly banners: HomeBanner[];
}

export default function HomeHero({ businessInfo, banners }: HomeHeroProps) {
  const waNumber = businessInfo?.whatsapp_number || "628123456789";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau tanya order cetak...")}`;
  const activeBanners = banners;

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prev = () => setCurrent((c) => (c - 1 + activeBanners.length) % activeBanners.length);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [activeBanners.length, next]);

  if (banners.length > 0) {
    return (
      <section className="w-full pt-2 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-slate-900 aspect-[2/1] sm:aspect-[3/1] lg:aspect-[4/1]">
            {/* Slides */}
            {activeBanners.map((b, i) => (
              <div
                key={b.id}
                className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
              >
                <Link href={b.link_url || "/"}>
                  <img
                    src={b.image_url}
                    alt={b.alt_text}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </Link>
              </div>
            ))}
            {/* Prev/Next */}
            {activeBanners.length > 1 && (
              <>
                <button onClick={prev} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition z-10 text-xl font-bold leading-none">&#8249;</button>
                <button onClick={next} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition z-10 text-xl font-bold leading-none">&#8250;</button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {activeBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-5" : "bg-white/50"}`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Fallback: 3-panel statis jika belum ada banner di DB
  return (
    <section className="w-full pt-4 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="lg:col-span-4 bg-linear-to-br from-amber-700 via-amber-800 to-amber-950 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Digital Printing</span>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight uppercase tracking-tight">Cetak Indoor & Outdoor</h2>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">Spanduk MMT, Baliho, X-Banner, Roll Banner, Sticker Backlite & Canvas resolusi tinggi.</p>
              </div>
              <div className="relative z-10 pt-6">
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-white text-amber-900 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md hover:bg-amber-50 transition">
                  <span>Pesan Banner Sekarang</span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 bg-linear-to-br from-white via-slate-50 to-amber-50/40 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-600 text-white text-[10px] sm:text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">Best Seller UMKM</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span>Siap Cetak Cepat</span></span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-none tracking-tight">Cutting Stiker</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Presisi potong Die Cut & Kiss Cut otomatis mesin Jepang beresolusi tinggi, hasil tajam anti luntur.</p>
              </div>
              <Link href="#katalog-produk" className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition">
                Lihat Katalog Stiker
              </Link>
            </div>
            <div className="lg:col-span-3 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white flex flex-col justify-between">
              <div className="space-y-3">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">Promo UMKM</span>
                <h3 className="text-lg sm:text-xl font-bold text-white">KARTU NAMA & BROSUR</h3>
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                  <span className="text-[11px] text-slate-300 font-medium block">Paket Hemat 3 Box</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs text-amber-400 font-bold">Hanya</span>
                    <span className="text-3xl font-extrabold text-amber-400 leading-none">50<span className="text-base font-bold">rb</span></span>
                  </div>
                </div>
              </div>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-md transition">
                <span>Klaim Promo WA</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
