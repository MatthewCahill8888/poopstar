import { NextRequest, NextResponse } from "next/server";

import {
  createSessionToken,
  getMaxAgeFromToken,
  SESSION_COOKIE,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail, toSafeUser } from "@/lib/db";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }
  const user = findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const sessionToken = await createSessionToken(user.id);
  const res = NextResponse.json({ user: toSafeUser(user) });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: sessionToken,
    maxAge: getMaxAgeFromToken(sessionToken),
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
