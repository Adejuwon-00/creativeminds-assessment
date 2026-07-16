import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Trade } from "../../../types/market";
import { PriceHistoryList } from "./PriceHistoryList";

vi.mock("../../../utils/formatters", async () => {
  const actual = await vi.importActual<typeof import("../../../utils/formatters")>("../../../utils/formatters");
  return {
    ...actual,
    formatTime: vi.fn((ms: number) => `time:${ms}`),
  };
});

import { formatTime } from "../../../utils/formatters";

const tradeA: Trade = { id: 1, symbol: "BTCUSDT", price: 65000, quantity: 0.1, side: "buy", timestamp: 1 };
const tradeB: Trade = { id: 2, symbol: "BTCUSDT", price: 64950, quantity: 0.2, side: "sell", timestamp: 2 };

describe("PriceHistoryList", () => {
  it("shows an empty state when there is no history yet", () => {
    render(<PriceHistoryList trades={[]} />);
    expect(screen.getByText("No trades yet.")).toBeInTheDocument();
  });

  it("renders one row per trade, newest first as given", () => {
    render(<PriceHistoryList trades={[tradeB, tradeA]} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Sell");
    expect(rows[1]).toHaveTextContent("Buy");
  });

  it("renders price and quantity for each trade", () => {
    render(<PriceHistoryList trades={[tradeA]} />);
    expect(screen.getByText("65,000.00")).toBeInTheDocument();
    expect(screen.getByText("0.10")).toBeInTheDocument();
  });

  it("labels the list for assistive tech", () => {
    render(<PriceHistoryList trades={[tradeA]} />);
    expect(screen.getByRole("list")).toHaveAttribute("aria-label", "Recent trades");
  });

  it("does not re-render unchanged rows when a new trade is prepended", () => {
    vi.mocked(formatTime).mockClear();
    const { rerender } = render(<PriceHistoryList trades={[tradeA]} />);
    expect(formatTime).toHaveBeenCalledTimes(1);

    rerender(<PriceHistoryList trades={[tradeB, tradeA]} />);

    expect(formatTime).toHaveBeenCalledTimes(2);
  });

  it("merges a caller-supplied className", () => {
    render(<PriceHistoryList trades={[tradeA]} className="custom-class" />);
    expect(screen.getByRole("list").className).toContain("custom-class");
  });
});
