"use client";

import useSWR from "swr";
import type { AvailabilityResponse } from "@/types";

const fetcher = (url: string): Promise<AvailabilityResponse> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch availability");
    return r.json();
  });

export function useAvailability(date: string | null) {
  const { data, error, isLoading } = useSWR<AvailabilityResponse>(
    date ? `/api/availability?date=${date}` : null,
    fetcher
  );

  return {
    slots: data?.slots ?? [],
    isLoading,
    isError: !!error,
  };
}
