import { NextRequest, NextResponse } from "next/server";
import { proxyMovement } from "../movement-proxy";

export const runtime = "nodejs";

export function GET(request: NextRequest): Promise<NextResponse> {
  return proxyMovement(request, "arrival");
}
