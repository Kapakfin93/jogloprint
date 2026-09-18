"use client";

import { useState, useMemo, useCallback } from "react";
import { VariantDetailItem } from "@/lib/repositories/product-detail.repository";
import { ProductAddon, PricingEngine, AddonSelectionMode } from "@/lib/types/database";
import { formatCurrency } from "@/lib/services/pricing.service";
import {
  generateOrderMessage,
  generateWhatsAppUrl,
} from "@/lib/services/whatsapp-message.service";
import { useProductPricing } from "@/lib/hooks/useProductPricing";
import { useOrderList } from "@/context/OrderListContext";
import VariantSelector from "./VariantSelector";
import AddonSelector from "./AddonSelector";
import QuantityInput from "./QuantityInput";
import DimensionInput from "./DimensionInput";
import OrderPriceSummary from "./OrderPriceSummary";
import VariantPriceTable from "./VariantPriceTable";
import WhatsAppCTA from "./WhatsAppCTA";

interface ProductDetailClientProps {
  readonly productName: string;
  readonly productSlug: string;
  readonly pricingModel?: PricingEngine;
  readonly addonSelectionMode?: AddonSelectionMode;
  readonly minOrderQty?: number | null;
  readonly maxRollWidthCm?: number | null;
  readonly variants: readonly VariantDetailItem[];
  readonly addons?: readonly ProductAddon[];
  readonly unitLabel?: string | null;
  readonly lowestPrice: number | null;
  readonly whatsappNumber?: string | null;
}

