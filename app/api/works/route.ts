import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, listWorks } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("section_id");
  return NextResponse.json(
    listWorks(sectionId ? Number(sectionId) : undefined)
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const sectionId = Number((body as any).section_id);
  const title = String((body as any).title || "").trim();
  const description = String((body as any).description || "").trim() || null;
  const imageUrl = String((body as any).image_url || "").trim();
  const linkUrl = String((body as any).link_url || "").trim() || null;

  if (!Number.isFinite(sectionId) || sectionId <= 0) {
    return NextResponse.json({ error: "Выберите раздел" }, { status: 400 });
  }
  if (title.length < 2) {
    return NextResponse.json({ error: "Укажите название работы" }, { status: 400 });
  }
  if (!imageUrl) {
    return NextResponse.json({ error: "Добавьте изображение" }, { status: 400 });
  }

  const db = getDb();
  const section = db.prepare("SELECT 1 FROM sections WHERE id = ?").get(sectionId);
  if (!section) return NextResponse.json({ error: "Раздел не найден" }, { status: 400 });

  const positionRow = db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM works WHERE section_id = ?")
    .get(sectionId) as { p: number };

  const info = db
    .prepare(
      "INSERT INTO works (section_id, title, description, image_url, link_url, position) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(sectionId, title, description, imageUrl, linkUrl, positionRow.p);

  const created = db.prepare("SELECT * FROM works WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(created, { status: 201 });
}
