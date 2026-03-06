import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { parseSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireUser(req?: NextRequest): Promise<{
  id: string;
  handle: string;
}> {
  const token = req
    ? req.cookies.get(SESSION_COOKIE)?.value
    : (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await parseSessionToken(token);
  if (!payload) {
    throw new Error("Unauthorized");
  }
  const user = findUserById(payload.userId);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return { id: user.id, handle: user.handle };
}
