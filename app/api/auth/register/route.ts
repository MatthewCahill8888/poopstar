import { NextRequest, NextResponse } from "next/server";

import {
  createSessionToken,
  getMaxAgeFromToken,
  hashPassword,
  SESSION_COOKIE,
} from "@/lib/auth";
import { createUser, toSafeUser } from "@/lib/db";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as {
    handle?: string;
    email?: string;
    password?: string;
  };
  const handle = body.handle?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!handle || !email || !password) {
    return NextResponse.json(
      { error: "Handle, email and password are required." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = createUser({ handle, email, passwordHash });
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
