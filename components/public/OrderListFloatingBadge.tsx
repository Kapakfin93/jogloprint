"use client";

import React from "react";
import { useOrderList } from "@/context/OrderListContext";
import { formatCurrency } from "@/lib/services/pricing.service";

export default function OrderListFloatingBadge() {
  const { totalCount, totalAmount, toggleDrawer, isDrawerOpen } = useOrderList();

  if (totalCount === 0 || isDrawerOpen) {
    return null;
  }

  return (
    <aside className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        type="button"
        onClick={toggleDrawer}
        className="group flex items-center gap-3 bg-primary hover:bg-primary-container text-white px-4 py-3 rounded-full shadow-xl shadow-primary/25 border-2 border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label={`Daftar Pesanan Sementara: ${totalCount} item`}
      >
        <div className="relative flex items-center justify-center">
          <span className="text-xl">📋</span>
          <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 font-extrabold text-[11px] h-5 min-w-5 px-1 rounded-full flex items-center justify-center border-2 border-primary shadow-sm animate-pulse">
            {totalCount}
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold leading-tight">
            Daftar Pesanan ({totalCount})
          </span>
          <span className="text-[11px] font-semibold text-amber-200 leading-tight">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <span className="text-white/80 group-hover:translate-x-0.5 transition-transform text-xs ml-0.5">
          ↗
        </span>
      </button>
    </aside>
  );
}
