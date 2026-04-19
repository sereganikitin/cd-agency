import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { SITE_IMAGE_SLOTS, setSiteImage, resetSiteImage } from "@/lib/db";

function validSlot(slot: string) {
  return SITE_IMAGE_SLOTS.some((s) => s.slot === slot);
}

export async function PATCH(req: Request, { params }: { params: { slot: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!validSlot(params.slot)) {
    return NextResponse.json({ error: "Unknown slot" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  const url = String(body?.url || "").trim();
  if (!url) return NextResponse.json({ error: "Укажите URL" }, { status: 400 });

  setSiteImage(params.slot, url);
  return NextResponse.json({ ok: true, slot: params.slot, url });
}

export async function DELETE(_req: Request, { params }: { params: { slot: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!validSlot(params.slot)) {
    return NextResponse.json({ error: "Unknown slot" }, { status: 400 });
  }

  resetSiteImage(params.slot);
  return NextResponse.json({ ok: true });
}
