import fs from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { requireUser, unauthorized } from "@/lib/api";

async function toBuffer(file: File): Promise<Buffer> {
  const array = await file.arrayBuffer();
  return Buffer.from(array);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await requireUser(req);
  } catch {
    return unauthorized();
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }
    const ext = file.type.includes("png") ? "png" : "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), await toBuffer(file));
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch {
    return NextResponse.json(
      { error: "Upload unavailable on this deployment (storage is read-only)." },
      { status: 503 },
    );
  }
}
