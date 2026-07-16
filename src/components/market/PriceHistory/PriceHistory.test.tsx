import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Trade } from "../../../types/market";
import { PriceHistory } from "./PriceHistory";

const tradeA: Trade = { id: 1, symbol: "BTCUSDT", price: 65000, quantity: 0.1, side: "buy", timestamp: 1 };
const tradeB: Trade = { id: 2, symbol: "BTCUSDT", price: 64950, quantity: 0.2, side: "sell", timestamp: 2 };

function stubScrollHeight(initial: number) {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
  const box = { current: initial };
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => box.current,
  });
  return {
    set: (value: number) => {
      box.current = value;
    },
    restore: () => {
      if (original) Object.defineProperty(HTMLElement.prototype, "scrollHeight", original);
    },
  };
}

function getScrollArea(container: HTMLElement): HTMLElement {
  return container.querySelector('[class*="scrollArea"]') as HTMLElement;
}

describe("PriceHistory", () => {
  it("renders exactly the trades it's given, via PriceHistoryList", () => {
    render(<PriceHistory trades={[tradeB, tradeA]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders a heading for context", () => {
    render(<PriceHistory trades={[]} />);
    expect(screen.getByRole("heading", { name: "Recent Trades" })).toBeInTheDocument();
  });

  it("snaps the scroll container back to top when a new trade arrives while already at top", () => {
    const scrollHeight = stubScrollHeight(100);
    const { container, rerender } = render(<PriceHistory trades={[tradeA]} />);
    const scrollArea = getScrollArea(container);

    scrollArea.scrollTop = 999;
    scrollHeight.set(140);
    rerender(<PriceHistory trades={[tradeB, tradeA]} />);

    expect(scrollArea.scrollTop).toBe(0);
    scrollHeight.restore();
  });

  it("preserves reading position instead of forcing scroll when the reader has scrolled away from top", () => {
    const scrollHeight = stubScrollHeight(100);
    const { container, rerender } = render(<PriceHistory trades={[tradeA]} />);
    const scrollArea = getScrollArea(container);

    scrollArea.scrollTop = 50;
    fireEvent.scroll(scrollArea);

    scrollHeight.set(140);
    rerender(<PriceHistory trades={[tradeB, tradeA]} />);

    expect(scrollArea.scrollTop).toBe(90);
    scrollHeight.restore();
  });

  it("merges a caller-supplied className", () => {
    const { container } = render(<PriceHistory trades={[]} className="custom-class" />);
    expect(container.firstElementChild?.className).toContain("custom-class");
  });
});
