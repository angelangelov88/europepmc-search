import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ErrorInfo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AppErrorFallback from "./components/AppErrorFallback";
import SearchWorkspace from "./features/search/components/SearchWorkspace";

// One cache for the whole app. Retries and cache times are set per query in
// searchQueryOptions.
const queryClient = new QueryClient();

// Logs only the error's name and message, and where it happened.
const logError = (error: unknown, info: ErrorInfo) => {
  const summary =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : "Unknown error";
  console.error("App crashed:", summary, info.componentStack);
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <main className="mx-auto max-w-4xl px-4 py-8 text-gray-900">
      <h1 className="mb-8 text-3xl font-bold">Europe PMC Search Workspace</h1>
      {/* The heading stays outside, so the page keeps it after a crash. */}
      <ErrorBoundary FallbackComponent={AppErrorFallback} onError={logError}>
        <SearchWorkspace />
      </ErrorBoundary>
    </main>
  </QueryClientProvider>
);

export default App;
