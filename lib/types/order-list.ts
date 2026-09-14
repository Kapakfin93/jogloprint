export interface OrderItem {
  id: string;
  productName: string;
  productSlug: string;
  variantName: string;
  addonName: string;
  addonPrice: number;
  unitPrice: number;
  qty: number;
  unitLabel: string;
  pricingModel?: string;
  lengthCm?: number;
  widthCm?: number;
  rawAreaM2?: number;
  billedAreaM2?: number;
  needsSeam?: boolean;
  totalPerUnit: number;
  subtotal: number;
  productUrl: string;
  addedAt: number;
}
