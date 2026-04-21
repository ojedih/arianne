import type { ServiceConfig, AddonConfig, PriceBreakdown, VehicleBodyClass } from "@/types";
import type { BookingPackage } from "@/lib/business";

export function resolvePackagePrice(
  pkg: Pick<BookingPackage, "basePriceCents" | "bodyClassPrices">,
  bodyClass?: VehicleBodyClass
): number {
  if (!bodyClass) return pkg.basePriceCents;
  return (
    pkg.bodyClassPrices.find((p) => p.bodyClass === bodyClass)?.priceCents ??
    pkg.basePriceCents
  );
}

export function resolvePackageDuration(
  pkg: Pick<BookingPackage, "durationMinutes" | "bodyClassPrices">,
  bodyClass?: VehicleBodyClass
): number {
  if (!bodyClass) return pkg.durationMinutes;
  return (
    pkg.bodyClassPrices.find((p) => p.bodyClass === bodyClass)?.durationMinutes ??
    pkg.durationMinutes
  );
}

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
