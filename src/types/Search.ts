import type { RefObject } from "react";
import type { Article } from "./EuropePmc";

type BooleanOperator = "AND" | "OR" | "NOT";

// Europe PMC field codes. ALL searches every field.
type SearchField = "ALL" | "TITLE" | "AUTH" | "ABSTRACT";

type SearchTerm = {
  id: string;
  text: string;
  field: SearchField;
  // How this term joins the ones before it. Ignored for the first term.
  operator: BooleanOperator;
};

type AddTermFormProps = {
  hasTerms: boolean;
  // Returns whether the term was added, so the form knows to clear its input.
  onAdd: (
    text: string,
    field: SearchField,
    operator: BooleanOperator,
  ) => boolean;
  inputRef: RefObject<HTMLInputElement | null>;
};

type TermListProps = {
  terms: SearchTerm[];
  onOperatorChange: (id: string, operator: BooleanOperator) => void;
  onFieldChange: (id: string, field: SearchField) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

type TermItemProps = {
  term: SearchTerm;
  isFirst: boolean;
  onOperatorChange: (id: string, operator: BooleanOperator) => void;
  onFieldChange: (id: string, field: SearchField) => void;
  onRemove: (id: string) => void;
};

type OperatorSelectProps = {
  label: string;
  // Hides the label on screen but keeps it for screen readers.
  hideLabel?: boolean;
  value: BooleanOperator;
  onChange: (operator: BooleanOperator) => void;
};

type FieldSelectProps = {
  label: string;
  hideLabel?: boolean;
  value: SearchField;
  onChange: (field: SearchField) => void;
};

type QueryPreviewProps = {
  query: string;
};

type SearchResultsProps = {
  query: string;
};

type ResultItemProps = {
  article: Article;
};

type PaginationProps = {
  pageNumber: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

type SearchErrorProps = {
  error: Error;
  onRetry: () => void;
};

type SpinnerProps = {
  label: string;
};

export type {
  AddTermFormProps,
  BooleanOperator,
  FieldSelectProps,
  OperatorSelectProps,
  PaginationProps,
  QueryPreviewProps,
  ResultItemProps,
  SearchErrorProps,
  SearchField,
  SearchResultsProps,
  SearchTerm,
  SpinnerProps,
  TermItemProps,
  TermListProps,
};
