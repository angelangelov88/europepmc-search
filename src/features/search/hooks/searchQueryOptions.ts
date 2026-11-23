import { queryOptions } from "@tanstack/react-query";
import { isRetryableError, searchArticles } from "../../../lib/europePmcApi";

const MAX_RETRIES = 2;
const STALE_TIME_MS = 5 * 60_000;

// Retries only errors that might go away (service down, network, timeout),
// at most twice. A bad query would fail the same way every time.
// error is typed Error (TanStack's default), because TanStack takes the
// query's error type from this function.
const shouldRetry = (failureCount: number, error: Error) =>
  failureCount < MAX_RETRIES && isRetryableError(error);

// One page of results. Each [query, cursor] is cached on its own, so going
// back to a page already seen is instant.
const searchQueryOptions = (query: string, cursor: string) =>
  queryOptions({
    queryKey: ["search", query, cursor],
    queryFn: () => searchArticles(query, cursor),
    staleTime: STALE_TIME_MS,
    retry: shouldRetry,
  });

export default searchQueryOptions;