export default function ProductDetailClient({
  productName,
  productSlug,
  pricingModel = "sheet",
  addonSelectionMode = "single",
  minOrderQty = 1.0,
  maxRollWidthCm,
  variants,
  addons = [],
  unitLabel,
  lowestPrice,
  whatsappNumber,
}: ProductDetailClientProps) {
  const { addItem } = useOrderList();
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const defaultVariantId = variants.find((v) => v.is_default)?.id || variants[0]?.id || "";
  const [selectedVariantId, setSelectedVariantId] = useState<string>(defaultVariantId);

  const isMulti = addonSelectionMode === "multi";

  const initialAddonIds = useMemo(() => {
    if (isMulti) {
      return addons.filter((a) => a.is_default).map((a) => a.id);
    }
    const def = addons.find((a) => a.is_default)?.id || addons[0]?.id;
    return def ? [def] : [];
  }, [addons, isMulti]);

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(initialAddonIds);

  const handleToggleAddon = useCallback((id: string) => {
    if (isMulti) {
      setSelectedAddonIds((prev) => {
        const clickedAddon = addons.find((a) => a.id === id);
        if (!clickedAddon) return prev;

        const isRemoving = prev.includes(id);

        const getGroupKey = (name: string): string | null => {
          const n = name.toLowerCase();
          if (n.includes("laminasi") || n.includes("glossy") || n.includes("doff")) return "laminasi";
          if (n.includes("jilid")) return "jilid";
          if (n.includes("warna") && (n.includes("1 warna") || n.includes("multi warna") || n.includes("2+ warna") || n.includes("2 warna"))) return "warna";
          if (n.includes("cetak isi") || n.includes("kertas isi")) return "isi";
          return null;
        };

        const group = getGroupKey(clickedAddon.name);

        if (isRemoving) {
          const remaining = prev.filter((item) => item !== id);
          if (group) {
            const hasOtherInGroup = remaining.some((remId) => {
              const other = addons.find((a) => a.id === remId);
              return other && getGroupKey(other.name) === group;
            });
            if (!hasOtherInGroup) {
              const defaultInGroup = addons.find((a) => a.is_default && getGroupKey(a.name) === group);
              if (defaultInGroup) {
                return [...remaining, defaultInGroup.id];
              }
            }
          }
          return remaining;
        } else {
          let filtered = prev;
          if (group) {
            filtered = prev.filter((prevId) => {
              const other = addons.find((a) => a.id === prevId);
              return !(other && getGroupKey(other.name) === group);
            });
          }
          return [...filtered, id];
        }
      });
    } else {
      setSelectedAddonIds([id]);
    }
  }, [isMulti, addons]);

  const [qty, setQty] = useState<number>(minOrderQty || 1);
  const [lengthCm, setLengthCm] = useState<number>(150);
  const [widthCm, setWidthCm] = useState<number>(100);

  const pricing = useProductPricing({
    pricingModel,
    variants,
    addons,
    selectedVariantId,
    selectedAddonIds,
    qty,
    lengthCm,
    widthCm,
    minOrderQty: minOrderQty || 1.0,
    maxRollWidthCm,
    unitLabel,
  });

  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jogloweb.vercel.app";
  const productUrl = `${siteBaseUrl}/produk/${productSlug}`;

  const orderMessage = generateOrderMessage({
    productName,
    variantName: pricing.selectedVariant?.variant_name || "-",
    addonName: pricing.combinedAddonName,
    addonPrice: pricing.addonFlat,
    selectedAddons: pricing.selectedAddons.map((a) => ({ name: a.name, price_flat: a.price_flat })),
    unitPrice: pricing.unitPrice,
    qty,
    unitLabel: pricing.safeUnit,
    totalPerUnit: pricing.totalPerUnit,
    grandTotal: pricing.grandTotal,
    productUrl,
    pricingModel,
    lengthCm: pricing.isArea ? lengthCm : undefined,
    widthCm: pricing.isArea ? widthCm : undefined,
    rawAreaM2: pricing.isArea ? pricing.areaCalc?.rawAreaM2 : undefined,
    billedAreaM2: pricing.isArea ? pricing.areaCalc?.billedAreaM2 : undefined,
    needsSeam: pricing.needsSeam,
  });

  const waNumber = whatsappNumber || "6281390286826";
  const whatsappUrl = generateWhatsAppUrl(waNumber, orderMessage);

  function handleAddToOrderList() {
    addItem({
      productName,
      productSlug,
      variantName: pricing.selectedVariant?.variant_name || "-",
      addonName: pricing.combinedAddonName,
      addonPrice: pricing.addonFlat,
      selectedAddons: pricing.selectedAddons.map((a) => ({ name: a.name, price_flat: a.price_flat })),
      unitPrice: pricing.calcUnitPrice,
      qty,
      unitLabel: pricing.isArea ? "pcs" : pricing.safeUnit,
      pricingModel,
      lengthCm: pricing.isArea ? lengthCm : undefined,
      widthCm: pricing.isArea ? widthCm : undefined,
      rawAreaM2: pricing.isArea ? pricing.areaCalc?.rawAreaM2 : undefined,
      billedAreaM2: pricing.isArea ? pricing.areaCalc?.billedAreaM2 : undefined,
      needsSeam: pricing.isArea ? pricing.needsSeam : undefined,
      totalPerUnit: pricing.totalPerUnit,
      subtotal: pricing.grandTotal,
      productUrl,
    });
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Price Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {pricing.bannerTitle}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xs text-slate-500 font-medium">Mulai dari</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {lowestPrice !== null ? formatCurrency(lowestPrice) : "Hubungi CS"}
            </span>
            <span className="text-xs font-bold text-slate-600">
              / {pricing.safeUnit}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
            ✓ Sudah Termasuk Cetak & Bahan
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            {pricing.bannerSub}
          </span>
        </div>
      </div>

      {/* 1. Variant Selector */}
      <VariantSelector
        variants={variants as VariantDetailItem[]}
        selectedVariantId={selectedVariantId}
        onSelectVariant={setSelectedVariantId}
        title={pricing.isMeterLari ? "1. Pilih Lebar Bahan" : "1. Jenis Finishing / Pilihan Varian"}
      />

      {/* 2. Add-on Selector */}
      {addons.length > 0 && (
        <AddonSelector
          addons={addons as ProductAddon[]}
          selectedAddonIds={selectedAddonIds}
          selectionMode={addonSelectionMode}
          unitLabel={pricing.isArea ? "pcs" : pricing.safeUnit}
          onToggleAddon={handleToggleAddon}
          title={pricing.isMeterLari ? "2. Jenis Finishing / Jahitan" : undefined}
        />
      )}

      {/* 3. Input Model: Area (Panjang x Lebar) vs Standard Qty */}
      {pricing.isArea ? (
        <DimensionInput
          lengthCm={lengthCm}
          widthCm={widthCm}
          qty={qty}
          minAreaM2={minOrderQty || 1.0}
          maxRollWidthCm={maxRollWidthCm ?? undefined}
          onChangeLength={setLengthCm}
          onChangeWidth={setWidthCm}
          onChangeQty={setQty}
        />
      ) : (
        <QuantityInput
          qty={qty}
          unitLabel={pricing.safeUnit}
          minQty={minOrderQty}
          step={productSlug === "id-card-pvc-custom" ? 5 : 1}
          onChangeQty={setQty}
        />
      )}

      {/* 4. Live Order Price Calculation Summary */}
      <OrderPriceSummary
        unitPrice={pricing.calcUnitPrice}
        addonFlat={pricing.calcAddonFlat}
        qty={qty}
        totalPerUnit={pricing.totalPerUnit}
        grandTotal={pricing.grandTotal}
        unitLabel={pricing.isArea ? "pcs" : pricing.safeUnit}
        leadTimeDays={pricing.applicableTier?.lead_time_days}
      />

      {/* 5. WhatsApp Structured CTA Action */}
      <WhatsAppCTA
        whatsappUrl={whatsappUrl}
        whatsappNumber={waNumber}
        productName={productName}
        onAddToOrderList={handleAddToOrderList}
        isAddedSuccess={isAddedSuccess}
      />

      {/* 6. Reactive Tiered Volume Pricing Table */}
      {pricing.selectedVariant && (
        <VariantPriceTable
          tiers={pricing.selectedVariant.price_tiers}
          unitLabel={pricing.safeUnit}
        />
      )}
    </div>
  );
}
