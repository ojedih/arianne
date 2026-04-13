import { Resend } from "resend";
import { format, parseISO } from "date-fns";
import { formatCents } from "@/lib/pricing";
import type { BookingConfirmation } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

type BusinessBranding = {
  name: string;
  email: string;
  phone: string;
  accentColor: string;
};

export async function sendBookingConfirmation(
  confirmation: BookingConfirmation,
  cancelToken: string,
  business: BusinessBranding
): Promise<void> {
  const {
    appointmentId,
    scheduledAt,
    vehicle,
    services,
    addons,
    subtotalCents,
    taxCents,
    totalCents,
    customer,
  } = confirmation;

  const confirmationNumber = appointmentId.slice(-6).toUpperCase();
  const scheduledDate = format(parseISO(scheduledAt), "EEEE, MMMM d, yyyy");
  const scheduledTime = format(parseISO(scheduledAt), "h:mm a");
  const vehicleLabel = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const manageUrl = `${baseUrl}/manage/${cancelToken}`;

  const lineItemsHtml = [
    ...services.map(
      (s) => `
      <tr>
        <td style="padding:6px 0;color:#374151;">${s.name}</td>
        <td style="padding:6px 0;color:#111827;text-align:right;font-weight:500;">${formatCents(s.priceCents)}</td>
      </tr>`
    ),
    ...addons.map(
      (a) => `
      <tr>
        <td style="padding:6px 0;color:#6b7280;">${a.name}</td>
        <td style="padding:6px 0;color:#374151;text-align:right;">+${formatCents(a.priceCents)}</td>
      </tr>`
    ),
  ].join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr>
          <td style="background:${business.accentColor};padding:32px 32px 24px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);letter-spacing:0.08em;text-transform:uppercase;">Booking Confirmed</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">${business.name}</h1>
          </td>
        </tr>

        <!-- Checkmark + confirmation number -->
        <tr>
          <td style="padding:24px 32px 0;text-align:center;">
            <div style="display:inline-block;width:56px;height:56px;background:#dcfce7;border-radius:50%;line-height:56px;text-align:center;margin-bottom:12px;">
              <span style="font-size:28px;line-height:56px;">✓</span>
            </div>
            <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">You&rsquo;re booked!</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Confirmation #${confirmationNumber}</p>
          </td>
        </tr>

        <!-- Date / Vehicle -->
        <tr>
          <td style="padding:24px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Date &amp; Time</p>
                  <p style="margin:0;font-weight:600;color:#111827;">${scheduledDate}</p>
                  <p style="margin:2px 0 0;font-size:14px;color:#374151;">${scheduledTime}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Vehicle</p>
                  <p style="margin:0;font-weight:600;color:#111827;">${vehicleLabel}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Services -->
        <tr>
          <td style="padding:16px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Services</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${lineItemsHtml}
                    <tr><td colspan="2" style="padding-top:8px;border-top:1px solid #e5e7eb;"></td></tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#6b7280;">Subtotal</td>
                      <td style="padding:4px 0;font-size:13px;color:#374151;text-align:right;">${formatCents(subtotalCents)}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#6b7280;">Tax</td>
                      <td style="padding:4px 0;font-size:13px;color:#374151;text-align:right;">+${formatCents(taxCents)}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 0;font-weight:700;color:#111827;">Total</td>
                      <td style="padding:8px 0 0;font-weight:700;color:#111827;text-align:right;">${formatCents(totalCents)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Service address -->
        <tr>
          <td style="padding:16px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;">
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Service address</p>
                  <p style="margin:0;font-size:14px;color:#374151;">${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Questions -->
        <tr>
          <td style="padding:16px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;">
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#93c5fd;text-transform:uppercase;letter-spacing:0.06em;">Questions?</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#1e40af;">${business.name}</p>
                  <p style="margin:2px 0 0;font-size:14px;color:#1d4ed8;">${business.phone}</p>
                  <p style="margin:2px 0 0;font-size:14px;color:#1d4ed8;">${business.email}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Manage booking -->
        <tr>
          <td style="padding:16px 32px 0;text-align:center;">
            <a href="${manageUrl}" style="display:inline-block;font-size:13px;color:#6b7280;text-decoration:underline;">View or cancel your booking</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">You&rsquo;re receiving this because you booked an appointment with ${business.name}.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: `${business.name} <${process.env.RESEND_FROM_EMAIL ?? business.email}>`,
    to: customer.email,
    subject: `Booking Confirmed — ${scheduledDate} at ${scheduledTime}`,
    html,
  });

  if (error) {
    console.error("[email] Failed to send booking confirmation:", error);
  }
}

export async function sendCancellationConfirmation(
  appointment: {
    id: string;
    scheduledAt: Date;
    vehicleYear: string;
    vehicleMake: string;
    vehicleModel: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
  },
  business: BusinessBranding
): Promise<void> {
  const confirmationNumber = appointment.id.slice(-6).toUpperCase();
  const scheduledDate = format(appointment.scheduledAt, "EEEE, MMMM d, yyyy");
  const scheduledTime = format(appointment.scheduledAt, "h:mm a");
  const vehicleLabel = `${appointment.vehicleYear} ${appointment.vehicleMake} ${appointment.vehicleModel}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr>
          <td style="background:#6b7280;padding:32px 32px 24px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);letter-spacing:0.08em;text-transform:uppercase;">Appointment Cancelled</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">${business.name}</h1>
          </td>
        </tr>

        <!-- Confirmation number -->
        <tr>
          <td style="padding:24px 32px 0;text-align:center;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">Your booking has been cancelled</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Confirmation #${confirmationNumber}</p>
          </td>
        </tr>

        <!-- Appointment details -->
        <tr>
          <td style="padding:24px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Date &amp; Time</p>
                  <p style="margin:0;font-weight:600;color:#6b7280;text-decoration:line-through;">${scheduledDate}</p>
                  <p style="margin:2px 0 0;font-size:14px;color:#9ca3af;text-decoration:line-through;">${scheduledTime}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">Vehicle</p>
                  <p style="margin:0;font-weight:600;color:#6b7280;">${vehicleLabel}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Contact -->
        <tr>
          <td style="padding:16px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;">
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#93c5fd;text-transform:uppercase;letter-spacing:0.06em;">Questions?</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#1e40af;">${business.name}</p>
                  <p style="margin:2px 0 0;font-size:14px;color:#1d4ed8;">${business.phone}</p>
                  <p style="margin:2px 0 0;font-size:14px;color:#1d4ed8;">${business.email}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">You&rsquo;re receiving this because you cancelled an appointment with ${business.name}.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: `${business.name} <${process.env.RESEND_FROM_EMAIL ?? business.email}>`,
    to: appointment.customerEmail,
    subject: `Booking Cancelled — ${scheduledDate} at ${scheduledTime}`,
    html,
  });

  if (error) {
    console.error("[email] Failed to send cancellation confirmation:", error);
  }
}
