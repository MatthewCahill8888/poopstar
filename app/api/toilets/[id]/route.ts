import { NextRequest, NextResponse } from "next/server";

import { getPostsForToilet, getRatingsForToilet, getToiletById } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  const toilet = getToiletById(id);
  if (!toilet) {
    return NextResponse.json({ error: "Toilet not found." }, { status: 404 });
  }
  return NextResponse.json({
    toilet,
    posts: getPostsForToilet(id),
    ratings: getRatingsForToilet(id),
  });
}
