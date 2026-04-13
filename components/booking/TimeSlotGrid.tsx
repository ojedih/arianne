"use client";

import { format, parseISO } from "date-fns";
import type { AvailableSlot } from "@/types";

interface TimeSlotGridProps {
  slots: AvailableSlot[];
  selectedSlot: string | null;
  onSelectSlot: (datetime: string) => void;
  isLoading: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-11 bg-gray-100 animate-pulse"
            style={{ borderRadius: "var(--ui-radius, 0.75rem)" }}
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-6">
        No slots available for this day.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {slots.map((slot) => {
        const time = format(parseISO(slot.datetime), "h:mm a");
        const isSelected = selectedSlot === slot.datetime;

        return (
          <button
            key={slot.datetime}
            onClick={() => slot.available && onSelectSlot(slot.datetime)}
            disabled={!slot.available}
            className={`h-11 text-sm font-medium transition-all ${
              !slot.available ? "cursor-not-allowed line-through" : ""
            }`}
            style={{
              borderRadius: "var(--ui-radius, 0.75rem)",
              backgroundColor: isSelected ? "var(--accent, #2563eb)" : "#f9fafb",
              color: isSelected ? "white" : slot.available ? "#1f2937" : "#d1d5db",
              border: isSelected ? "none" : `1px solid ${slot.available ? "#e5e7eb" : "#f3f4f6"}`,
            }}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}
