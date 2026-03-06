import { NextRequest, NextResponse } from "next/server";

import { badRequest, requireUser, unauthorized } from "@/lib/api";

const REPLICATE_CARTOON_VERSION =
  "catacolabs/cartoonify:f109015d60170dfb20460f17da8cb863155823c85ece1115e1e9e4ec7ef51d3b";

function fallbackCartoonize(imageUrl: string): string {
  const tone = ["fcd34d", "fdba74", "fca5a5", "f9a8d4"][
    Math.floor(Math.random() * 4)
  ];
  return `https://placehold.co/800x800/${tone}/111111?text=Brainrot+Cartoon`;
}

/** Ensure imageUrl is absolute and publicly reachable (Replicate must fetch it). */
function toPublicImageUrl(imageUrl: string, requestUrl: string): string {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  try {
    const base = new URL(requestUrl);
    const origin = `${base.protocol}//${base.host}`;
    return imageUrl.startsWith("/") ? `${origin}${imageUrl}` : `${origin}/${imageUrl}`;
  } catch {
    return imageUrl;
  }
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

  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    const cartoonUrl = fallbackCartoonize(body.imageUrl);
    return NextResponse.json({ cartoonUrl });
  }

  const publicImageUrl = toPublicImageUrl(
    body.imageUrl,
    req.headers.get("origin") ?? req.url ?? "",
  );

  try {
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        version: REPLICATE_CARTOON_VERSION,
        input: {
          image: publicImageUrl,
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("Replicate create failed:", createRes.status, errText);
      return NextResponse.json(
        { error: "AI service error. Try again or add a REPLICATE_API_TOKEN." },
        { status: 502 },
      );
    }

    const prediction = (await createRes.json()) as {
      status: string;
      output?: string | string[];
      error?: string;
    };

    if (prediction.status !== "succeeded") {
      const msg = prediction.error ?? "Cartoon generation did not complete.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const raw = prediction.output;
    const cartoonUrl =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw) && raw.length > 0
          ? typeof raw[0] === "string"
            ? raw[0]
            : (raw[0] as { url?: string })?.url ?? null
          : raw && typeof raw === "object" && "url" in raw
            ? (raw as { url: string }).url
            : null;

    if (!cartoonUrl) {
      return NextResponse.json(
        { error: "No image URL from AI." },
        { status: 502 },
      );
    }

    return NextResponse.json({ cartoonUrl });
  } catch (e) {
    console.error("Replicate cartoon error:", e);
    return NextResponse.json(
      { error: "AI service unavailable. Try again later." },
      { status: 502 },
    );
  }
}
