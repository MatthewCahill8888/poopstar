import { NextRequest, NextResponse } from "next/server";

import { forbidden, requireUser, unauthorized } from "@/lib/api";
import { deletePost } from "@/lib/db";
import { RLSForbiddenError, assertPostOwner } from "@/lib/rls";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  let user: { id: string; handle: string };
  try {
    user = await requireUser(req);
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  try {
    assertPostOwner(id, user.id);
  } catch (err) {
    if (err instanceof RLSForbiddenError) {
      return forbidden(err.message);
    }
    throw err;
  }
  deletePost(id);
  return NextResponse.json({ ok: true });
}
