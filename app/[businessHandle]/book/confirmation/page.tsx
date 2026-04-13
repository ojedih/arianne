"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { formatCents } from "@/lib/pricing";
import { useBookingContext } from "../BookingProvider";
import type { BookingConfirmation } from "@/types";

export default function ConfirmationPage() {
  const { businessHandle } = useParams() as { businessHandle: string };
  const { business } = useBookingContext();
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("lastConfirmation");
    if (raw) {
      try {
        setConfirmation(JSON.parse(raw));
      } catch {
        // fallback
      }
    }
  }, []);

  if (!confirmation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">You&apos;re booked!</h1>
          <p className="text-gray-500 text-sm mt-1">Check your email for confirmation details.</p>
        </div>
      </div>
    );
  }

  const scheduledDate = format(parseISO(confirmation.scheduledAt), "EEEE, MMMM d, yyyy");
  const scheduledTime = format(parseISO(confirmation.scheduledAt), "h:mm a");

  return (
    <div className="flex flex-col flex-1 pb-8">
      <div className="flex flex-col items-center text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
        >
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re booked!</h1>
        <p className="text-gray-500 text-sm mt-1">
          Confirmation #{confirmation.appointmentId.slice(-6).toUpperCase()}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Date & Time</p>
          <p className="font-semibold text-gray-900">{scheduledDate}</p>
          <p className="text-gray-600 text-sm">{scheduledTime}</p>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Vehicle</p>
          <p className="font-semibold text-gray-900">
            {confirmation.vehicle.year} {confirmation.vehicle.make} {confirmation.vehicle.model}
          </p>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Services</p>
          {confirmation.services.map((s, i) => (
            <div key={i} className="flex justify-between text-sm py-0.5">
              <span className="text-gray-700">{s.name}</span>
              <span className="text-gray-900 font-medium">{formatCents(s.priceCents)}</span>
            </div>
          ))}
          {confirmation.addons.map((a, i) => (
            <div key={i} className="flex justify-between text-sm py-0.5">
              <span className="text-gray-500">{a.name}</span>
              <span className="text-gray-700">+{formatCents(a.priceCents)}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3">
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCents(confirmation.totalCents)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>Incl. tax</span>
            <span>+{formatCents(confirmation.taxCents)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Service address</p>
        <p className="text-gray-800 text-sm">{confirmation.customer.address}</p>
        <p className="text-gray-800 text-sm">{confirmation.customer.city}, {confirmation.customer.state} {confirmation.customer.zip}</p>
      </div>

      <div className="rounded-2xl px-4 py-3 mb-6" style={{ backgroundColor: business.accentColor + "15" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: business.accentColor + "99" }}>Questions?</p>
        <p className="text-sm font-medium" style={{ color: business.accentColor }}>{business.name}</p>
        <p className="text-sm" style={{ color: business.accentColor }}>{business.phone}</p>
        <p className="text-sm" style={{ color: business.accentColor }}>{business.email}</p>
      </div>

      <Link
        href={`/manage/${confirmation.cancelToken}`}
        className="w-full h-12 text-white font-semibold text-base transition-colors flex items-center justify-center"
        style={{
          backgroundColor: "var(--accent, #2563eb)",
          borderRadius: "var(--ui-radius-lg, 1rem)",
        }}
      >
        Manage booking
      </Link>

      <Link
        href={`/${businessHandle}/book/vehicle`}
        className="w-full h-11 text-gray-500 font-medium text-sm rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center mt-3"
      >
        Book another appointment
      </Link>
    </div>
  );
}
