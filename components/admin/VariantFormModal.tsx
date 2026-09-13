"use client";

import { useState } from "react";
import { VariantWithTiers } from "@/lib/repositories/variants.repository";
import { saveVariantAction } from "@/app/admin/actions/variants.action";
import VariantPriceTierEditor, { FormTierItem } from "./VariantPriceTierEditor";

interface VariantFormModalProps {
  readonly productId: string;
  readonly variant?: VariantWithTiers | null;
  readonly pricingModel?: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export default function VariantFormModal({
  productId,
  variant,
  pricingModel = "sheet",
  isOpen,
  onClose,
  onSuccess,
}: VariantFormModalProps) {
  if (!isOpen) return null;

  return (
    <VariantFormContent
      key={variant?.id || "new"}
      productId={productId}
      variant={variant}
      pricingModel={pricingModel}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function VariantFormContent({
  productId,
  variant,
  pricingModel,
  onClose,
  onSuccess,
}: Omit<VariantFormModalProps, "isOpen">) {
  const isEdit = !!variant;
  const [variantName, setVariantName] = useState(variant?.variant_name || "");
  const [description, setDescription] = useState(variant?.description || "");
  const [sku, setSku] = useState(variant?.sku || "");
  const [isDefault, setIsDefault] = useState(variant?.is_default ?? false);
  const [displayOrder, setDisplayOrder] = useState(variant?.display_order || 0);
  
  const initialTiers: FormTierItem[] =
    variant?.price_tiers && variant.price_tiers.length > 0
      ? variant.price_tiers.map((t, idx) => ({
          id: t.id,
          min_qty: t.min_qty,
          max_qty: t.max_qty,
          price_per_unit: Number(t.price_per_unit) || 0,
          lead_time_days: t.lead_time_days || "1 Hari",
          discount_label: t.discount_label || "",
          display_order: t.display_order ?? idx,
        }))
      : [
          {
            min_qty: 1,
            max_qty: null,
            price_per_unit: 0,
            lead_time_days: "1 Hari",
            discount_label: "",
            display_order: 0,
          },
        ];

  const [tiers, setTiers] = useState<FormTierItem[]>(initialTiers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await saveVariantAction({
      id: variant?.id,
      product_id: productId,
      variant_name: variantName.trim(),
      description: description.trim() || null,
      sku: sku.trim() || null,
      is_default: isDefault,
      display_order: displayOrder,
      tiers,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error || "Gagal menyimpan varian");
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
              {isEdit ? "Edit Varian Finishing" : "Tambah Varian Finishing Baru"}
            </h2>
            {isEdit && (
              <span className="text-[11px] font-mono text-slate-400">
                ID DB: {variant.id}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200 shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="var-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Varian Finishing (Bebas) <span className="text-red-500">*</span>
              </label>
              <input
                id="var-name"
                type="text"
                required
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="Contoh: Mata Ayam / Selongsong / Kiss Cut"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label htmlFor="var-sku" className="block text-xs font-semibold text-slate-700 mb-1">
                SKU / Kode Opsi (Opsional)
              </label>
              <input
                id="var-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="BNR-MATA-AYAM"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono text-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="var-desc" className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Finishing (Opsional)
            </label>
            <input
              id="var-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Mata ayam tiap sudut untuk pengikatan tali"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <VariantPriceTierEditor
            tiers={tiers}
            onChange={setTiers}
            pricingModel={pricingModel}
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="var-order" className="block text-xs font-semibold text-slate-700 mb-1">
                Urutan Tampil
              </label>
              <input
                id="var-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number.parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center pt-5">
              <label htmlFor="var-default" className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                <input
                  id="var-default"
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
                Pilihan Default / Terpopuler
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
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
              {loading ? "Menyimpan..." : "Simpan Varian & Tier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
