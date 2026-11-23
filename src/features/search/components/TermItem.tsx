import type { TermItemProps } from "../../../types/Search";
import FieldSelect from "./FieldSelect";
import OperatorSelect from "./OperatorSelect";

const TermItem = ({
  term,
  isFirst,
  onOperatorChange,
  onFieldChange,
  onRemove,
}: TermItemProps) => (
  <li className="flex flex-wrap items-center gap-3 py-2">
    {/* Keeps the rows lined up when the first one has no operator. */}
    <div className="w-20">
      {!isFirst && (
        <OperatorSelect
          label={`Operator for ${term.text}`}
          hideLabel
          value={term.operator}
          onChange={(operator) => {
            onOperatorChange(term.id, operator);
          }}
        />
      )}
    </div>
    <span className="min-w-32 flex-1 font-medium break-words">{term.text}</span>
    <FieldSelect
      label={`Field for ${term.text}`}
      hideLabel
      value={term.field}
      onChange={(field) => {
        onFieldChange(term.id, field);
      }}
    />
    <button
      type="button"
      aria-label={`Remove term: ${term.text}`}
      onClick={() => {
        onRemove(term.id);
      }}
      className="rounded-md px-3 py-1.5 text-red-800 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <span aria-hidden="true">✕</span> Remove
    </button>
  </li>
);

export default TermItem;
