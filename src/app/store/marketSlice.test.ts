import { describe, expect, it, vi } from "vitest";
import type { TradingPair } from "../../types/market";

vi.mock("../../services/api/binance", () => ({
  getTradingPairs: vi.fn(),
}));

import { getTradingPairs } from "../../services/api/binance";
import {
  fetchTradingPairs,
  selectMarketError,
  selectMarketStatus,
  selectSelectedSymbol,
  selectSelectedTradingPair,
  selectTradingPairs,
  symbolCleared,
  symbolSelected,
} from "./marketSlice";
import { createAppStore as createTestStore } from "./store";

const btc: TradingPair = { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", status: "TRADING" };
const eth: TradingPair = { symbol: "ETHUSDT", baseAsset: "ETH", quoteAsset: "USDT", status: "TRADING" };

describe("marketSlice", () => {
  it("starts idle with no pairs and no selection", () => {
    const store = createTestStore();
    expect(selectMarketStatus(store.getState())).toBe("idle");
    expect(selectTradingPairs(store.getState())).toEqual([]);
    expect(selectSelectedSymbol(store.getState())).toBeNull();
  });

  it("symbolSelected/symbolCleared update the selection", () => {
    const store = createTestStore();
    store.dispatch(symbolSelected("BTCUSDT"));
    expect(selectSelectedSymbol(store.getState())).toBe("BTCUSDT");
    store.dispatch(symbolCleared());
    expect(selectSelectedSymbol(store.getState())).toBeNull();
  });

  describe("fetchTradingPairs", () => {
    it("goes loading -> succeeded and stores the pairs on success", async () => {
      vi.mocked(getTradingPairs).mockResolvedValueOnce([btc, eth]);
      const store = createTestStore();

      const promise = store.dispatch(fetchTradingPairs());
      expect(selectMarketStatus(store.getState())).toBe("loading");

      await promise;
      expect(selectMarketStatus(store.getState())).toBe("succeeded");
      expect(selectTradingPairs(store.getState())).toEqual([btc, eth]);
      expect(selectMarketError(store.getState())).toBeNull();
    });

    it("goes loading -> failed and stores the ApiError on failure", async () => {
      vi.mocked(getTradingPairs).mockRejectedValueOnce({ message: "Could not reach Binance." });
      const store = createTestStore();

      await store.dispatch(fetchTradingPairs());

      expect(selectMarketStatus(store.getState())).toBe("failed");
      expect(selectMarketError(store.getState())).toEqual({ message: "Could not reach Binance." });
      expect(selectTradingPairs(store.getState())).toEqual([]);
    });

    it("wraps a non-ApiError rejection into a generic ApiError instead of crashing", async () => {
      vi.mocked(getTradingPairs).mockRejectedValueOnce(new TypeError("boom"));
      const store = createTestStore();

      await store.dispatch(fetchTradingPairs());

      expect(selectMarketError(store.getState())).toEqual({ message: "Failed to fetch trading pairs." });
    });

    it("clears a previous error when a new fetch starts", async () => {
      vi.mocked(getTradingPairs).mockRejectedValueOnce({ message: "first failure" });
      const store = createTestStore();
      await store.dispatch(fetchTradingPairs());
      expect(selectMarketError(store.getState())).not.toBeNull();

      vi.mocked(getTradingPairs).mockResolvedValueOnce([btc]);
      const promise = store.dispatch(fetchTradingPairs());
      expect(selectMarketError(store.getState())).toBeNull();
      await promise;
    });
  });

  describe("selectSelectedTradingPair", () => {
    it("returns the TradingPair matching the current selection", async () => {
      vi.mocked(getTradingPairs).mockResolvedValueOnce([btc, eth]);
      const store = createTestStore();
      await store.dispatch(fetchTradingPairs());
      store.dispatch(symbolSelected("ETHUSDT"));

      expect(selectSelectedTradingPair(store.getState())).toEqual(eth);
    });

    it("returns null when nothing is selected or the selection isn't in the list", () => {
      const store = createTestStore();
      expect(selectSelectedTradingPair(store.getState())).toBeNull();

      store.dispatch(symbolSelected("DOESNOTEXIST"));
      expect(selectSelectedTradingPair(store.getState())).toBeNull();
    });
  });
});
