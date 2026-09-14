import { VariantPriceTier } from "@/lib/types/database";

/**
 * Format number to Indonesian Rupiah currency format
 * Example: 4800 -> "Rp 4.800"
 */
export function formatCurrency(amount: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(amount);
}

/**
 * Find the price tier matching the requested quantity
 */
export function findApplicableTier(
  tiers: VariantPriceTier[],
  qty: number
): VariantPriceTier | null {
  if (!tiers || tiers.length === 0 || qty < 1) return null;

  for (const tier of tiers) {
    const min = tier.min_qty;
    const max = tier.max_qty;

    if (qty >= min && (max === null || max === undefined || qty <= max)) {
      return tier;
    }
  }

  // Fallback to highest min_qty tier if qty exceeds all
  return tiers[tiers.length - 1] || null;
}

/**
 * Calculate total price based on unit tier price, flat add-on price, and quantity
 */
export function calculateTotalPrice(
  unitPrice: number,
  addonFlat: number,
  qty: number
): {
  unitPrice: number;
  addonFlat: number;
  totalPerUnit: number;
  grandTotal: number;
} {
  const safeQty = Math.max(1, qty);
  const totalPerUnit = unitPrice + addonFlat;
  const grandTotal = totalPerUnit * safeQty;

  return {
    unitPrice,
    addonFlat,
    totalPerUnit,
    grandTotal,
  };
}

/**
 * Get the absolute lowest unit price across all variants and tiers for a product
 * Example: if tiers have Rp 6.000, Rp 5.500, Rp 5.000, Rp 4.800 -> returns 4800
 */
export function getLowestPriceFromVariants(
  variants?: Array<{
    price_tiers?: Array<{ price_per_unit: number }>;
    variant_price_tiers?: Array<{ price_per_unit: number }>;
  }> | null
): number | null {
  if (!variants || variants.length === 0) return null;

  let minPrice = Infinity;

  for (const variant of variants) {
    const tiers = variant.price_tiers || variant.variant_price_tiers || [];
    for (const tier of tiers) {
      if (typeof tier.price_per_unit === "number" && tier.price_per_unit > 0) {
        if (tier.price_per_unit < minPrice) {
          minPrice = tier.price_per_unit;
        }
      }
    }
  }

  return minPrice === Infinity ? null : minPrice;
}

/**
 * Calculate area in m² from length (cm) and width (cm)
 * Example: 150cm x 150cm = 2.25 m²
 */
export function calculateAreaM2(lengthCm: number, widthCm: number): number {
  const safeLength = Math.max(0, lengthCm);
  const safeWidth = Math.max(0, widthCm);
  const rawM2 = (safeLength * safeWidth) / 10000;
  return Number.parseFloat(rawM2.toFixed(4));
}

/**
 * Calculate total price for area-based products (Banner, Flexi, Stiker Meteran)
 * Formula: max(Area_m2, min_area) * (Price/m2 + Addon/m2)
 */
export function calculateAreaPrice(
  pricePerM2: number,
  addonFlat: number,
  lengthCm: number,
  widthCm: number,
  qty: number,
  minAreaM2: number = 1.0
): {
  rawAreaM2: number;
  billedAreaM2: number;
  pricePerM2: number;
  addonFlat: number;
  pricePerPcs: number;
  grandTotal: number;
} {
  const safeQty = Math.max(1, qty);
  const rawAreaM2 = calculateAreaM2(lengthCm, widthCm);
  const billedAreaM2 = rawAreaM2 > 0 ? Math.max(rawAreaM2, minAreaM2) : minAreaM2;
  const pricePerPcs = Math.round(billedAreaM2 * (pricePerM2 + addonFlat));
  const grandTotal = Math.round(pricePerPcs * safeQty);

  return {
    rawAreaM2,
    billedAreaM2,
    pricePerM2,
    addonFlat,
    pricePerPcs,
    grandTotal,
  };
}

