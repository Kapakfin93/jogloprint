import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatCurrency,
  findApplicableTier,
  calculateTotalPrice,
  getLowestPriceFromVariants,
  calculateAreaM2,
  calculateAreaPrice,
} from "../lib/services/pricing.service";
import {
  generateOrderMessage,
  generateMultiItemOrderMessage,
  generateWhatsAppUrl,
} from "../lib/services/whatsapp-message.service";
import { VariantPriceTier } from "../lib/types/database";

describe("Pricing Service - Robustness & Boundary Conditions", () => {
  const sampleTiers: VariantPriceTier[] = [
    {
      id: "t1",
      variant_id: "v1",
      min_qty: 1,
      max_qty: 9,
      price_per_unit: 10000,
      lead_time_days: "1",
      discount_label: null,
      display_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: "t2",
      variant_id: "v1",
      min_qty: 10,
      max_qty: 49,
      price_per_unit: 8500,
      lead_time_days: "1",
      discount_label: "Diskon 15%",
      display_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: "t3",
      variant_id: "v1",
      min_qty: 50,
      max_qty: 99999,
      price_per_unit: 7000,
      lead_time_days: "2",
      discount_label: "Grosir",
      display_order: 3,
      created_at: new Date().toISOString(),
    },
  ];

  it("findApplicableTier: handles qty = 0, negative qty, and null/empty tiers safely", () => {
    assert.equal(findApplicableTier(sampleTiers, 0), null);
    assert.equal(findApplicableTier(sampleTiers, -5), null);
    assert.equal(findApplicableTier([], 10), null);
    // @ts-expect-error testing null/undefined safety
    assert.equal(findApplicableTier(null, 10), null);
    // @ts-expect-error testing undefined safety
    assert.equal(findApplicableTier(undefined, 10), null);
  });

  it("findApplicableTier: matches exact tiers and falls back when qty exceeds all tiers", () => {
    const tier1 = findApplicableTier(sampleTiers, 5);
    assert.equal(tier1?.price_per_unit, 10000);

    const tier2 = findApplicableTier(sampleTiers, 10);
    assert.equal(tier2?.price_per_unit, 8500);

    const tier3 = findApplicableTier(sampleTiers, 50);
    assert.equal(tier3?.price_per_unit, 7000);

    // Qty exceeds max tier (e.g. 1000000) -> falls back to highest tier
    const exceededTier = findApplicableTier(sampleTiers, 1000000);
    assert.equal(exceededTier?.price_per_unit, 7000);
  });

  it("calculateTotalPrice: handles qty = 0, negative qty by enforcing safe minimum qty of 1", () => {
    const zeroResult = calculateTotalPrice(10000, 2000, 0);
    assert.equal(zeroResult.totalPerUnit, 12000);
    assert.equal(zeroResult.grandTotal, 12000); // safeQty = 1

    const negResult = calculateTotalPrice(10000, 2000, -10);
    assert.equal(negResult.grandTotal, 12000);
  });

  it("calculateAreaM2 & calculateAreaPrice: handles 0, negative dimensions, and minimum billed area", () => {
    // 0 and negative dimensions
    assert.equal(calculateAreaM2(0, 0), 0);
    assert.equal(calculateAreaM2(-100, 50), 0);
    assert.equal(calculateAreaM2(100, -50), 0);

    // Valid dimensions: 200cm x 150cm = 3.0 m²
    assert.equal(calculateAreaM2(200, 150), 3.0);

    // Area smaller than minAreaM2 (e.g. 50cm x 50cm = 0.25 m², default min = 1.0 m²)
    const smallBanner = calculateAreaPrice(20000, 0, 50, 50, 1, 1.0);
    assert.equal(smallBanner.rawAreaM2, 0.25);
    assert.equal(smallBanner.billedAreaM2, 1.0); // clamped to min 1.0 m²
    assert.equal(smallBanner.pricePerPcs, 20000);
    assert.equal(smallBanner.grandTotal, 20000);

    // Negative dimension input in calculateAreaPrice safely uses minAreaM2
    const negBanner = calculateAreaPrice(20000, 0, -100, 100, 1, 1.0);
    assert.equal(negBanner.rawAreaM2, 0);
    assert.equal(negBanner.billedAreaM2, 1.0);
    assert.equal(negBanner.grandTotal, 20000);
  });

  it("getLowestPriceFromVariants: handles null, empty, or zero/invalid prices safely", () => {
    assert.equal(getLowestPriceFromVariants(null), null);
    assert.equal(getLowestPriceFromVariants([]), null);
    assert.equal(
      getLowestPriceFromVariants([
        {
          price_tiers: [{ price_per_unit: 10000 }, { price_per_unit: 6500 }],
        },
        {
          price_tiers: [{ price_per_unit: 8000 }, { price_per_unit: 5000 }],
        },
      ]),
      5000
    );
  });

  it("formatCurrency: correctly formats currency into Indonesian Rupiah standard", () => {
    assert.equal(formatCurrency(0), "Rp 0");
    assert.equal(formatCurrency(5000), "Rp 5.000");
    assert.equal(formatCurrency(1250000), "Rp 1.250.000");
  });
});

