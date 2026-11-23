import { useId, type ChangeEvent } from "react";
import {
  FIELD_LABELS,
  SEARCH_FIELDS,
  isSearchField,
} from "../../../lib/searchQuery";
import type { FieldSelectProps } from "../../../types/Search";

const FieldSelect = ({
  label,
  hideLabel = false,
  value,
  onChange,
}: FieldSelectProps) => {
  const selectId = useId();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    if (isSearchField(selected)) onChange(selected);
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className={hideLabel ? "sr-only" : "text-sm font-medium"}
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        className="rounded-md border border-gray-500 bg-white px-2 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        {SEARCH_FIELDS.map((field) => (
          <option key={field} value={field}>
            {FIELD_LABELS[field]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FieldSelect;
