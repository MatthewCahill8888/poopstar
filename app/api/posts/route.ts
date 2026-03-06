import { NextRequest, NextResponse } from "next/server";

import { badRequest, requireUser, unauthorized } from "@/lib/api";
import { DEFAULT_NEARBY_RADIUS_KM } from "@/lib/constants";
import {
  createPost,
  getNearestToilet,
  getPostsWithMeta,
  toRadiusPosts,
} from "@/lib/db";
import { parseCoordinate } from "@/lib/geo";

export async function GET(req: NextRequest): Promise<NextResponse> {
  let viewerId: string | undefined;
  try {
    const user = await requireUser(req);
    viewerId = user.id;
  } catch {
    // Public read allowed for browsing; no likedByMe metadata.
  }

  const lat = parseCoordinate(req.nextUrl.searchParams.get("lat"));
  const lng = parseCoordinate(req.nextUrl.searchParams.get("lng"));
  const radius =
    Number(req.nextUrl.searchParams.get("radiusKm")) || DEFAULT_NEARBY_RADIUS_KM;

  const posts = getPostsWithMeta(viewerId, lat, lng);
  const payload =
    lat !== undefined && lng !== undefined ? toRadiusPosts(posts, radius) : posts;
  return NextResponse.json({ posts: payload });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let user: { id: string; handle: string };
  try {
    user = await requireUser(req);
  } catch {
    return unauthorized();
  }

  const body = (await req.json()) as {
    toiletId?: string;
    caption?: string;
    originalImageUrl?: string;
    cartoonImageUrl?: string;
    lat?: number;
    lng?: number;
  };

  if (!body.originalImageUrl || !body.cartoonImageUrl) {
    return badRequest("originalImageUrl and cartoonImageUrl are required.");
  }
  if (typeof body.lat !== "number" || typeof body.lng !== "number") {
    return badRequest("lat and lng are required.");
  }
  const nearest = getNearestToilet(body.lat, body.lng);
  const post = createPost({
    authorId: user.id,
    toiletId: body.toiletId ?? nearest?.id,
    caption: body.caption,
    originalImageUrl: body.originalImageUrl,
    cartoonImageUrl: body.cartoonImageUrl,
    lat: body.lat,
    lng: body.lng,
  });
  return NextResponse.json({ post }, { status: 201 });
}
