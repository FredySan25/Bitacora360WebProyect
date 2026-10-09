"use client";

import { useState } from "react";
import { outlineButtonClassName } from "@/core/components/buttonStyles";
import { ConfirmDialog } from "@/core/components/ConfirmDialog";
import { FormAlert } from "@/core/components/FormAlert";
import { PlusIcon } from "@/core/components/icons";
import { todayKey } from "@/core/lib/dates";
import { formatMoney } from "../format";
import { useSavingsGoals } from "../hooks/useSavingsGoals";
import type { SavingsContribution, SavingsGoal } from "../types";
import { GoalCard } from "./GoalCard";
import { GoalForm } from "./GoalForm";

/** What the confirmation dialog is asking about: a whole goal, or one of its contributions. */
type PendingDelete = { goal: SavingsGoal; contribution?: SavingsContribution };

function contributionsCount(count: number): string {
  return count === 1 ? "su aporte" : `sus ${count} aportes`;
}

/** Savings goals: create, edit and delete them, and add or remove contributions. */
export function GoalsBoard() {
  const {
    status,
    goals,
    actionError,
    clearActionError,
    addGoal,
    editGoal,
    removeGoal,
    addContribution,
    removeContribution,
  } = useSavingsGoals();

  const [today] = useState(todayKey);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<PendingDelete | null>(null);

  if (status === "loading") {
    return <p className="text-sm text-ink-muted">Cargando tus metas...</p>;
  }
  if (status === "error") {
    return (
      <FormAlert message="No pudimos cargar tus metas. Recarga la página para intentar de nuevo." />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {actionError && <FormAlert message={actionError} />}

      {goals.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              today={today}
              editing={editingId === goal.id}
              onStartEdit={() => setEditingId(goal.id)}
              onCancelEdit={() => {
                setEditingId(null);
                clearActionError();
              }}
              onSave={async (input) => {
                const ok = await editGoal(goal.id, input);
                if (ok) setEditingId(null);
                return ok;
              }}
              onDelete={() => setDeleting({ goal })}
              onContribute={(input) => addContribution(goal.id, input)}
              onDeleteContribution={(contribution) => setDeleting({ goal, contribution })}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-rule px-4 py-6 text-center text-sm text-ink-muted">
          Aún no tienes metas de ahorro. Un fondo de emergencia es un buen comienzo.
        </p>
      )}

      {creating ? (
        <section className="rounded-2xl border border-border bg-paper-elevated p-4">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Nueva meta</h2>
          <GoalForm
            submitLabel="Crear meta"
            onSubmit={async (input) => {
              const ok = await addGoal(input);
              if (ok) setCreating(false);
              return ok;
            }}
            onCancel={() => {
              setCreating(false);
              clearActionError();
            }}
          />
        </section>
      ) : (
        <button type="button" onClick={() => setCreating(true)} className={outlineButtonClassName}>
          <PlusIcon className="h-4 w-4" />
          Nueva meta
        </button>
      )}

      {deleting &&
        (deleting.contribution ? (
          <ConfirmDialog
            title="¿Eliminar este aporte?"
            message={`${formatMoney(deleting.contribution.amount)} de "${deleting.goal.name}". Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            onConfirm={async () => {
              if (deleting.contribution) {
                await removeContribution(deleting.goal.id, deleting.contribution.id);
              }
              setDeleting(null);
            }}
            onCancel={() => setDeleting(null)}
          />
        ) : (
          <ConfirmDialog
            title={`¿Eliminar la meta "${deleting.goal.name}"?`}
            message={
              deleting.goal.contributions.length > 0
                ? `Se elimina junto con ${contributionsCount(deleting.goal.contributions.length)}. Esta acción no se puede deshacer.`
                : "Esta acción no se puede deshacer."
            }
            confirmLabel="Eliminar"
            onConfirm={async () => {
              await removeGoal(deleting.goal.id);
              setDeleting(null);
            }}
            onCancel={() => setDeleting(null)}
          />
        ))}
    </div>
  );
}
