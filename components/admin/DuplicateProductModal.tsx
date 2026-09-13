"use client";

import { useState } from "react";
import { ProductWithDetails } from "@/lib/repositories/products.repository";
import { duplicateProductAction } from "@/app/admin/actions/products.action";
import { slugify } from "@/lib/services/slug.service";

interface DuplicateProductModalProps {
  readonly sourceProduct: ProductWithDetails | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (newProductId: string) => void;
}

export default function DuplicateProductModal({
  sourceProduct,
  isOpen,
  onClose,
  onSuccess,
}: DuplicateProductModalProps) {
  if (!isOpen || !sourceProduct) return null;

  return (
    <DuplicateFormContent
      key={sourceProduct.id}
      sourceProduct={sourceProduct}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function DuplicateFormContent({
  sourceProduct,
  onClose,
  onSuccess,
}: {
  readonly sourceProduct: ProductWithDetails;
  readonly onClose: () => void;
  readonly onSuccess: (newProductId: string) => void;
}) {
  const defaultName = `${sourceProduct.name} (Baru)`;
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(slugify(defaultName));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    setSlug(slugify(val));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama produk baru wajib diisi");
      return;
    }
    if (!slug.trim()) {
      setError("Slug URL baru wajib diisi");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await duplicateProductAction(
      sourceProduct.id,
      name.trim(),
      slug.trim()
    );

    setLoading(false);
    if (!result.success || !result.productId) {
      setError(result.error || "Gagal menduplikasi produk");
      return;
    }

    onSuccess(result.productId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Duplikat Produk (Template)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menyalin varian & harga dari: <span className="font-semibold text-slate-700">{sourceProduct.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
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
            <label htmlFor="dup-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Produk Resmi Baru <span className="text-red-500">*</span>
            </label>
            <input
              id="dup-name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Art Carton 310g A3+"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label htmlFor="dup-slug" className="block text-xs font-semibold text-slate-700 mb-1">
              Slug URL Resmi <span className="text-red-500">*</span>
            </label>
            <input
              id="dup-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="art-carton-310g-a3"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-mono text-slate-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200 text-xs text-amber-800">
            ℹ️ <strong>Atomic Clone:</strong> Seluruh konfigurasi varian (1 sisi/2 sisi, finishing), tabel harga grosir tier, dan add-on akan diduplikasi secara utuh.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
              {loading ? "Menduplikasi..." : "Duplikat Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
