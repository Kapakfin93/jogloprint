"use client";

import { useState } from "react";
import { CategoryWithStats } from "@/lib/repositories/categories.repository";
import CategoryFormModal from "./CategoryFormModal";
import { deleteCategoryAction } from "@/app/admin/actions/categories.action";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CategoryListProps {
  readonly initialCategories: CategoryWithStats[];
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCategories = initialCategories.filter((c) => !deletedIds.has(c.id));

  function handleAdd() {
    setSelectedCategory(null);
    setIsModalOpen(true);
  }

  function handleEdit(cat: CategoryWithStats) {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  }

  async function handleDelete(cat: CategoryWithStats) {
    if (!confirm(`Hapus kategori "${cat.name}"? Produk di dalamnya mungkin terpengaruh.`)) {
      return;
    }

    setDeletingId(cat.id);
    setDeletedIds((prev) => new Set(prev).add(cat.id));

    const result = await deleteCategoryAction(cat.id);
    setDeletingId(null);

    if (!result.success) {
      alert(result.error || "Gagal menghapus kategori");
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(cat.id);
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
          <h1 className="text-2xl font-bold text-slate-800">Kategori & Engine Guard</h1>
          <p className="text-sm text-slate-500">
            Kelola taksonomi katalog Joglo Print dan guard kalkulator (Pcs, Luas m², Meter Lari, Bundle)
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition"
        >
          + Tambah Kategori
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Urutan</th>
              <th className="px-6 py-3.5">Nama & Slug</th>
              <th className="px-6 py-3.5">Engine Model (Guard)</th>
              <th className="px-6 py-3.5">Produk Terdaftar</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Belum ada kategori. Klik <strong>+ Tambah Kategori</strong> untuk membuat kategori.
                </td>
              </tr>
            ) : (
              activeCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    #{cat.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{cat.name}</div>
                    <div className="text-xs font-mono text-slate-400">/{cat.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                      {cat.pricing_engine === "area" && "📐 Luas Area (m²)"}
                      {cat.pricing_engine === "meter_lari" && "📏 Meter Lari"}
                      {cat.pricing_engine === "bundle" && "📚 Paket/Buku"}
                      {(!cat.pricing_engine || cat.pricing_engine === "sheet") && "📄 Lembaran/Pcs"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/produk?category=${cat.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-amber-800 transition"
                      title="Lihat daftar produk pada kategori ini"
                    >
                      <span>📦 {cat.products_count ?? 0} Produk</span>
                      <span className="text-[10px]">→</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        cat.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {cat.is_active ? "Aktif" : "Non-aktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="rounded-lg px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      className="rounded-lg px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === cat.id ? "..." : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CategoryFormModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
