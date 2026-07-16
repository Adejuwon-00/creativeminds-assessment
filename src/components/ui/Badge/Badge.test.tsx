import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its label text", () => {
    render(<Badge>Live now</Badge>);
    expect(screen.getByText("Live now")).toBeInTheDocument();
  });

  it("renders as a <span>, not an interactive element", () => {
    render(<Badge data-testid="badge">Scheduled</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).not.toHaveAttribute("role");
    expect(badge).not.toHaveAttribute("tabindex");
  });

  it("defaults to variant=neutral, size=sm, and a visible dot", () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toMatch(/neutral/);
    expect(badge.className).toMatch(/sm/);
    expect(badge.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it.each(["neutral", "success", "warning", "error", "primary", "violet"] as const)(
    "applies the %s variant class",
    (variant) => {
      render(
        <Badge variant={variant} data-testid="badge">
          Status
        </Badge>,
      );
      expect(screen.getByTestId("badge").className).toMatch(new RegExp(variant));
    },
  );

  it("can hide the dot", () => {
    render(
      <Badge dot={false} data-testid="badge">
        No dot
      </Badge>,
    );
    expect(screen.getByTestId("badge").querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("marks the dot as decorative so it's never the only signal of status", () => {
    render(<Badge data-testid="badge">Live now</Badge>);
    const dot = screen.getByTestId("badge").firstElementChild;
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Live now")).toBeInTheDocument();
  });

  it("merges a caller-supplied className", () => {
    render(
      <Badge className="custom-class" data-testid="badge">
        Label
      </Badge>,
    );
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("custom-class");
    expect(badge.className).toMatch(/badge/);
  });

  it("forwards a ref to the underlying <span>", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Label</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("spreads through additional span attributes", () => {
    render(<Badge id="status-badge">Label</Badge>);
    expect(document.getElementById("status-badge")).toBeInTheDocument();
  });
});
