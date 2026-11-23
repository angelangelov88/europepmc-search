import { useId } from "react";
import type { QueryPreviewProps } from "../../../types/Search";

const QueryPreview = ({ query }: QueryPreviewProps) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-2 text-xl font-semibold">
        Query
      </h2>
      {/* Always rendered, so screen readers announce each new query. */}
      <p
        aria-live="polite"
        className="rounded-md bg-gray-100 px-3 py-2 break-words"
      >
        {query === "" ? (
          <span className="text-gray-700">Add a term to build your query.</span>
        ) : (
          <code>{query}</code>
        )}
      </p>
    </section>
  );
};

export default QueryPreview;
