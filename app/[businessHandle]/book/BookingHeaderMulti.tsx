"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Car } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

const STEP_MAP: Record<string, number> = {
  vehicle: 1,
  exterior: 2,
  interior: 3,
  addons: 4,
  summary: 5,
  datetime: 6,
  details: 7,
  confirmation: 8,
};

const TOTAL_STEPS = 8;

export function BookingHeaderMulti({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  const vehicle = useBookingStore((s) => s.vehicle);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const segment = pathname.split("/").pop() ?? "vehicle";
  const currentStep = STEP_MAP[segment] ?? 1;
  const progressPct = (currentStep / TOTAL_STEPS) * 100;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="h-1 bg-gray-100 w-full">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%`, backgroundColor: "var(--accent)" }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--accent, #2563eb)", borderRadius: "var(--ui-radius, 0.75rem)" }}
          >
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm leading-tight">
            {businessName}
          </span>
        </div>

        {mounted && vehicle && segment !== "vehicle" && (
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 max-w-[180px]" style={{ borderRadius: "var(--ui-radius, 0.75rem)" }}>
            <Car className="w-3.5 h-3.5 text-gray-500 shrink-0" strokeWidth={2} />
            <span className="text-xs font-medium text-gray-700 truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
