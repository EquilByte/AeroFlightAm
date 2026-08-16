import { NextRequest, NextResponse } from "next/server";
import {
  getConfiguredOpenSkyAccessMode,
  getOpenSkyRequestAccess,
  OpenSkyAuthenticationError,
} from "./auth";

export async function proxyMovement(
  request: NextRequest,
  movement: "arrival" | "departure",
): Promise<NextResponse> {
  const configuredAccessMode = getConfiguredOpenSkyAccessMode();
  const airport = (request.nextUrl.searchParams.get("airport") ?? "").toUpperCase();
  const end = Number(request.nextUrl.searchParams.get("end"));
  const begin = Number(request.nextUrl.searchParams.get("begin"));

  if (!/^[A-Z0-9]{4}$/.test(airport) || !Number.isInteger(begin) || !Number.isInteger(end)) {
    return NextResponse.json(
      { error: "A valid ICAO airport, begin, and end are required." },
      {
        status: 400,
        headers: { "X-AeroFlight-Access": configuredAccessMode },
      },
    );
  }
  if (begin >= end || end - begin > 604_800) {
    return NextResponse.json(
      { error: "The requested interval must be positive and no longer than seven days." },
      {
        status: 400,
        headers: { "X-AeroFlight-Access": configuredAccessMode },
      },
    );
  }

  const upstream = new URL(`https://opensky-network.org/api/flights/${movement}`);
  upstream.searchParams.set("airport", airport);
  upstream.searchParams.set("begin", String(begin));
  upstream.searchParams.set("end", String(end));

  try {
    const access = await getOpenSkyRequestAccess();
    const response = await fetch(upstream, {
      headers: access.headers,
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 60 },
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

      if (response.status === 404) {
        return NextResponse.json([], {
          headers: {
            "Cache-Control": "public, s-maxage=60",
            "X-AeroFlight-Access": access.mode,
            ...(remaining ? { "X-Rate-Limit-Remaining": remaining } : {}),
          },
        });
      }

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
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OpenSky request failed." },
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
