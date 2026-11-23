import { describe, expect, it } from "vitest";
import { articleUrl, cleanTitle } from "./articleDisplay";

describe("articleUrl", () => {
  it("links to the article on Europe PMC", () => {
    expect(articleUrl({ source: "MED", id: "43035835" })).toBe(
      "https://europepmc.org/article/MED/43035835",
    );
    expect(articleUrl({ source: "PPR", id: "PPR1373568" })).toBe(
      "https://europepmc.org/article/PPR/PPR1373568",
    );
  });
});

describe("cleanTitle", () => {
  it("removes markup from the title", () => {
    expect(cleanTitle("Genes of <i>Homo sapiens</i>.")).toBe(
      "Genes of Homo sapiens.",
    );
  });

  it("uses Untitled when nothing is left", () => {
    expect(cleanTitle(" <b></b> ")).toBe("Untitled");
  });
});
