# Engineering notes

## Approach

I started by calling the Europe PMC API with curl to learn how it behaves:
the reply shape, how paging works and how it reports errors. That shaped most
of the decisions below. The app is kept deliberately small: one feature
folder, no state library beyond TanStack Query, and no schema library.

## Key decisions

### Building the query

Each term is `{ text, field, operator }`, and a pure function
(`lib/searchQuery.ts`) turns the list into Europe PMC syntax. What you see in
the Query box is exactly what is sent.

- Phrases, and words Europe PMC would read as operators, are put in quotes.
  Single words are left unquoted so wildcards such as `immun*` still work.
- Fields are added as prefixes, for example `TITLE:cancer`.
- Terms are joined left to right in the order they were added. Brackets are
  added only when switching between OR and AND/NOT, so
  `cancer OR tumour` then `AND immunotherapy` becomes
  `(cancer OR tumour) AND immunotherapy`, while the brief's example
  `cancer AND immunotherapy NOT melanoma` needs none.

The search runs when **Search** is pressed, not on every change, so results
don't reload while the query is still being built.

### Paging

Europe PMC pages with cursors: each reply gives the cursor for the next page
only. The last page still gets one (only the empty page after it has none),
so Next is also turned off once the total number of results is reached. The
results component keeps a list of the cursors it has visited. Next adds one
and Previous removes one. The component
is keyed by the query, so a new search starts again at page 1 without an
effect.

TanStack Query caches each `[query, cursor]` page for five minutes, so going
back is instant. While a new page loads, a spinner replaces the list. I first
kept the old page on screen, dimmed (`keepPreviousData`), but it was then
numbered as the new page until the new one arrived; fixing that needed extra
state, so the spinner was the simpler choice.

### Talking to the API

`lib/europePmcApi.ts` makes the request and returns a clean `SearchPage`, or
throws a `SearchApiError` with a safe, user-friendly message. The raw reply is
never shown.

- **Errors inside HTTP 200.** Europe PMC reports some errors (for example a
  bad query) with status 200 and `{ errCode, errMsg }` in the body, so the
  body is checked as well as the status.
- **HTML error pages.** When the service is down it may send an HTML 503
  page. That isn't JSON, so it is treated as "unavailable" rather than as a
  network failure.
- **Timeout.** `fetch` has no timeout. While building this I saw requests
  stall for over 60 seconds, so the request gives up after 20 seconds and the
  user can try again.
- **Retries.** Only errors that may go away (service unavailable, network,
  timeout) are retried, up to twice. A bad query would fail the same way every
  time, so it isn't.
- **Type guards, not a schema library.** TypeScript types disappear at run
  time, so the reply is checked by small hand-written guards
  (`lib/europePmcGuards.ts`). For one endpoint this is simpler than adding zod.
  An article with missing required fields is skipped rather than failing the
  whole page.

### State

Terms live in `useState` inside a `useSearchTerms` hook. Each change computes
the new list and sets it; a reducer would add boilerplate (action types and
a switch) without making it clearer at this size.

### Errors in our own code

An app-level error boundary (`react-error-boundary`) catches rendering bugs
and shows a fallback with a "Start again" button, logging only the error's
name and message. API errors don't reach it: they are shown inside the
results, next to the search.

## Accessibility

- Every input and select has a label. Labels that would repeat on each row
  are visually hidden but still read out, for example "Operator for melanoma".
- Remove buttons say which term they remove.
- The query and the "Showing 26–50 of …" line are live regions, so changes are
  announced. Loading states use `role="status"` and errors `role="alert"`.
- After Previous or Next, focus moves to the Results heading, so keyboard and
  screen reader users start at the top of the new page. After removing a
  term, focus returns to the keyword box.
- Results are an ordered list numbered from the right position; each title is
  a heading and a link that says it opens in a new tab.
- Visible focus rings, colours chosen to meet WCAG AA contrast, and the
  spinner stops when reduced motion is requested.

## Testing

- **Unit tests** for query building, the term hook, the API client
  (success, last page, empty, errors inside 200, HTML 503, network failure,
  timeout, wrong shape) and the display helpers.
- **Component and integration tests** with Testing Library: building and
  editing a query, Search, Next sending the right cursor, Previous coming
  from the cache, the empty state, retries followed by Try again, and bad
  queries not being retried.
- MSW answers every request, so no test reaches the real API.

## Keeping it small

During review I removed code that wasn't paying for itself: an unused field,
unit tests that the integration tests already covered, and several small
helpers in the API client that wrapped `fetch` and JSON parsing.

## Limitations and next steps

- **No jumping to a page number.** Cursors only go forward, so pages can only
  be reached one at a time.
- **No sorting or filters** (year, open access, article type).
- **The query isn't in the URL**, so a search can't be bookmarked or shared,
  and a refresh loses it.
- **A timed-out request isn't cancelled.** The app stops waiting, but the
  browser may finish the request in the background. `AbortSignal.timeout`
  would cancel it.
- **The service is unreliable.** Retries and Try again help, but there is no
  status message for a longer outage.
- **No CI yet.** A GitHub Actions workflow would run install (frozen
  lockfile), type-check, lint, format check, tests and build on every push
  and pull request.
