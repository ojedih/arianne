"use client";

import { useRouter, useParams } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { AddonCard } from "@/components/booking/AddonCard";
import { StepTitle } from "@/components/booking/StepTitle";
import { NavButtons } from "@/components/booking/NavButtons";
import { useBookingContext } from "../BookingProvider";
import type { AddonConfig } from "@/types";

export default function AddonsPage() {
  const router = useRouter();
  const { businessHandle } = useParams() as { businessHandle: string };
  const { packages } = useBookingContext();
  const {
    selectedAddonIds,
    toggleAddon,
    setNavigationDirection,
    allSelectedServiceIds,
  } = useBookingStore();

  const selectedPackageIds = allSelectedServiceIds();

  // Collect addon items from selected packages, deduplicated by packageItemId
  const seen = new Set<string>();
  const eligibleAddons: AddonConfig[] = [];
  for (const pkg of packages) {
    if (!selectedPackageIds.includes(pkg.id)) continue;
    for (const item of pkg.addonItems) {
      if (seen.has(item.packageItemId)) continue;
      seen.add(item.packageItemId);
      eligibleAddons.push({
        id: item.packageItemId,
        name: item.name,
        shortDescription: item.description ?? "",
        fullDescription: item.description ?? "",
        price: item.addonPriceCents,
        eligibleServiceIds: [pkg.id],
      });
    }
  }

  function handleContinue() {
    setNavigationDirection("forward");
    router.push(`/${businessHandle}/book/summary`);
  }

  return (
    <div className="flex flex-col flex-1">
      <StepTitle
        title="Enhance your detail"
        subtitle={
          eligibleAddons.length > 0
            ? "These add-ons are available with your selected services."
            : "No add-ons available for your selected services."
        }
      />

      {eligibleAddons.length > 0 ? (
        <div className="flex flex-col gap-3">
          {eligibleAddons.map((addon) => (
            <AddonCard
              key={addon.id}
              addon={addon}
              selected={selectedAddonIds.includes(addon.id)}
              onToggle={() => toggleAddon(addon.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            No add-ons for your current selection.
          </p>
        </div>
      )}

      <NavButtons
        nextLabel={
          selectedAddonIds.length > 0
            ? `Continue with ${selectedAddonIds.length} add-on${selectedAddonIds.length > 1 ? "s" : ""}`
            : "Continue without add-ons"
        }
        onNext={handleContinue}
        backHref={`/${businessHandle}/book/interior`}
      />
    </div>
  );
}
