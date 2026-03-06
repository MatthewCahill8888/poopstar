import { NextRequest, NextResponse } from "next/server";

import { badRequest, requireUser, unauthorized } from "@/lib/api";

function fallbackCartoonize(imageUrl: string): string {
  const tone = ["fcd34d", "fdba74", "fca5a5", "f9a8d4"][
    Math.floor(Math.random() * 4)
  ];
  return `https://placehold.co/800x800/${tone}/111111?text=Brainrot+Cartoon`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await requireUser(req);
  } catch {
    return unauthorized();
  }

  const body = (await req.json()) as { imageUrl?: string };
  if (!body.imageUrl) {
    return badRequest("imageUrl is required.");
  }

  // MVP behavior:
  // If no provider key is configured, return a stylized placeholder.
  // You can replace this route with Replicate/OpenAI/Stability integration.
  const cartoonUrl = fallbackCartoonize(body.imageUrl);
  return NextResponse.json({ cartoonUrl });
}
