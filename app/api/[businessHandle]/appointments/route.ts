import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { sendBookingConfirmation } from "@/lib/email";
import type { BookingConfirmation } from "@/types";

const BookingSchema = z.object({
  vehicle: z.object({
    year: z.string().min(4).max(4),
    make: z.string().min(1),
    model: z.string().min(1),
  }),
  selectedPackageIds: z.array(z.string()).min(1),
  selectedAddonPackageItemIds: z.array(z.string()).default([]),
  scheduledAt: z.string().datetime(),
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().min(5),
    notes: z.string().optional(),
  }),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessHandle: string }> }
) {
  const { businessHandle } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking data", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { vehicle, selectedPackageIds, selectedAddonPackageItemIds, scheduledAt, customer } = parsed.data;

  // Load business
  const business = await prisma.business.findUnique({
    where: { handle: businessHandle },
    select: { id: true, taxRate: true, name: true, email: true, phone: true, accentColor: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Load selected packages — must belong to this business
  const packages = await prisma.servicePackage.findMany({
    where: {
      id: { in: selectedPackageIds },
      serviceType: { businessId: business.id },
    },
    select: { id: true, name: true, basePriceCents: true, durationMinutes: true },
  });

  if (packages.length === 0) {
    return NextResponse.json({ error: "No valid services found" }, { status: 422 });
  }

  // Load selected addon items — must belong to selected packages
  const addonItems = selectedAddonPackageItemIds.length > 0
    ? await prisma.servicePackageItem.findMany({
        where: {
          id: { in: selectedAddonPackageItemIds },
          isBundled: false,
          packageId: { in: selectedPackageIds },
        },
        include: { item: true },
      })
    : [];

  const packageSubtotal = packages.reduce((sum, p) => sum + p.basePriceCents, 0);
  const addonSubtotal = addonItems.reduce((sum, a) => sum + (a.addonPriceCents ?? 0), 0);
  const subtotalCents = packageSubtotal + addonSubtotal;
  const taxCents = Math.round(subtotalCents * business.taxRate);
  const totalCents = subtotalCents + taxCents;
  const totalDurationMinutes = packages.reduce((sum, p) => sum + p.durationMinutes, 0);

  const slotDate = new Date(scheduledAt);

  let appointment;
  try {
    appointment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Check for slot conflict within this business
      const conflict = await tx.appointment.findFirst({
        where: {
          businessId: business.id,
          scheduledAt: slotDate,
          status: { not: "CANCELLED" },
        },
      });

      if (conflict) throw new SlotTakenError();

      // Upsert customer record
      const dbCustomer = await tx.customer.upsert({
        where: {
          businessId_email: { businessId: business.id, email: customer.email.toLowerCase() },
        },
        update: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        },
        create: {
          businessId: business.id,
          email: customer.email.toLowerCase(),
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        },
      });

      // Record vehicle if not already on file for this customer
      const existingVehicle = await tx.customerVehicle.findFirst({
        where: {
          customerId: dbCustomer.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
        },
      });
      if (!existingVehicle) {
        await tx.customerVehicle.create({
          data: {
            customerId: dbCustomer.id,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
          },
        });
      }

      return tx.appointment.create({
        data: {
          businessId: business.id,
          customerId: dbCustomer.id,
          scheduledAt: slotDate,
          durationMinutes: totalDurationMinutes,
          vehicleYear: vehicle.year,
          vehicleMake: vehicle.make,
          vehicleModel: vehicle.model,
          customerFirstName: customer.firstName,
          customerLastName: customer.lastName,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          customerAddress: customer.address,
          customerCity: customer.city,
          customerState: customer.state,
          customerZip: customer.zip,
          customerNotes: customer.notes ?? null,
          subtotalCents,
          taxCents,
          totalCents,
          services: {
            create: packages.map((p) => ({
              packageId: p.id,
              serviceId: p.id,
              serviceName: p.name,
              priceCents: p.basePriceCents,
            })),
          },
          addons: {
            create: addonItems.map((a) => ({
              addonId: a.id,
              addonName: a.item.name,
              priceCents: a.addonPriceCents ?? 0,
            })),
          },
        },
        include: { services: true, addons: true },
      });
    });
  } catch (err) {
    if (err instanceof SlotTakenError) {
      return NextResponse.json(
        { error: "That time slot is no longer available." },
        { status: 409 }
      );
    }
    console.error("[appointments] booking error:", err);
    return NextResponse.json(
      { error: "Failed to create appointment. Please try again." },
      { status: 500 }
    );
  }

  const confirmation: BookingConfirmation = {
    appointmentId: appointment.id,
    cancelToken: appointment.cancelToken,
    scheduledAt: appointment.scheduledAt.toISOString(),
    vehicle: {
      year: appointment.vehicleYear,
      make: appointment.vehicleMake,
      model: appointment.vehicleModel,
    },
    services: appointment.services.map((s) => ({
      name: s.serviceName,
      priceCents: s.priceCents,
    })),
    addons: appointment.addons.map((a) => ({
      name: a.addonName,
      priceCents: a.priceCents,
    })),
    subtotalCents: appointment.subtotalCents,
    taxCents: appointment.taxCents,
    totalCents: appointment.totalCents,
    customer: {
      firstName: appointment.customerFirstName,
      lastName: appointment.customerLastName,
      phone: appointment.customerPhone,
      email: appointment.customerEmail,
      address: appointment.customerAddress,
      city: appointment.customerCity,
      state: appointment.customerState,
      zip: appointment.customerZip,
      notes: appointment.customerNotes ?? undefined,
    },
  };

  after(() => sendBookingConfirmation(confirmation, appointment.cancelToken, {
    name: business.name,
    email: business.email,
    phone: business.phone,
    accentColor: business.accentColor,
  }));

  return NextResponse.json(confirmation, { status: 201 });
}

class SlotTakenError extends Error {
  constructor() {
    super("SLOT_TAKEN");
    this.name = "SlotTakenError";
  }
}
