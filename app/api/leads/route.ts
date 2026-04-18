import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = String((body as any).name || "").trim();
  const contact = String((body as any).contact || "").trim();
  const message = String((body as any).message || "").trim() || null;
  const source = String((body as any).source || "").trim() || null;

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  }
  if (contact.length < 3 || contact.length > 200) {
    return NextResponse.json({ error: "Укажите контакт" }, { status: 400 });
  }
  if (message && message.length > 5000) {
    return NextResponse.json({ error: "Сообщение слишком длинное" }, { status: 400 });
  }

  getDb()
    .prepare("INSERT INTO leads (name, contact, message, source) VALUES (?, ?, ?, ?)")
    .run(name, contact, message, source);

  return NextResponse.json({ ok: true });
}
