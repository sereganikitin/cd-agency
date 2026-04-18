import { NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Ожидался multipart/form-data" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Файл не передан" }, { status: 400 });

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Разрешены JPG, PNG, WEBP, GIF, AVIF" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл больше 8 МБ" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 12);
  const ext = EXT[file.type];
  const filename = `${Date.now()}-${hash}.${ext}`;

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}` });
}

export const runtime = "nodejs";
