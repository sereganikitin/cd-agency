import { listSections } from "@/lib/db";
import { SectionsManager } from "./sections-manager";

export const dynamic = "force-dynamic";

export default function AdminSectionsPage() {
  const sections = listSections();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Разделы галереи</h1>
        <p className="mt-2 text-white/60">
          Добавляйте, переименовывайте и удаляйте разделы. Они автоматически появятся как фильтры на
          странице галереи.
        </p>
      </div>
      <SectionsManager initial={sections} />
    </div>
  );
}
