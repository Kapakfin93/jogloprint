"use client";

import { useState } from "react";
import { Category, ProductSpecificationItem, PricingEngine } from "@/lib/types/database";
import { ProductWithDetails } from "@/lib/repositories/products.repository";
import { saveProductAction } from "@/app/admin/actions/products.action";
import { slugify } from "@/lib/services/slug.service";
import ProductSpecificationEditor from "./ProductSpecificationEditor";
import ProductImageUploader, { FormImageItem } from "./ProductImageUploader";

interface ProductFormModalProps {
  readonly product?: ProductWithDetails | null;
  readonly categories: Category[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export default function ProductFormModal({
  product,
  categories,
  isOpen,
  onClose,
  onSuccess,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <ProductFormContent
      key={product?.id || "new-product"}
      product={product}
      categories={categories}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

const STANDARD_UNITS = [
  { value: "lembar", label: "lembar (A3+, Brosur, Kartu Nama, Flyer)" },
  { value: "pcs", label: "pcs (Satuan Barang, Merchandise, Pin, Mug)" },
  { value: "m²", label: "m² (Meter Persegi / Banner, Spanduk, Backdrop)" },
  { value: "m lari", label: "m lari (Meter Lari / DTF Sablon, Tekstil)" },
  { value: "buku", label: "buku (Nota NCR, Buku Kenangan, Booklet)" },
  { value: "rim", label: "rim (Kop Surat, HVS Massal)" },
  { value: "set", label: "set (Undangan + Amplop, Paket Custom)" },
  { value: "pack", label: "pack (Kemasan, Stiker Pack)" },
  { value: "box", label: "box (Dus Box Kemasan, Box Kartu Nama)" },
  { value: "roll", label: "roll (Stiker Label Roll, Pita Cetak)" },
];

function getDefaultUnitForEngine(engine: PricingEngine): string {
  if (engine === "area") return "m²";
  if (engine === "meter_lari") return "m lari";
  if (engine === "bundle") return "buku";
  return "lembar";
}

function ProductFormContent({
  product,
  categories,
  onClose,
  onSuccess,
}: {
  readonly product?: ProductWithDetails | null;
  readonly categories: Category[];
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}) {
  const isEdit = !!product;
  const initialCategory = categories.find((c) => c.id === (product?.category_id || categories[0]?.id));
  const defaultUnit = getDefaultUnitForEngine(initialCategory?.pricing_engine || "sheet");
  const initialUnit = product ? (product.unit_label || "") : defaultUnit;
  const initialIsCustom = !!initialUnit && !STANDARD_UNITS.some((u) => u.value === initialUnit);

  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || "");
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [unitLabel, setUnitLabel] = useState(initialUnit);
  const [isCustomUnit, setIsCustomUnit] = useState(initialIsCustom);
  const [minOrderQty, setMinOrderQty] = useState(product?.min_order_qty ?? 1.0);
  const [displayOrder, setDisplayOrder] = useState(product?.display_order || 0);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [specs, setSpecs] = useState<ProductSpecificationItem[]>(
    Array.isArray(product?.specifications) ? product.specifications : []
  );
  const [images, setImages] = useState<FormImageItem[]>(
    product?.images?.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      alt_text: img.alt_text || "",
      is_primary: img.is_primary,
      display_order: img.display_order,
    })) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCategory = categories.find((c) => c.id === categoryId);
  const pricingEngine: PricingEngine = activeCategory?.pricing_engine || "sheet";

  function handleCategoryChange(newCatId: string) {
    setCategoryId(newCatId);
    if (!isEdit) {
      const cat = categories.find((c) => c.id === newCatId);
      const newDefault = getDefaultUnitForEngine(cat?.pricing_engine || "sheet");
      setUnitLabel(newDefault);
      setIsCustomUnit(false);
    }
  }

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

    const result = await saveProductAction({
      id: product?.id,
      category_id: categoryId,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      unit_label: unitLabel.trim() || null,
      pricing_model: pricingEngine,
      min_order_qty: pricingEngine === "area" || pricingEngine === "meter_lari" ? minOrderQty : null,
      specifications: specs,
      display_order: displayOrder,
      is_active: isActive,
      images,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error || "Gagal menyimpan produk");
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Engine: {pricingEngine.toUpperCase()}
              </span>
              {isEdit && (
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {product.id}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {isEdit && product?.slug && (
              isActive ? (
                <a
                  href={`/produk/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition shadow-2xs"
                  title="Buka halaman publik produk ini di tab baru"
                >
                  <span>Lihat di Publik</span>
                  <span className="text-[11px]">↗</span>
                </a>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl cursor-not-allowed"
                  title="Aktifkan status publik produk terlebih dahulu untuk melihat di halaman publik"
                >
                  <span>Lihat di Publik</span>
                  <span className="text-[10px] text-amber-600">(Non-aktif)</span>
                </span>
              )
            )}
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1">
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200 shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-cat" className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="p-cat"
                required
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.pricing_engine || "sheet"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="p-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                id="p-name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Flexi Standart 280gr"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-slug" className="block text-xs font-semibold text-slate-700 mb-1">
                Slug URL <span className="text-red-500">*</span>
              </label>
              <input
                id="p-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="flexi-standart-280gr"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-slate-50 font-mono text-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="p-unit-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan Unit Tampilan
              </label>
              <select
                id="p-unit-select"
                value={isCustomUnit ? "__custom__" : unitLabel}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomUnit(true);
                  } else {
                    setIsCustomUnit(false);
                    setUnitLabel(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                {STANDARD_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
                <option value="__custom__">✨ Lainnya / Kustom (Ketik Sendiri)...</option>
              </select>

              {isCustomUnit && (
                <div className="mt-2 animate-in fade-in duration-100">
                  <input
                    id="p-unit-custom"
                    type="text"
                    value={unitLabel}
                    onChange={(e) => setUnitLabel(e.target.value)}
                    placeholder="Ketik satuan kustom (mis: lusin, eksemplar)"
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {(pricingEngine === "area" || pricingEngine === "meter_lari") && (
            <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3">
              <label htmlFor="p-min-qty" className="block text-xs font-bold text-amber-900 mb-1">
                {pricingEngine === "area" ? "Minimal Hitung Luas Area (m²)" : "Minimal Hitung Panjang Bahan (Meter)"}
              </label>
              <input
                id="p-min-qty"
                type="number"
                step="0.1"
                min="0.1"
                value={minOrderQty}
                onChange={(e) => setMinOrderQty(Number.parseFloat(e.target.value) || 1.0)}
                className="w-32 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
              />
              <span className="ml-2 text-xs text-amber-700">
                {pricingEngine === "area"
                  ? "Contoh: 1.0 m² (pesanan di bawah 1 m² tetap dihitung 1 m²)"
                  : "Contoh: 1.0 meter (pesanan di bawah 1 meter tetap dihitung 1 meter)"}
              </span>
            </div>
          )}

          <div>
            <label htmlFor="p-desc" className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Produk</label>
            <textarea
              id="p-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bahan spanduk / banner outdoor tahan cuaca..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <ProductImageUploader images={images} onChange={setImages} />
          <ProductSpecificationEditor items={specs} onChange={setSpecs} />

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label htmlFor="p-order" className="block text-xs font-semibold text-slate-700 mb-1">Urutan Tampil</label>
              <input
                id="p-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number.parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center pt-5">
              <label htmlFor="p-active" className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                <input
                  id="p-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
                Status Aktif
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
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
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
