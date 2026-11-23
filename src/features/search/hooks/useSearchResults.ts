import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FIRST_CURSOR, PAGE_SIZE } from "../../../lib/europePmcApi";
import searchQueryOptions from "./searchQueryOptions";

// Europe PMC pages with cursors and only gives the next one, so we keep every
// cursor we've visited. The last one is the current page; Previous drops it.
// A new search starts again at page 1 because SearchResults is keyed by query.
const useSearchResults = (query: string) => {
  const [cursors, setCursors] = useState<string[]>([FIRST_CURSOR]);
  const cursor = cursors.at(-1) ?? FIRST_CURSOR;

  const { data, error, refetch } = useQuery(searchQueryOptions(query, cursor));

  const pageNumber = cursors.length;
  const nextCursor = data?.nextCursor ?? null;
  // The last page can still carry a next cursor, so check the total as well.
  const hasNext =
    nextCursor !== null &&
    data !== undefined &&
    pageNumber * PAGE_SIZE < data.hitCount;
  const hasPrevious = pageNumber > 1;

  const goNext = () => {
    if (!hasNext) return;
    const updatedCursors = [...cursors, nextCursor];
    setCursors(updatedCursors);
  };

  const goPrevious = () => {
    if (!hasPrevious) return;
    const updatedCursors = cursors.slice(0, -1);
    setCursors(updatedCursors);
  };

  const retry = () => {
    void refetch();
  };

  return {
    page: data,
    error,
    pageNumber,
    hasNext,
    hasPrevious,
    goNext,
    goPrevious,
    retry,
  };
};

export default useSearchResults;
