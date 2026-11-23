import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JOURNAL_ARTICLE, PREPRINT } from "../../../test/fixtures";
import type { Article } from "../../../types/EuropePmc";
import ResultItem from "./ResultItem";

// ResultItem is an <li>, so it is rendered inside a list.
const renderItem = (article: Article) =>
  render(
    <ol>
      <ResultItem article={article} />
    </ol>,
  );

describe("ResultItem", () => {
  it("links the title to Europe PMC in a new tab", () => {
    renderItem(JOURNAL_ARTICLE);

    const link = screen.getByRole("link", {
      name: `${JOURNAL_ARTICLE.title} (opens in new tab)`,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://europepmc.org/article/MED/43035835",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows the authors, journal and year", () => {
    renderItem(JOURNAL_ARTICLE);

    expect(screen.getByText("Fu R, Chen L, Smith J.")).toBeInTheDocument();
    expect(screen.getByText("Head Neck · 2026")).toBeInTheDocument();
  });

  it("says Preprint when there is no journal", () => {
    renderItem(PREPRINT);

    expect(screen.getByText(/Preprint · 2026/)).toBeInTheDocument();
  });

  it("copes with missing authors", () => {
    renderItem({ id: "1", source: "MED", title: "A <i>short</i> title" });

    expect(screen.getByText("Unknown authors")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /A short title/ }),
    ).toBeInTheDocument();
  });
});
