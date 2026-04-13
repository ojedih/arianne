import { after } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCancellationConfirmation } from "@/lib/email";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: {
      business: {
        select: { name: true, email: true, phone: true, accentColor: true, cancellationPolicyHours: true },
      },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (appointment.status === "CANCELLED") {
    return NextResponse.json(
      { error: "This booking is already cancelled." },
      { status: 409 }
    );
  }

  if (appointment.status === "COMPLETED" || appointment.status === "NO_SHOW") {
    return NextResponse.json(
      { error: "This booking cannot be cancelled." },
      { status: 409 }
    );
  }

  const hoursUntilAppointment =
    (appointment.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilAppointment < appointment.business.cancellationPolicyHours) {
    return NextResponse.json(
      {
        error: `Cancellations must be made at least ${appointment.business.cancellationPolicyHours} hours in advance.`,
      },
      { status: 422 }
    );
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELLED" },
  });

  const business = appointment.business;
  after(() => sendCancellationConfirmation(appointment, business));

  return NextResponse.json({ success: true });
}
