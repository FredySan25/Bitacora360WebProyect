import { ModuleCard, ModuleCardEmpty } from "@/core/components/ModuleCard";
import { FinanceIcon } from "@/core/components/icons";

/** Current month's finance summary. Empty state until the finance module has data. */
export function FinanceMonthCard() {
  return (
    <ModuleCard title="Finanzas" icon={<FinanceIcon />} href="/finance">
      <ModuleCardEmpty
        message="Sin movimientos este mes. Anota tu primer gasto."
        actionLabel="+ Registrar gasto"
        actionHref="/finance"
      />
    </ModuleCard>
  );
}
