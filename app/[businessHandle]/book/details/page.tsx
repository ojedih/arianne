"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { CustomerInfoSchema } from "@/lib/validations";
import { StepTitle } from "@/components/booking/StepTitle";
import { useBookingContext } from "../BookingProvider";
import type { CustomerInfo } from "@/types";

const US_STATES: { abbr: string; name: string }[] = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" },
  { abbr: "AZ", name: "Arizona" }, { abbr: "AR", name: "Arkansas" },
  { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" },
  { abbr: "DC", name: "District of Columbia" }, { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" }, { abbr: "HI", name: "Hawaii" },
  { abbr: "ID", name: "Idaho" }, { abbr: "IL", name: "Illinois" },
  { abbr: "IN", name: "Indiana" }, { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" }, { abbr: "KY", name: "Kentucky" },
  { abbr: "LA", name: "Louisiana" }, { abbr: "ME", name: "Maine" },
  { abbr: "MD", name: "Maryland" }, { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" }, { abbr: "MN", name: "Minnesota" },
  { abbr: "MS", name: "Mississippi" }, { abbr: "MO", name: "Missouri" },
  { abbr: "MT", name: "Montana" }, { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" }, { abbr: "NH", name: "New Hampshire" },
  { abbr: "NJ", name: "New Jersey" }, { abbr: "NM", name: "New Mexico" },
  { abbr: "NY", name: "New York" }, { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" }, { abbr: "OH", name: "Ohio" },
  { abbr: "OK", name: "Oklahoma" }, { abbr: "OR", name: "Oregon" },
  { abbr: "PA", name: "Pennsylvania" }, { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" }, { abbr: "SD", name: "South Dakota" },
  { abbr: "TN", name: "Tennessee" }, { abbr: "TX", name: "Texas" },
  { abbr: "UT", name: "Utah" }, { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" }, { abbr: "WA", name: "Washington" },
  { abbr: "WV", name: "West Virginia" }, { abbr: "WI", name: "Wisconsin" },
  { abbr: "WY", name: "Wyoming" },
];

export default function DetailsPage() {
  const router = useRouter();
  const { businessHandle } = useParams() as { businessHandle: string };
  const { business } = useBookingContext();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    customer,
    setCustomer,
    vehicle,
    selectedExteriorServiceIds,
    selectedInteriorServiceIds,
    selectedAddonIds,
    selectedTimeSlot,
    setNavigationDirection,
    resetBooking,
  } = useBookingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerInfo>({
    resolver: zodResolver(CustomerInfoSchema),
    defaultValues: customer ?? {
      firstName: "", lastName: "", phone: "", email: "",
      address: "", city: "", state: business.defaultState, zip: "", notes: "",
    },
  });

  const stateValue = watch("state");
  const [stateSearch, setStateSearch] = useState(() => customer?.state ?? business.defaultState);
  const [showStateDrop, setShowStateDrop] = useState(false);
  const stateDropRef = useRef<HTMLDivElement>(null);

  const filteredStates = stateSearch
    ? US_STATES.filter(
        (s) =>
          s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
          s.abbr.toLowerCase().includes(stateSearch.toLowerCase())
      )
    : US_STATES;

  function selectState(abbr: string) {
    setValue("state", abbr, { shouldValidate: true });
    setStateSearch(abbr);
    setShowStateDrop(false);
  }

  async function onSubmit(data: CustomerInfo) {
    setSubmitting(true);
    setServerError(null);
    setCustomer(data);

    try {
      const res = await fetch(`/api/${businessHandle}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle,
          selectedPackageIds: [
            ...selectedExteriorServiceIds,
            ...selectedInteriorServiceIds,
          ],
          selectedAddonPackageItemIds: selectedAddonIds,
          scheduledAt: selectedTimeSlot,
          customer: data,
        }),
      });

      if (res.status === 409) {
        setServerError(
          "That time slot was just booked by someone else. Please go back and pick another time."
        );
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.error ?? "Something went wrong. Please try again.");
        return;
      }

      const confirmation = await res.json();
      setNavigationDirection("forward");
      sessionStorage.setItem("lastAppointmentId", confirmation.appointmentId);
      sessionStorage.setItem("lastConfirmation", JSON.stringify(confirmation));
      resetBooking();
      router.push(`/${businessHandle}/book/confirmation`);
    } catch {
      setServerError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <StepTitle
        title="Your details"
        subtitle="We'll send a confirmation to your email."
      />

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700" style={{ borderRadius: "var(--ui-radius, 0.75rem)" }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" error={errors.firstName?.message}>
            <input type="text" autoCapitalize="words" placeholder="Jane"
              {...register("firstName")} className={inputClass(!!errors.firstName)} />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <input type="text" autoCapitalize="words" placeholder="Smith"
              {...register("lastName")} className={inputClass(!!errors.lastName)} />
          </Field>
        </div>

        <Field label="Phone" error={errors.phone?.message}>
          <input type="tel" inputMode="tel" placeholder="+1 (555) 000-0000"
            {...register("phone")} className={inputClass(!!errors.phone)} />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input type="email" inputMode="email" placeholder="jane@example.com"
            {...register("email")} className={inputClass(!!errors.email)} />
        </Field>

        <Field label="Street address" error={errors.address?.message}>
          <input type="text" autoCapitalize="words" placeholder="123 Main St"
            {...register("address")} className={inputClass(!!errors.address)} />
        </Field>

        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <Field label="City" error={errors.city?.message}>
            <input type="text" autoCapitalize="words" placeholder="Los Angeles"
              {...register("city")} className={inputClass(!!errors.city)} />
          </Field>

          <Field label="State" error={errors.state?.message}>
            <div className="relative" ref={stateDropRef}>
              <input type="hidden" {...register("state")} />
              <input
                type="text"
                value={stateSearch}
                placeholder="CA"
                autoComplete="off"
                onChange={(e) => { setStateSearch(e.target.value); setShowStateDrop(true); }}
                onFocus={() => setShowStateDrop(true)}
                onBlur={() => setTimeout(() => setShowStateDrop(false), 150)}
                className={`w-20 h-12 px-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.state ? "border-red-400" : "border-gray-200"
                }`}
              />
              {showStateDrop && filteredStates.length > 0 && (
                <ul className="dropdown-list absolute z-20 left-0 mt-1 w-52 bg-white border border-gray-200 shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                  {filteredStates.map((s) => (
                    <li key={s.abbr}>
                      <button type="button" onMouseDown={() => selectState(s.abbr)}
                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                          stateValue === s.abbr ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-900 hover:bg-gray-50"
                        }`}>
                        <span className="font-mono text-xs text-gray-500 mr-2">{s.abbr}</span>
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Field>

          <Field label="ZIP" error={errors.zip?.message}>
            <input type="text" inputMode="numeric" placeholder="90210" maxLength={10}
              {...register("zip")}
              className={`w-24 h-12 px-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.zip ? "border-red-400" : "border-gray-200"
              }`} />
          </Field>
        </div>

        <Field label="Notes (optional)" error={errors.notes?.message}>
          <textarea placeholder="Any special instructions, gate codes, or notes for the detailer…"
            rows={3} {...register("notes")}
            className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.notes ? "border-red-400" : "border-gray-200"
            }`} />
        </Field>

        <div className="mt-auto pt-4">
          <button type="submit" disabled={submitting}
            className="w-full h-12 text-white font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--accent, #2563eb)",
              borderRadius: "var(--ui-radius-lg, 1rem)",
            }}>
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Booking…
              </>
            ) : "Book appointment"}
          </button>
          <button type="button"
            onClick={() => { setNavigationDirection("backward"); router.push(`/${businessHandle}/book/datetime`); }}
            className="w-full h-11 text-gray-500 font-medium text-sm rounded-2xl hover:bg-gray-50 transition-colors mt-3">
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full h-12 px-4 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    hasError ? "border-red-400" : "border-gray-200"
  }`;
}
