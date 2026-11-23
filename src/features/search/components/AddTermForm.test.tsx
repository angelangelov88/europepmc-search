import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AddTermFormProps } from "../../../types/Search";
import AddTermForm from "./AddTermForm";

const renderForm = ({ hasTerms = false, added = true } = {}) => {
  const onAdd = vi.fn<AddTermFormProps["onAdd"]>(() => added);
  const view = render(
    <AddTermForm
      hasTerms={hasTerms}
      onAdd={onAdd}
      inputRef={createRef<HTMLInputElement>()}
    />,
  );
  return { onAdd, view };
};

describe("AddTermForm", () => {
  it("adds a term with Enter and clears the box", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderForm();
    const input = screen.getByLabelText("Keyword or phrase");

    await user.type(input, "cancer{Enter}");

    expect(onAdd).toHaveBeenCalledWith("cancer", "ALL", "AND");
    expect(input).toHaveValue("");
  });

  it("adds a term with the Add button, using the chosen field", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderForm();

    await user.type(screen.getByLabelText("Keyword or phrase"), "Smith J");
    await user.selectOptions(screen.getByLabelText("Field"), "AUTH");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).toHaveBeenCalledWith("Smith J", "AUTH", "AND");
  });

  it("keeps the text when the term wasn't added", async () => {
    const user = userEvent.setup();
    renderForm({ added: false });
    const input = screen.getByLabelText("Keyword or phrase");

    await user.type(input, "   {Enter}");

    expect(input).toHaveValue("   ");
  });

  it("asks how to join a term only once there is a first term", () => {
    const { onAdd, view } = renderForm();

    expect(screen.queryByLabelText("Join with")).not.toBeInTheDocument();

    view.rerender(
      <AddTermForm
        hasTerms
        onAdd={onAdd}
        inputRef={createRef<HTMLInputElement>()}
      />,
    );

    expect(screen.getByLabelText("Join with")).toBeInTheDocument();
  });
});
