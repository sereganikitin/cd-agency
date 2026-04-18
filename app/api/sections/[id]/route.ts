import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, slugify } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sectionId = Number(params.id);
  if (!Number.isFinite(sectionId)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as {
    title?: string;
    description?: string | null;
    slug?: string;
    position?: number;
  } | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const db = getDb();
  const existing = db.prepare("SELECT * FROM sections WHERE id = ?").get(sectionId);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const fields: string[] = [];
  const values: any[] = [];

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (title.length < 2) return NextResponse.json({ error: "bad title" }, { status: 400 });
    fields.push("title = ?");
    values.push(title);
  }
  if (body.description !== undefined) {
    const desc = body.description === null ? null : String(body.description).trim() || null;
    fields.push("description = ?");
    values.push(desc);
  }
  if (body.slug !== undefined) {
    let slug = slugify(String(body.slug));
    let attempt = 0;
    while (
      db.prepare("SELECT 1 FROM sections WHERE slug = ? AND id != ?").get(slug, sectionId)
    ) {
      attempt += 1;
      slug = `${slugify(String(body.slug))}-${attempt}`;
    }
    fields.push("slug = ?");
    values.push(slug);
  }
  if (body.position !== undefined) {
    fields.push("position = ?");
    values.push(Number(body.position) || 0);
  }

  if (!fields.length) return NextResponse.json({ error: "no fields" }, { status: 400 });

  values.push(sectionId);
  db.prepare(`UPDATE sections SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  return NextResponse.json(db.prepare("SELECT * FROM sections WHERE id = ?").get(sectionId));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sectionId = Number(params.id);
  if (!Number.isFinite(sectionId)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  getDb().prepare("DELETE FROM sections WHERE id = ?").run(sectionId);
  return NextResponse.json({ ok: true });
}
