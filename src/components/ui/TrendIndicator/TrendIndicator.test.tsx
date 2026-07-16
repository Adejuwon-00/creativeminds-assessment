import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrendIndicator } from "./TrendIndicator";

describe("TrendIndicator", () => {
  it("renders the caller's text verbatim", () => {
    render(<TrendIndicator direction="up">+0.15%</TrendIndicator>);
    expect(screen.getByText("+0.15%")).toBeInTheDocument();
  });

  it.each([
    ["up", "Increased:"],
    ["down", "Decreased:"],
    ["neutral", "No change:"],
  ] as const)("prefixes %s with an accessible '%s' announcement", (direction, prefix) => {
    render(<TrendIndicator direction={direction}>1.2%</TrendIndicator>);
    expect(screen.getByText(new RegExp(prefix))).toBeInTheDocument();
  });

  it("marks its arrow as decorative", () => {
    render(<TrendIndicator direction="down">-1%</TrendIndicator>);
    expect(document.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("merges a caller-supplied className", () => {
    render(
      <TrendIndicator direction="neutral" className="custom-class">
        0%
      </TrendIndicator>,
    );
    expect(screen.getByText("0%").closest("span")?.className).toContain("custom-class");
  });
});
