import type { PaginationProps } from "../../../types/Search";

const BUTTON_CLASSES =
  "rounded-md border border-blue-700 px-4 py-1.5 font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-500 disabled:hover:bg-transparent";

const Pagination = ({
  pageNumber,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: PaginationProps) => (
  <nav
    aria-label="Results pages"
    className="flex items-center justify-between gap-4"
  >
    <button
      type="button"
      onClick={onPrevious}
      disabled={!hasPrevious}
      className={BUTTON_CLASSES}
    >
      <span aria-hidden="true">←</span> Previous
    </button>
    <span>Page {pageNumber}</span>
    <button
      type="button"
      onClick={onNext}
      disabled={!hasNext}
      className={BUTTON_CLASSES}
    >
      Next <span aria-hidden="true">→</span>
    </button>
  </nav>
);

export default Pagination;
