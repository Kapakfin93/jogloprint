"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ProductAddon } from "@/lib/types/database";
import { saveAddonAction } from "@/app/admin/actions/addons.action";
import { formatCurrency } from "@/lib/services/pricing.service";

interface AddonFormModalProps {
  readonly productId: string;
  readonly addon: ProductAddon | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export default function AddonFormModal({
  productId,
  addon,
  isOpen,
  onClose,
  onSuccess,
}: AddonFormModalProps) {
  if (!isOpen) return null;

  return (
    <AddonFormModalContent
      key={addon?.id || "new-addon"}
      productId={productId}
      addon={addon}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function AddonFormModalContent({
  productId,
  addon,
  onClose,
  onSuccess,
}: Omit<AddonFormModalProps, "isOpen">) {
  const [name, setName] = useState(addon?.name || "");
  const [description, setDescription] = useState(addon?.description || "");
  const [priceFlat, setPriceFlat] = useState<number>(addon?.price_flat || 0);
  const [displayOrder, setDisplayOrder] = useState<number>(addon?.display_order || 0);
  const [isDefault, setIsDefault] = useState(addon?.is_default || false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama add-on wajib diisi");
      return;
    }

    setErrorMsg("");

    startTransition(async () => {
      const result = await saveAddonAction({
        id: addon?.id,
        product_id: productId,
        name: name.trim(),
        description: description.trim() || null,
        price_flat: Number(priceFlat) || 0,
        display_order: Number(displayOrder) || 0,
        is_default: isDefault,
      });

      if (!result.success) {
        setErrorMsg(result.error || "Gagal menyimpan add-on");
        return;
      }

      onSuccess();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            {addon ? "Edit Add-on" : "Tambah Add-on Baru"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="addon-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Add-on <span className="text-red-500">*</span>
            </label>
            <input
              id="addon-name"
              type="text"
              required
              placeholder="Contoh: Tanpa Laminasi, Laminasi Glossy, Box Kardus, dsb"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Input bebas & dinamis sesuai kebutuhan kategori produk.
            </p>
          </div>

          <div>
            <label htmlFor="addon-price" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Biaya Tambahan Per Lembar/Unit (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="addon-price"
                type="number"
                min="0"
                step="500"
                required
                value={priceFlat}
                onChange={(e) => setPriceFlat(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute right-3.5 top-2 text-xs font-bold text-amber-700">
                {formatCurrency(priceFlat)} / pcs
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Biaya ini akan ditambahkan ke harga tier per unit, lalu dikalikan qty.
            </p>
          </div>

          <div>
            <label htmlFor="addon-desc" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Keterangan (Opsional)
            </label>
            <textarea
              id="addon-desc"
              rows={2}
              placeholder="Contoh: Memberikan kilau cerah dan perlindungan tahan cipratan air"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="addon-order" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Urutan Tampil
              </label>
              <input
                id="addon-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-700">Pilihan Default</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan Add-on"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
