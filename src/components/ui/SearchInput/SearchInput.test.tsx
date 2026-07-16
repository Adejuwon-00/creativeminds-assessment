import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders the label via Input", () => {
    render(<SearchInput label="Search sessions" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Search sessions")).toBeInTheDocument();
  });

  it("defaults to type=search", () => {
    render(<SearchInput label="Search" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Search")).toHaveAttribute("type", "search");
  });

  it("calls onSubmit with the current value when the form is submitted", () => {
    const onSubmit = vi.fn();
    render(<SearchInput label="Search" value="pricing" onChange={() => {}} onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Search");
    fireEvent.submit(input.closest("form")!);
    expect(onSubmit).toHaveBeenCalledWith("pricing");
  });

  it("shows a spinner and announces 'Searching…' while loading", () => {
    const { container } = render(<SearchInput label="Search" value="pricing" onChange={() => {}} loading />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Searching…");
  });

  it("announces nothing when not loading", () => {
    render(<SearchInput label="Search" value="" onChange={() => {}} />);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  describe("clearable", () => {
    it("shows no clear button when there is no value", () => {
      render(<SearchInput label="Search" value="" onChange={() => {}} clearable />);
      expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    });

    it("shows a clear button once there's a value, and calls onClear when clicked", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(<SearchInput label="Search" value="pricing" onChange={() => {}} clearable onClear={onClear} />);
      const clearButton = screen.getByRole("button", { name: "Clear search" });
      await user.click(clearButton);
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("returns focus to the input after clearing", async () => {
      const user = userEvent.setup();
      render(<SearchInput label="Search" value="pricing" onChange={() => {}} clearable onClear={() => {}} />);
      await user.click(screen.getByRole("button", { name: "Clear search" }));
      expect(screen.getByLabelText("Search")).toHaveFocus();
    });

    it("hides the clear button while loading even if there's a value", () => {
      render(<SearchInput label="Search" value="pricing" onChange={() => {}} clearable loading />);
      expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    });
  });

  it("forwards a ref to the underlying <input>", () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchInput label="Search" value="" onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
