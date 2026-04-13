import { NextRequest, NextResponse } from "next/server";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import {
  isDateAvailable,
  generateSlots,
  filterAvailableSlots,
} from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import type { AvailabilityConfig } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessHandle: string }> }
) {
  const { businessHandle } = await params;
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { handle: businessHandle },
    select: { id: true, availability: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const availability = business.availability as unknown as AvailabilityConfig;
  const date = parseISO(dateParam);

  if (!isDateAvailable(availability, date)) {
    return NextResponse.json({ date: dateParam, slots: [] });
  }

  const allSlots = generateSlots(availability, date);

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      scheduledAt: { gte: dayStart, lte: dayEnd },
      status: { not: "CANCELLED" },
    },
    select: { scheduledAt: true },
  });

  const bookedTimes = bookedAppointments.map((a) => a.scheduledAt);

  const slots = filterAvailableSlots(
    allSlots,
    bookedTimes,
    availability.bufferBetweenBookingsMinutes
  );

  return NextResponse.json({ date: dateParam, slots });
}
