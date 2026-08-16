import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 5;

const PRIMARY_API = "https://api.adsb.lol/v2";
const FALLBACK_API = "https://api.adsb.fi/v2";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl;
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const radius = url.searchParams.get("radius") || "50";
  const icao = url.searchParams.get("icao");
  const callsign = url.searchParams.get("callsign");

  let endpoint = "";
  if (icao) {
    endpoint = `/hex/${icao}`;
  } else if (callsign) {
    endpoint = `/callsign/${callsign}`;
  } else if (lat && lon) {
    endpoint = `/point/${lat}/${lon}/${radius}`;
  } else {
    return NextResponse.json(
      { error: "Must provide either 'icao' or 'lat' and 'lon' parameters." },
      { status: 400 }
    );
  }

  const fetchWithFallback = async (path: string) => {
    const headers = new Headers();
    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    headers.set("Accept", "application/json");

    try {
      const response = await fetch(`${PRIMARY_API}${path}`, {
        signal: AbortSignal.timeout(5_000),
        headers,
        next: { revalidate: 5 },
      });
      if (response.ok) {
        return { response, source: "adsb.lol" };
      }
      console.warn(`Primary API failed with status ${response.status}. Falling back...`);
    } catch (error) {
      console.warn(`Primary API fetch failed: ${error}. Falling back...`);
    }

    // Fallback
    try {
      let fallbackPath = path;
      // adsb.lol might have a different point format based on user comment
      if (lat && lon && !icao) {
        fallbackPath = `/lat/${lat}/lon/${lon}/dist/${radius}`;
      }
      const response = await fetch(`${FALLBACK_API}${fallbackPath}`, {
        signal: AbortSignal.timeout(5_000),
        headers,
        next: { revalidate: 5 },
      });
      if (response.ok) {
        return { response, source: "adsb.fi" };
      }
      throw new Error(`Fallback API failed with status ${response.status}`);
    } catch (error) {
      throw new Error(`Both Primary and Fallback APIs failed. Last error: ${error}`);
    }
  };

  try {
    const { response, source } = await fetchWithFallback(endpoint);
    const payload = await response.json();
    const headers = new Headers({
      "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
      "X-ADSB-Source": source,
    });
    
    // Add timestamp to the payload to use for client-side dead reckoning
    if (typeof payload === 'object' && payload !== null) {
      (payload as any).fetchTime = Date.now();
    }

    return NextResponse.json(payload, { headers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 502 }
    );
  }
}
