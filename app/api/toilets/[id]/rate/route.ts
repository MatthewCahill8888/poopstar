import { NextRequest, NextResponse } from "next/server";

import { badRequest, forbidden, requireUser, unauthorized } from "@/lib/api";
import { upsertToiletRating } from "@/lib/db";
import { RLSForbiddenError, assertRatingScope } from "@/lib/rls";

type Params = { params: Promise<{ id: string }> };

function clamp(value: number): number {
  return Math.max(1, Math.min(5, value));
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  let user: { id: string; handle: string };
  try {
    user = await requireUser(req);
  } catch {
    return unauthorized();
  }
  const body = (await req.json()) as {
    cleanliness?: number;
    privacy?: number;
    paper?: number;
    vibe?: number;
  };

  if (
    typeof body.cleanliness !== "number" ||
    typeof body.privacy !== "number" ||
    typeof body.paper !== "number" ||
    typeof body.vibe !== "number"
  ) {
    return badRequest("cleanliness, privacy, paper, and vibe are required.");
  }

  const { id } = await params;
  try {
    assertRatingScope(id, user.id);
  } catch (err) {
    if (err instanceof RLSForbiddenError) {
      return forbidden(err.message);
    }
    throw err;
  }
  const cleanliness = clamp(body.cleanliness);
  const privacy = clamp(body.privacy);
  const paper = clamp(body.paper);
  const vibe = clamp(body.vibe);
  const overall = Number(((cleanliness + privacy + paper + vibe) / 4).toFixed(2));
  const rating = upsertToiletRating({
    toiletId: id,
    userId: user.id,
    cleanliness,
    privacy,
    paper,
    vibe,
    overall,
  });
  return NextResponse.json({ rating });
}
