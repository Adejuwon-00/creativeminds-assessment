import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TradingPair } from "../../../types/market";
import type { UseTradingPairsResult } from "../../../hooks/useTradingPairs";

const useTradingPairsMock = vi.fn<() => UseTradingPairsResult>();
vi.mock("../../../hooks/useTradingPairs", () => ({
  useTradingPairs: () => useTradingPairsMock(),
}));

import { TradingPairSearch } from "./TradingPairSearch";

const btc: TradingPair = { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", status: "TRADING" };
const eth: TradingPair = { symbol: "ETHUSDT", baseAsset: "ETH", quoteAsset: "USDT", status: "HALT" };

function mockResult(overrides: Partial<UseTradingPairsResult>) {
  const selectSymbol = vi.fn();
  const refetch = vi.fn();
  useTradingPairsMock.mockReturnValue({
    pairs: [],
    isLoading: false,
    isError: false,
    error: null,
    selectedSymbol: null,
    selectSymbol,
    refetch,
    ...overrides,
  });
  return { selectSymbol, refetch };
}

describe("TradingPairSearch", () => {
  it("shows a loading state while the initial fetch is in flight", () => {
    mockResult({ isLoading: true });
    render(<TradingPairSearch />);
    expect(screen.getByText("Loading trading pairs…")).toBeInTheDocument();
  });

  it("shows an error state with a retry action", () => {
    const { refetch } = mockResult({ isError: true, error: { message: "Could not reach Binance." } });
    render(<TradingPairSearch />);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not reach Binance.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows an empty state when there are no pairs at all", () => {
    mockResult({ pairs: [] });
    render(<TradingPairSearch />);
    expect(screen.getByText("No trading pairs available.")).toBeInTheDocument();
  });

  it("renders every pair with its status when loaded", () => {
    mockResult({ pairs: [btc, eth] });
    render(<TradingPairSearch />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("TRADING")).toBeInTheDocument();
    expect(screen.getByText("HALT")).toBeInTheDocument();
  });

  it("filters the list as the user types, case-insensitively", () => {
    mockResult({ pairs: [btc, eth] });
    render(<TradingPairSearch />);

    fireEvent.change(screen.getByPlaceholderText("Search by symbol, e.g. BTCUSDT"), { target: { value: "eth" } });

    expect(screen.getByText("ETHUSDT")).toBeInTheDocument();
    expect(screen.queryByText("BTCUSDT")).not.toBeInTheDocument();
  });

  it("shows a distinct message when a search matches nothing", () => {
    mockResult({ pairs: [btc, eth] });
    render(<TradingPairSearch />);

    fireEvent.change(screen.getByPlaceholderText("Search by symbol, e.g. BTCUSDT"), { target: { value: "ZZZ" } });

    expect(screen.getByText('No pairs match "ZZZ".')).toBeInTheDocument();
  });

  it("selects a pair on click and marks it pressed", () => {
    const { selectSymbol } = mockResult({ pairs: [btc, eth], selectedSymbol: "BTCUSDT" });
    render(<TradingPairSearch />);

    expect(screen.getByRole("button", { name: /BTCUSDT/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /ETHUSDT/ })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: /ETHUSDT/ }));
    expect(selectSymbol).toHaveBeenCalledWith("ETHUSDT");
  });
});
