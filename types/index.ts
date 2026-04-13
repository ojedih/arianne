// ─── Config types (loaded from /config JSON files) ───────────────────────────

export interface ServiceConfig {
  id: string;
  category: "exterior" | "interior";
  name: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  basePrice: number; // cents
  durationMinutes: number;
  displayOrder: number;
}

export interface AddonConfig {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number; // cents
  eligibleServiceIds: string[]; // use ["*"] for any service
}

export interface BusinessConfig {
  name: string;
  logoPath: string;
  phone: string;
  email: string;
  address: string;
  taxRate: number; // e.g. 0.0875
  currency: "USD";
  accentColor: string; // hex, e.g. "#2563eb"
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  defaultState: string; // 2-letter state code, e.g. "CA"
  cancellationPolicyHours: number;
}

export interface DaySchedule {
  open: string; // "09:00" 24h
  close: string; // "17:00" 24h
}

export interface WeeklySchedule {
  monday: DaySchedule | null;
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

export interface AvailabilityConfig {
  schedule: WeeklySchedule;
  slotDurationMinutes: number;
  bufferBetweenBookingsMinutes: number;
  maxBookingsPerSlot: number;
  blackoutDates: string[]; // ISO date strings "2026-12-25"
}

// ─── Booking session state ────────────────────────────────────────────────────

export interface VehicleInfo {
  year: string;
  make: string;
  model: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes?: string;
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface AvailableSlot {
  datetime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  slots: AvailableSlot[];
}

export interface LineItem {
  label: string;
  priceCents: number;
}

export interface PriceBreakdown {
  lineItems: LineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export interface BookingRequest {
  vehicle: VehicleInfo;
  selectedServiceIds: string[];
  selectedAddonIds: string[];
  scheduledAt: string; // ISO datetime
  customer: CustomerInfo;
}

export interface BookingConfirmation {
  appointmentId: string;
  cancelToken: string;
  scheduledAt: string;
  vehicle: VehicleInfo;
  services: { name: string; priceCents: number }[];
  addons: { name: string; priceCents: number }[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  customer: CustomerInfo;
}
