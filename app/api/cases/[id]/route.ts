import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DIRECTIONS, getDb, slugify } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as
    | {
        direction?: string;
        type_slug?: string;
        type_title?: string;
        title?: string;
        description?: string | null;
        image_url?: string;
        link_url?: string | null;
        position?: number;
        featured?: boolean | number;
      }
    | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const db = getDb();
  const existing = db.prepare("SELECT * FROM cases WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const fields: string[] = [];
  const values: any[] = [];

  if (body.direction !== undefined) {
    if (!DIRECTIONS.some((d) => d.slug === body.direction)) {
      return NextResponse.json({ error: "Неизвестное направление" }, { status: 400 });
    }
    fields.push("direction = ?");
    values.push(body.direction);
  }
  if (body.type_title !== undefined) {
    const t = String(body.type_title).trim();
    if (t.length < 2) return NextResponse.json({ error: "bad type" }, { status: 400 });
    fields.push("type_title = ?");
    values.push(t);
    if (body.type_slug === undefined) {
      fields.push("type_slug = ?");
      values.push(slugify(t));
    }
  }
  if (body.type_slug !== undefined) {
    fields.push("type_slug = ?");
    values.push(slugify(String(body.type_slug)));
  }
  if (body.title !== undefined) {
    const t = String(body.title).trim();
    if (t.length < 2) return NextResponse.json({ error: "bad title" }, { status: 400 });
    fields.push("title = ?");
    values.push(t);
  }
  if (body.description !== undefined) {
    fields.push("description = ?");
    values.push(body.description === null ? null : String(body.description).trim() || null);
  }
  if (body.image_url !== undefined) {
    const u = String(body.image_url).trim();
    if (!u) return NextResponse.json({ error: "bad image" }, { status: 400 });
    fields.push("image_url = ?");
    values.push(u);
  }
  if (body.link_url !== undefined) {
    fields.push("link_url = ?");
    values.push(body.link_url === null ? null : String(body.link_url).trim() || null);
  }
  if (body.position !== undefined) {
    fields.push("position = ?");
    values.push(Number(body.position) || 0);
  }
  if (body.featured !== undefined) {
    fields.push("featured = ?");
    values.push(body.featured ? 1 : 0);
  }

  if (!fields.length) return NextResponse.json({ error: "no fields" }, { status: 400 });

  values.push(id);
  db.prepare(`UPDATE cases SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT * FROM cases WHERE id = ?").get(id) as Record<string, any>;
  return NextResponse.json({ ...updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  getDb().prepare("DELETE FROM cases WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
