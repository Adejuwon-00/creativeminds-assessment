import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppStore } from "../app/store/store";
import type { TradingPair } from "../types/market";

vi.mock("../services/api/binance", () => ({
  getTradingPairs: vi.fn(),
}));

import { getTradingPairs } from "../services/api/binance";
import { useTradingPairs } from "./useTradingPairs";

const btc: TradingPair = { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", status: "TRADING" };

function renderWithStore() {
  const store = createAppStore();
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(() => useTradingPairs(), { wrapper }) };
}

describe("useTradingPairs", () => {
  beforeEach(() => {
    vi.mocked(getTradingPairs).mockClear();
  });

  it("fetches pairs on mount and reports loading -> succeeded", async () => {
    vi.mocked(getTradingPairs).mockResolvedValueOnce([btc]);
    const { result } = renderWithStore();

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pairs).toEqual([btc]);
    expect(result.current.isError).toBe(false);
  });

  it("reports isError and the ApiError on failure", async () => {
    vi.mocked(getTradingPairs).mockRejectedValueOnce({ message: "Could not reach Binance." });
    const { result } = renderWithStore();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual({ message: "Could not reach Binance." });
  });

  it("does not refetch on rerender once pairs have loaded", async () => {
    vi.mocked(getTradingPairs).mockResolvedValueOnce([btc]);
    const { result, rerender } = renderWithStore();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender();

    expect(getTradingPairs).toHaveBeenCalledTimes(1);
  });

  it("selectSymbol dispatches the selection and refetch triggers another fetch", async () => {
    vi.mocked(getTradingPairs).mockResolvedValueOnce([btc]);
    const { result } = renderWithStore();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.selectSymbol("BTCUSDT"));
    expect(result.current.selectedSymbol).toBe("BTCUSDT");

    vi.mocked(getTradingPairs).mockResolvedValueOnce([btc]);
    act(() => result.current.refetch());
    expect(getTradingPairs).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
