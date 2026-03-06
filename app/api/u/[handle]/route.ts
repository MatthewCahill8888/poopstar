import { NextRequest, NextResponse } from "next/server";

import { getProfileByHandle } from "@/lib/db";

type Params = { params: Promise<{ handle: string }> };

export async function GET(_: NextRequest, { params }: Params): Promise<NextResponse> {
  const { handle } = await params;
  const profile = getProfileByHandle(handle);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }
  return NextResponse.json(profile);
}
