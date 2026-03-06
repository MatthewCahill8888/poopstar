import { NextResponse } from "next/server";

import { requireUser, unauthorized } from "@/lib/api";
import { findUserById, toSafeUser } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const full = findUserById(user.id);
    if (!full) {
      return unauthorized();
    }
    return NextResponse.json({ user: toSafeUser(full) });
  } catch {
    return unauthorized();
  }
}
