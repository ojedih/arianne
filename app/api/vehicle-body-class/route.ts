import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");
  const make = searchParams.get("make");
  const model = searchParams.get("model");

  if (!handle || !make || !model) {
    return NextResponse.json({ bodyClass: null });
  }

  const business = await prisma.business.findUnique({
    where: { handle },
    select: { id: true },
  });

  if (!business) return NextResponse.json({ bodyClass: null });

  const rule = await prisma.vehicleBodyClassRule.findUnique({
    where: { businessId_make_model: { businessId: business.id, make, model } },
    select: { bodyClass: true },
  });

  return NextResponse.json({ bodyClass: rule?.bodyClass ?? null });
}
