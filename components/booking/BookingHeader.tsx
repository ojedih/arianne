"use client";

import { usePathname } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import type { BusinessConfig } from "@/types";

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

interface BookingHeaderProps {
  business: BusinessConfig;
}

export function BookingHeader({ business }: BookingHeaderProps) {
  const pathname = usePathname();
  const vehicle = useBookingStore((s) => s.vehicle);

  const segment = pathname.split("/").pop() ?? "vehicle";
  const currentStep = STEP_MAP[segment] ?? 1;
  const progressPct = (currentStep / TOTAL_STEPS) * 100;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 w-full">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        {/* Logo mark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm leading-tight">
            {business.name}
          </span>
        </div>

        {/* Vehicle pill — appears after step 1 */}
        {vehicle && segment !== "vehicle" && (
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 max-w-[180px]" style={{ borderRadius: "var(--ui-radius, 0.75rem)" }}>
            <svg
              className="w-3.5 h-3.5 text-gray-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17H7a2 2 0 01-2-2v-3l2-4h10l2 4v3a2 2 0 01-2 2h-2m-6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
            <span className="text-xs font-medium text-gray-700 truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
