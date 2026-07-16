import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTradingPairs, MOCK_PAIRS } from "./binance";

function jsonResponse(body: unknown, init?: { status?: number; ok?: boolean }) {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: async () => body,
  } as Response;
}

function validSymbol(overrides: Record<string, unknown> = {}) {
  return {
    symbol: "BTCUSDT",
    status: "TRADING",
    baseAsset: "BTC",
    quoteAsset: "USDT",
    ...overrides,
  };
}

describe("getTradingPairs", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("normalizes a valid exchangeInfo response into typed TradingPair[]", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        symbols: [validSymbol(), validSymbol({ symbol: "ETHUSDT", baseAsset: "ETH" })],
      }),
    );

    const pairs = await getTradingPairs();

    expect(pairs).toEqual([
      { symbol: "BTCUSDT", baseAsset: "BTC", quoteAsset: "USDT", status: "TRADING" },
      { symbol: "ETHUSDT", baseAsset: "ETH", quoteAsset: "USDT", status: "TRADING" },
    ]);
  });

  it("calls the documented exchangeInfo endpoint via the proxy path", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ symbols: [] }));

    await getTradingPairs();

    expect(fetch).toHaveBeenCalledWith(
      "/binance-api/api/v3/exchangeInfo",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("drops individually malformed symbol entries instead of failing the whole call", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        symbols: [
          validSymbol(),
          { symbol: "BROKEN" },
          { ...validSymbol(), status: "NOT_A_REAL_STATUS" },
          null,
          "not even an object",
        ],
      }),
    );

    const pairs = await getTradingPairs();

    expect(pairs).toHaveLength(1);
    expect(pairs[0].symbol).toBe("BTCUSDT");
    expect(warnSpy).toHaveBeenCalledTimes(4);
  });

  it("falls back to MOCK_PAIRS when the symbols array is missing entirely", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ timezone: "UTC" }));

    const pairs = await getTradingPairs();
    expect(pairs).toEqual(MOCK_PAIRS);
  });

  it("falls back to MOCK_PAIRS on a network failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const pairs = await getTradingPairs();
    expect(pairs).toEqual(MOCK_PAIRS);
  });

  it("falls back to MOCK_PAIRS on a non-2xx response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ code: -1121, msg: "Invalid symbol." }, { ok: false, status: 400 }),
    );

    const pairs = await getTradingPairs();
    expect(pairs).toEqual(MOCK_PAIRS);
  });

  it("falls back to MOCK_PAIRS when a non-2xx response has no parseable error body", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    const pairs = await getTradingPairs();
    expect(pairs).toEqual(MOCK_PAIRS);
  });

  it("falls back to MOCK_PAIRS when a 2xx response body isn't valid JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    const pairs = await getTradingPairs();
    expect(pairs).toEqual(MOCK_PAIRS);
  });

  it("falls back to MOCK_PAIRS when the request exceeds the timeout", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementationOnce(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = (init as RequestInit).signal!;
          signal.addEventListener("abort", () => {
            const error = new Error("This operation was aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
    );

    const pending = getTradingPairs();
    await vi.advanceTimersByTimeAsync(10_000);
    const pairs = await pending;
    expect(pairs).toEqual(MOCK_PAIRS);
  });
});
