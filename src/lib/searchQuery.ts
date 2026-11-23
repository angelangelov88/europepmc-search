import type { BooleanOperator, SearchField, SearchTerm } from "../types/Search";

const FIELD_LABELS: Record<SearchField, string> = {
  ALL: "Any field",
  TITLE: "Title",
  AUTH: "Author",
  ABSTRACT: "Abstract",
};

const OPERATORS: BooleanOperator[] = ["AND", "OR", "NOT"];
const SEARCH_FIELDS: SearchField[] = ["ALL", "TITLE", "AUTH", "ABSTRACT"];

// A <select> gives back plain text, so these check it is one of ours.
const isBooleanOperator = (value: string): value is BooleanOperator =>
  OPERATORS.some((operator) => operator === value);

const isSearchField = (value: string): value is SearchField =>
  SEARCH_FIELDS.some((field) => field === value);

// Words Europe PMC would read as operators rather than as search text.
const OPERATOR_WORDS = new Set<string>(OPERATORS);

// Spaces split a phrase into separate words, and ( ) : are query syntax.
const NEEDS_QUOTES = /[\s():]/;

// One term as Europe PMC syntax, e.g. cancer, "gene therapy" or
// AUTH:"Smith J". Single words stay unquoted so wildcards (immun*) still work.
// Returns "" when nothing is left after cleaning.
const formatTerm = ({ text, field }: Pick<SearchTerm, "text" | "field">) => {
  const clean = text.replaceAll('"', "").trim().replace(/\s+/g, " ");
  if (clean === "") return "";

  const needsQuotes =
    NEEDS_QUOTES.test(clean) || OPERATOR_WORDS.has(clean.toUpperCase());
  const value = needsQuotes ? `"${clean}"` : clean;
  return field === "ALL" ? value : `${field}:${value}`;
};

const isOr = (operator: BooleanOperator) => operator === "OR";

// Joins the terms left to right, in the order the user added them. Brackets
// are added only when switching between OR and AND/NOT, so the result reads
// the way it was built: (cancer OR tumour) AND immunotherapy. A run of AND and
// NOT needs none, since both only narrow the results.
const buildQuery = (terms: SearchTerm[]) => {
  let query = "";
  let previous: BooleanOperator | null = null;

  for (const term of terms) {
    const value = formatTerm(term);
    if (value === "") continue;

    if (query === "") {
      query = value;
      continue;
    }

    if (previous !== null && isOr(previous) !== isOr(term.operator)) {
      query = `(${query})`;
    }
    query = `${query} ${term.operator} ${value}`;
    previous = term.operator;
  }

  return query;
};

export {
  FIELD_LABELS,
  OPERATORS,
  SEARCH_FIELDS,
  buildQuery,
  formatTerm,
  isBooleanOperator,
  isSearchField,
};
