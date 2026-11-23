import { delay, http, HttpResponse, type JsonBodyType } from "msw";
import { describe, expect, it } from "vitest";
import {
  JOURNAL_ARTICLE,
  NEXT_CURSOR,
  PREPRINT,
  SEARCH_URL,
  searchResponse,
} from "../test/fixtures";
import server from "../test/server";
import type { SearchErrorKind, SearchOptions } from "../types/EuropePmc";
import { FIRST_CURSOR, searchArticles } from "./europePmcApi";

// Makes the fake Europe PMC reply with the given JSON body.
const replyWith = (body: JsonBodyType, status = 200) => {
  server.use(http.get(SEARCH_URL, () => HttpResponse.json(body, { status })));
};

const expectErrorKind = async (
  kind: SearchErrorKind,
  options?: SearchOptions,
) => {
  await expect(
    searchArticles("cancer", FIRST_CURSOR, options),
  ).rejects.toMatchObject({ name: "SearchApiError", kind });
};

describe("searchArticles", () => {
  it("sends the query, page size and cursor", async () => {
    let sentParams = new URLSearchParams();
    server.use(
      http.get(SEARCH_URL, ({ request }) => {
        sentParams = new URL(request.url).searchParams;
        return HttpResponse.json(searchResponse([]));
      }),
    );

    await searchArticles('cancer AND "gene therapy"', "AoE_abc");

    expect(Object.fromEntries(sentParams)).toEqual({
      query: 'cancer AND "gene therapy"',
      format: "json",
      resultType: "lite",
      pageSize: "25",
      cursorMark: "AoE_abc",
    });
  });

  it("returns the articles, total and next cursor", async () => {
    replyWith(searchResponse([JOURNAL_ARTICLE, PREPRINT], { hitCount: 120 }));

    const page = await searchArticles("cancer", FIRST_CURSOR);

    expect(page).toEqual({
      hitCount: 120,
      articles: [JOURNAL_ARTICLE, PREPRINT],
      nextCursor: NEXT_CURSOR,
    });
  });

  it("has no next cursor on the last page", async () => {
    replyWith(searchResponse([PREPRINT], { lastPage: true }));

    const page = await searchArticles("cancer", FIRST_CURSOR);

    expect(page.nextCursor).toBeNull();
  });

  it("has no next cursor when Europe PMC sends back the same one", async () => {
    replyWith(searchResponse([PREPRINT]));

    const page = await searchArticles("cancer", NEXT_CURSOR);

    expect(page.nextCursor).toBeNull();
  });

  it("returns an empty page when nothing matches", async () => {
    replyWith(searchResponse([], { lastPage: true }));

    const page = await searchArticles("zzqqxx", FIRST_CURSOR);

    expect(page).toEqual({ hitCount: 0, articles: [], nextCursor: null });
  });

  it("skips a broken article instead of failing the page", async () => {
    replyWith(searchResponse([JOURNAL_ARTICLE, { id: 7, title: null }]));

    const page = await searchArticles("cancer", FIRST_CURSOR);

    expect(page.articles).toEqual([JOURNAL_ARTICLE]);
  });

  it("treats an errCode sent with HTTP 200 as a bad query", async () => {
    replyWith({ errCode: 404, errMsg: "Query cannot be empty" });

    await expectErrorKind("bad_query");
  });

  it("treats errCode 503 as unavailable", async () => {
    replyWith(
      { errCode: 503, errMsg: "Search service is temporarily unavailable" },
      503,
    );

    await expectErrorKind("unavailable");
  });

  it("treats an HTML 503 page as unavailable", async () => {
    server.use(
      http.get(SEARCH_URL, () =>
        HttpResponse.html("<html><h1>503 Service Unavailable</h1></html>", {
          status: 503,
        }),
      ),
    );

    await expectErrorKind("unavailable");
  });

  it("reports a network failure", async () => {
    server.use(http.get(SEARCH_URL, () => HttpResponse.error()));

    await expectErrorKind("network");
  });

  it("gives up after the timeout", async () => {
    server.use(
      http.get(SEARCH_URL, async () => {
        await delay("infinite");
        return HttpResponse.json(searchResponse([]));
      }),
    );

    await expectErrorKind("timeout", { timeoutMs: 50 });
  });

  it("rejects a reply with the wrong shape", async () => {
    replyWith({ hitCount: "lots", resultList: {} });

    await expectErrorKind("invalid");
  });
});
