import { NextResponse } from "next/server";

// This endpoint is deprecated. Booking now goes through /api/[businessHandle]/appointments.
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been moved. Use /api/{businessHandle}/appointments instead." },
    { status: 410 }
  );
}
