"use client";

import React from "react";
import Link from "next/link";
import { OrderItem } from "@/lib/types/order-list";
import { formatCurrency } from "@/lib/services/pricing.service";

interface OrderListDrawerItemProps {
  readonly item: OrderItem;
  readonly index: number;
  readonly onRemove: (id: string) => void;
  readonly onCloseDrawer: () => void;
}

export default function OrderListDrawerItem({
  item,
  index,
  onRemove,
  onCloseDrawer,
}: OrderListDrawerItemProps) {
  return (
    <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition-colors shadow-2xs space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
            Item #{index + 1}
          </span>
          <Link
            href={`/produk/${item.productSlug}`}
            onClick={onCloseDrawer}
            className="font-bold text-slate-800 text-sm hover:text-primary transition line-clamp-1"
          >
            {item.productName}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-slate-400 hover:text-rose-600 p-1 text-sm rounded transition cursor-pointer"
          title="Hapus item ini"
          aria-label={`Hapus ${item.productName}`}
        >
          🗑️
        </button>
      </div>

      <div className="text-xs text-slate-600 space-y-0.5 pt-0.5 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Finishing/Varian:</span>
          <span className="font-medium text-slate-800">{item.variantName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Opsi/Addon:</span>
          <span className="font-medium text-slate-800">{item.addonName}</span>
        </div>
        {item.lengthCm && item.widthCm && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Ukuran:</span>
            <span className="font-medium text-slate-800">
              {item.lengthCm}x{item.widthCm}cm ({item.rawAreaM2?.toFixed(2)}m²)
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Jumlah:</span>
          <span className="font-semibold text-slate-800">
            {item.qty} {item.unitLabel || "lembar"}
          </span>
        </div>
      </div>

      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">Subtotal:</span>
        <span className="font-bold text-primary text-sm">
          {formatCurrency(item.subtotal)}
        </span>
      </div>
    </div>
  );
}
