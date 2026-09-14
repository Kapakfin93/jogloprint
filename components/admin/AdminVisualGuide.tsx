"use client";

import { useState } from "react";
import Link from "next/link";
import GuideStepsTab from "./guide/GuideStepsTab";
import GuideEnginesTab from "./guide/GuideEnginesTab";
import GuideDualAxisTab from "./guide/GuideDualAxisTab";
import GuideExamplesTab from "./guide/GuideExamplesTab";
import GuideJsonTab from "./guide/GuideJsonTab";

type GuideTabKey = "step" | "engine" | "dual_axis" | "examples" | "json";

const TABS: Array<{ id: GuideTabKey; label: string; icon: string }> = [
  { id: "step", label: "SOP 5 Langkah", icon: "📋" },
  { id: "engine", label: "4 Pricing Engine", icon: "⚙️" },
  { id: "dual_axis", label: "Varian vs Add-on", icon: "⚖️" },
  { id: "examples", label: "4 Studi Kasus Nyata", icon: "📚" },
  { id: "json", label: "Format Ingesti AI (JSON)", icon: "🤖" },
];

export default function AdminVisualGuide() {
  const [activeTab, setActiveTab] = useState<GuideTabKey>("step");

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <span>💡</span> Panduan Resmi & SOP Operasional
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Panduan Visual Input Katalog Joglo Print
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Standar panduan bagi operator admin & instruksi agen untuk memastikan akurasi data produk, kombinasi varian/add-on, serta pencegahan kesalahan kalkulator harga di website publik.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === tab.id
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "step" && <GuideStepsTab />}
      {activeTab === "engine" && <GuideEnginesTab />}
      {activeTab === "dual_axis" && <GuideDualAxisTab />}
      {activeTab === "examples" && <GuideExamplesTab />}
      {activeTab === "json" && <GuideJsonTab />}

      {/* Quick Action Footer */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="text-xs text-slate-500">
          Butuh input produk baru sekarang?
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/kategori"
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            📁 Ke Kategori
          </Link>
          <Link
            href="/admin/produk"
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 transition shadow-xs"
          >
            📦 Ke Daftar Produk
          </Link>
        </div>
      </div>
    </div>
  );
}
