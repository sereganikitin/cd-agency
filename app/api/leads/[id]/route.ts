import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leadId = Number(params.id);
  if (!Number.isFinite(leadId)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  const body = (await req.json().catch(() => null)) as { handled?: boolean } | null;
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  if (body.handled !== undefined) {
    getDb()
      .prepare("UPDATE leads SET handled = ? WHERE id = ?")
      .run(body.handled ? 1 : 0, leadId);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leadId = Number(params.id);
  if (!Number.isFinite(leadId)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  getDb().prepare("DELETE FROM leads WHERE id = ?").run(leadId);
  return NextResponse.json({ ok: true });
}
