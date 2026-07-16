import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("uses aria-label as the accessible name and renders the icon", () => {
    render(<IconButton icon={<svg data-testid="icon" />} aria-label="Delete" />);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(button).not.toHaveTextContent(/./);
  });

  it("renders a real, keyboard-operable <button> with type=button by default", () => {
    render(<IconButton icon={<svg />} aria-label="Delete" />);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
  });

  it("fires onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={<svg />} aria-label="Delete" onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables and blocks onClick while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={<svg />} aria-label="Delete" isLoading onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables and blocks onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={<svg />} aria-label="Delete" disabled onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards a ref to the underlying <button>", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} icon={<svg />} aria-label="Delete" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
