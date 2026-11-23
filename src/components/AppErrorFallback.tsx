import type { FallbackProps } from "react-error-boundary";

// Shown when a component crashes while rendering. The raw error is never
// shown here, only logged (see logError in App).
const AppErrorFallback = ({ resetErrorBoundary }: FallbackProps) => (
  <div
    role="alert"
    className="space-y-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-900"
  >
    <h2 className="text-xl font-semibold">Something went wrong</h2>
    <p>The search workspace stopped working. Your terms may be lost.</p>
    <button
      type="button"
      onClick={resetErrorBoundary}
      className="rounded-md bg-red-800 px-4 py-1.5 font-medium text-white hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      Start again
    </button>
  </div>
);

export default AppErrorFallback;
