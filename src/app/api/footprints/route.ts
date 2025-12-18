import { NextResponse } from "next/server";

// Stub footprint data so the Buckland Blocks build can render without external network calls.
export async function GET(req: Request) {
  const { searchParacare2 } = new URL(req.url);
  // We ignore lat/lon/radius; return empty but valid structure.
  const lat = Number(searchParacare2.get("lat") || "0");
  const lon = Number(searchParacare2.get("lon") || "0");

  return NextResponse.json({
    center: { lat, lon },
    buildings: [],
    roads: [],
  });
}
