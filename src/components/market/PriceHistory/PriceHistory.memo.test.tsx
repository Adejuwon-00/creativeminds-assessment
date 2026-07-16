import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Trade } from "../../../types/market";

vi.mock("../PriceHistoryList", () => ({
  PriceHistoryList: vi.fn(() => <div data-testid="list" />),
}));

import { PriceHistoryList } from "../PriceHistoryList";
import { PriceHistory } from "./PriceHistory";

const tradeA: Trade = { id: 1, symbol: "BTCUSDT", price: 65000, quantity: 0.1, side: "buy", timestamp: 1 };

describe("PriceHistory memoization", () => {
  beforeEach(() => {
    vi.mocked(PriceHistoryList).mockClear();
  });

  it("does not re-render when the parent re-renders but `trades` keeps the same reference", () => {
    const trades = [tradeA];
    function Harness() {
      const [, forceRerender] = useState(0);
      return (
        <>
          <button onClick={() => forceRerender((n) => n + 1)}>rerender parent</button>
          <PriceHistory trades={trades} />
        </>
      );
    }

    render(<Harness />);
    expect(PriceHistoryList).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "rerender parent" }));
    fireEvent.click(screen.getByRole("button", { name: "rerender parent" }));

    expect(PriceHistoryList).toHaveBeenCalledTimes(1);
  });

  it("does re-render when a new trade actually arrives (a new `trades` reference)", () => {
    const { rerender } = render(<PriceHistory trades={[tradeA]} />);
    expect(PriceHistoryList).toHaveBeenCalledTimes(1);

    rerender(<PriceHistory trades={[tradeA, tradeA]} />);
    expect(PriceHistoryList).toHaveBeenCalledTimes(2);
  });
});
