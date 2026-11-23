import { useRef, useState } from "react";
import AddTermForm from "./AddTermForm";
import QueryPreview from "./QueryPreview";
import SearchResults from "./SearchResults";
import TermList from "./TermList";
import useSearchTerms from "../hooks/useSearchTerms";

const SearchWorkspace = () => {
  const {
    terms,
    query,
    addTerm,
    removeTerm,
    setOperator,
    setField,
    clearTerms,
  } = useSearchTerms();
  // Changes only when Search is pressed, so results don't reload while the
  // user is still building the query.
  const [submittedQuery, setSubmittedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // The removed button disappears, so move focus back to the keyword box
  // rather than losing it.
  const handleRemove = (id: string) => {
    removeTerm(id);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    clearTerms();
    inputRef.current?.focus();
  };

  // Nothing to search, or this query has already been searched (its results
  // are loading or shown). Changing the query makes Search available again.
  const canSearch = query !== "" && query !== submittedQuery;

  const handleSearch = () => {
    if (!canSearch) return;
    setSubmittedQuery(query);
  };

  return (
    <div className="space-y-8">
      <AddTermForm
        hasTerms={terms.length > 0}
        onAdd={addTerm}
        inputRef={inputRef}
      />
      <TermList
        terms={terms}
        onOperatorChange={setOperator}
        onFieldChange={setField}
        onRemove={handleRemove}
        onClear={handleClear}
      />
      <div className="space-y-3">
        <QueryPreview query={query} />
        {/* aria-disabled rather than disabled, so the button keeps keyboard
            focus after it is pressed. */}
        <button
          type="button"
          onClick={handleSearch}
          aria-disabled={!canSearch}
          className="rounded-md bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 aria-disabled:cursor-not-allowed aria-disabled:bg-gray-500 aria-disabled:hover:bg-gray-500"
        >
          Search
        </button>
      </div>
      {/* key: a new search starts again from page 1. */}
      {submittedQuery !== "" && (
        <SearchResults key={submittedQuery} query={submittedQuery} />
      )}
    </div>
  );
};

export default SearchWorkspace;
