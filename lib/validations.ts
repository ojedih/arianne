import { z } from "zod";
import type { VehicleBodyClass } from "@/types";

const VEHICLE_BODY_CLASSES: [VehicleBodyClass, ...VehicleBodyClass[]] = [
  "COUPE",
  "SEDAN",
  "SUV",
  "LARGE_SUV",
  "PICKUP_TRUCK",
  "VAN",
];

// ─── Config schemas ───────────────────────────────────────────────────────────

export const ServiceConfigSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["exterior", "interior"]),
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().min(1),
  images: z.array(z.string()),
  basePrice: z.number().int().nonnegative(),
  durationMinutes: z.number().int().positive(),
  displayOrder: z.number().int().nonnegative(),
});

export const AddonConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().min(1),
  price: z.number().int().nonnegative(),
  eligibleServiceIds: z.array(z.string()).min(1),
});

export const BusinessConfigSchema = z.object({
  name: z.string().min(1),
  logoPath: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  taxRate: z.number().nonnegative().max(1),
  currency: z.literal("USD"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color").default("#2563eb"),
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).default("lg"),
  defaultState: z.string().length(2).default("CA"),
  cancellationPolicyHours: z.number().int().nonnegative().default(24),
});

export const DayScheduleSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
});

export const AvailabilityConfigSchema = z.object({
  slotDurationMinutes: z.number().int().positive(),
  bufferBetweenBookingsMinutes: z.number().int().nonnegative(),
  maxBookingsPerSlot: z.number().int().positive(),
  blackoutDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  schedule: z.object({
    monday: DayScheduleSchema.nullable(),
    tuesday: DayScheduleSchema.nullable(),
    wednesday: DayScheduleSchema.nullable(),
    thursday: DayScheduleSchema.nullable(),
    friday: DayScheduleSchema.nullable(),
    saturday: DayScheduleSchema.nullable(),
    sunday: DayScheduleSchema.nullable(),
  }),
});

// ─── Booking request schema (used by API route + client form) ─────────────────

export const VehicleInfoSchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, "Enter a 4-digit year")
    .refine(
      (y) => {
        const n = parseInt(y);
        return n >= 1980 && n <= new Date().getFullYear() + 1;
      },
      { message: "Year must be between 1980 and next year" }
    ),
  make: z.string().min(1, "Make is required").max(50),
  model: z.string().min(1, "Model is required").max(50),
  bodyClass: z.enum(VEHICLE_BODY_CLASSES).optional(),
});

export const CustomerInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  address: z.string().min(3, "Street address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().length(2, "Select a state"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  notes: z.string().max(500).optional(),
});

export const BookingRequestSchema = z.object({
  vehicle: VehicleInfoSchema,
  selectedServiceIds: z.array(z.string()).min(1, "Select at least one service"),
  selectedAddonIds: z.array(z.string()),
  scheduledAt: z.string().datetime(),
  customer: CustomerInfoSchema,
});
