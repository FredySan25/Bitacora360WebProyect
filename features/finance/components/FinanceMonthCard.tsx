"use client";

import { useState } from "react";
import { ModuleCard, ModuleCardEmpty } from "@/core/components/ModuleCard";
import { FinanceIcon } from "@/core/components/icons";
import { currentMonth } from "@/core/lib/dates";
import { formatMoney } from "../format";
import { useTransactions } from "../hooks/useTransactions";
import { totalsOf } from "../stats";

/** Current month's finance summary for the Today page: the balance, and what came in and went out. */
export function FinanceMonthCard() {
  const [month] = useState(currentMonth);
  const { status, transactions } = useTransactions(month, 1);
  const totals = totalsOf(transactions);

  return (
    <ModuleCard title="Finanzas" icon={<FinanceIcon />} href="/finance">
      {status === "loading" && <p className="text-sm text-ink-muted">Cargando...</p>}

      {status === "error" && (
        <p className="text-sm text-ink-muted">No pudimos cargar tus movimientos.</p>
      )}

      {status === "ready" && transactions.length === 0 && (
        <ModuleCardEmpty
          message="Sin movimientos este mes. Anota tu primer gasto."
          actionLabel="+ Registrar gasto"
          actionHref="/finance"
        />
      )}

      {status === "ready" && transactions.length > 0 && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-ink-muted">Balance del mes</p>
            <p className="text-2xl font-semibold text-ink">{formatMoney(totals.balance)}</p>
          </div>
          <dl className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Ingresos</dt>
              <dd className="font-medium tabular-nums text-ink">{formatMoney(totals.income)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Gastos</dt>
              <dd className="font-medium tabular-nums text-ink">{formatMoney(totals.expenses)}</dd>
            </div>
          </dl>
        </div>
      )}
    </ModuleCard>
  );
}
