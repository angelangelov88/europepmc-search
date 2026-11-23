import { useId, useState, type SubmitEvent } from "react";
import type {
  AddTermFormProps,
  BooleanOperator,
  SearchField,
} from "../../../types/Search";
import FieldSelect from "./FieldSelect";
import OperatorSelect from "./OperatorSelect";

const AddTermForm = ({ hasTerms, onAdd, inputRef }: AddTermFormProps) => {
  const [text, setText] = useState("");
  const [field, setField] = useState<SearchField>("ALL");
  const [operator, setOperator] = useState<BooleanOperator>("AND");
  const headingId = useId();
  const inputId = useId();

  // Enter in the text box submits the form too, so both add the term.
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const added = onAdd(text, field, operator);
    if (added) setText("");
  };

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-3 text-xl font-semibold">
        Build your query
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-48 flex-1 flex-col gap-1">
          <label htmlFor={inputId} className="text-sm font-medium">
            Keyword or phrase
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            className="rounded-md border border-gray-500 px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          />
        </div>
        <FieldSelect label="Field" value={field} onChange={setField} />
        {/* The first term's operator is ignored, so ask only from the second. */}
        {hasTerms && (
          <OperatorSelect
            label="Join with"
            value={operator}
            onChange={setOperator}
          />
        )}
        <button
          type="submit"
          className="rounded-md border border-blue-700 px-4 py-1.5 font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Add
        </button>
      </form>
    </section>
  );
};

export default AddTermForm;
