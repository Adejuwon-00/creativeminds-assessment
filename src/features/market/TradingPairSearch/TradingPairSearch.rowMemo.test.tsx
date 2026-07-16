import { type ReactNode } from "react";
import { act, render, waitFor, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { createAppStore } from "../../../app/store/store";
import { symbolSelected } from "../../../app/store/marketSlice";
import type { TradingPair } from "../../../types/market";

vi.mock("../../../components/ui/Badge", () => ({
  Badge: vi.fn(({ children }: { children: ReactNode }) => <span>{children}</span>),
}));

vi.mock("../../../services/api/binance", () => ({
  getTradingPairs: vi.fn(),
}));

import { Badge } from "../../../components/ui/Badge";
import { getTradingPairs } from "../../../services/api/binance";
import { TradingPairSearch } from "./TradingPairSearch";

const btc: TradingPair = { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", status: "TRADING" };
const eth: TradingPair = { symbol: "ETHUSDT", baseAsset: "ETH", quoteAsset: "USDT", status: "TRADING" };
const ltc: TradingPair = { symbol: "LTCUSDT", baseAsset: "LTC", quoteAsset: "USDT", status: "TRADING" };

describe("TradingPairSearch row memoization", () => {
  it("re-renders only the two affected rows when selection changes via a real Redux dispatch, not the whole list", async () => {
    vi.mocked(getTradingPairs).mockResolvedValueOnce([btc, eth, ltc]);
    const store = createAppStore();
    render(
      <Provider store={store}>
        <TradingPairSearch />
      </Provider>,
    );
    await waitFor(() => expect(screen.getByText("BTCUSDT")).toBeInTheDocument());
    expect(Badge).toHaveBeenCalledTimes(3);

    vi.mocked(Badge).mockClear();
    act(() => store.dispatch(symbolSelected("ETHUSDT")));

    expect(Badge).toHaveBeenCalledTimes(1);

    vi.mocked(Badge).mockClear();
    act(() => store.dispatch(symbolSelected("BTCUSDT")));

    expect(Badge).toHaveBeenCalledTimes(2);
  });
});
