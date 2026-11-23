import type { ApiErrorBody, Article, SearchResponse } from "../types/EuropePmc";

// TypeScript types disappear after the build, so these check the real data
// that comes back from Europe PMC while the app runs.

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isOptionalString = (value: unknown) =>
  value === undefined || typeof value === "string";

const isApiErrorBody = (value: unknown): value is ApiErrorBody =>
  isRecord(value) &&
  typeof value.errCode === "number" &&
  typeof value.errMsg === "string";

const isSearchResponse = (value: unknown): value is SearchResponse =>
  isRecord(value) &&
  typeof value.hitCount === "number" &&
  isOptionalString(value.nextCursorMark) &&
  isRecord(value.resultList) &&
  Array.isArray(value.resultList.result);

const isArticle = (value: unknown): value is Article =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.source === "string" &&
  typeof value.title === "string" &&
  isOptionalString(value.authorString) &&
  isOptionalString(value.journalTitle) &&
  isOptionalString(value.pubYear);

export { isApiErrorBody, isArticle, isSearchResponse };
