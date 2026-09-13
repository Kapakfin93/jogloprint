"use client";

import { useState } from "react";
import { Category } from "@/lib/types/database";
import { ProductWithDetails } from "@/lib/repositories/products.repository";
import ProductFormModal from "./ProductFormModal";
import DuplicateProductModal from "./DuplicateProductModal";
import ProductTableRow from "./ProductTableRow";
import { deleteProductAction, toggleProductActiveAction } from "@/app/admin/actions/products.action";
import { useRouter } from "next/navigation";

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
  const [optimisticActiveMap, setOptimisticActiveMap] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeProducts = initialProducts.filter((p) => !deletedIds.has(p.id));
  const filtered = activeProducts.filter((p) => {
    if (filterCategory === "ALL") return true;
    return p.category_id === filterCategory;
  });

  const currentCategory = categories.find((c) => c.id === filterCategory);

  async function handleToggleActive(prodId: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    setOptimisticActiveMap((prev) => ({ ...prev, [prodId]: nextStatus }));
    setTogglingId(prodId);

    const res = await toggleProductActiveAction(prodId, nextStatus);
    setTogglingId(null);

    if (!res.success) {
      alert(res.error || "Gagal mengubah status aktif");
      setOptimisticActiveMap((prev) => ({ ...prev, [prodId]: currentStatus }));
    } else {
      router.refresh();
    }
  }

  async function handleDelete(prod: ProductWithDetails) {
    if (!confirm(`Hapus produk "${prod.name}"? Varian dan data terkait akan ikut terhapus.`)) return;

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
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition"
        >
          + Tambah Produk
        </button>
      </div>

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
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({activeProducts.filter((p) => p.category_id === c.id).length} produk)
              </option>
            ))}
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
              <th className="px-6 py-3.5">Status Publik</th>
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
                <ProductTableRow
                  key={prod.id}
                  prod={prod}
                  isProdActive={optimisticActiveMap[prod.id] ?? prod.is_active}
                  isToggling={togglingId === prod.id}
                  isDeleting={deletingId === prod.id}
                  onToggleActive={handleToggleActive}
                  onDuplicate={(p) => {
                    setDuplicateSource(p);
                    setIsDuplicateOpen(true);
                  }}
                  onEdit={(p) => {
                    setSelectedProduct(p);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDelete}
                />
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
