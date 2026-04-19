import { DIRECTIONS, listBenefits } from "@/lib/db";
import { BenefitsManager } from "./benefits-manager";

export const dynamic = "force-dynamic";

export default function AdminBenefitsPage() {
  const initial: Record<string, ReturnType<typeof listBenefits>> = {};
  for (const d of DIRECTIONS) initial[d.slug] = listBenefits(d.slug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">«Что вы получаете»</h1>
        <p className="mt-2 text-white/60">
          Пункты выгод, которые видит посетитель на странице направления. Порядок задаётся стрелками,
          тексты редактируются на месте.
        </p>
      </div>
      <BenefitsManager directions={DIRECTIONS} initial={initial} />
    </div>
  );
}
