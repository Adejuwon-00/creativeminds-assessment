import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppStore } from "../app/store/store";
import { symbolSelected } from "../app/store/marketSlice";
import type { Ticker, Trade } from "../types/market";

vi.mock("./socketInstance", () => ({
  binanceSocket: {
    connect: vi.fn(),
    subscribeTicker: vi.fn(),
    unsubscribeTicker: vi.fn(),
    subscribeTrade: vi.fn(),
    unsubscribeTrade: vi.fn(),
    onTicker: vi.fn(() => vi.fn()),
    onTrade: vi.fn(() => vi.fn()),
  },
}));

import { binanceSocket } from "./socketInstance";
import { useTicker } from "./useTicker";

const btcTicker: Ticker = {
  symbol: "BTCUSDT",
  lastPrice: 65000,
  priceChange: 100,
  priceChangePercent: 0.15,
  highPrice: 65500,
  lowPrice: 64500,
  volume: 1000,
  quoteVolume: 65000000,
  openTime: 1,
  closeTime: 2,
};

function renderWithStore() {
  const store = createAppStore();
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(() => useTicker(), { wrapper }) };
}

describe("useTicker", () => {
  beforeEach(() => {
    vi.mocked(binanceSocket.connect).mockClear();
    vi.mocked(binanceSocket.subscribeTicker).mockClear();
    vi.mocked(binanceSocket.unsubscribeTicker).mockClear();
    vi.mocked(binanceSocket.subscribeTrade).mockClear();
    vi.mocked(binanceSocket.unsubscribeTrade).mockClear();
    vi.mocked(binanceSocket.onTicker).mockClear();
    vi.mocked(binanceSocket.onTrade).mockClear();
  });

  it("does not subscribe until a symbol is selected", () => {
    renderWithStore();
    expect(binanceSocket.subscribeTicker).not.toHaveBeenCalled();
  });

  it("subscribes to the selected symbol's ticker and trade streams, unsubscribing when it changes", () => {
    const { store, rerender } = renderWithStore();

    act(() => store.dispatch(symbolSelected("BTCUSDT")));
    rerender();
    expect(binanceSocket.connect).toHaveBeenCalled();
    expect(binanceSocket.subscribeTicker).toHaveBeenCalledWith("BTCUSDT");
    expect(binanceSocket.subscribeTrade).toHaveBeenCalledWith("BTCUSDT");

    act(() => store.dispatch(symbolSelected("ETHUSDT")));
    rerender();
    expect(binanceSocket.unsubscribeTicker).toHaveBeenCalledWith("BTCUSDT");
    expect(binanceSocket.unsubscribeTrade).toHaveBeenCalledWith("BTCUSDT");
    expect(binanceSocket.subscribeTicker).toHaveBeenCalledWith("ETHUSDT");
    expect(binanceSocket.subscribeTrade).toHaveBeenCalledWith("ETHUSDT");
  });

  it("unsubscribes both streams on unmount", () => {
    const { store, rerender, unmount } = renderWithStore();
    act(() => store.dispatch(symbolSelected("BTCUSDT")));
    rerender();

    unmount();
    expect(binanceSocket.unsubscribeTicker).toHaveBeenCalledWith("BTCUSDT");
    expect(binanceSocket.unsubscribeTrade).toHaveBeenCalledWith("BTCUSDT");
  });

  it("dispatches ticker events received from the socket into state", () => {
    let emit: ((ticker: Ticker) => void) | undefined;
    vi.mocked(binanceSocket.onTicker).mockImplementationOnce((listener) => {
      emit = listener;
      return vi.fn();
    });

    const { store, result, rerender } = renderWithStore();
    act(() => store.dispatch(symbolSelected("BTCUSDT")));
    rerender();

    act(() => emit?.(btcTicker));
    expect(result.current.ticker).toEqual(btcTicker);
    expect(result.current.symbol).toBe("BTCUSDT");
  });

  it("dispatches trade events received from the socket into state", () => {
    let emit: ((trade: Trade) => void) | undefined;
    vi.mocked(binanceSocket.onTrade).mockImplementationOnce((listener) => {
      emit = listener;
      return vi.fn();
    });

    const trade: Trade = { id: 1, symbol: "BTCUSDT", price: 65000, quantity: 0.1, side: "buy", timestamp: 1 };
    const { store, result, rerender } = renderWithStore();
    act(() => store.dispatch(symbolSelected("BTCUSDT")));
    rerender();

    act(() => emit?.(trade));
    expect(result.current.trades).toEqual([trade]);
  });
});
