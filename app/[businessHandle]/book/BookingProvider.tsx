"use client";

import { createContext, useContext } from "react";
import type { BookingBusiness, BookingPackage } from "@/lib/business";

type BookingContextValue = {
  business: BookingBusiness;
  packages: BookingPackage[];
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  business,
  packages,
  children,
}: {
  business: BookingBusiness;
  packages: BookingPackage[];
  children: React.ReactNode;
}) {
  return (
    <BookingContext.Provider value={{ business, packages }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookingContext must be used within BookingProvider");
  return ctx;
}
