import { NextRequest, NextResponse } from "next/server";

import { badRequest, forbidden, requireUser, unauthorized } from "@/lib/api";
import { addComment, getComments } from "@/lib/db";
import { RLSForbiddenError, assertPostExists } from "@/lib/rls";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params): Promise<NextResponse> {
  const { id } = await params;
  return NextResponse.json({ comments: getComments(id) });
}

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  let user: { id: string; handle: string };
  try {
    user = await requireUser(req);
  } catch {
    return unauthorized();
  }

  const body = (await req.json()) as { text?: string };
  const text = body.text?.trim();
  if (!text) {
    return badRequest("Comment text is required.");
  }
  const { id } = await params;
  try {
    assertPostExists(id);
  } catch (err) {
    if (err instanceof RLSForbiddenError) {
      return forbidden(err.message);
    }
    throw err;
  }
  const comment = addComment(id, user.id, text);
  return NextResponse.json({ comment }, { status: 201 });
}
