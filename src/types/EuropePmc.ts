// One search result, as Europe PMC sends it with resultType=lite. Only the
// fields we show are listed. Preprints have no journal, so most are optional.
type Article = {
  id: string;
  source: string;
  title: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: string;
};

// The raw reply from /search. resultList.result is checked item by item.
type SearchResponse = {
  hitCount: number;
  // Missing on the last page.
  nextCursorMark?: string;
  resultList: { result: unknown[] };
};

// Europe PMC reports some errors with HTTP 200 and this body.
type ApiErrorBody = {
  errCode: number;
  errMsg: string;
};

// Our cleaned-up page: the only shape the UI ever sees.
type SearchPage = {
  hitCount: number;
  articles: Article[];
  // null on the last page.
  nextCursor: string | null;
};

type SearchErrorKind =
  "unavailable" | "network" | "timeout" | "bad_query" | "invalid";

type SearchOptions = {
  timeoutMs?: number;
};

export type {
  ApiErrorBody,
  Article,
  SearchErrorKind,
  SearchOptions,
  SearchPage,
  SearchResponse,
};
