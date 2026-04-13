"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { isDateAvailable } from "@/lib/availability";
import type { AvailabilityConfig } from "@/types";

interface CalendarPickerProps {
  config: AvailabilityConfig;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function CalendarPicker({
  config,
  selectedDate,
  onSelectDate,
}: CalendarPickerProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return startOfMonth(now);
  });

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Leading empty cells for day-of-week alignment (0=Sun)
  const leadingBlanks = getDay(monthStart);

  const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : null;

  return (
    <div className="bg-white border border-gray-200 overflow-hidden" style={{ borderRadius: "var(--ui-radius-lg, 1rem)" }}>
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          disabled={isBefore(startOfMonth(subMonths(viewMonth, 1)), startOfMonth(today))}
          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ borderRadius: "var(--ui-radius, 0.75rem)" }}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-gray-900 text-sm">
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
          style={{ borderRadius: "var(--ui-radius, 0.75rem)" }}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const available = isDateAvailable(config, day);
          const isSelected = selectedDateObj ? isSameDay(day, selectedDateObj) : false;
          const isPast = isBefore(startOfDay(day), today);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={dateStr}
              onClick={() => available && onSelectDate(dateStr)}
              disabled={!available}
              className="aspect-square text-sm font-medium transition-all flex items-center justify-center"
              style={{
                borderRadius: "var(--ui-radius, 0.75rem)",
                backgroundColor: isSelected ? "var(--accent, #2563eb)" : undefined,
                color: isSelected ? "white" : !available ? "#d1d5db" : "#111827",
                cursor: !available ? "not-allowed" : "pointer",
                outline: isToday && !isSelected ? "1px solid var(--accent-light, #bfdbfe)" : undefined,
              }}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
