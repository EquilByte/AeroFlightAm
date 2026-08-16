import { NextRequest, NextResponse } from "next/server";
import {
  getConfiguredOpenSkyAccessMode,
  getOpenSkyRequestAccess,
  OpenSkyAuthenticationError,
} from "../auth";

const OPENSKY_STATES_URL = "https://opensky-network.org/api/states/all";
const ALLOWED_QUERY_KEYS = ["lamin", "lomin", "lamax", "lomax", "extended"] as const;
const ICAO24_PATTERN = /^[0-9a-f]{6}$/i;
const MAX_ICAO24_FILTERS = 100;

export const runtime = "nodejs";
export const revalidate = 15;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const configuredAccessMode = getConfiguredOpenSkyAccessMode();
  const upstream = new URL(OPENSKY_STATES_URL);
  for (const key of ALLOWED_QUERY_KEYS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) upstream.searchParams.set(key, value);
  }

  const icao24Filters = request.nextUrl.searchParams.getAll("icao24");
  if (
    icao24Filters.length > MAX_ICAO24_FILTERS
    || icao24Filters.some((icao24) => !ICAO24_PATTERN.test(icao24))
  ) {
    return NextResponse.json(
      { error: `icao24 must contain at most ${MAX_ICAO24_FILTERS} six-digit hexadecimal addresses.` },
      {
        status: 400,
        headers: { "X-AeroFlight-Access": configuredAccessMode },
      },
    );
  }
  for (const icao24 of icao24Filters) upstream.searchParams.append("icao24", icao24.toLowerCase());

  try {
    const access = await getOpenSkyRequestAccess();
    const response = await fetch(upstream, {
      headers: access.headers,
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 15 },
    });

    if (!response.ok) {
      const retryAfter = response.headers.get("x-rate-limit-retry-after-seconds")
        ?? response.headers.get("retry-after");
      const remaining = response.headers.get("x-rate-limit-remaining");
      const headers = new Headers({
        "Cache-Control": "no-store",
        "X-AeroFlight-Access": access.mode,
      });
      if (retryAfter) {
        headers.set("Retry-After", retryAfter);
        headers.set("X-Rate-Limit-Retry-After-Seconds", retryAfter);
      }
      if (remaining) headers.set("X-Rate-Limit-Remaining", remaining);

      const retryAfterSeconds = retryAfter === null ? null : Number(retryAfter);
      return NextResponse.json(
        {
          error: response.status === 429
            ? "OpenSky request quota is exhausted."
            : `OpenSky returned ${response.status}.`,
          upstreamStatus: response.status,
          ...(Number.isFinite(retryAfterSeconds) ? { retryAfterSeconds } : {}),
        },
        {
          status: response.status === 429 ? 429 : 502,
          headers,
        },
      );
    }

    const payload: unknown = await response.json();
    const headers = new Headers({
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
      "X-AeroFlight-Access": access.mode,
    });
    const remaining = response.headers.get("x-rate-limit-remaining");
    if (remaining) headers.set("X-Rate-Limit-Remaining", remaining);
    return NextResponse.json(payload, {
      headers,
    });
  } catch (error) {
    if (error instanceof OpenSkyAuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store",
            "X-AeroFlight-Access": configuredAccessMode,
          },
        },
      );
    }
    const message = error instanceof Error ? error.message : "OpenSky request failed.";
    return NextResponse.json(
      { error: message },
      {
        status: 504,
        headers: {
          "Cache-Control": "no-store",
          "X-AeroFlight-Access": configuredAccessMode,
        },
      },
    );
  }
}
