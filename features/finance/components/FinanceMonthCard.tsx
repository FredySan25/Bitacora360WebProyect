"use client";

import { useState } from "react";
import { ModuleCard, ModuleCardEmpty } from "@/core/components/ModuleCard";
import { currentMonth } from "@/core/lib/dates";
import { formatMoney } from "../format";
import { useTransactions } from "../hooks/useTransactions";
import { totalsOf } from "../stats";

/** One line of the card: label, dotted leader and amount, like a ledger. */
function LedgerLine({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex items-baseline gap-2 py-1.5">
      <dt className="flex flex-1 items-baseline gap-2 text-ink-muted">
        {label}
        <span aria-hidden="true" className="ledger-leader" />
      </dt>
      <dd className="font-bold tabular-nums text-ink">{amount}</dd>
    </div>
  );
}

/** Current month's finance summary for the Today page: the balance, and what came in and went out. */
export function FinanceMonthCard() {
  const [month] = useState(currentMonth);
  const { status, transactions } = useTransactions(month, 1);
  const totals = totalsOf(transactions);

  return (
    <ModuleCard title="Finanzas" href="/finance">
      {/* Holds about the height of the summary, so what comes below doesn't jump */}
      {status === "loading" && <p className="min-h-40 text-ink-muted">Cargando...</p>}

      {status === "error" && <p className="text-ink-muted">No pudimos cargar tus movimientos.</p>}

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
            <p className="text-sm text-ink-muted">Balance del mes</p>
            <p className="font-display text-5xl leading-tight font-bold text-ink tabular-nums">
              {formatMoney(totals.balance)}
            </p>
          </div>
          <dl className="flex flex-col">
            <LedgerLine label="Ingresos" amount={formatMoney(totals.income)} />
            <LedgerLine label="Gastos" amount={formatMoney(totals.expenses)} />
          </dl>
        </div>
      )}
    </ModuleCard>
  );
}
