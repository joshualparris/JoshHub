import { NextResponse } from "next/server";

// Minimal stub so local Buckland Blocks build can geocode without hitting real APIs.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "";

  // Hard-code the known address; default to a sane lat/lon so the game continues to run.
  const isBuckland =
    address.toLowerCase().includes("53 buckland street") ||
    address.toLowerCase().includes("epsom");

  const lat = isBuckland ? -36.7366 : -35.3075; // fallback: Dubbo-ish
  const lon = isBuckland ? 144.3054 : 149.1244;

  return NextResponse.json({ lat, lon });
}
