"use client";

import { useState } from "react";
import { Category, PricingEngine } from "@/lib/types/database";
import { saveCategoryAction } from "@/app/admin/actions/categories.action";
import { slugify } from "@/lib/services/slug.service";

interface CategoryFormModalProps {
  readonly category?: Category | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

const PRICING_ENGINES: Array<{
  id: PricingEngine;
  label: string;
  icon: string;
  desc: string;
  unit: string;
}> = [
  {
    id: "sheet",
    label: "Lembaran / Pcs",
    icon: "📄",
    desc: "Per kuantitas lembar (Stiker A3+, Brosur, Kartu Nama, Sertifikat)",
    unit: "lembar / pcs",
  },
  {
    id: "area",
    label: "Luas Area (m²)",
    icon: "📐",
    desc: "Panjang (cm) x Lebar (cm) (Spanduk Outdoor, Banner Flexi, Korchin, Backlite)",
    unit: "m²",
  },
  {
    id: "meter_lari",
    label: "Meter Lari",
    icon: "📏",
    desc: "Panjang x Lebar Bahan Roll Tetap (Spanduk Kain Peles/Satin, Sablon DTF)",
    unit: "meter",
  },
  {
    id: "bundle",
    label: "Buku / Bundle",
    icon: "📚",
    desc: "Per paket / buku (Nota NCR 2-3 Ply, Buku Yasin, Kalender)",
    unit: "buku / rim",
  },
];

export default function CategoryFormModal({
  category,
  isOpen,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  if (!isOpen) return null;

  return (
    <CategoryFormContent
      key={category?.id || "new-category"}
      category={category}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function CategoryFormContent({
  category,
  onClose,
  onSuccess,
}: {
  readonly category?: Category | null;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [pricingEngine, setPricingEngine] = useState<PricingEngine>(
    category?.pricing_engine || "sheet"
  );
  const [coverUrl] = useState(category?.cover_image_url || "");
  const [displayOrder, setDisplayOrder] = useState(category?.display_order || 0);
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (category?.id) {
      formData.append("id", category.id);
    }
    formData.append("name", name.trim());
    formData.append("slug", slug.trim());
    formData.append("description", description.trim());
    formData.append("pricing_engine", pricingEngine);
    formData.append("cover_image_url", coverUrl);
    formData.append("display_order", displayOrder.toString());
    formData.append("is_active", isActive ? "true" : "false");

    const result = await saveCategoryAction(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Gagal menyimpan kategori");
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h2>
            {isEdit && (
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                ID: {category.id}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="cat-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Banner / MMT & Spanduk"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cat-slug" className="block text-xs font-semibold text-slate-700 mb-1">
              Slug URL <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="banner-spanduk"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-slate-50 font-mono text-slate-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Engine Guard Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              ⚙️ Model Perhitungan Satuan (Engine Guard) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRICING_ENGINES.map((eng) => (
                <label
                  key={eng.id}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${
                    pricingEngine === eng.id
                      ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{eng.icon}</span>
                      <span>{eng.label}</span>
                    </span>
                    <input
                      type="radio"
                      name="pricing_engine"
                      value={eng.id}
                      checked={pricingEngine === eng.id}
                      onChange={() => setPricingEngine(eng.id)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {eng.desc}
                  </p>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="cat-desc" className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi</label>
            <textarea
              id="cat-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat kategori..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cat-order" className="block text-xs font-semibold text-slate-700 mb-1">Urutan Tampil</label>
              <input
                id="cat-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number.parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center pt-5">
              <label htmlFor="cat-active" className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                <input
                  id="cat-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
                Status Aktif
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
