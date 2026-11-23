import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  JOURNAL_ARTICLE,
  SEARCH_URL,
  searchResponse,
} from "../../../test/fixtures";
import renderWithClient from "../../../test/renderWithClient";
import server from "../../../test/server";
import type { BooleanOperator } from "../../../types/Search";
import SearchWorkspace from "./SearchWorkspace";

// Adds one term the way a user would: type it, pick how it joins, press Add.
const addTerm = async (
  user: UserEvent,
  text: string,
  operator?: BooleanOperator,
) => {
  await user.type(screen.getByLabelText("Keyword or phrase"), text);
  if (operator) {
    await user.selectOptions(screen.getByLabelText("Join with"), operator);
  }
  await user.click(screen.getByRole("button", { name: "Add" }));
};

// Builds the brief's example: cancer AND immunotherapy NOT melanoma.
const renderWithExample = async () => {
  const user = userEvent.setup();
  renderWithClient(<SearchWorkspace />);
  await addTerm(user, "cancer");
  await addTerm(user, "immunotherapy", "AND");
  await addTerm(user, "melanoma", "NOT");
  return user;
};

describe("SearchWorkspace", () => {
  it("shows the query as it is built", async () => {
    await renderWithExample();

    expect(
      screen.getByText("cancer AND immunotherapy NOT melanoma"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("updates the query when an operator or field changes", async () => {
    const user = await renderWithExample();

    await user.selectOptions(
      screen.getByLabelText("Operator for melanoma"),
      "OR",
    );
    await user.selectOptions(
      screen.getByLabelText("Field for cancer"),
      "TITLE",
    );

    expect(
      screen.getByText("(TITLE:cancer AND immunotherapy) OR melanoma"),
    ).toBeInTheDocument();
  });

  it("removes a term and moves focus back to the keyword box", async () => {
    const user = await renderWithExample();

    await user.click(
      screen.getByRole("button", { name: "Remove term: immunotherapy" }),
    );

    expect(screen.getByText("cancer NOT melanoma")).toBeInTheDocument();
    expect(screen.getByLabelText("Keyword or phrase")).toHaveFocus();
  });

  it("clears all terms", async () => {
    const user = await renderWithExample();

    await user.click(screen.getByRole("button", { name: "Clear all" }));

    expect(screen.getByText("No terms yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Add a term to build your query."),
    ).toBeInTheDocument();
  });

  it("searches only when Search is pressed", async () => {
    server.use(
      http.get(SEARCH_URL, () =>
        HttpResponse.json(
          searchResponse([JOURNAL_ARTICLE], { lastPage: true }),
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<SearchWorkspace />);
    const searchButton = screen.getByRole("button", { name: "Search" });

    // Unavailable with no terms, and pressing it does nothing.
    expect(searchButton).toHaveAttribute("aria-disabled", "true");
    await user.click(searchButton);
    expect(
      screen.queryByRole("heading", { name: "Results" }),
    ).not.toBeInTheDocument();

    await addTerm(user, "cancer");
    expect(searchButton).toHaveAttribute("aria-disabled", "false");
    expect(
      screen.queryByRole("heading", { name: "Results" }),
    ).not.toBeInTheDocument();

    await user.click(searchButton);
    expect(
      await screen.findByRole("link", { name: /Specialist Palliative Care/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 1–1 of 1 results")).toBeInTheDocument();
    // Keeps focus, so keyboard users don't lose their place.
    expect(searchButton).toHaveFocus();
  });

  it("makes Search available again only when the query changes", async () => {
    server.use(
      http.get(SEARCH_URL, () =>
        HttpResponse.json(
          searchResponse([JOURNAL_ARTICLE], { lastPage: true }),
        ),
      ),
    );
    const user = userEvent.setup();
    renderWithClient(<SearchWorkspace />);
    const searchButton = screen.getByRole("button", { name: "Search" });

    await addTerm(user, "cancer");
    await user.click(searchButton);

    expect(searchButton).toHaveAttribute("aria-disabled", "true");

    await addTerm(user, "tumour", "OR");

    expect(searchButton).toHaveAttribute("aria-disabled", "false");
  });
});