describe("WhatsApp Message Service - Robustness & Template Integrity", () => {
  it("generateOrderMessage: renders complete single order message for sheet products", () => {
    const msg = generateOrderMessage({
      productName: "Stiker Kromo A3+",
      variantName: "Kiss Cut",
      addonName: "Laminasi Glossy",
      addonPrice: 2000,
      unitPrice: 7500,
      qty: 10,
      unitLabel: "lembar",
      totalPerUnit: 9500,
      grandTotal: 95000,
      productUrl: "https://jogloprint.id/produk/stiker-kromo-a3",
      pricingModel: "sheet",
    });

    assert.ok(msg.includes("Stiker Kromo A3+"));
    assert.ok(msg.includes("Kiss Cut"));
    assert.ok(msg.includes("Laminasi Glossy"));
    assert.ok(msg.includes("10 lembar"));
    assert.ok(msg.includes("Rp 95.000"));
  });

  it("generateOrderMessage: renders area product with dimensions & billed area note", () => {
    const msg = generateOrderMessage({
      productName: "Spanduk Banner MMT",
      variantName: "Flexi 280gr",
      addonName: "Mata Ayam 4 Sudut",
      addonPrice: 0,
      unitPrice: 20000,
      qty: 1,
      totalPerUnit: 20000,
      grandTotal: 20000,
      productUrl: "https://jogloprint.id/produk/banner-mmt",
      pricingModel: "area",
      lengthCm: 50,
      widthCm: 50,
      rawAreaM2: 0.25,
      billedAreaM2: 1.0,
    });

    assert.ok(msg.includes("50 cm x 50 cm"));
    assert.ok(msg.includes("Min hitung 1.0 m²"));
    assert.ok(msg.includes("Flexi 280gr"));
  });

  it("generateMultiItemOrderMessage: safely handles empty cart and multi items", () => {
    // Empty items
    const emptyMsg = generateMultiItemOrderMessage([]);
    assert.equal(emptyMsg, "Halo Joglo Print, saya ingin konsultasi pesanan cetak.");

    // Multi items
    const multiMsg = generateMultiItemOrderMessage([
      {
        productName: "Stiker Kromo A3+",
        variantName: "Kiss Cut",
        addonName: "Tanpa Tambahan",
        addonPrice: 0,
        qty: 10,
        unitLabel: "lembar",
        totalPerUnit: 7500,
        subtotal: 75000,
        productUrl: "https://jogloprint.id/produk/stiker-kromo-a3",
      },
      {
        productName: "ID Card PVC Custom",
        variantName: "1 Muka",
        addonName: "Tali Lanyard",
        addonPrice: 5000,
        qty: 25,
        unitLabel: "pcs",
        totalPerUnit: 13000,
        subtotal: 325000,
        productUrl: "https://jogloprint.id/produk/id-card-pvc-custom",
      },
    ]);

    assert.ok(multiMsg.includes("ITEM #1: Stiker Kromo A3+"));
    assert.ok(multiMsg.includes("ITEM #2: ID Card PVC Custom"));
    assert.ok(multiMsg.includes("TOTAL KESELURUHAN (2 ITEM): Rp 400.000"));
  });

  it("generateWhatsAppUrl: cleans formatting characters and normalizes 08 prefix to 62", () => {
    const url1 = generateWhatsAppUrl("0813-9028-6826", "Halo");
    assert.ok(url1.startsWith("https://wa.me/6281390286826?text="));

    const url2 = generateWhatsAppUrl("+62 813-9028-6826", "Test");
    assert.ok(url2.startsWith("https://wa.me/6281390286826?text="));
  });
});
