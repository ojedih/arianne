"use client";

import { create } from "zustand";
import type { VehicleInfo, CustomerInfo } from "@/types";

// ─── Cookie persistence ───────────────────────────────────────────────────────

const COOKIE_KEY = "arianne_booking";
const COOKIE_TTL = 15 * 60; // 15 minutes in seconds

type PersistedState = {
  vehicle: VehicleInfo | null;
  skippedExterior: boolean;
  skippedInterior: boolean;
  selectedExteriorServiceIds: string[];
  selectedInteriorServiceIds: string[];
  selectedAddonIds: string[];
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  customer: CustomerInfo | null;
};

export function writeCookieState(state: PersistedState): void {
  document.cookie = [
    `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(state))}`,
    `max-age=${COOKIE_TTL}`,
    "path=/",
    "SameSite=Strict",
  ].join("; ");
}

export function clearCookieState(): void {
  document.cookie = `${COOKIE_KEY}=; max-age=0; path=/; SameSite=Strict`;
}

/** Reads persisted booking state from cookie. Returns null if absent or invalid. */
function readCookieState(): PersistedState | null {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`)
    );
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match[1])) as PersistedState;
  } catch {
    return null;
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface BookingStore extends PersistedState {
  navigationDirection: "forward" | "backward" | null;

  // Actions
  setVehicle: (v: VehicleInfo) => void;
  setSkippedExterior: (val: boolean) => void;
  setSkippedInterior: (val: boolean) => void;
  setExteriorService: (id: string) => void;
  clearExteriorService: () => void;
  setInteriorService: (id: string) => void;
  clearInteriorService: () => void;
  toggleAddon: (id: string) => void;
  setDateTime: (date: string, slot: string) => void;
  setCustomer: (c: CustomerInfo) => void;
  setNavigationDirection: (d: "forward" | "backward") => void;
  resetBooking: () => void;

  // Computed helpers
  allSelectedServiceIds: () => string[];
}

const emptyState: PersistedState = {
  vehicle: null,
  skippedExterior: false,
  skippedInterior: false,
  selectedExteriorServiceIds: [],
  selectedInteriorServiceIds: [],
  selectedAddonIds: [],
  selectedDate: null,
  selectedTimeSlot: null,
  customer: null,
};

// Read cookie synchronously at store creation time.
// Since this file is "use client", it only ever runs in the browser — document.cookie is available.
const cookieState = readCookieState();
const initialState: PersistedState = cookieState ?? emptyState;

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,
  navigationDirection: null,

  setVehicle: (v) => set({ vehicle: v }),

  setSkippedExterior: (val) => set({ skippedExterior: val }),

  setSkippedInterior: (val) => set({ skippedInterior: val }),

  setExteriorService: (id) =>
    set({ selectedExteriorServiceIds: [id], selectedAddonIds: [] }),

  clearExteriorService: () =>
    set({ selectedExteriorServiceIds: [], selectedAddonIds: [] }),

  setInteriorService: (id) =>
    set({ selectedInteriorServiceIds: [id], selectedAddonIds: [] }),

  clearInteriorService: () =>
    set({ selectedInteriorServiceIds: [], selectedAddonIds: [] }),

  toggleAddon: (id) =>
    set((state) => ({
      selectedAddonIds: state.selectedAddonIds.includes(id)
        ? state.selectedAddonIds.filter((a) => a !== id)
        : [...state.selectedAddonIds, id],
    })),

  setDateTime: (date, slot) =>
    set({ selectedDate: date, selectedTimeSlot: slot }),

  setCustomer: (c) => set({ customer: c }),

  setNavigationDirection: (d) => set({ navigationDirection: d }),

  resetBooking: () => {
    clearCookieState();
    set({ ...emptyState, navigationDirection: null });
  },

  allSelectedServiceIds: () => {
    const state = get();
    return [
      ...state.selectedExteriorServiceIds,
      ...state.selectedInteriorServiceIds,
    ];
  },
}));
