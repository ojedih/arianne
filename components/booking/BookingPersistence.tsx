"use client";

import { useEffect } from "react";
import { useBookingStore, writeCookieState } from "@/store/bookingStore";

/**
 * Invisible component that:
 *  1. Subscribes to the booking store and writes progress to a 15-minute cookie
 *     on every state change, so the user can resume after an accidental reload.
 *  2. Registers a `beforeunload` handler to warn the user when they try to
 *     close or hard-refresh the page while they have active booking progress.
 *
 * Place this once inside the booking layout. Returns null (no rendered output).
 */
export function BookingPersistence() {
  // ── 1. Write cookie on every store change ──────────────────────────────────
  useEffect(() => {
    // Write the current state immediately (covers the case where the component
    // mounts on a page mid-flow, e.g. after a reload restored from cookie).
    const current = useBookingStore.getState();
    if (current.vehicle !== null) {
      writeCookieState({
        vehicle: current.vehicle,
        skippedExterior: current.skippedExterior,
        skippedInterior: current.skippedInterior,
        selectedExteriorServiceIds: current.selectedExteriorServiceIds,
        selectedInteriorServiceIds: current.selectedInteriorServiceIds,
        selectedAddonIds: current.selectedAddonIds,
        selectedDate: current.selectedDate,
        selectedTimeSlot: current.selectedTimeSlot,
        customer: current.customer,
      });
    }

    const unsubscribe = useBookingStore.subscribe((state) => {
      if (state.vehicle !== null) {
        writeCookieState({
          vehicle: state.vehicle,
          skippedExterior: state.skippedExterior,
          skippedInterior: state.skippedInterior,
          selectedExteriorServiceIds: state.selectedExteriorServiceIds,
          selectedInteriorServiceIds: state.selectedInteriorServiceIds,
          selectedAddonIds: state.selectedAddonIds,
          selectedDate: state.selectedDate,
          selectedTimeSlot: state.selectedTimeSlot,
          customer: state.customer,
        });
      }
      // Cookie is cleared by resetBooking() in the store itself
    });

    return unsubscribe;
  }, []);

  // ── 2. Warn before hard reload / tab close ──────────────────────────────────
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const { vehicle } = useBookingStore.getState();
      if (vehicle !== null) {
        // Modern browsers show a generic "Leave site?" dialog.
        // Setting returnValue is required for the dialog to appear.
        e.preventDefault();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return null;
}
