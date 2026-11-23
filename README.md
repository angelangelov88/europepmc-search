# Europe PMC Search Workspace

A small React app for building a boolean search (AND / OR / NOT) from separate
terms and browsing the matching articles from the
[Europe PMC REST API](https://europepmc.org/RestfulWebService), 25 per page.

- Add terms one at a time, each in any field, title, author or abstract.
- Change a term's operator or field, or remove it; the query updates as you go.
- Press **Search** to run it. Results show title, authors, journal and year,
  with Previous / Next paging.
- Loading, no-results and error states, with automatic retries and a
  **Try again** button when Europe PMC is unavailable.

Design decisions and limitations are in
[ENGINEERING_NOTES.md](ENGINEERING_NOTES.md).

## Requirements

- Node.js 24
- pnpm 12

No API key is needed: Europe PMC allows calls straight from the browser.

## Getting started

```sh
pnpm install
pnpm dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Scripts

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Start the dev server                             |
| `pnpm build`        | Type-check and build for production into `dist/` |
| `pnpm preview`      | Serve the production build locally               |
| `pnpm test`         | Run all tests once (Vitest)                      |
| `pnpm test:watch`   | Run tests in watch mode                          |
| `pnpm typecheck`    | Type-check with TypeScript                       |
| `pnpm lint`         | Lint with ESLint                                 |
| `pnpm format`       | Format with Prettier                             |
| `pnpm format:check` | Check formatting without changing files          |
| `pnpm check`        | Format, then type-check, lint and test in one go |

**To review the project, run `pnpm check`.** It runs formatting, type-checking,
linting and all the tests in one command, so you don't need to run them one
by one.

The tests never call the real API: [MSW](https://mswjs.io) answers every
request, and any request without a handler fails the test.

## Project structure

```
src/
  App.tsx                 Query client, error boundary and page layout
  components/             App-wide components (error fallback)
  features/search/
    components/           Query builder, results, pagination and their tests
    hooks/                Term state, results state and the TanStack query
  lib/                    React-free code: query building, API client, type guards
  types/                  All TypeScript types
  test/                   Test setup, MSW server, fixtures, render helper
```

## Tech stack

React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, Vitest, Testing
Library and MSW.
