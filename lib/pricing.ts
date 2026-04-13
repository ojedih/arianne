import type { ServiceConfig, AddonConfig, PriceBreakdown } from "@/types";

export function calculatePricing(
  services: ServiceConfig[],
  addons: AddonConfig[],
  taxRate: number
): PriceBreakdown {
  const lineItems = [
    ...services.map((s) => ({ label: s.name, priceCents: s.basePrice })),
    ...addons.map((a) => ({ label: a.name, priceCents: a.price })),
  ];

  const subtotalCents = lineItems.reduce((sum, li) => sum + li.priceCents, 0);
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;

  return { lineItems, subtotalCents, taxCents, totalCents };
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
