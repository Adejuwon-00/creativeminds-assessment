import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders its children inside a <div> by default", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.tagName).toBe("DIV");
  });

  it("defaults to padding=md and outlined=true, with no shadow", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).toMatch(/padding-md/);
    expect(card.className).toMatch(/outlined/);
    expect(card.className).not.toMatch(/shadow/);
  });

  it.each(["none", "sm", "md", "lg"] as const)("applies padding=%s", (padding) => {
    render(
      <Card padding={padding} data-testid="card">
        Content
      </Card>,
    );
    expect(screen.getByTestId("card").className).toMatch(new RegExp(`padding-${padding}`));
  });

  it("can disable the outline", () => {
    render(
      <Card outlined={false} data-testid="card">
        Content
      </Card>,
    );
    expect(screen.getByTestId("card").className).not.toMatch(/\boutlined\b/);
  });

  it("can enable a shadow", () => {
    render(
      <Card shadow data-testid="card">
        Content
      </Card>,
    );
    expect(screen.getByTestId("card").className).toMatch(/shadow/);
  });

  it("merges a caller-supplied className", () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("custom-class");
    expect(card.className).toMatch(/card/);
  });

  it("forwards a ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("is not focusable and has no interactive role when static", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  describe("interactive as='button'", () => {
    it("renders a real, keyboard-operable <button>", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Card interactive as="button" onClick={onClick}>
          Session row
        </Card>,
      );
      const card = screen.getByRole("button", { name: "Session row" });
      expect(card.tagName).toBe("BUTTON");
      expect(card).toHaveAttribute("type", "button");

      await user.tab();
      expect(card).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.click(card);
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("respects an explicit type override", () => {
      render(
        <Card interactive as="button" type="submit" data-testid="card">
          Content
        </Card>,
      );
      expect(screen.getByTestId("card")).toHaveAttribute("type", "submit");
    });
  });

  describe("interactive as='a'", () => {
    it("renders a real, keyboard-operable <a> with the given href", async () => {
      const user = userEvent.setup();
      render(
        <Card interactive as="a" href="/sessions/4">
          Checkout Flow — Respondent 4
        </Card>,
      );
      const card = screen.getByRole("link", { name: "Checkout Flow — Respondent 4" });
      expect(card.tagName).toBe("A");
      expect(card).toHaveAttribute("href", "/sessions/4");

      await user.tab();
      expect(card).toHaveFocus();
    });
  });
});
