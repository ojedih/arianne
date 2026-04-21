"use client";

import { useRouter, useParams } from "next/navigation";
import { Car, CarFront, Truck, Van, Bus } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { StepTitle } from "@/components/booking/StepTitle";
import type { VehicleBodyClass } from "@/types";

const BODY_CLASSES: {
  value: VehicleBodyClass;
  label: string;
  description: string;
  Icon: React.ElementType;
}[] = [
  { value: "SEDAN",        label: "Sedan",        description: "Car, hatchback, or wagon", Icon: Car },
  { value: "COUPE",        label: "Coupe",         description: "2-door or convertible",   Icon: CarFront },
  { value: "SUV",          label: "SUV",           description: "Crossover or mid-size",   Icon: Car },
  { value: "LARGE_SUV",    label: "Large SUV",     description: "Tahoe, Expedition, etc.", Icon: Bus },
  { value: "PICKUP_TRUCK", label: "Pickup Truck",  description: "Any pickup truck",        Icon: Truck },
  { value: "VAN",          label: "Van / Minivan", description: "Minivan or cargo van",    Icon: Van },
];

export default function VehicleTypePage() {
  const router = useRouter();
  const { businessHandle } = useParams() as { businessHandle: string };
  const { vehicle, setVehicle, setNavigationDirection } = useBookingStore();

  function handleSelect(bodyClass: VehicleBodyClass) {
    setVehicle({ ...vehicle!, bodyClass });
    setNavigationDirection("forward");
    router.push(`/${businessHandle}/book/exterior`);
  }

  return (
    <div className="flex flex-col flex-1">
      <StepTitle
        title="What type of vehicle?"
        subtitle="We couldn't auto-detect your vehicle type — pick the closest match so we can price your service correctly."
      />

      <div className="grid grid-cols-2 gap-3">
        {BODY_CLASSES.map(({ value, label, description, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            className="group flex flex-col items-center gap-2.5 p-4 border-2 border-gray-200 bg-white text-center transition-all duration-150 active:scale-[0.97]"
            style={{ borderRadius: "var(--ui-radius-lg, 1rem)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.backgroundColor = "var(--accent-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.backgroundColor = "";
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.backgroundColor = "var(--accent-light)";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.backgroundColor = "";
            }}
          >
            <Icon
              className="w-8 h-8 transition-colors"
              style={{ color: "var(--accent)" }}
              strokeWidth={1.5}
            />
            <div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={() => {
            setNavigationDirection("backward");
            router.push(`/${businessHandle}/book/vehicle`);
          }}
          className="w-full h-11 text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors"
          style={{ borderRadius: "var(--ui-radius-lg, 1rem)" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
