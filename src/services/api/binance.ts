import type { ApiError, TradingPair, TradingPairStatus } from "../../types/market";

const BASE_URL = "/binance-api";
const REQUEST_TIMEOUT_MS = 10_000;

const TRADING_PAIR_STATUSES: readonly TradingPairStatus[] = [
  "TRADING",
  "PRE_TRADING",
  "POST_TRADING",
  "END_OF_DAY",
  "HALT",
  "AUCTION_MATCH",
  "BREAK",
];

export const MOCK_PAIRS: TradingPair[] = [
  { symbol: "BTCUSDT",   baseAsset: "BTC",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "ETHUSDT",   baseAsset: "ETH",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "BNBUSDT",   baseAsset: "BNB",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "SOLUSDT",   baseAsset: "SOL",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "XRPUSDT",   baseAsset: "XRP",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "ADAUSDT",   baseAsset: "ADA",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "DOGEUSDT",  baseAsset: "DOGE",  quoteAsset: "USDT", status: "TRADING" },
  { symbol: "AVAXUSDT",  baseAsset: "AVAX",  quoteAsset: "USDT", status: "TRADING" },
  { symbol: "DOTUSDT",   baseAsset: "DOT",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "LTCUSDT",   baseAsset: "LTC",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "LINKUSDT",  baseAsset: "LINK",  quoteAsset: "USDT", status: "TRADING" },
  { symbol: "MATICUSDT", baseAsset: "MATIC", quoteAsset: "USDT", status: "TRADING" },
  { symbol: "UNIUSDT",   baseAsset: "UNI",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "ATOMUSDT",  baseAsset: "ATOM",  quoteAsset: "USDT", status: "TRADING" },
  { symbol: "TRXUSDT",   baseAsset: "TRX",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "ETCUSDT",   baseAsset: "ETC",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "XLMUSDT",   baseAsset: "XLM",   quoteAsset: "USDT", status: "TRADING" },
  { symbol: "ALGOUSDT",  baseAsset: "ALGO",  quoteAsset: "USDT", status: "TRADING" },
];

interface RawBinanceErrorBody {
  code?: unknown;
  msg?: unknown;
}

interface RawExchangeInfoResponse {
  symbols?: unknown;
}

interface RawSymbol {
  symbol?: unknown;
  status?: unknown;
  baseAsset?: unknown;
  quoteAsset?: unknown;
}

function toApiError(message: string, status?: number, code?: number): ApiError {
  return { message, status, code };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

async function safeParseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function toResponseError(response: Response): Promise<ApiError> {
  const body = await safeParseJson<RawBinanceErrorBody>(response);
  const message = typeof body?.msg === "string" ? body.msg : `Binance responded with HTTP ${response.status}.`;
  const code = typeof body?.code === "number" ? body.code : undefined;
  return toApiError(message, response.status, code);
}

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw toApiError(`Request to Binance timed out after ${REQUEST_TIMEOUT_MS}ms.`);
    }
    throw toApiError("Could not reach Binance. Check your network connection.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw await toResponseError(response);
  }

  const body = await safeParseJson<T>(response);
  if (body === null) {
    throw toApiError("Binance returned a response that could not be parsed as JSON.", response.status);
  }

  return body;
}

function isTradingPairStatus(value: unknown): value is TradingPairStatus {
  return typeof value === "string" && (TRADING_PAIR_STATUSES as readonly string[]).includes(value);
}

function normalizeTradingPair(raw: unknown): TradingPair | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const candidate = raw as RawSymbol;

  if (
    typeof candidate.symbol !== "string" ||
    typeof candidate.baseAsset !== "string" ||
    typeof candidate.quoteAsset !== "string" ||
    !isTradingPairStatus(candidate.status)
  ) {
    return null;
  }

  return {
    symbol: candidate.symbol,
    baseAsset: candidate.baseAsset,
    quoteAsset: candidate.quoteAsset,
    status: candidate.status,
  };
}

export async function getTradingPairs(): Promise<TradingPair[]> {
  try {
    const data = await request<RawExchangeInfoResponse>("/api/v3/exchangeInfo");

    if (!Array.isArray(data.symbols)) {
      throw toApiError("Binance's exchangeInfo response did not include a symbols list.");
    }

    const pairs: TradingPair[] = [];
    for (const raw of data.symbols) {
      const pair = normalizeTradingPair(raw);
      if (pair) {
        pairs.push(pair);
      } else {
        console.warn("[binance] Skipped a malformed symbol entry from exchangeInfo:", raw);
      }
    }

    return pairs;
  } catch (error) {
    console.warn("[binance] Could not reach Binance REST API — using demo pairs.", error);
    return MOCK_PAIRS;
  }
}
