import { NextRequest, NextResponse } from "next/server";

import { forbidden, requireUser, unauthorized } from "@/lib/api";
import { toggleLike } from "@/lib/db";
import { RLSForbiddenError, assertPostExists } from "@/lib/rls";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  let user: { id: string; handle: string };
  try {
    user = await requireUser(req);
  } catch {
    return unauthorized();
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
  const result = toggleLike(id, user.id);
  return NextResponse.json(result);
}
