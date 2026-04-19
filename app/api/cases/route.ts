import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DIRECTIONS, getDb, listCases, slugify } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const direction = url.searchParams.get("direction") || undefined;
  return NextResponse.json(listCases(direction));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const direction = String((body as any).direction || "").trim();
  const typeTitle = String((body as any).type_title || "").trim();
  const typeSlug =
    String((body as any).type_slug || "").trim() || slugify(typeTitle);
  const title = String((body as any).title || "").trim();
  const description = String((body as any).description || "").trim() || null;
  const imageUrl = String((body as any).image_url || "").trim();
  const linkUrl = String((body as any).link_url || "").trim() || null;

  if (!DIRECTIONS.some((d) => d.slug === direction)) {
    return NextResponse.json({ error: "Неизвестное направление" }, { status: 400 });
  }
  if (typeTitle.length < 2) {
    return NextResponse.json({ error: "Укажите тип кейса" }, { status: 400 });
  }
  if (title.length < 2) {
    return NextResponse.json({ error: "Укажите название кейса" }, { status: 400 });
  }
  if (!imageUrl) {
    return NextResponse.json({ error: "Добавьте изображение" }, { status: 400 });
  }

  const db = getDb();
  const positionRow = db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM cases WHERE direction = ?")
    .get(direction) as { p: number };

  const info = db
    .prepare(
      `INSERT INTO cases (direction, type_slug, type_title, title, description, image_url, link_url, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(direction, typeSlug, typeTitle, title, description, imageUrl, linkUrl, positionRow.p);

  const created = db.prepare("SELECT * FROM cases WHERE id = ?").get(info.lastInsertRowid) as
    | Record<string, any>
    | undefined;
  return NextResponse.json(created ? { ...created } : null, { status: 201 });
}
