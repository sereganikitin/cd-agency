import Link from "next/link";
import { listSections, listWorks } from "@/lib/db";
import { WorksManager } from "./works-manager";

export const dynamic = "force-dynamic";

export default function AdminWorksPage() {
  const sections = listSections();
  const works = listWorks();

  if (sections.length === 0) {
    return (
      <div className="card p-10 text-center">
        <h1 className="font-display text-3xl">Сначала создайте раздел</h1>
        <p className="mt-3 text-white/60">
          Работы привязываются к разделам галереи. Создайте хотя бы один.
        </p>
        <Link href="/admin/sections" className="btn-primary mt-6">
          Перейти к разделам →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Работы в галерее</h1>
        <p className="mt-2 text-white/60">
          Загружайте изображения, привязывайте к разделу и описывайте кейс.
        </p>
      </div>
      <WorksManager sections={sections} initialWorks={works as any} />
    </div>
  );
}
