import { NextRequest, NextResponse } from "next/server";

import { getToiletsWithMeta } from "@/lib/db";
import { parseCoordinate } from "@/lib/geo";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const lat = parseCoordinate(req.nextUrl.searchParams.get("lat"));
  const lng = parseCoordinate(req.nextUrl.searchParams.get("lng"));
  const toilets = getToiletsWithMeta(lat, lng);
  return NextResponse.json({ toilets });
}
