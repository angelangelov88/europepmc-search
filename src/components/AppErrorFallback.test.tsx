import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AppErrorFallback from "./AppErrorFallback";

describe("AppErrorFallback", () => {
  it("shows an alert without the raw error", () => {
    render(
      <AppErrorFallback
        error={new Error("secret details")}
        resetErrorBoundary={vi.fn()}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Something went wrong");
    expect(alert).not.toHaveTextContent("secret details");
  });

  it("starts again when the button is pressed", async () => {
    const user = userEvent.setup();
    const resetErrorBoundary = vi.fn();
    render(
      <AppErrorFallback
        error={new Error("boom")}
        resetErrorBoundary={resetErrorBoundary}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Start again" }));

    expect(resetErrorBoundary).toHaveBeenCalledOnce();
  });
});
