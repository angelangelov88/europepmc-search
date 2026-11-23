import { useId } from "react";
import type { TermListProps } from "../../../types/Search";
import TermItem from "./TermItem";

const TermList = ({
  terms,
  onOperatorChange,
  onFieldChange,
  onRemove,
  onClear,
}: TermListProps) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-2 text-xl font-semibold">
        Terms
      </h2>
      {terms.length === 0 ? (
        <p className="text-gray-700">No terms yet.</p>
      ) : (
        <>
          <ol className="list-decimal divide-y divide-gray-200 pl-6">
            {terms.map((term, index) => (
              <TermItem
                key={term.id}
                term={term}
                isFirst={index === 0}
                onOperatorChange={onOperatorChange}
                onFieldChange={onFieldChange}
                onRemove={onRemove}
              />
            ))}
          </ol>
          <button
            type="button"
            onClick={onClear}
            className="mt-2 rounded-md px-3 py-1.5 text-gray-800 underline hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Clear all
          </button>
        </>
      )}
    </section>
  );
};

export default TermList;
