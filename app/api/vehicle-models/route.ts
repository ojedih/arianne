import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get("make");
  const year = searchParams.get("year");

  if (!make || !year) {
    return NextResponse.json({ error: "make and year are required" }, { status: 400 });
  }

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${encodeURIComponent(make)}/modelyear/${yearNum}?format=json`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // cache for 24 hours — NHTSA data rarely changes
    });

    if (!res.ok) {
      return NextResponse.json({ models: [] });
    }

    const data = await res.json();
    const models: string[] = (data.Results ?? [])
      .map((r: { Model_Name?: string }) => r.Model_Name)
      .filter((m: unknown): m is string => typeof m === "string" && m.length > 0)
      .sort((a: string, b: string) => a.localeCompare(b));

    return NextResponse.json({ models });
  } catch {
    // Fail gracefully — the model field falls back to free text
    return NextResponse.json({ models: [] });
  }
}
