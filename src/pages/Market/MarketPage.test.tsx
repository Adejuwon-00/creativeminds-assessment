import { act, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppStore } from "../../app/store/store";
import type { ConnectionStatus, Ticker, Trade, TradingPair } from "../../types/market";

vi.mock("../../services/api/binance", () => ({
  getTradingPairs: vi.fn(),
}));

vi.mock("../../hooks/socketInstance", () => ({
  binanceSocket: {
    connect: vi.fn(),
    subscribeTicker: vi.fn(),
    unsubscribeTicker: vi.fn(),
    subscribeTrade: vi.fn(),
    unsubscribeTrade: vi.fn(),
    onConnectionChange: vi.fn(() => vi.fn()),
    onTicker: vi.fn(() => vi.fn()),
    onTrade: vi.fn(() => vi.fn()),
    isDemoMode: vi.fn(() => false),
  },
}));

import { getTradingPairs } from "../../services/api/binance";
import { binanceSocket } from "../../hooks/socketInstance";
import { MarketPage } from "./MarketPage";

const btc: TradingPair = { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", status: "TRADING" };

const btcTicker: Ticker = {
  symbol: "BTCUSDT",
  lastPrice: 65000,
  priceChange: 100.5,
  priceChangePercent: 0.2,
  highPrice: 65500,
  lowPrice: 64500,
  volume: 1000,
  quoteVolume: 65000000,
  openTime: 1,
  closeTime: 2,
};

function renderPage() {
  const store = createAppStore();
  render(
    <Provider store={store}>
      <MarketPage />
    </Provider>,
  );
}

describe("MarketPage", () => {
  beforeEach(() => {
    vi.mocked(getTradingPairs).mockReset();
    vi.mocked(binanceSocket.subscribeTicker).mockClear();
    vi.mocked(binanceSocket.subscribeTrade).mockClear();
    vi.mocked(binanceSocket.onConnectionChange).mockClear();
    vi.mocked(binanceSocket.onTicker).mockClear();
  });

  it("loads trading pairs on mount and shows a select-a-pair placeholder before anything is chosen", async () => {
    vi.mocked(getTradingPairs).mockResolvedValueOnce([btc]);
    renderPage();

    expect(screen.getByText("Loading trading pairs…")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("BTCUSDT")).toBeInTheDocument());
    expect(screen.getByText(/Select a trading pair/)).toBeInTheDocument();
  });

  it("shows the connection status from useConnectionStatus", async () => {
    let emitStatus: ((status: ConnectionStatus) => void) | undefined;
    vi.mocked(binanceSocket.onConnectionChange).mockImplementationOnce((listener) => {
      emitStatus = listener;
      return vi.fn();
    });
    vi.mocked(getTradingPairs).mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByText("No trading pairs available.")).toBeInTheDocument());

    expect(screen.getByText("Idle")).toBeInTheDocument();
    act(() => emitStatus?.("connected"));
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("selecting a pair subscribes its symbol and shows a waiting-for-data placeholder until a ticker arrives", async () => {
    vi.mocked(getTradingPairs).mockResolvedValueOnce([btc]);
    renderPage();
    await waitFor(() => expect(screen.getByText("BTCUSDT")).toBeInTheDocument());

    act(() => screen.getByRole("button", { name: /BTCUSDT/ }).click());

    expect(binanceSocket.subscribeTicker).toHaveBeenCalledWith("BTCUSDT");
    expect(binanceSocket.subscribeTrade).toHaveBeenCalledWith("BTCUSDT");
    expect(screen.getByText(/Waiting for live data for BTCUSDT/)).toBeInTheDocument();
  });

  it("renders CurrentPriceCard and PriceHistory once ticker/trade data arrives for the selected symbol", async () => {
    let emitTicker: ((ticker: Ticker) => void) | undefined;
    let emitTrade: ((trade: Trade) => void) | undefined;
    vi.mocked(binanceSocket.onTicker).mockImplementationOnce((listener) => {
      emitTicker = listener;
      return vi.fn();
    });
    vi.mocked(binanceSocket.onTrade).mockImplementationOnce((listener) => {
      emitTrade = listener;
      return vi.fn();
    });
    vi.mocked(getTradingPairs).mockResolvedValueOnce([btc]);
    renderPage();
    await waitFor(() => expect(screen.getByText("BTCUSDT")).toBeInTheDocument());

    act(() => screen.getByRole("button", { name: /BTCUSDT/ }).click());
    act(() => emitTicker?.(btcTicker));

    expect(screen.getByText("65,000.00")).toBeInTheDocument();

    act(() => emitTrade?.({ id: 1, symbol: "BTCUSDT", price: 65000, quantity: 0.1, side: "buy", timestamp: 1 }));
    expect(screen.getByRole("heading", { name: "Recent Trades" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Recent trades" })).toBeInTheDocument();
  });
});
