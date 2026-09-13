"use client";

import { useState } from "react";

const HIGHLIGHT_DATA = [
  { size: "3 x 3 cm", qty: "104", label: "Cocok untuk segel toples & botol kecil" },
  { size: "4 x 4 cm", qty: "60", label: "Cocok untuk cup kopi & botol sambal" },
  { size: "5 x 5 cm", qty: "40", label: "Favorit toples kue 250-500g & box", badge: "Terpopuler" },
  { size: "9 x 5.5 cm", qty: "21", label: "Ukuran standar kartu nama & label box", badge: "Kemasan Box" },
];

const FULL_YIELD_TABLE = [
  { size: "3 x 3 cm", qty: "104 pcs", useCase: "Segel tutup toples, label kosmetik kecil" },
  { size: "3.5 x 3.5 cm", qty: "77 pcs", useCase: "Label jar selai, cup dessert" },
  { size: "4 x 4 cm", qty: "60 pcs", useCase: "Botol sambal, cup kopi, botol jus" },
  { size: "4.5 x 4.5 cm", qty: "54 pcs", useCase: "Kemasan pouch kecil, toples bumbu" },
  { size: "5 x 5 cm", qty: "40 pcs", useCase: "Toples kue kering 250g-500g, box snack" },
  { size: "6 x 6 cm", qty: "28 pcs", useCase: "Standing pouch kripik, box makanan" },
  { size: "7 x 7 cm", qty: "24 pcs", useCase: "Box hampers, kardus makanan, lunch box" },
  { size: "8 x 8 cm", qty: "15 pcs", useCase: "Thinwall besar, besek katering" },
  { size: "9 x 5.5 cm", qty: "21 pcs", useCase: "Ukuran standar kartu nama, stiker thank you" },
  { size: "9 x 9 cm", qty: "12 pcs", useCase: "Box oleh-oleh, kemasan frozen food besar" },
  { size: "10 x 6 cm", qty: "16 pcs", useCase: "Label informasi komposisi & nutrition fact" },
  { size: "10 x 10 cm", qty: "8 pcs", useCase: "Stiker box pizza, dus hampers besar" },
  { size: "12 x 12 cm", qty: "6 pcs", useCase: "Stiker branding kaca, box jumbo" },
];

export default function ProductYieldGuide() {
  const [showFullTable, setShowFullTable] = useState(false);

  return (
    <section className="w-full bg-white border-y border-slate-200/90 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Panduan Efisiensi Biaya UMKM
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                Estimasi Jumlah Stiker dalam 1 Lembar A3+
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowFullTable((prev) => !prev)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition shrink-0"
            >
              {showFullTable ? "Tutup Tabel Lengkap ▲" : "Lihat Semua Ukuran (13 Ukuran) ▼"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {HIGHLIGHT_DATA.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col items-center text-center relative overflow-hidden shadow-xs hover:shadow-md transition-all group"
              >
                {item.badge && (
                  <div className="absolute top-2.5 right-2.5 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </div>
                )}
                <div className="w-16 h-10 rounded-xl bg-amber-600/10 text-amber-700 font-extrabold text-xs flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {item.size}
                </div>
                <span className="text-xs text-slate-500 font-medium">Isi per Lembar</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{item.qty}</span>
                  <span className="text-xs font-bold text-amber-700">pcs</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-2 leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {showFullTable && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs animate-in fade-in duration-200">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tabel Lengkap Kapasitas Cetak Lembar A3+ (Area Bersih 31 × 47 cm)
                </span>
                <span className="text-[11px] text-slate-500">
                  Toleransi jarak potong otomatis: 2 mm
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Ukuran Desain (cm)</th>
                      <th className="px-4 py-3">Estimasi Hasil (Qty)</th>
                      <th className="px-4 py-3">Rekomendasi Penggunaan Produk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {FULL_YIELD_TABLE.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2.5 font-bold font-mono text-slate-800">
                          {row.size}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 font-bold text-amber-800 border border-amber-200">
                            ± {row.qty}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {row.useCase}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

