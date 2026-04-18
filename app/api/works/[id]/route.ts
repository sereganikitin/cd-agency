import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workId = Number(params.id);
  if (!Number.isFinite(workId)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as {
    section_id?: number;
    title?: string;
    description?: string | null;
    image_url?: string;
    link_url?: string | null;
    position?: number;
  } | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const db = getDb();
  const existing = db.prepare("SELECT * FROM works WHERE id = ?").get(workId);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const fields: string[] = [];
  const values: any[] = [];

  if (body.section_id !== undefined) {
    const sid = Number(body.section_id);
    const ok = db.prepare("SELECT 1 FROM sections WHERE id = ?").get(sid);
    if (!ok) return NextResponse.json({ error: "Раздел не найден" }, { status: 400 });
    fields.push("section_id = ?");
    values.push(sid);
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
    const iu = String(body.image_url).trim();
    if (!iu) return NextResponse.json({ error: "bad image" }, { status: 400 });
    fields.push("image_url = ?");
    values.push(iu);
  }
  if (body.link_url !== undefined) {
    fields.push("link_url = ?");
    values.push(body.link_url === null ? null : String(body.link_url).trim() || null);
  }
  if (body.position !== undefined) {
    fields.push("position = ?");
    values.push(Number(body.position) || 0);
  }

  if (!fields.length) return NextResponse.json({ error: "no fields" }, { status: 400 });

  values.push(workId);
  db.prepare(`UPDATE works SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  return NextResponse.json(db.prepare("SELECT * FROM works WHERE id = ?").get(workId));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workId = Number(params.id);
  if (!Number.isFinite(workId)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  getDb().prepare("DELETE FROM works WHERE id = ?").run(workId);
  return NextResponse.json({ ok: true });
}
