import { useId, type ChangeEvent } from "react";
import { OPERATORS, isBooleanOperator } from "../../../lib/searchQuery";
import type { OperatorSelectProps } from "../../../types/Search";

const OperatorSelect = ({
  label,
  hideLabel = false,
  value,
  onChange,
}: OperatorSelectProps) => {
  const selectId = useId();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    if (isBooleanOperator(selected)) onChange(selected);
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
        {OPERATORS.map((operator) => (
          <option key={operator} value={operator}>
            {operator}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OperatorSelect;
