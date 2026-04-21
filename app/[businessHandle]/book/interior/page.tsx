"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { ServiceCard } from "@/components/booking/ServiceCard";
import { StepTitle } from "@/components/booking/StepTitle";
import { useBookingContext } from "../BookingProvider";
import { resolvePackagePrice, resolvePackageDuration } from "@/lib/pricing";
import type { ServiceConfig } from "@/types";

export default function InteriorPage() {
  const router = useRouter();
  const { businessHandle } = useParams() as { businessHandle: string };
  const { packages } = useBookingContext();
  const {
    vehicle,
    selectedExteriorServiceIds,
    selectedInteriorServiceIds,
    skippedExterior,
    setInteriorService,
    clearInteriorService,
    setSkippedInterior,
    setNavigationDirection,
  } = useBookingStore();

  const [showError, setShowError] = useState(false);

  const interiorServices: ServiceConfig[] = packages
    .filter((p) => p.typeSlug === "interior")
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((p) => ({
      id: p.id,
      category: "interior",
      name: p.name,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      images: p.images,
      basePrice: resolvePackagePrice(p, vehicle?.bodyClass),
      durationMinutes: resolvePackageDuration(p, vehicle?.bodyClass),
      displayOrder: p.displayOrder,
    }));

  function handleSkip() {
    clearInteriorService();
    if (selectedExteriorServiceIds.length === 0) {
      setShowError(true);
      return;
    }
    setSkippedInterior(true);
    setNavigationDirection("forward");
    router.push(`/${businessHandle}/book/addons`);
  }

  function handleSelect(id: string) {
    setShowError(false);
    setInteriorService(id);
    setSkippedInterior(false);
    setNavigationDirection("forward");
    router.push(`/${businessHandle}/book/addons`);
  }

  return (
    <div className="flex flex-col flex-1">
      <StepTitle
        title="For the interior"
        subtitle="Choose an interior service, or skip if you only need exterior."
      />

      {showError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700" style={{ borderRadius: "var(--ui-radius, 0.75rem)" }}>
          You need to select at least one service — go back and pick an exterior
          service, or choose an interior service here.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {interiorServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={selectedInteriorServiceIds.includes(service.id)}
            onToggle={() => handleSelect(service.id)}
            singleSelect
          />
        ))}
      </div>

      <div className="mt-5 text-center">
        <button
          onClick={handleSkip}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
        >
          Don&apos;t need interior — continue
        </button>
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={() => {
            setNavigationDirection("backward");
            router.push(`/${businessHandle}/book/exterior`);
          }}
          className="w-full h-11 text-gray-500 font-medium text-sm rounded-2xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
