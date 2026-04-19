import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DIRECTIONS, getDb, listBenefits } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const direction = url.searchParams.get("direction");
  if (!direction) return NextResponse.json({ error: "direction required" }, { status: 400 });
  return NextResponse.json(listBenefits(direction));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const direction = String((body as any)?.direction || "").trim();
  const title = String((body as any)?.title || "").trim();
  const description = String((body as any)?.description || "").trim();

  if (!DIRECTIONS.some((d) => d.slug === direction)) {
    return NextResponse.json({ error: "Неизвестное направление" }, { status: 400 });
  }
  if (title.length < 2) return NextResponse.json({ error: "Укажите заголовок" }, { status: 400 });
  if (description.length < 5) return NextResponse.json({ error: "Укажите описание" }, { status: 400 });

  const db = getDb();
  const positionRow = db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM direction_benefits WHERE direction = ?")
    .get(direction) as { p: number };

  const info = db
    .prepare(
      "INSERT INTO direction_benefits (direction, title, description, position) VALUES (?, ?, ?, ?)"
    )
    .run(direction, title, description, positionRow.p);

  const created = db.prepare("SELECT * FROM direction_benefits WHERE id = ?").get(info.lastInsertRowid) as
    | Record<string, any>
    | undefined;
  return NextResponse.json(created ? { ...created } : null, { status: 201 });
}
