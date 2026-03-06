import { NextRequest, NextResponse } from "next/server";

import { forbidden, requireUser, unauthorized } from "@/lib/api";
import { deleteComment } from "@/lib/db";
import { RLSForbiddenError, assertCommentOwner } from "@/lib/rls";

type Params = { params: Promise<{ id: string; commentId: string }> };

export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  let user: { id: string; handle: string };
  try {
    user = await requireUser(req);
  } catch {
    return unauthorized();
  }

  const { commentId } = await params;
  try {
    assertCommentOwner(commentId, user.id);
  } catch (err) {
    if (err instanceof RLSForbiddenError) {
      return forbidden(err.message);
    }
    throw err;
  }
  deleteComment(commentId);
  return NextResponse.json({ ok: true });
}
