import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as
    | { title?: string; description?: string; position?: number }
    | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const db = getDb();
  const existing = db.prepare("SELECT 1 FROM direction_benefits WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const fields: string[] = [];
  const values: any[] = [];
  if (body.title !== undefined) {
    const t = String(body.title).trim();
    if (t.length < 2) return NextResponse.json({ error: "bad title" }, { status: 400 });
    fields.push("title = ?");
    values.push(t);
  }
  if (body.description !== undefined) {
    const d = String(body.description).trim();
    if (d.length < 5) return NextResponse.json({ error: "bad description" }, { status: 400 });
    fields.push("description = ?");
    values.push(d);
  }
  if (body.position !== undefined) {
    fields.push("position = ?");
    values.push(Number(body.position) || 0);
  }
  if (!fields.length) return NextResponse.json({ error: "no fields" }, { status: 400 });

  values.push(id);
  db.prepare(`UPDATE direction_benefits SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT * FROM direction_benefits WHERE id = ?").get(id) as Record<string, any>;
  return NextResponse.json({ ...updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  getDb().prepare("DELETE FROM direction_benefits WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
