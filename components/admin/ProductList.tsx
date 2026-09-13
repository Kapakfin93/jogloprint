"use client";

import { useState } from "react";
import { Category } from "@/lib/types/database";
import { ProductWithDetails } from "@/lib/repositories/products.repository";
import ProductFormModal from "./ProductFormModal";
import DuplicateProductModal from "./DuplicateProductModal";
import { deleteProductAction } from "@/app/admin/actions/products.action";
import { getThumbnailUrl } from "@/lib/services/image-url.service";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProductListProps {
  readonly initialProducts: ProductWithDetails[];
  readonly categories: Category[];
  readonly initialCategoryFilter?: string;
}

export default function ProductList({
  initialProducts,
  categories,
  initialCategoryFilter = "ALL",
}: ProductListProps) {
  const router = useRouter();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<ProductWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>(initialCategoryFilter);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeProducts = initialProducts.filter((p) => !deletedIds.has(p.id));

  const filtered = activeProducts.filter((p) => {
    if (filterCategory === "ALL") return true;
    return p.category_id === filterCategory;
  });

  const currentCategory = categories.find((c) => c.id === filterCategory);

  function handleAdd() {
    setSelectedProduct(null);
    setIsModalOpen(true);
  }

  function handleEdit(prod: ProductWithDetails) {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  }

  function handleOpenDuplicate(prod: ProductWithDetails) {
    setDuplicateSource(prod);
    setIsDuplicateOpen(true);
  }

  async function handleDelete(prod: ProductWithDetails) {
    if (!confirm(`Hapus produk "${prod.name}"? Varian dan data terkait akan ikut terhapus.`)) {
      return;
    }

    setDeletingId(prod.id);
    setDeletedIds((prev) => new Set(prev).add(prod.id));

    const result = await deleteProductAction(prod.id);
    setDeletingId(null);

    if (!result.success) {
      alert(result.error || "Gagal menghapus produk");
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(prod.id);
        return next;
      });
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Produk & Katalog</h1>
          <p className="text-sm text-slate-500">
            Kelola katalog percetakan, relasi guard kategori & duplikasi template instan
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition"
        >
          + Tambah Produk
        </button>
      </div>

      {/* Filter and Engine Guard Status Strip */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <label htmlFor="filter-cat" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Filter Kategori:
          </label>
          <select
            id="filter-cat"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">Semua Kategori ({activeProducts.length} Produk)</option>
            {categories.map((c) => {
              const count = activeProducts.filter((p) => p.category_id === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({count} produk)
                </option>
              );
            })}
          </select>
        </div>

        {currentCategory && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Engine Guard Kategori:</span>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 font-bold uppercase text-amber-800 border border-amber-200">
              {currentCategory.pricing_engine === "area" && "📐 Luas Area (m²)"}
              {currentCategory.pricing_engine === "meter_lari" && "📏 Meter Lari"}
              {currentCategory.pricing_engine === "bundle" && "📚 Paket/Buku"}
              {(!currentCategory.pricing_engine || currentCategory.pricing_engine === "sheet") && "📄 Lembaran/Pcs"}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Foto</th>
              <th className="px-6 py-3.5">Nama & Slug</th>
              <th className="px-6 py-3.5">Kategori & Engine Guard</th>
              <th className="px-6 py-3.5">Satuan Standar</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Belum ada produk dalam kategori ini.
                </td>
              </tr>
            ) : (
              filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3">
                    <ProductThumbnail src={prod.primary_image_url} alt={prod.name} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{prod.name}</div>
                    <div className="text-xs font-mono text-slate-400">/{prod.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-700">{prod.category_name || "—"}</span>
                      <span className="inline-block w-fit rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 border border-amber-200">
                        {prod.pricing_model === "meter_lari" && "📏 Meter Lari"}
                        {prod.pricing_model === "area" && "📐 Luas Area (m²)"}
                        {prod.pricing_model === "bundle" && "📚 Paket/Buku"}
                        {(!prod.pricing_model || prod.pricing_model === "sheet") && "📄 Lembaran/Pcs"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">
                    {prod.unit_label || "lembar"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        prod.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {prod.is_active ? "Aktif" : "Non-aktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <Link
                      href={`/admin/produk/${prod.id}/varian`}
                      className="rounded-lg px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                    >
                      Varian
                    </Link>
                    <Link
                      href={`/admin/produk/${prod.id}/addon`}
                      className="rounded-lg px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      Add-on
                    </Link>
                    <button
                      onClick={() => handleOpenDuplicate(prod)}
                      title="Duplikat produk dengan nama dan slug baru"
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                    >
                      Duplikat
                    </button>
                    <button
                      onClick={() => handleEdit(prod)}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prod)}
                      disabled={deletingId === prod.id}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === prod.id ? "..." : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        product={selectedProduct}
        categories={categories}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <DuplicateProductModal
        sourceProduct={duplicateSource}
        isOpen={isDuplicateOpen}
        onClose={() => {
          setIsDuplicateOpen(false);
          setDuplicateSource(null);
        }}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

function ProductThumbnail({ src, alt }: { readonly src?: string | null; readonly alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-400 select-none">
        No Img
      </div>
    );
  }

  return (
    <img
      src={getThumbnailUrl(src, 80)}
      alt={alt}
      onError={() => setHasError(true)}
      className="h-12 w-12 rounded-lg object-cover border border-slate-200"
    />
  );
}
