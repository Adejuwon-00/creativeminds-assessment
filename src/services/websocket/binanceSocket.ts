import type { ConnectionStatus, Ticker, Trade } from "../../types/market";

const WS_URL = import.meta.env.VITE_BINANCE_WS_URL ?? "wss://stream.binance.com:443/ws";
const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const FAILURES_BEFORE_DEMO = 1;

const MOCK_BASE_PRICES: Record<string, number> = {
  BTCUSDT:   65_000,
  ETHUSDT:    3_500,
  BNBUSDT:      580,
  SOLUSDT:      170,
  XRPUSDT:     0.60,
  ADAUSDT:     0.45,
  DOGEUSDT:    0.13,
  AVAXUSDT:      38,
  DOTUSDT:        8,
  LTCUSDT:       90,
  LINKUSDT:      16,
  MATICUSDT:   0.85,
  UNIUSDT:       10,
  ATOMUSDT:      11,
  TRXUSDT:     0.12,
  ETCUSDT:       28,
  XLMUSDT:     0.11,
  ALGOUSDT:    0.18,
};

function getMockBase(symbol: string): number {
  const known = MOCK_BASE_PRICES[symbol.toUpperCase()];
  if (known !== undefined) return known;

  let hash = 0;
  for (const char of symbol.toUpperCase()) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return 0.05 + (hash % 200_000) / 100;
}

function jitter(value: number, pct = 0.003): number {
  return value * (1 + (Math.random() * 2 - 1) * pct);
}

interface RawTickerMessage {
  e?: unknown;
  s?: unknown;
  c?: unknown;
  p?: unknown;
  P?: unknown;
  h?: unknown;
  l?: unknown;
  v?: unknown;
  q?: unknown;
  O?: unknown;
  C?: unknown;
}

interface RawTradeMessage {
  e?: unknown;
  s?: unknown;
  t?: unknown;
  p?: unknown;
  q?: unknown;
  T?: unknown;
  m?: unknown;
}

type ConnectionListener = (status: ConnectionStatus) => void;
type TickerListener = (ticker: Ticker) => void;
type TradeListener = (trade: Trade) => void;
type Unsubscribe = () => void;
type StreamKind = "ticker" | "trade";

export interface BinanceSocketService {
  connect(): void;
  disconnect(): void;
  destroy(): void;
  subscribeTicker(symbol: string): void;
  unsubscribeTicker(symbol: string): void;
  subscribeTrade(symbol: string): void;
  unsubscribeTrade(symbol: string): void;
  onConnectionChange(listener: ConnectionListener): Unsubscribe;
  onTicker(listener: TickerListener): Unsubscribe;
  onTrade(listener: TradeListener): Unsubscribe;
  getStatus(): ConnectionStatus;
  isDemoMode(): boolean;
}

function toStreamName(symbol: string, kind: StreamKind): string {
  return `${symbol.toLowerCase()}@${kind}`;
}

function toNumber(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTicker(raw: unknown): Ticker | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as RawTickerMessage;
  if (candidate.e !== "24hrTicker" || typeof candidate.s !== "string") return null;

  const lastPrice = toNumber(candidate.c);
  const priceChange = toNumber(candidate.p);
  const priceChangePercent = toNumber(candidate.P);
  const highPrice = toNumber(candidate.h);
  const lowPrice = toNumber(candidate.l);
  const volume = toNumber(candidate.v);
  const quoteVolume = toNumber(candidate.q);
  const openTime = toNumber(candidate.O);
  const closeTime = toNumber(candidate.C);

  if (
    lastPrice === null ||
    priceChange === null ||
    priceChangePercent === null ||
    highPrice === null ||
    lowPrice === null ||
    volume === null ||
    quoteVolume === null ||
    openTime === null ||
    closeTime === null
  ) {
    return null;
  }

  return {
    symbol: candidate.s,
    lastPrice,
    priceChange,
    priceChangePercent,
    highPrice,
    lowPrice,
    volume,
    quoteVolume,
    openTime,
    closeTime,
  };
}

