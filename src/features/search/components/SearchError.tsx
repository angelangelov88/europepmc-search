import { SearchApiError } from "../../../lib/europePmcApi";
import type { SearchErrorProps } from "../../../types/Search";

const FALLBACK_ERROR = "Something went wrong. Please try again.";

// Our own errors carry a safe message. Anything else gets a general one, so a
// raw error is never shown.
const SearchError = ({ error, onRetry }: SearchErrorProps) => (
  <div
    role="alert"
    className="space-y-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-900"
  >
    <p>{error instanceof SearchApiError ? error.message : FALLBACK_ERROR}</p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-md bg-red-800 px-4 py-1.5 font-medium text-white hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      Try again
    </button>
  </div>
);

export default SearchError;
