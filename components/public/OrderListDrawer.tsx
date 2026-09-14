"use client";

import React from "react";
import Link from "next/link";
import { useOrderList } from "@/context/OrderListContext";
import { formatCurrency } from "@/lib/services/pricing.service";
import {
  generateMultiItemOrderMessage,
  generateWhatsAppUrl,
} from "@/lib/services/whatsapp-message.service";

interface OrderListDrawerProps {
  readonly whatsappNumber?: string;
}

export default function OrderListDrawer({ whatsappNumber = "6281390286826" }: OrderListDrawerProps) {
  const {
    items,
    removeItem,
    clearItems,
    isDrawerOpen,
    closeDrawer,
    totalCount,
    totalAmount,
  } = useOrderList();

  if (!isDrawerOpen) return null;

  const waMessage = generateMultiItemOrderMessage(items);
  const waUrl = generateWhatsAppUrl(whatsappNumber, waMessage);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup Panel Pesanan"
        onClick={closeDrawer}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer w-full h-full border-0 p-0 m-0"
      />

      {/* Slide-over Panel */}
      <aside
        aria-label="Panel Daftar Pesanan Sementara"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">
                Daftar Pesanan Sementara
              </h2>
              <p className="text-xs text-slate-500">
                {totalCount} item siap dikirim via 1 pesan WA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="h-8 w-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm font-bold transition cursor-pointer"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <span className="text-4xl mb-2">🛒</span>
              <p className="font-bold text-slate-700 text-sm">Daftar Pesanan Masih Kosong</p>
              <p className="text-xs text-slate-400 mt-1 max-w-60">
                Pilih produk, tentukan opsi finishing & jumlah, lalu klik &quot;Tambah ke Daftar Pesanan&quot;.
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-container transition cursor-pointer"
              >
                Jelajahi Produk
              </button>
            </div>
          ) : (
            items.map((it, idx) => (
              <div
                key={it.id}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition-colors shadow-2xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                      Item #{idx + 1}
                    </span>
                    <Link
                      href={`/produk/${it.productSlug}`}
                      onClick={closeDrawer}
                      className="font-bold text-slate-800 text-sm hover:text-primary transition line-clamp-1"
                    >
                      {it.productName}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 text-sm rounded transition cursor-pointer"
                    title="Hapus item ini"
                    aria-label={`Hapus ${it.productName}`}
                  >
                    🗑️
                  </button>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5 pt-0.5 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Finishing/Varian:</span>
                    <span className="font-medium text-slate-800">{it.variantName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Opsi/Addon:</span>
                    <span className="font-medium text-slate-800">{it.addonName}</span>
                  </div>
                  {it.lengthCm && it.widthCm && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Ukuran:</span>
                      <span className="font-medium text-slate-800">
                        {it.lengthCm}x{it.widthCm}cm ({it.rawAreaM2?.toFixed(2)}m²)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Jumlah:</span>
                    <span className="font-semibold text-slate-800">
                      {it.qty} {it.unitLabel || "lembar"}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Subtotal:</span>
                  <span className="font-bold text-primary text-sm">
                    {formatCurrency(it.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total Keseluruhan</span>
                <span className="text-xs font-semibold text-slate-600">
                  {totalCount} Item Terpilih
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-tertiary-container hover:bg-tertiary text-on-tertiary font-bold text-sm rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬</span>
                <span>Kirim Semua via WhatsApp ({totalCount})</span>
              </a>

              <button
                type="button"
                onClick={clearItems}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold transition cursor-pointer"
              >
                Bersihkan Daftar Pesanan
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
