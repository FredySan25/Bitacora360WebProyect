import { SelectField } from "@/core/components/SelectField";
import { TRANSACTION_TYPES, categoriesOf } from "../constants";
import type { Transaction, TransactionType } from "../types";

export type TransactionFilter = {
  type: TransactionType | "all";
  /** "" for every category, or `categoryFilterValue(type, key)`. */
  category: string;
};

export const NO_FILTERS: TransactionFilter = { type: "all", category: "" };

/** Both types have an "other" category, so a category is filtered together with its type. */
export function categoryFilterValue(type: TransactionType, key: string): string {
  return `${type}:${key}`;
}

export function matchesFilter(transaction: Transaction, filter: TransactionFilter): boolean {
  if (filter.type !== "all" && transaction.type !== filter.type) return false;
  return (
    filter.category === "" ||
    filter.category === categoryFilterValue(transaction.type, transaction.category)
  );
}

type TransactionFiltersProps = {
  filter: TransactionFilter;
  onChange: (filter: TransactionFilter) => void;
};

/** Narrows the list by type and by category. */
export function TransactionFilters({ filter, onChange }: TransactionFiltersProps) {
  const shownTypes = TRANSACTION_TYPES.filter(
    (type) => filter.type === "all" || type.value === filter.type,
  );

  function changeType(type: TransactionFilter["type"]) {
    // A category of the other type would leave the list empty for no visible reason
    const keepsCategory = type === "all" || filter.category.startsWith(`${type}:`);
    onChange({ type, category: keepsCategory ? filter.category : "" });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:max-w-md">
      <SelectField
        label="Tipo"
        value={filter.type}
        onChange={(e) => changeType(e.target.value as TransactionFilter["type"])}
      >
        <option value="all">Todos</option>
        {TRANSACTION_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.plural}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Categoría"
        value={filter.category}
        onChange={(e) => onChange({ ...filter, category: e.target.value })}
      >
        <option value="">Todas</option>
        {shownTypes.map((type) => (
          <optgroup key={type.value} label={type.plural}>
            {categoriesOf(type.value).map((category) => (
              <option key={category.key} value={categoryFilterValue(type.value, category.key)}>
                {category.label}
              </option>
            ))}
          </optgroup>
        ))}
      </SelectField>
    </div>
  );
}
