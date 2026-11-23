import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  JOURNAL_ARTICLE,
  NEXT_CURSOR,
  PREPRINT,
  SEARCH_URL,
  searchResponse,
} from "../../../test/fixtures";
import renderWithClient from "../../../test/renderWithClient";
import server from "../../../test/server";
import SearchResults from "./SearchResults";

// Two pages: page 1 has a next cursor, page 2 is the last page. Like the real
// API, the last page still has a next cursor. Records every cursor the app
// sends, so tests can check what was requested.
const mockTwoPages = () => {
  const sentCursors: (string | null)[] = [];
  server.use(
    http.get(SEARCH_URL, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get("cursorMark");
      sentCursors.push(cursor);
      return cursor === NEXT_CURSOR
        ? HttpResponse.json({
            ...searchResponse([PREPRINT], { hitCount: 26 }),
            nextCursorMark: "AoE_after_last",
          })
        : HttpResponse.json(
            searchResponse([JOURNAL_ARTICLE], { hitCount: 26 }),
          );
    }),
  );
  return sentCursors;
};

const renderResults = () => {
  const user = userEvent.setup();
  renderWithClient(<SearchResults query="cancer" />);
  return user;
};

describe("SearchResults", () => {
  it("loads page 2 with the cursor from page 1", async () => {
    const sentCursors = mockTwoPages();
    const user = renderResults();

    await screen.findByRole("link", { name: /Specialist Palliative Care/ });
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(
      await screen.findByRole("link", { name: /LCatlas/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 26–26 of 26 results")).toBeInTheDocument();
    expect(screen.getByText("Page 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Results" })).toHaveFocus();
    expect(sentCursors).toEqual(["*", NEXT_CURSOR]);
  });

  it("goes back to page 1 from the cache", async () => {
    const sentCursors = mockTwoPages();
    const user = renderResults();

    await screen.findByRole("link", { name: /Specialist Palliative Care/ });
    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByRole("link", { name: /LCatlas/ });
    await user.click(screen.getByRole("button", { name: "Previous" }));

    expect(
      await screen.findByRole("link", { name: /Specialist Palliative Care/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Page 1")).toBeInTheDocument();
    expect(sentCursors).toEqual(["*", NEXT_CURSOR]);
  });

  it("says so when nothing matches", async () => {
    server.use(
      http.get(SEARCH_URL, () =>
        HttpResponse.json(searchResponse([], { hitCount: 0, lastPage: true })),
      ),
    );
    renderResults();

    expect(await screen.findByText(/No results for/)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Results pages" }),
    ).not.toBeInTheDocument();
  });

  it("shows an error after retrying, then recovers on Try again", async () => {
    let isDown = true;
    let requestCount = 0;
    server.use(
      http.get(SEARCH_URL, () => {
        requestCount += 1;
        return isDown
          ? HttpResponse.json(
              { errCode: 503, errMsg: "Service unavailable" },
              { status: 503 },
            )
          : HttpResponse.json(
              searchResponse([JOURNAL_ARTICLE], { lastPage: true }),
            );
      }),
    );
    const user = renderResults();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "temporarily unavailable",
    );
    // The first try plus two automatic retries.
    expect(requestCount).toBe(3);

    isDown = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("link", { name: /Specialist Palliative Care/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not retry a query Europe PMC rejects", async () => {
    let requestCount = 0;
    server.use(
      http.get(SEARCH_URL, () => {
        requestCount += 1;
        // Europe PMC reports bad queries with HTTP 200 and an error body.
        return HttpResponse.json({ errCode: 400, errMsg: "Invalid query" });
      }),
    );
    renderResults();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "couldn't run this search",
    );
    expect(requestCount).toBe(1);
  });
});
