import { NextRequest, NextResponse } from "next/server";
import { getOpenSkyRequestAccess } from "../auth";

export const runtime = "nodejs";

const API_BASE = "https://opensky-network.org/api";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const callsign = request.nextUrl.searchParams.get("callsign");
  if (!callsign) {
    return new NextResponse("Missing callsign parameter", { status: 400 });
  }

  const access = await getOpenSkyRequestAccess();
  const url = `${API_BASE}/routes?callsign=${callsign}`;

  try {
    const response = await fetch(url, {
      headers: access.headers,
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 },
    });
    const headers = new Headers(response.headers);
    headers.set("X-AeroFlight-Access", access.mode);
    const remaining = response.headers.get("x-rate-limit-remaining");
    if (remaining) headers.set("X-Rate-Limit-Remaining", remaining);
    headers.delete("Set-Cookie");
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    return new NextResponse("Failed to proxy request", { status: 502 });
  }
}
