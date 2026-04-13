"use client";

import { useRouter, useParams } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { StepTitle } from "@/components/booking/StepTitle";
import { NavButtons } from "@/components/booking/NavButtons";
import { CalendarPicker } from "@/components/booking/CalendarPicker";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { useBookingContext } from "../BookingProvider";
import useSWR from "swr";
import type { AvailabilityResponse, AvailabilityConfig } from "@/types";
import { format, parseISO } from "date-fns";

function useBusinessAvailability(businessHandle: string, date: string | null) {
  const fetcher = (url: string): Promise<AvailabilityResponse> =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error("Failed to fetch availability");
      return r.json();
    });

  const { data, error, isLoading } = useSWR<AvailabilityResponse>(
    date ? `/api/${businessHandle}/availability?date=${date}` : null,
    fetcher
  );

  return { slots: data?.slots ?? [], isLoading, isError: !!error };
}

export default function DateTimePage() {
  const router = useRouter();
  const { businessHandle } = useParams() as { businessHandle: string };
  const { business } = useBookingContext();
  const {
    selectedDate,
    selectedTimeSlot,
    setDateTime,
    setNavigationDirection,
  } = useBookingStore();

  const { slots, isLoading } = useBusinessAvailability(businessHandle, selectedDate);

  const availability = business.availability as AvailabilityConfig;

  function handleSelectDate(date: string) {
    setDateTime(date, "");
  }

  function handleSelectSlot(datetime: string) {
    setDateTime(selectedDate!, datetime);
  }

  function handleContinue() {
    setNavigationDirection("forward");
    router.push(`/${businessHandle}/book/details`);
  }

  const formattedDate = selectedDate
    ? format(parseISO(selectedDate), "EEEE, MMMM d")
    : null;

  return (
    <div className="flex flex-col flex-1">
      <StepTitle
        title="Pick a date & time"
        subtitle="Available slots are shown in your local time."
      />

      <CalendarPicker
        config={availability}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {selectedDate && (
        <div className="mt-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">
            {formattedDate}
          </h2>
          <TimeSlotGrid
            slots={slots}
            selectedSlot={selectedTimeSlot}
            onSelectSlot={handleSelectSlot}
            isLoading={isLoading}
          />
        </div>
      )}

      <NavButtons
        nextLabel="Continue"
        nextDisabled={!selectedDate || !selectedTimeSlot}
        onNext={handleContinue}
        backHref={`/${businessHandle}/book/summary`}
      />
    </div>
  );
}