function normalizeTrade(raw: unknown): Trade | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as RawTradeMessage;
  if (candidate.e !== "trade" || typeof candidate.s !== "string" || typeof candidate.m !== "boolean") return null;

  const id = toNumber(candidate.t);
  const price = toNumber(candidate.p);
  const quantity = toNumber(candidate.q);
  const timestamp = toNumber(candidate.T);

  if (id === null || price === null || quantity === null || timestamp === null) {
    return null;
  }

  return {
    id,
    symbol: candidate.s,
    price,
    quantity,
    side: candidate.m ? "sell" : "buy",
    timestamp,
  };
}

export function createBinanceSocket(): BinanceSocketService {
  let socket: WebSocket | null = null;
  let status: ConnectionStatus = "idle";
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let intentionalDisconnect = false;
  let messageId = 0;

  let demoMode = false;
  let consecutiveFailures = 0;
  let didOpen = false;
  let everConnected = false;

  const activeStreams = new Set<string>();
  const connectionListeners = new Set<ConnectionListener>();
  const tickerListeners = new Set<TickerListener>();
  const tradeListeners = new Set<TradeListener>();
  const demoIntervals = new Map<string, ReturnType<typeof setInterval>>();

  function setStatus(next: ConnectionStatus): void {
    if (status === next) return;
    status = next;
    for (const listener of connectionListeners) {
      try {
        listener(status);
      } catch (error) {
        console.error("[binanceSocket] connection listener threw:", error);
      }
    }
  }

  function isSocketOpen(): boolean {
    return socket !== null && socket.readyState === WebSocket.OPEN;
  }

  function sendControlMessage(method: "SUBSCRIBE" | "UNSUBSCRIBE", params: string[]): void {
    if (!isSocketOpen() || params.length === 0) return;
    messageId += 1;
    socket!.send(JSON.stringify({ method, params, id: messageId }));
  }

  function clearReconnectTimer(): void {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function startDemoStream(stream: string): void {
    if (demoIntervals.has(stream)) return;
    const parts = stream.split("@");
    const symbol = parts[0].toUpperCase();
    const kind = parts[1] as StreamKind;
    let tradeId = Date.now();

    if (kind === "ticker") {
      const base = getMockBase(symbol);
      let price = base;
      const id = setInterval(() => {
        price = jitter(price, 0.003);
        const change = price - base;
        const ticker: Ticker = {
          symbol,
          lastPrice: price,
          priceChange: change,
          priceChangePercent: (change / base) * 100,
          highPrice: price * 1.005,
          lowPrice: price * 0.995,
          volume: 10_000 + Math.random() * 5_000,
          quoteVolume: price * (10_000 + Math.random() * 5_000),
          openTime: Date.now() - 86_400_000,
          closeTime: Date.now(),
        };
        for (const listener of tickerListeners) {
          try {
            listener(ticker);
          } catch {
            continue;
          }
        }
      }, 1_500);
      demoIntervals.set(stream, id);
    }

    if (kind === "trade") {
      const base = getMockBase(symbol);
      const id = setInterval(() => {
        const price = jitter(base, 0.002);
        const trade: Trade = {
          id: ++tradeId,
          symbol,
          price,
          quantity: parseFloat((Math.random() * 2).toFixed(6)),
          side: Math.random() > 0.5 ? "buy" : "sell",
          timestamp: Date.now(),
        };
        for (const listener of tradeListeners) {
          try {
            listener(trade);
          } catch {
            continue;
          }
        }
      }, 800);
      demoIntervals.set(stream, id);
    }
  }

  function stopDemoStream(stream: string): void {
    const id = demoIntervals.get(stream);
    if (id !== undefined) {
      clearInterval(id);
      demoIntervals.delete(stream);
    }
  }

  function stopAllDemoStreams(): void {
    for (const stream of demoIntervals.keys()) {
      stopDemoStream(stream);
    }
  }

  function activateDemoMode(): void {
    demoMode = true;
    consecutiveFailures = 0;
    clearReconnectTimer();
    console.warn("[binanceSocket] Cannot reach Binance — switching to demo simulation.");
    setStatus("connected");
    for (const stream of activeStreams) {
      startDemoStream(stream);
    }
  }

  function handleOpen(): void {
    didOpen = true;
    everConnected = true;
    consecutiveFailures = 0;
    reconnectAttempts = 0;
    setStatus("connected");
    sendControlMessage("SUBSCRIBE", Array.from(activeStreams));
  }

  function handleMessage(event: MessageEvent): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      return;
    }

    if (typeof parsed === "object" && parsed !== null && "id" in parsed) {
      return;
    }

    const eventType = typeof parsed === "object" && parsed !== null ? (parsed as { e?: unknown }).e : undefined;

    if (eventType === "24hrTicker") {
      const ticker = normalizeTicker(parsed);
      if (!ticker) return;
      for (const listener of tickerListeners) {
        try {
          listener(ticker);
        } catch (error) {
          console.error("[binanceSocket] ticker listener threw:", error);
        }
      }
      return;
    }

    if (eventType === "trade") {
      const trade = normalizeTrade(parsed);
      if (!trade) return;
      for (const listener of tradeListeners) {
        try {
          listener(trade);
        } catch (error) {
          console.error("[binanceSocket] trade listener threw:", error);
        }
      }
    }
  }

  function handleClose(): void {
    socket = null;

    if (intentionalDisconnect) {
      setStatus("disconnected");
      return;
    }

    if (!didOpen && !everConnected) {
      consecutiveFailures += 1;
      if (consecutiveFailures >= FAILURES_BEFORE_DEMO) {
        activateDemoMode();
        return;
      }
    } else {
      consecutiveFailures = 0;
    }

    scheduleReconnect();
  }

  function scheduleReconnect(): void {
    if (reconnectTimer !== null) return;
    setStatus("reconnecting");
    const delay = Math.min(INITIAL_RECONNECT_DELAY_MS * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY_MS);
    reconnectAttempts += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  function connect(): void {
    if (demoMode) return;

    if (socket !== null && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    intentionalDisconnect = false;
    didOpen = false;
    clearReconnectTimer();
    setStatus(status === "reconnecting" ? "reconnecting" : "connecting");

    socket = new WebSocket(WS_URL);
    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", () => {
      console.error("[binanceSocket] socket error");
    });
  }

  function disconnect(): void {
    demoMode = false;
    intentionalDisconnect = true;
    stopAllDemoStreams();
    clearReconnectTimer();
    reconnectAttempts = 0;
    consecutiveFailures = 0;
    socket?.close();
    socket = null;
    setStatus("disconnected");
  }

  function destroy(): void {
    disconnect();
    stopAllDemoStreams();
    activeStreams.clear();
    connectionListeners.clear();
    tickerListeners.clear();
    tradeListeners.clear();
    demoIntervals.clear();
  }

  function subscribe(symbol: string, kind: StreamKind): void {
    const trimmed = symbol.trim();
    if (!trimmed) return;
    const stream = toStreamName(trimmed, kind);
    if (activeStreams.has(stream)) return;
    activeStreams.add(stream);
    if (demoMode) {
      startDemoStream(stream);
    } else {
      sendControlMessage("SUBSCRIBE", [stream]);
    }
  }

  function unsubscribe(symbol: string, kind: StreamKind): void {
    const stream = toStreamName(symbol.trim(), kind);
    if (!activeStreams.has(stream)) return;
    activeStreams.delete(stream);
    if (demoMode) {
      stopDemoStream(stream);
    } else {
      sendControlMessage("UNSUBSCRIBE", [stream]);
    }
  }

  function subscribeTicker(symbol: string): void {
    subscribe(symbol, "ticker");
  }

  function unsubscribeTicker(symbol: string): void {
    unsubscribe(symbol, "ticker");
  }

  function subscribeTrade(symbol: string): void {
    subscribe(symbol, "trade");
  }

  function unsubscribeTrade(symbol: string): void {
    unsubscribe(symbol, "trade");
  }

  function onConnectionChange(listener: ConnectionListener): Unsubscribe {
    connectionListeners.add(listener);
    return () => connectionListeners.delete(listener);
  }

  function onTicker(listener: TickerListener): Unsubscribe {
    tickerListeners.add(listener);
    return () => tickerListeners.delete(listener);
  }

  function onTrade(listener: TradeListener): Unsubscribe {
    tradeListeners.add(listener);
    return () => tradeListeners.delete(listener);
  }

  function getStatus(): ConnectionStatus {
    return status;
  }

  function isDemoMode(): boolean {
    return demoMode;
  }

  return {
    connect,
    disconnect,
    destroy,
    subscribeTicker,
    unsubscribeTicker,
    subscribeTrade,
    unsubscribeTrade,
    onConnectionChange,
    onTicker,
    onTrade,
    getStatus,
    isDemoMode,
  };
}
