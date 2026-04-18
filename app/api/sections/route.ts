import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, listSections, slugify } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listSections());
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = String((body as any)?.title || "").trim();
  const description = String((body as any)?.description || "").trim() || null;
  const customSlug = String((body as any)?.slug || "").trim();

  if (title.length < 2 || title.length > 120) {
    return NextResponse.json({ error: "Укажите название раздела" }, { status: 400 });
  }

  const db = getDb();
  const positionRow = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM sections").get() as { p: number };
  let slug = slugify(customSlug || title);

  let attempt = 0;
  while (db.prepare("SELECT 1 FROM sections WHERE slug = ?").get(slug)) {
    attempt += 1;
    slug = `${slugify(customSlug || title)}-${attempt}`;
  }

  const info = db
    .prepare("INSERT INTO sections (slug, title, description, position) VALUES (?, ?, ?, ?)")
    .run(slug, title, description, positionRow.p);

  const created = db.prepare("SELECT * FROM sections WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(created, { status: 201 });
}
