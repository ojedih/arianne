import {
  parseISO,
  format,
  addMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import type { AvailabilityConfig, DaySchedule, AvailableSlot } from "@/types";

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type DayName = (typeof DAY_NAMES)[number];

export function getDaySchedule(
  config: AvailabilityConfig,
  date: Date
): DaySchedule | null {
  const dayName = DAY_NAMES[date.getDay()] as DayName;
  return config.schedule[dayName];
}

export function isBlackoutDate(
  config: AvailabilityConfig,
  date: Date
): boolean {
  const dateStr = format(date, "yyyy-MM-dd");
  return config.blackoutDates.includes(dateStr);
}

export function isDateAvailable(
  config: AvailabilityConfig,
  date: Date
): boolean {
  if (isBefore(date, startOfDay(new Date()))) return false;
  if (isBlackoutDate(config, date)) return false;
  return getDaySchedule(config, date) !== null;
}

function parseTimeToDate(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0);
}

export function generateSlots(
  config: AvailabilityConfig,
  date: Date
): Date[] {
  const schedule = getDaySchedule(config, date);
  if (!schedule) return [];
  if (isBlackoutDate(config, date)) return [];

  const openTime = parseTimeToDate(date, schedule.open);
  const closeTime = parseTimeToDate(date, schedule.close);
  const slots: Date[] = [];

  let current = openTime;
  while (isBefore(current, closeTime)) {
    slots.push(current);
    current = addMinutes(current, config.slotDurationMinutes);
  }

  return slots;
}

export function filterAvailableSlots(
  allSlots: Date[],
  bookedDatetimes: Date[],
  bufferMinutes: number
): AvailableSlot[] {
  return allSlots.map((slot) => {
    const isBooked = bookedDatetimes.some((booked) => {
      const diff = Math.abs(slot.getTime() - booked.getTime());
      return diff < (bufferMinutes + 1) * 60 * 1000;
    });

    // Also gray out slots in the past (same-day booking)
    const isPast = isBefore(slot, new Date());

    return {
      datetime: slot.toISOString(),
      available: !isBooked && !isPast,
    };
  });
}
