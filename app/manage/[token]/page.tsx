import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/pricing";
import { CancelButton } from "./CancelButton";

export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: {
      services: true,
      addons: true,
      business: {
        select: {
          name: true,
          email: true,
          phone: true,
          accentColor: true,
          cancellationPolicyHours: true,
        },
      },
    },
  });

  if (!appointment) notFound();

  const { business } = appointment;
  const scheduledDate = format(appointment.scheduledAt, "EEEE, MMMM d, yyyy");
  const scheduledTime = format(appointment.scheduledAt, "h:mm a");
  const vehicleLabel = `${appointment.vehicleYear} ${appointment.vehicleMake} ${appointment.vehicleModel}`;
  const confirmationNumber = appointment.id.slice(-6).toUpperCase();

  const isCancelled = appointment.status === "CANCELLED";
  const isPast =
    appointment.status === "COMPLETED" || appointment.status === "NO_SHOW";
  const hoursUntil =
    (appointment.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
  const withinCutoff = hoursUntil < business.cancellationPolicyHours;
  const canCancel = !isCancelled && !isPast && !withinCutoff;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: business.accentColor }}
          >
            <span className="text-white font-bold text-sm">
              {business.name.charAt(0)}
            </span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">
            {business.name}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Status banner */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-center">
            <p className="font-semibold text-red-700">Appointment cancelled</p>
            <p className="text-sm text-red-500 mt-0.5">
              This appointment has been cancelled.
            </p>
          </div>
        )}
        {isPast && (
          <div className="bg-gray-100 rounded-2xl px-4 py-3 text-center">
            <p className="font-semibold text-gray-700">Appointment completed</p>
          </div>
        )}

        {/* Confirmation number */}
        <div className="text-center pt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Confirmation
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            #{confirmationNumber}
          </p>
        </div>

        {/* Appointment details */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              Date &amp; Time
            </p>
            <p className="font-semibold text-gray-900">{scheduledDate}</p>
            <p className="text-gray-600 text-sm">{scheduledTime}</p>
          </div>
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              Vehicle
            </p>
            <p className="font-semibold text-gray-900">{vehicleLabel}</p>
          </div>
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Services
            </p>
            {appointment.services.map((s) => (
              <div key={s.id} className="flex justify-between text-sm py-0.5">
                <span className="text-gray-700">{s.serviceName}</span>
                <span className="text-gray-900 font-medium">
                  {formatCents(s.priceCents)}
                </span>
              </div>
            ))}
            {appointment.addons.map((a) => (
              <div key={a.id} className="flex justify-between text-sm py-0.5">
                <span className="text-gray-500">{a.addonName}</span>
                <span className="text-gray-700">
                  +{formatCents(a.priceCents)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3">
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCents(appointment.totalCents)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>Incl. tax</span>
              <span>+{formatCents(appointment.taxCents)}</span>
            </div>
          </div>
        </div>

        {/* Service address */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
            Service address
          </p>
          <p className="text-gray-800 text-sm">
            {appointment.customerAddress}, {appointment.customerCity},{" "}
            {appointment.customerState} {appointment.customerZip}
          </p>
        </div>

        {/* Cancellation */}
        {!isCancelled && !isPast && (
          <div className="bg-white rounded-2xl px-4 py-4 shadow-sm flex flex-col gap-3">
            {canCancel ? (
              <CancelButton token={token} />
            ) : (
              <p className="text-sm text-gray-500 text-center">
                Cancellations must be made at least{" "}
                {business.cancellationPolicyHours} hours before the appointment.
              </p>
            )}
          </div>
        )}

        {/* Contact */}
        <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: business.accentColor + "15" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: business.accentColor + "99" }}>
            Questions?
          </p>
          <p className="text-sm font-medium" style={{ color: business.accentColor }}>{business.name}</p>
          <p className="text-sm" style={{ color: business.accentColor }}>{business.phone}</p>
          <p className="text-sm" style={{ color: business.accentColor }}>{business.email}</p>
        </div>
      </main>
    </div>
  );
}
