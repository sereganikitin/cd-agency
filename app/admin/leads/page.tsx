import { listLeads } from "@/lib/db";
import { LeadsManager } from "./leads-manager";

export const dynamic = "force-dynamic";

export default function AdminLeadsPage() {
  const leads = listLeads();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Заявки</h1>
        <p className="mt-2 text-white/60">Обработанные заявки отмечайте — они уйдут из списка новых.</p>
      </div>
      <LeadsManager initial={leads} />
    </div>
  );
}
