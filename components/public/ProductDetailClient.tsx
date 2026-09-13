"use client";

import { useState } from "react";
import { VariantDetailItem } from "@/lib/repositories/product-detail.repository";
import { ProductAddon, PricingEngine } from "@/lib/types/database";
import {
  findApplicableTier,
  calculateTotalPrice,
  calculateAreaPrice,
  formatCurrency,
} from "@/lib/services/pricing.service";
import {
  generateOrderMessage,
  generateWhatsAppUrl,
} from "@/lib/services/whatsapp-message.service";
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
  readonly pricingModel?: PricingEngine | string;
  readonly minOrderQty?: number | null;
  readonly variants: VariantDetailItem[];
  readonly addons?: ProductAddon[];
  readonly unitLabel?: string | null;
  readonly lowestPrice: number | null;
  readonly whatsappNumber?: string | null;
}

export default function ProductDetailClient({
  productName,
  productSlug,
  pricingModel = "sheet",
  minOrderQty = 1.0,
  variants,
  addons = [],
  unitLabel,
  lowestPrice,
  whatsappNumber,
}: ProductDetailClientProps) {
  const isArea = pricingModel === "area";
  const isMeterLari = pricingModel === "meter_lari";
  const defaultVariant = variants.find((v) => v.is_default) || variants[0] || null;
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    defaultVariant?.id || ""
  );

  const defaultAddon = addons.find((a) => a.is_default) || addons[0] || null;
  const [selectedAddonId, setSelectedAddonId] = useState<string>(
    defaultAddon?.id || ""
  );

  const [qty, setQty] = useState<number>(1);
  const [lengthCm, setLengthCm] = useState<number>(150);
  const [widthCm, setWidthCm] = useState<number>(100);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || defaultVariant;
  const selectedAddon = addons.find((a) => a.id === selectedAddonId) || defaultAddon;
  
  let defaultUnit = "lembar";
  if (isArea) defaultUnit = "m²";
  else if (isMeterLari) defaultUnit = "meter";
  const safeUnit = unitLabel || defaultUnit;

  // Tier lookup based on qty (panjang meter / kuantitas lembar)
  const applicableTier = findApplicableTier(selectedVariant?.price_tiers || [], qty);
  const unitPrice = applicableTier?.price_per_unit || 0;
  const addonFlat = selectedAddon?.price_flat || 0;

  // Calculation dispatch: Area vs Standard Unit (Sheet / Meter Lari / Bundle)
  const areaCalc = isArea
    ? calculateAreaPrice(unitPrice, addonFlat, lengthCm, widthCm, qty, minOrderQty || 1.0)
    : null;

  const standardCalc = !isArea
    ? calculateTotalPrice(unitPrice, addonFlat, qty)
    : null;

  let calcUnitPrice = unitPrice;
  let calcAddonFlat = addonFlat;
  let totalPerUnit = 0;
  let grandTotal = 0;

  if (isArea && areaCalc) {
    calcUnitPrice = areaCalc.pricePerM2;
    calcAddonFlat = areaCalc.addonFlat;
    totalPerUnit = areaCalc.pricePerPcs;
    grandTotal = areaCalc.grandTotal;
  } else if (standardCalc) {
    calcUnitPrice = standardCalc.unitPrice;
    calcAddonFlat = standardCalc.addonFlat;
    totalPerUnit = standardCalc.totalPerUnit;
    grandTotal = standardCalc.grandTotal;
  }

  // WhatsApp structured order message generation
  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jogloweb.vercel.app";
  const productUrl =
    typeof window !== "undefined" && window.location.href
      ? window.location.href
      : `${siteBaseUrl}/produk/${productSlug}`;

  const orderMessage = generateOrderMessage({
    productName,
    variantName: selectedVariant?.variant_name || "-",
    addonName: selectedAddon?.name || "Standar / Tanpa Tambahan",
    addonPrice: addonFlat,
    unitPrice,
    qty,
    unitLabel: safeUnit,
    totalPerUnit,
    grandTotal,
    productUrl,
    pricingModel,
    lengthCm: isArea ? lengthCm : undefined,
    widthCm: isArea ? widthCm : undefined,
    rawAreaM2: isArea ? areaCalc?.rawAreaM2 : undefined,
    billedAreaM2: isArea ? areaCalc?.billedAreaM2 : undefined,
  });

  const waNumber = whatsappNumber || "628123456789";
  const whatsappUrl = generateWhatsAppUrl(waNumber, orderMessage);

  let bannerTitle = "Harga Grosir Fleksibel";
  let bannerSub = "Tersedia berbagai pilihan kuantitas";
  if (isArea) {
    bannerTitle = "Harga Banner / Meter Persegi (m²)";
    bannerSub = "Hitungan otomatis per luas area";
  } else if (isMeterLari) {
    bannerTitle = "Harga Cetak / Meter Lari (m)";
    bannerSub = "Hitungan otomatis per panjang meter";
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Price Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {bannerTitle}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xs text-slate-500 font-medium">Mulai dari</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {lowestPrice !== null ? formatCurrency(lowestPrice) : "Hubungi CS"}
            </span>
            <span className="text-xs font-bold text-slate-600">
              / {safeUnit}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
            ✓ Sudah Termasuk Cetak & Bahan
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            {bannerSub}
          </span>
        </div>
      </div>

      {/* 1. Variant Selector (Lebar Bahan untuk Meter Lari / Finishing untuk Sheet & Area) */}
      <VariantSelector
        variants={variants}
        selectedVariantId={selectedVariantId}
        onSelectVariant={setSelectedVariantId}
        title={isMeterLari ? "1. Pilih Lebar Bahan" : "1. Jenis Finishing / Pilihan Varian"}
      />

      {/* 2. Add-on Selector (Finishing Jahit untuk Meter Lari / Laminasi untuk Sheet) */}
      {addons.length > 0 && (
        <AddonSelector
          addons={addons}
          selectedAddonId={selectedAddonId}
          unitLabel={isArea ? "pcs" : safeUnit}
          onSelectAddon={setSelectedAddonId}
          title={isMeterLari ? "2. Jenis Finishing / Jahitan" : "2. Lapisan Tambahan / Add-on"}
        />
      )}

      {/* 3. Input Model: Area (Panjang x Lebar) vs Standard Qty (Lembar / Meter / Buku) */}
      {isArea ? (
        <DimensionInput
          lengthCm={lengthCm}
          widthCm={widthCm}
          qty={qty}
          minAreaM2={minOrderQty || 1.0}
          onChangeLength={setLengthCm}
          onChangeWidth={setWidthCm}
          onChangeQty={setQty}
        />
      ) : (
        <QuantityInput
          qty={qty}
          unitLabel={safeUnit}
          onChangeQty={setQty}
        />
      )}

      {/* 4. Live Order Price Calculation Summary */}
      <OrderPriceSummary
        unitPrice={calcUnitPrice}
        addonFlat={calcAddonFlat}
        qty={qty}
        totalPerUnit={totalPerUnit}
        grandTotal={grandTotal}
        unitLabel={isArea ? "pcs" : safeUnit}
        leadTimeDays={applicableTier?.lead_time_days}
      />

      {/* 5. WhatsApp Structured CTA Action */}
      <WhatsAppCTA
        whatsappUrl={whatsappUrl}
        whatsappNumber={waNumber}
        productName={productName}
      />

      {/* 6. Reactive Tiered Volume Pricing Table */}
      {selectedVariant && (
        <VariantPriceTable
          tiers={selectedVariant.price_tiers}
          unitLabel={safeUnit}
        />
      )}
    </div>
  );
}
