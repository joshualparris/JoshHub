import { NextResponse } from "next/server";

// Stub footprint data so the Buckland Blocks build can render without external network calls.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // We ignore lat/lon/radius; return empty but valid structure.
  const lat = Number(searchParams.get("lat") || "0");
  const lon = Number(searchParams.get("lon") || "0");

  return NextResponse.json({
    center: { lat, lon },
    buildings: [],
    roads: [],
  });
}
