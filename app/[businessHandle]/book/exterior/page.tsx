"use client";

import { useRouter, useParams } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { ServiceCard } from "@/components/booking/ServiceCard";
import { StepTitle } from "@/components/booking/StepTitle";
import { useBookingContext } from "../BookingProvider";
import { resolvePackagePrice, resolvePackageDuration } from "@/lib/pricing";
import type { ServiceConfig } from "@/types";

export default function ExteriorPage() {
  const router = useRouter();
  const { businessHandle } = useParams() as { businessHandle: string };
  const { packages } = useBookingContext();
  const {
    vehicle,
    selectedExteriorServiceIds,
    setExteriorService,
    clearExteriorService,
    setSkippedExterior,
    setNavigationDirection,
  } = useBookingStore();

  const exteriorServices: ServiceConfig[] = packages
    .filter((p) => p.typeSlug === "exterior")
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((p) => ({
      id: p.id,
      category: "exterior",
      name: p.name,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      images: p.images,
      basePrice: resolvePackagePrice(p, vehicle?.bodyClass),
      durationMinutes: resolvePackageDuration(p, vehicle?.bodyClass),
      displayOrder: p.displayOrder,
    }));

  function handleSkip() {
    clearExteriorService();
    setSkippedExterior(true);
    setNavigationDirection("forward");
    router.push(`/${businessHandle}/book/interior`);
  }

  function handleSelect(id: string) {
    setExteriorService(id);
    setSkippedExterior(false);
    setNavigationDirection("forward");
    router.push(`/${businessHandle}/book/interior`);
  }

  return (
    <div className="flex flex-col flex-1">
      <StepTitle
        title="For the exterior"
        subtitle="Choose an exterior service to continue."
      />

      <div className="flex flex-col gap-3">
        {exteriorServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={selectedExteriorServiceIds.includes(service.id)}
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
          Don&apos;t need exterior — go to interior
        </button>
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={() => {
            setNavigationDirection("backward");
            router.push(`/${businessHandle}/book/vehicle`);
          }}
          className="w-full h-11 text-gray-500 font-medium text-sm rounded-2xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
