import { describe, expect, it } from "vitest";
import type { Ticker, Trade } from "../../types/market";
import { symbolCleared, symbolSelected } from "./marketSlice";
import {
  selectLatestTicker,
  selectPriceHistorySymbol,
  selectRecentTrades,
  tickerReceived,
  tradeReceived,
} from "./priceHistorySlice";
import { createAppStore as createTestStore } from "./store";

function makeTicker(overrides: Partial<Ticker> = {}): Ticker {
  return {
    symbol: "BTCUSDT",
    lastPrice: 50000,
    priceChange: 100,
    priceChangePercent: 0.2,
    highPrice: 51000,
    lowPrice: 49000,
    volume: 1000,
    quoteVolume: 50_000_000,
    openTime: 1000,
    closeTime: 2000,
    ...overrides,
  };
}

function makeTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: 1,
    symbol: "BTCUSDT",
    price: 50000,
    quantity: 0.5,
    side: "buy",
    timestamp: 1000,
    ...overrides,
  };
}

describe("priceHistorySlice", () => {
  it("adopts the selected symbol and starts empty, reacting to marketSlice's symbolSelected", () => {
    const store = createTestStore();
    store.dispatch(tickerReceived(makeTicker()));
    store.dispatch(symbolSelected("BTCUSDT"));

    expect(selectPriceHistorySymbol(store.getState())).toBe("BTCUSDT");
    expect(selectLatestTicker(store.getState())).toBeNull();
    expect(selectRecentTrades(store.getState())).toEqual([]);
  });

  it("resets to empty in response to marketSlice's symbolCleared", () => {
    const store = createTestStore();
    store.dispatch(symbolSelected("BTCUSDT"));
    store.dispatch(tickerReceived(makeTicker()));
    store.dispatch(symbolCleared());

    expect(selectPriceHistorySymbol(store.getState())).toBeNull();
    expect(selectLatestTicker(store.getState())).toBeNull();
  });

  it("applies a ticker update for the currently tracked symbol", () => {
    const store = createTestStore();
    store.dispatch(symbolSelected("BTCUSDT"));
    store.dispatch(tickerReceived(makeTicker({ lastPrice: 51234 })));

    expect(selectLatestTicker(store.getState())?.lastPrice).toBe(51234);
  });

  it("discards a ticker update for a symbol other than the one currently tracked", () => {
    const store = createTestStore();
    store.dispatch(symbolSelected("BTCUSDT"));
    store.dispatch(tickerReceived(makeTicker({ symbol: "ETHUSDT", lastPrice: 3000 })));

    expect(selectLatestTicker(store.getState())).toBeNull();
  });

  it("prepends new trades, newest first", () => {
    const store = createTestStore();
    store.dispatch(symbolSelected("BTCUSDT"));
    store.dispatch(tradeReceived(makeTrade({ id: 1 })));
    store.dispatch(tradeReceived(makeTrade({ id: 2 })));

    expect(selectRecentTrades(store.getState()).map((t) => t.id)).toEqual([2, 1]);
  });

  it("discards a trade for a symbol other than the one currently tracked", () => {
    const store = createTestStore();
    store.dispatch(symbolSelected("BTCUSDT"));
    store.dispatch(tradeReceived(makeTrade({ symbol: "ETHUSDT" })));

    expect(selectRecentTrades(store.getState())).toEqual([]);
  });

  it("caps trade history at 50 entries", () => {
    const store = createTestStore();
    store.dispatch(symbolSelected("BTCUSDT"));
    for (let i = 0; i < 60; i += 1) {
      store.dispatch(tradeReceived(makeTrade({ id: i })));
    }

    const trades = selectRecentTrades(store.getState());
    expect(trades).toHaveLength(50);
    expect(trades[0].id).toBe(59);
  });
});
