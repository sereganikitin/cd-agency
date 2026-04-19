import { DIRECTIONS, listCases } from "@/lib/db";
import { CasesManager } from "./cases-manager";

export const dynamic = "force-dynamic";

export default function AdminCasesPage() {
  const cases = listCases();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Кейсы направлений</h1>
        <p className="mt-2 text-white/60">
          Управление кейсами на страницах /services/[направление]. Тип кейса используется как
          фильтр (например: «Лендинг», «Корпоративный сайт», «Рилс», «Яндекс.Директ»).
        </p>
      </div>
      <CasesManager directions={DIRECTIONS} initial={cases} />
    </div>
  );
}
