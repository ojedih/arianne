import { notFound } from "next/navigation";
import { getBookingData } from "@/lib/business";
import { BookingProvider } from "./BookingProvider";
import { BookingPersistence } from "@/components/booking/BookingPersistence";
import { BookingHeaderMulti } from "./BookingHeaderMulti";

const RADIUS_MAP: Record<string, [string, string]> = {
  none: ["0rem",    "0rem"],
  sm:   ["0.375rem","0.5rem"],
  md:   ["0.5rem",  "0.75rem"],
  lg:   ["0.75rem", "1rem"],
  full: ["9999px",  "9999px"],
};

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessHandle: string }>;
}) {
  const { businessHandle } = await params;
  const data = await getBookingData(businessHandle);

  if (!data) notFound();

  const { accentColor, borderRadius } = data.business;
  const [rXl, r2xl] = RADIUS_MAP[borderRadius] ?? RADIUS_MAP.lg;

  const cssVars = `
    :root {
      --accent: ${accentColor};
      --accent-hover: color-mix(in srgb, ${accentColor} 85%, black);
      --accent-light: color-mix(in srgb, ${accentColor} 12%, white);
      --ui-radius: ${rXl};
      --ui-radius-lg: ${r2xl};
    }
    .booking-flow input,
    .booking-flow textarea,
    .booking-flow select {
      border-radius: var(--ui-radius) !important;
    }
    .booking-flow ul.dropdown-list {
      border-radius: var(--ui-radius) !important;
    }
  `;

  return (
    <BookingProvider business={data.business} packages={data.packages}>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      <div className="booking-flow min-h-screen flex flex-col bg-white overflow-x-hidden">
        <BookingPersistence />
        <BookingHeaderMulti businessName={data.business.name} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </BookingProvider>
  );
}
