import { describe, expect, it } from "vitest";
import type { BooleanOperator, SearchField, SearchTerm } from "../types/Search";
import { buildQuery, formatTerm } from "./searchQuery";

let nextId = 0;

const term = (
  text: string,
  operator: BooleanOperator = "AND",
  field: SearchField = "ALL",
): SearchTerm => ({ id: String(nextId++), text, field, operator });

describe("formatTerm", () => {
  it("leaves a single word as it is", () => {
    expect(formatTerm({ text: "cancer", field: "ALL" })).toBe("cancer");
  });

  it("quotes a phrase", () => {
    expect(formatTerm({ text: "gene therapy", field: "ALL" })).toBe(
      '"gene therapy"',
    );
  });

  it("trims, collapses spaces and removes the user's quotes", () => {
    expect(formatTerm({ text: '  "gene   therapy" ', field: "ALL" })).toBe(
      '"gene therapy"',
    );
  });

  it("adds the field prefix", () => {
    expect(formatTerm({ text: "cancer", field: "TITLE" })).toBe("TITLE:cancer");
    expect(formatTerm({ text: "Smith J", field: "AUTH" })).toBe(
      'AUTH:"Smith J"',
    );
  });

  it("quotes operator words and query syntax", () => {
    expect(formatTerm({ text: "NOT", field: "ALL" })).toBe('"NOT"');
    expect(formatTerm({ text: "or", field: "ALL" })).toBe('"or"');
    expect(formatTerm({ text: "covid:19", field: "ALL" })).toBe('"covid:19"');
    expect(formatTerm({ text: "(tumour", field: "ALL" })).toBe('"(tumour"');
  });

  it("keeps wildcards working", () => {
    expect(formatTerm({ text: "immun*", field: "ALL" })).toBe("immun*");
  });

  it("returns an empty string for blank text", () => {
    expect(formatTerm({ text: '  " ', field: "ALL" })).toBe("");
  });
});

describe("buildQuery", () => {
  it("returns an empty string for no terms", () => {
    expect(buildQuery([])).toBe("");
  });

  it("returns a single term", () => {
    expect(buildQuery([term("cancer")])).toBe("cancer");
  });

  it("builds the example from the brief", () => {
    expect(
      buildQuery([
        term("cancer"),
        term("immunotherapy", "AND"),
        term("melanoma", "NOT"),
      ]),
    ).toBe("cancer AND immunotherapy NOT melanoma");
  });

  it("ignores the first term's operator", () => {
    expect(buildQuery([term("cancer", "NOT"), term("tumour", "OR")])).toBe(
      "cancer OR tumour",
    );
  });

  it("groups an OR before an AND", () => {
    expect(
      buildQuery([
        term("cancer"),
        term("tumour", "OR"),
        term("immunotherapy", "AND"),
      ]),
    ).toBe("(cancer OR tumour) AND immunotherapy");
  });

  it("groups an AND before an OR", () => {
    expect(
      buildQuery([
        term("cancer"),
        term("melanoma", "NOT"),
        term("tumour", "OR"),
      ]),
    ).toBe("(cancer NOT melanoma) OR tumour");
  });

  it("nests groups when the operator keeps switching", () => {
    expect(
      buildQuery([term("a"), term("b", "AND"), term("c", "OR"), term("d")]),
    ).toBe("((a AND b) OR c) AND d");
  });

  it("needs no brackets for a run of ORs", () => {
    expect(buildQuery([term("a"), term("b", "OR"), term("c", "OR")])).toBe(
      "a OR b OR c",
    );
  });

  it("combines fields and phrases", () => {
    expect(
      buildQuery([
        term("gene therapy", "AND", "TITLE"),
        term("Smith J", "AND", "AUTH"),
      ]),
    ).toBe('TITLE:"gene therapy" AND AUTH:"Smith J"');
  });

  it("skips terms that are blank after cleaning", () => {
    expect(
      buildQuery([term("cancer"), term('"  "', "OR"), term("melanoma", "NOT")]),
    ).toBe("cancer NOT melanoma");
  });
});
