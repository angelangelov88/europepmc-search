import type {
  SearchErrorKind,
  SearchOptions,
  SearchPage,
} from "../types/EuropePmc";
import { isApiErrorBody, isArticle, isSearchResponse } from "./europePmcGuards";

const SEARCH_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";
const PAGE_SIZE = 25;
const FIRST_CURSOR = "*";
const DEFAULT_TIMEOUT_MS = 20_000;

// Safe messages for the user. Europe PMC's own reply is never shown.
const ERROR_MESSAGES: Record<SearchErrorKind, string> = {
  unavailable:
    "Europe PMC is temporarily unavailable. Please try again in a moment.",
  network: "Couldn't reach Europe PMC. Check your connection and try again.",
  timeout: "Europe PMC took too long to reply. Please try again.",
  bad_query: "Europe PMC couldn't run this search. Try changing your terms.",
  invalid: "Europe PMC sent a reply we couldn't read. Please try again.",
};

// Worth trying again: the service or the connection may recover.
const RETRYABLE_KINDS = new Set<SearchErrorKind>([
  "unavailable",
  "network",
  "timeout",
]);

class SearchApiError extends Error {
  readonly kind: SearchErrorKind;

  constructor(kind: SearchErrorKind) {
    super(ERROR_MESSAGES[kind]);
    this.name = "SearchApiError";
    this.kind = kind;
  }
}

const isRetryableError = (error: unknown) =>
  error instanceof SearchApiError && RETRYABLE_KINDS.has(error.kind);

const buildSearchUrl = (query: string, cursor: string) => {
  const params = new URLSearchParams({
    query,
    format: "json",
    resultType: "lite",
    pageSize: String(PAGE_SIZE),
    cursorMark: cursor,
  });
  return `${SEARCH_URL}?${params.toString()}`;
};

// Races the request against a timer: whichever finishes first wins. If the
// timer wins we stop waiting, though the browser may finish the request in the
// background. The timer is cleared either way.
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timerId = setTimeout(() => {
      reject(new SearchApiError("timeout"));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timerId);
  }
};

// Europe PMC sometimes reports errors with HTTP 200 and an errCode in the
// body, so both the status and the body are checked.
const getErrorKind = (status: number, body: unknown) => {
  const errCode = isApiErrorBody(body) ? body.errCode : null;
  if (status >= 500 || (errCode !== null && errCode >= 500)) {
    return "unavailable";
  }
  if (status >= 400 || errCode !== null) return "bad_query";
  return null;
};

// Fetches one page of results. cursor is "*" for the first page, then the
// nextCursor of the page before. Throws SearchApiError when it fails.
const searchArticles = async (
  query: string,
  cursor: string,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: SearchOptions = {},
): Promise<SearchPage> => {
  const url = buildSearchUrl(query, cursor);
  let response: Response;
  try {
    response = await withTimeout(fetch(url), timeoutMs);
  } catch (error) {
    // Our timeout error is passed on. Anything else fetch throws means the
    // request never got a reply, e.g. no connection.
    throw error instanceof SearchApiError
      ? error
      : new SearchApiError("network");
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // An HTML error page isn't JSON.
    body = null;
  }

  const errorKind = getErrorKind(response.status, body);
  if (errorKind) throw new SearchApiError(errorKind);
  if (!isSearchResponse(body)) throw new SearchApiError("invalid");

  // Past the last page nextCursorMark is missing or the same as the one we sent.
  const next = body.nextCursorMark;
  const nextCursor = next === undefined || next === cursor ? null : next;

  return {
    hitCount: body.hitCount,
    // A broken article is skipped rather than failing the whole page.
    articles: body.resultList.result.filter(isArticle),
    nextCursor,
  };
};

export {
  FIRST_CURSOR,
  PAGE_SIZE,
  SearchApiError,
  isRetryableError,
  searchArticles,
};
