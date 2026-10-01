"use client";

import { ghostButtonClassName, iconButtonClassName } from "@/core/components/buttonStyles";
import { FlameIcon, PencilIcon } from "@/core/components/icons";
import type { Habit, HabitInput } from "../types";
import { describeWeekdays } from "../weekdays";
import { HabitCheckbox } from "./HabitCheckbox";
import { HabitForm } from "./HabitForm";

type HabitItemProps = {
  habit: Habit;
  /** Current streak, in scheduled days. */
  streak: number;
  /** Whether it's done on the day being shown; omit when it isn't scheduled that day. */
  checked?: boolean;
  editing: boolean;
  onToggle: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (input: HabitInput) => Promise<boolean>;
  onArchive: () => void;
  onDelete: () => void;
};

/** One habit row: check it off, or open it to edit, archive or delete. */
export function HabitItem({
  habit,
  streak,
  checked,
  editing,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onSave,
  onArchive,
  onDelete,
}: HabitItemProps) {
  if (editing) {
    return (
      <li className="px-4 py-4">
        <HabitForm
          initial={{ name: habit.name, weekdays: habit.weekdays }}
          submitLabel="Guardar"
          onSubmit={onSave}
          onCancel={onCancelEdit}
        >
          <button type="button" onClick={onArchive} className={ghostButtonClassName}>
            Archivar
          </button>
          <button type="button" onClick={onDelete} className={ghostButtonClassName}>
            Eliminar
          </button>
        </HabitForm>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {checked !== undefined && (
        <HabitCheckbox checked={checked} label={habit.name} onToggle={onToggle} />
      )}

      <div className="min-w-0 flex-1">
        <p className={`truncate font-medium ${checked ? "text-ink-muted line-through" : "text-ink"}`}>
          {habit.name}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
          <span>{describeWeekdays(habit.weekdays)}</span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <FlameIcon className="h-3.5 w-3.5 text-accent" />
              Racha de {streak} {streak === 1 ? "día" : "días"}
            </span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onStartEdit}
        aria-label={`Editar ${habit.name}`}
        className={iconButtonClassName}
      >
        <PencilIcon className="h-4 w-4" />
      </button>
    </li>
  );
}
