"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/lib/types/database";
import { getGalleryUrl, getThumbnailUrl } from "@/lib/services/image-url.service";

interface ProductGalleryProps {
  readonly productName: string;
  readonly images: ProductImage[];
}

export default function ProductGallery({ productName, images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeImage = images[selectedIndex] || images[0] || null;

  return (
    <div className="flex flex-col gap-4">
      {/* Featured Photo Frame */}
      <div className="relative w-full rounded-2xl bg-white p-2 shadow-xs border border-slate-200/90 overflow-hidden group">
        <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
          {activeImage ? (
            <Image
              src={getGalleryUrl(activeImage.image_url, 900)}
              alt={activeImage.alt_text || productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-all duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-1">🖼️</span>
              <span className="text-xs font-semibold">Foto Joglo Print</span>
            </div>
          )}


        </div>
      </div>

      {/* Interactive Gallery Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {images.map((img, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden bg-white p-1 shadow-xs transition-all border ${
                  isActive
                    ? "border-amber-600 ring-2 ring-amber-500/20 scale-95 opacity-100"
                    : "border-slate-200 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <Image
                    src={getThumbnailUrl(img.image_url, 200)}
                    alt={img.alt_text || `${productName} view ${idx + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Production Commitments */}
      <div className="bg-amber-50/60 rounded-2xl p-4 flex items-center justify-between border border-amber-200/60 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-700 flex items-center justify-center font-black text-lg shrink-0">
            ⚡
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
              Proses Cetak Cepat 1 Hari
            </span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              File siap cetak diproses di hari yang sama
            </span>
          </div>
        </div>
        <span className="text-emerald-600 text-lg font-bold">✓</span>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-start gap-3">
        <span className="text-amber-600 text-xl mt-0.5">🛡️</span>
        <div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 block">
            Jaminan Akurasi Warna Demak
          </span>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Dikalibrasi berkala untuk memastikan ketepatan logo UMKM Anda. Proof digital via WhatsApp sebelum naik cetak penuh.
          </p>
        </div>
      </div>
    </div>
  );
}
