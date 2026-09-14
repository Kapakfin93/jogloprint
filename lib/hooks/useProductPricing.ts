"use client";

import { useMemo } from "react";
import { VariantDetailItem } from "@/lib/repositories/product-detail.repository";
import { ProductAddon, PricingEngine } from "@/lib/types/database";
import {
  findApplicableTier,
  calculateTotalPrice,
  calculateAreaPrice,
} from "@/lib/services/pricing.service";

interface UseProductPricingParams {
  readonly pricingModel: PricingEngine;
  readonly variants: readonly VariantDetailItem[];
  readonly addons: readonly ProductAddon[];
  readonly selectedVariantId: string;
  readonly selectedAddonId: string;
  readonly qty: number;
  readonly lengthCm: number;
  readonly widthCm: number;
  readonly minOrderQty: number;
  readonly maxRollWidthCm?: number | null;
  readonly unitLabel?: string | null;
}

export function useProductPricing({
  pricingModel,
  variants,
  addons,
  selectedVariantId,
  selectedAddonId,
  qty,
  lengthCm,
  widthCm,
  minOrderQty,
  maxRollWidthCm,
  unitLabel,
}: UseProductPricingParams) {
  const isArea = pricingModel === "area";
  const isMeterLari = pricingModel === "meter_lari";

  const defaultVariant = variants.find((v) => v.is_default) || variants[0] || null;
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || defaultVariant;

  const defaultAddon = addons.find((a) => a.is_default) || addons[0] || null;
  const selectedAddon = addons.find((a) => a.id === selectedAddonId) || defaultAddon;

  const safeUnit = useMemo(() => {
    if (unitLabel) return unitLabel;
    if (isArea) return "m²";
    if (isMeterLari) return "meter";
    return "lembar";
  }, [unitLabel, isArea, isMeterLari]);

  const applicableTier = findApplicableTier(selectedVariant?.price_tiers || [], qty);
  const unitPrice = applicableTier?.price_per_unit || 0;
  const addonFlat = selectedAddon?.price_flat || 0;

  const areaCalc = useMemo(() => {
    if (!isArea) return null;
    return calculateAreaPrice(unitPrice, addonFlat, lengthCm, widthCm, qty, minOrderQty);
  }, [isArea, unitPrice, addonFlat, lengthCm, widthCm, qty, minOrderQty]);

  const standardCalc = useMemo(() => {
    if (isArea) return null;
    return calculateTotalPrice(unitPrice, addonFlat, qty);
  }, [isArea, unitPrice, addonFlat, qty]);

  const pricingSummary = useMemo(() => {
    if (isArea && areaCalc) {
      return {
        calcUnitPrice: areaCalc.pricePerM2,
        calcAddonFlat: areaCalc.addonFlat,
        totalPerUnit: areaCalc.pricePerPcs,
        grandTotal: areaCalc.grandTotal,
      };
    }
    return {
      calcUnitPrice: standardCalc?.unitPrice || unitPrice,
      calcAddonFlat: standardCalc?.addonFlat || addonFlat,
      totalPerUnit: standardCalc?.totalPerUnit || 0,
      grandTotal: standardCalc?.grandTotal || 0,
    };
  }, [isArea, areaCalc, standardCalc, unitPrice, addonFlat]);

  const needsSeam = useMemo(() => {
    if (!isArea || !maxRollWidthCm) return false;
    return lengthCm > maxRollWidthCm && widthCm > maxRollWidthCm;
  }, [isArea, maxRollWidthCm, lengthCm, widthCm]);

  const bannerInfo = useMemo(() => {
    if (isArea) {
      return {
        title: "Harga Banner / Meter Persegi (m²)",
        subtitle: "Hitungan otomatis per luas area",
      };
    }
    if (isMeterLari) {
      return {
        title: "Harga Cetak / Meter Lari (m)",
        subtitle: "Hitungan otomatis per panjang meter",
      };
    }
    return {
      title: "Harga Grosir Fleksibel",
      subtitle: "Tersedia berbagai pilihan kuantitas",
    };
  }, [isArea, isMeterLari]);

  return {
    isArea,
    isMeterLari,
    defaultVariant,
    selectedVariant,
    defaultAddon,
    selectedAddon,
    safeUnit,
    applicableTier,
    unitPrice,
    addonFlat,
    areaCalc,
    ...pricingSummary,
    needsSeam,
    bannerTitle: bannerInfo.title,
    bannerSub: bannerInfo.subtitle,
  };
}
