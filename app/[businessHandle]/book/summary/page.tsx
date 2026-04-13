"use client";

import { useRouter, useParams } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { StepTitle } from "@/components/booking/StepTitle";
import { NavButtons } from "@/components/booking/NavButtons";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { useBookingContext } from "../BookingProvider";
import { formatCents } from "@/lib/pricing";

export default function SummaryPage() {
  const router = useRouter();
  const { businessHandle } = useParams() as { businessHandle: string };
  const { packages, business } = useBookingContext();
  const {
    selectedExteriorServiceIds,
    selectedInteriorServiceIds,
    selectedAddonIds,
    setNavigationDirection,
  } = useBookingStore();

  const allSelectedPackageIds = [
    ...selectedExteriorServiceIds,
    ...selectedInteriorServiceIds,
  ];

  const selectedPackages = packages.filter((p) =>
    allSelectedPackageIds.includes(p.id)
  );

  // Collect selected addon items across all selected packages
  const selectedAddonItems = selectedPackages.flatMap((pkg) =>
    pkg.addonItems.filter((item) => selectedAddonIds.includes(item.packageItemId))
  );

  const subtotalCents =
    selectedPackages.reduce((sum, p) => sum + p.basePriceCents, 0) +
    selectedAddonItems.reduce((sum, a) => sum + a.addonPriceCents, 0);
  const taxCents = Math.round(subtotalCents * business.taxRate);
  const totalCents = subtotalCents + taxCents;

  const breakdown = {
    lineItems: [
      ...selectedPackages.map((p) => ({ label: p.name, priceCents: p.basePriceCents })),
      ...selectedAddonItems.map((a) => ({ label: a.name, priceCents: a.addonPriceCents })),
    ],
    subtotalCents,
    taxCents,
    totalCents,
  };

  function handleContinue() {
    setNavigationDirection("forward");
    router.push(`/${businessHandle}/book/datetime`);
  }

  return (
    <div className="flex flex-col flex-1">
      <StepTitle title="Your booking summary" />

      {selectedPackages.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
            Services
          </h2>
          <div className="flex flex-col gap-2">
            {selectedPackages.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ backgroundColor: "var(--accent-light, #eff6ff)", borderRadius: "var(--ui-radius, 0.75rem)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--accent, #2563eb)" }} />
                <span className="text-sm font-medium text-gray-800 flex-1">
                  {p.name}
                </span>
                <EditLink href={`/${businessHandle}/book/exterior`} handle={businessHandle}>
                  {formatCents(p.basePriceCents)}
                </EditLink>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAddonItems.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
            Add-ons
          </h2>
          <div className="flex flex-col gap-2">
            {selectedAddonItems.map((a) => (
              <div
                key={a.packageItemId}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                <span className="text-sm font-medium text-gray-800 flex-1">
                  {a.name}
                </span>
                <span className="text-xs text-blue-500 font-medium">
                  +{formatCents(a.addonPriceCents)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <PriceSummary breakdown={breakdown} taxRate={business.taxRate} />

      <NavButtons
        nextLabel="Looks good — pick a time"
        onNext={handleContinue}
        backHref={`/${businessHandle}/book/addons`}
      />
    </div>
  );
}

function EditLink({
  href,
  handle: _handle,
  children,
}: {
  href: string;
  handle: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setDirection = useBookingStore((s) => s.setNavigationDirection);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setDirection("backward");
        router.push(href);
      }}
      className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
    >
      {children}
    </button>
  );
}
