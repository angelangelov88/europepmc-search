import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useSearchTerms from "./useSearchTerms";

// Renders the hook with the brief's example: cancer AND immunotherapy NOT
// melanoma. One act() per change, as a user makes one change per click.
const renderWithTerms = () => {
  const { result } = renderHook(() => useSearchTerms());
  act(() => {
    result.current.addTerm("cancer", "ALL", "AND");
  });
  act(() => {
    result.current.addTerm("immunotherapy", "ALL", "AND");
  });
  act(() => {
    result.current.addTerm("melanoma", "ALL", "NOT");
  });
  return result;
};

describe("useSearchTerms", () => {
  it("builds the query as terms are added", () => {
    const result = renderWithTerms();

    expect(result.current.query).toBe("cancer AND immunotherapy NOT melanoma");
    const ids = result.current.terms.map((term) => term.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("ignores blank text", () => {
    const { result } = renderHook(() => useSearchTerms());
    let added = true;

    act(() => {
      added = result.current.addTerm("   ", "ALL", "AND");
    });

    expect(added).toBe(false);
    expect(result.current.terms).toEqual([]);
  });

  it("removes a term by id", () => {
    const result = renderWithTerms();
    const [, immunotherapy] = result.current.terms;

    act(() => {
      result.current.removeTerm(immunotherapy.id);
    });

    expect(result.current.query).toBe("cancer NOT melanoma");
  });

  it("resets the operator of the term that becomes first", () => {
    const result = renderWithTerms();
    const [cancer, immunotherapy] = result.current.terms;

    act(() => {
      result.current.removeTerm(cancer.id);
    });
    act(() => {
      result.current.removeTerm(immunotherapy.id);
    });

    expect(result.current.terms).toHaveLength(1);
    expect(result.current.terms[0]).toMatchObject({
      text: "melanoma",
      operator: "AND",
    });
    expect(result.current.query).toBe("melanoma");
  });

  it("changes one term's operator", () => {
    const result = renderWithTerms();
    const [, , melanoma] = result.current.terms;

    act(() => {
      result.current.setOperator(melanoma.id, "OR");
    });

    expect(result.current.query).toBe("(cancer AND immunotherapy) OR melanoma");
  });

  it("changes one term's field", () => {
    const result = renderWithTerms();
    const [cancer] = result.current.terms;

    act(() => {
      result.current.setField(cancer.id, "TITLE");
    });

    expect(result.current.query).toBe(
      "TITLE:cancer AND immunotherapy NOT melanoma",
    );
  });

  it("clears all terms", () => {
    const result = renderWithTerms();

    act(() => {
      result.current.clearTerms();
    });

    expect(result.current.terms).toEqual([]);
    expect(result.current.query).toBe("");
  });
});
