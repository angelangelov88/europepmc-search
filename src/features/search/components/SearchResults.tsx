import { useId, useRef } from "react";
import { PAGE_SIZE } from "../../../lib/europePmcApi";
import type { SearchResultsProps } from "../../../types/Search";
import useSearchResults from "../hooks/useSearchResults";
import Pagination from "./Pagination";
import ResultItem from "./ResultItem";
import SearchError from "./SearchError";
import Spinner from "./Spinner";

const SearchResults = ({ query }: SearchResultsProps) => {
  const {
    page,
    error,
    pageNumber,
    hasNext,
    hasPrevious,
    goNext,
    goPrevious,
    retry,
  } = useSearchResults(query);
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // No page and no error: a page is loading.
  const isLoading = page === undefined && error === null;
  const hasResults = page !== undefined && page.hitCount > 0;
  // Numbers for "Showing 26–50 of 279,943 results".
  const first = (pageNumber - 1) * PAGE_SIZE + 1;
  const last = first + (page?.articles.length ?? 0) - 1;

  // The page changes but the buttons stay, so focus moves to the heading.
  // Keyboard and screen reader users then start at the top of the new page.
  const handleNext = () => {
    goNext();
    headingRef.current?.focus();
  };

  const handlePrevious = () => {
    goPrevious();
    headingRef.current?.focus();
  };

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Results
        </h2>
        <p className="text-sm text-gray-700">
          for <code>{query}</code>
        </p>
      </div>

      {error && <SearchError error={error} onRetry={retry} />}

      {isLoading && (
        <Spinner
          label={
            pageNumber === 1
              ? "Loading results…"
              : `Loading page ${String(pageNumber)}…`
          }
        />
      )}

      {page?.hitCount === 0 && (
        <div role="status" className="space-y-1">
          <p>
            No results for <code>{query}</code>.
          </p>
          <p>Try fewer or broader terms.</p>
        </div>
      )}

      {hasResults && (
        <div className="space-y-6">
          <p role="status" className="text-gray-800">
            Showing {first}–{last} of {page.hitCount.toLocaleString("en-GB")}{" "}
            results
          </p>
          <ol start={first} className="list-decimal space-y-5 pl-8">
            {page.articles.map((article) => (
              <ResultItem
                key={`${article.source}-${article.id}`}
                article={article}
              />
            ))}
          </ol>
          {(hasPrevious || hasNext) && (
            <Pagination
              pageNumber={pageNumber}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default SearchResults;
