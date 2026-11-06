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
      <li className="py-5">
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
    <li className="flex items-center gap-3.5 py-3.5">
      {checked !== undefined && (
        <HabitCheckbox checked={checked} label={habit.name} onToggle={onToggle} />
      )}

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[1.0625rem] ${checked ? "text-ink-muted line-through" : "text-ink"}`}
        >
          {habit.name}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink-muted">
          <span>{describeWeekdays(habit.weekdays)}</span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded px-2 py-px text-[0.8125rem] font-bold text-ink bg-highlight">
              <FlameIcon className="h-3.5 w-3.5" />
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
