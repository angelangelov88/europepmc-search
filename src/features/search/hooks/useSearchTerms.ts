import { useState } from "react";
import { buildQuery } from "../../../lib/searchQuery";
import type {
  BooleanOperator,
  SearchField,
  SearchTerm,
} from "../../../types/Search";

// Each function works out the new list from `terms` and then sets it. That's
// safe because every change comes from one user action, and React re-renders
// between actions. Code making several changes in a row would need the
// callback form instead: setTerms((current) => ...).
const useSearchTerms = () => {
  const [terms, setTerms] = useState<SearchTerm[]>([]);

  // Returns whether a term was added, so the form knows to clear its input.
  const addTerm = (
    text: string,
    field: SearchField,
    operator: BooleanOperator,
  ) => {
    const trimmed = text.trim();
    if (trimmed === "") return false;
    const newTerm = { id: crypto.randomUUID(), text: trimmed, field, operator };
    const updatedTerms = [...terms, newTerm];
    setTerms(updatedTerms);
    return true;
  };

  const removeTerm = (id: string) => {
    const remainingTerms = terms.filter((term) => term.id !== id);
    // The first term's operator is hidden, so reset it to AND.
    const updatedTerms = remainingTerms.map((term, index): SearchTerm =>
      index === 0 ? { ...term, operator: "AND" } : term,
    );
    setTerms(updatedTerms);
  };

  const setOperator = (id: string, operator: BooleanOperator) => {
    const updatedTerms = terms.map((term) =>
      term.id === id ? { ...term, operator } : term,
    );
    setTerms(updatedTerms);
  };

  const setField = (id: string, field: SearchField) => {
    const updatedTerms = terms.map((term) =>
      term.id === id ? { ...term, field } : term,
    );
    setTerms(updatedTerms);
  };

  const clearTerms = () => {
    setTerms([]);
  };

  return {
    terms,
    query: buildQuery(terms),
    addTerm,
    removeTerm,
    setOperator,
    setField,
    clearTerms,
  };
};

export default useSearchTerms;
