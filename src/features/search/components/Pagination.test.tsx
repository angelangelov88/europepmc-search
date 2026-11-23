import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PaginationProps } from "../../../types/Search";
import Pagination from "./Pagination";

const renderPagination = (props: Partial<PaginationProps> = {}) => {
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  render(
    <Pagination
      pageNumber={2}
      hasPrevious
      hasNext
      onPrevious={onPrevious}
      onNext={onNext}
      {...props}
    />,
  );
  return { onPrevious, onNext };
};

describe("Pagination", () => {
  it("shows the page number and moves between pages", async () => {
    const user = userEvent.setup();
    const { onPrevious, onNext } = renderPagination();

    expect(screen.getByText("Page 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("disables Previous on the first page and Next on the last", () => {
    renderPagination({ pageNumber: 1, hasPrevious: false, hasNext: false });

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
