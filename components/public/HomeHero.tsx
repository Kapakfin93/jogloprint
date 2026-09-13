import Link from "next/link";
import { BusinessInfo } from "@/lib/types/database";

interface HomeHeroProps {
  readonly businessInfo: BusinessInfo | null;
}

export default function HomeHero({ businessInfo }: HomeHeroProps) {
  const waNumber = businessInfo?.whatsapp_number || "628123456789";

  return (
    <section className="w-full pt-4 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* Banner 1: Cetak Indoor & Outdoor */}
            <div className="lg:col-span-4 bg-linear-to-br from-amber-700 via-amber-800 to-amber-950 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <span className="inline-block bg-white/20 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Digital Printing
                </span>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight uppercase tracking-tight">
                  Cetak Indoor & Outdoor
                </h2>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  Spanduk MMT, Baliho, X-Banner, Roll Banner, Sticker Backlite & Canvas resolusi tinggi.
                </p>
              </div>

              <div className="relative z-10 pt-6 space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg text-xs font-semibold text-amber-200">
                  <span>⚡</span>
                  <span>Tahan Terik Matahari & Air Hujan</span>
                </div>
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau pesan Spanduk / Banner MMT Outdoor...")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-amber-900 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md hover:bg-amber-50 transition"
                >
                  <span>🖨️</span>
                  <span>Pesan Banner Sekarang</span>
                </a>
              </div>
            </div>

            {/* Banner 2: Cutting Stiker Express (Best Seller UMKM) */}
            <div className="lg:col-span-5 bg-linear-to-br from-white via-slate-50 to-amber-50/40 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-600 text-white text-[10px] sm:text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Best Seller UMKM
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Siap Cetak Cepat</span>
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-none tracking-tight">
                    Cutting Stiker
                  </h2>
                  <p className="text-base sm:text-lg font-bold text-amber-800 mt-1">
                    Stiker Kromo A3+, Vinyl & Transparan
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Presisi potong Die Cut & Kiss Cut otomatis mesin Jepang beresolusi tinggi, hasil tajam anti luntur.
                </p>
              </div>

              <div className="my-4 bg-amber-100/60 border border-amber-200/80 p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-base">
                    ⏱️
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase leading-none">Layanan Express</p>
                    <p className="text-sm font-extrabold text-slate-900 leading-tight">Bisa Ditunggu!</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-900 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-amber-200">
                  Mulai Rp 4.800 / lbr
                </span>
              </div>

              <div className="relative z-10">
                <Link
                  href="#katalog-produk"
                  className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition"
                >
                  <span>✂️</span>
                  <span>Lihat Katalog Stiker</span>
                </Link>
              </div>
            </div>

            {/* Banner 3: Promo & Kemasan */}
            <div className="lg:col-span-3 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white flex flex-col justify-between">
              <div className="space-y-3">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Promo UMKM
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  KARTU NAMA & BROSUR
                </h3>
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                  <span className="text-[11px] text-slate-300 font-medium block">Paket Hemat 3 Box</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs text-amber-400 font-bold">Hanya</span>
                    <span className="text-3xl font-extrabold text-amber-400 leading-none">50<span className="text-base font-bold">rb</span></span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">*Sudah termasuk potong & box plastik</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Joglo Print, saya mau klaim Promo Paket Kartu Nama 50rb...")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-md transition"
                >
                  <span>💬</span>
                  <span>Klaim Promo WA</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
