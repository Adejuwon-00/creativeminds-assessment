import { useState, type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TradingPair } from "../../../types/market";
import type { UseTradingPairsResult } from "../../../hooks/useTradingPairs";

vi.mock("../../../components/ui/Badge", () => ({
  Badge: vi.fn(({ children }: { children: ReactNode }) => <span>{children}</span>),
}));

const useTradingPairsMock = vi.fn<() => UseTradingPairsResult>();
vi.mock("../../../hooks/useTradingPairs", () => ({
  useTradingPairs: () => useTradingPairsMock(),
}));

import { Badge } from "../../../components/ui/Badge";
import { TradingPairSearch } from "./TradingPairSearch";

const btc: TradingPair = { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", status: "TRADING" };
const eth: TradingPair = { symbol: "ETHUSDT", baseAsset: "ETH", quoteAsset: "USDT", status: "TRADING" };
const ltc: TradingPair = { symbol: "LTCUSDT", baseAsset: "LTC", quoteAsset: "USDT", status: "TRADING" };

function mockResult(overrides: Partial<UseTradingPairsResult>) {
  useTradingPairsMock.mockReturnValue({
    pairs: [btc, eth, ltc],
    isLoading: false,
    isError: false,
    error: null,
    selectedSymbol: null,
    selectSymbol: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  });
}

describe("TradingPairSearch memoization", () => {
  beforeEach(() => {
    vi.mocked(Badge).mockClear();
  });

  it("does not re-render the pair list when the parent re-renders but the pairs/selection are unchanged", () => {
    mockResult({});
    function Harness() {
      const [, forceRerender] = useState(0);
      return (
        <>
          <button onClick={() => forceRerender((n) => n + 1)}>rerender parent</button>
          <TradingPairSearch />
        </>
      );
    }

    render(<Harness />);
    expect(Badge).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole("button", { name: "rerender parent" }));
    fireEvent.click(screen.getByRole("button", { name: "rerender parent" }));

    expect(Badge).toHaveBeenCalledTimes(3);
  });
});
