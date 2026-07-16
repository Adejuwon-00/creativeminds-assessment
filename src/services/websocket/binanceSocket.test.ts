import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBinanceSocket } from "./binanceSocket";

type Listener = (event: unknown) => void;

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = FakeWebSocket.CONNECTING;
  sent: string[] = [];
  private listeners: Record<string, Set<Listener>> = {
    open: new Set(),
    message: new Set(),
    close: new Set(),
    error: new Set(),
  };

  constructor(public url: string) {
    instances.push(this);
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners[type]?.add(listener);
  }

  removeEventListener(type: string, listener: Listener) {
    this.listeners[type]?.delete(listener);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    this.emit("close", {});
  }

  emitOpen() {
    this.readyState = FakeWebSocket.OPEN;
    this.emit("open", {});
  }

  emitMessage(data: unknown) {
    this.emit("message", { data: JSON.stringify(data) });
  }

  emitUnexpectedClose() {
    this.readyState = FakeWebSocket.CLOSED;
    this.emit("close", {});
  }

  private emit(type: string, event: unknown) {
    for (const listener of this.listeners[type] ?? []) listener(event);
  }
}

let instances: FakeWebSocket[];

function lastSocket(): FakeWebSocket {
  return instances[instances.length - 1];
}

function tickerPayload(overrides: Record<string, unknown> = {}) {
  return {
    e: "24hrTicker",
    s: "BTCUSDT",
    c: "50000.00",
    p: "100.50",
    P: "0.2",
    h: "51000",
    l: "49000",
    v: "1000",
    q: "50000000",
    O: 1000,
    C: 2000,
    ...overrides,
  };
}

function tradePayload(overrides: Record<string, unknown> = {}) {
  return {
    e: "trade",
    s: "BTCUSDT",
    t: 12345,
    p: "50000.00",
    q: "0.5",
    T: 1700000000000,
    m: false,
    ...overrides,
  };
}

beforeEach(() => {
  instances = [];
  vi.stubGlobal("WebSocket", FakeWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("createBinanceSocket", () => {
  it("connects to the documented Binance WS endpoint and reports connecting then connected", () => {
    const socket = createBinanceSocket();
    const statuses: string[] = [];
    socket.onConnectionChange((status) => statuses.push(status));

    socket.connect();
    expect(lastSocket().url).toBe("wss://stream.binance.com:443/ws");
    expect(statuses).toEqual(["connecting"]);

    lastSocket().emitOpen();
    expect(statuses).toEqual(["connecting", "connected"]);
    expect(socket.getStatus()).toBe("connected");
  });

  it("does not open a second socket when connect() is called while already connecting", () => {
    const socket = createBinanceSocket();
    socket.connect();
    socket.connect();
    expect(instances).toHaveLength(1);
  });

  it("queues a subscription made before the socket is open, then sends it once connected", () => {
    const socket = createBinanceSocket();
    socket.connect();
    socket.subscribeTicker("BTCUSDT");
    expect(lastSocket().sent).toHaveLength(0);

    lastSocket().emitOpen();
    expect(lastSocket().sent).toHaveLength(1);
    expect(JSON.parse(lastSocket().sent[0])).toMatchObject({ method: "SUBSCRIBE", params: ["btcusdt@ticker"] });
  });

  it("sends a subscription immediately when the socket is already open", () => {
    const socket = createBinanceSocket();
    socket.connect();
    lastSocket().emitOpen();

    socket.subscribeTicker("ethusdt");
    expect(JSON.parse(lastSocket().sent[0])).toMatchObject({ method: "SUBSCRIBE", params: ["ethusdt@ticker"] });
  });

  it("never sends a duplicate SUBSCRIBE for the same symbol", () => {
    const socket = createBinanceSocket();
    socket.connect();
    lastSocket().emitOpen();

    socket.subscribeTicker("BTCUSDT");
    socket.subscribeTicker("BTCUSDT");
    socket.subscribeTicker("btcusdt");

    expect(lastSocket().sent).toHaveLength(1);
  });

  it("unsubscribes and is a no-op when unsubscribing something never subscribed", () => {
    const socket = createBinanceSocket();
    socket.connect();
    lastSocket().emitOpen();

    socket.subscribeTicker("BTCUSDT");
    socket.unsubscribeTicker("BTCUSDT");
    expect(JSON.parse(lastSocket().sent[1])).toMatchObject({ method: "UNSUBSCRIBE", params: ["btcusdt@ticker"] });

    socket.unsubscribeTicker("ETHUSDT");
    expect(lastSocket().sent).toHaveLength(2);
  });

  it("normalizes and emits ticker updates to registered listeners", () => {
    const socket = createBinanceSocket();
    const onTicker = vi.fn();
    socket.onTicker(onTicker);
    socket.connect();
    lastSocket().emitOpen();

    lastSocket().emitMessage(tickerPayload());

    expect(onTicker).toHaveBeenCalledWith({
      symbol: "BTCUSDT",
      lastPrice: 50000,
      priceChange: 100.5,
      priceChangePercent: 0.2,
      highPrice: 51000,
      lowPrice: 49000,
      volume: 1000,
      quoteVolume: 50000000,
      openTime: 1000,
      closeTime: 2000,
    });
  });

  it("ignores SUBSCRIBE/UNSUBSCRIBE acknowledgements and malformed ticker payloads", () => {
    const socket = createBinanceSocket();
    const onTicker = vi.fn();
    socket.onTicker(onTicker);
    socket.connect();
    lastSocket().emitOpen();

    lastSocket().emitMessage({ result: null, id: 1 });
    lastSocket().emitMessage({ e: "24hrTicker", s: "BTCUSDT" });
    lastSocket().emitMessage("not even json-shaped data");

    expect(onTicker).not.toHaveBeenCalled();
  });

  it("registering the same listener function twice only invokes it once per event", () => {
    const socket = createBinanceSocket();
    const onTicker = vi.fn();
    socket.onTicker(onTicker);
    socket.onTicker(onTicker);
    socket.connect();
    lastSocket().emitOpen();

    lastSocket().emitMessage(tickerPayload());

    expect(onTicker).toHaveBeenCalledTimes(1);
  });

  it("stops notifying a listener once its returned unsubscribe function is called", () => {
    const socket = createBinanceSocket();
    const onTicker = vi.fn();
    const unsubscribe = socket.onTicker(onTicker);
    socket.connect();
    lastSocket().emitOpen();

    unsubscribe();
    lastSocket().emitMessage(tickerPayload());

    expect(onTicker).not.toHaveBeenCalled();
  });

  it("keeps notifying other listeners when one listener throws", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const socket = createBinanceSocket();
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();
    socket.onTicker(bad);
    socket.onTicker(good);
    socket.connect();
    lastSocket().emitOpen();

    lastSocket().emitMessage(tickerPayload());

    expect(bad).toHaveBeenCalledTimes(1);
    expect(good).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });

  it("subscribes and unsubscribes trade streams independently from ticker streams", () => {
    const socket = createBinanceSocket();
    socket.connect();
    lastSocket().emitOpen();

    socket.subscribeTicker("BTCUSDT");
    socket.subscribeTrade("BTCUSDT");
    expect(JSON.parse(lastSocket().sent[0])).toMatchObject({ method: "SUBSCRIBE", params: ["btcusdt@ticker"] });
    expect(JSON.parse(lastSocket().sent[1])).toMatchObject({ method: "SUBSCRIBE", params: ["btcusdt@trade"] });

    socket.unsubscribeTicker("BTCUSDT");
    expect(JSON.parse(lastSocket().sent[2])).toMatchObject({ method: "UNSUBSCRIBE", params: ["btcusdt@ticker"] });
    expect(lastSocket().sent).toHaveLength(3);
  });

  it("normalizes and emits trade updates to registered listeners, deriving side from isBuyerMaker", () => {
    const socket = createBinanceSocket();
    const onTrade = vi.fn();
    socket.onTrade(onTrade);
    socket.connect();
    lastSocket().emitOpen();

    lastSocket().emitMessage(tradePayload({ m: false }));
    expect(onTrade).toHaveBeenLastCalledWith({
      id: 12345,
      symbol: "BTCUSDT",
      price: 50000,
      quantity: 0.5,
      side: "buy",
      timestamp: 1700000000000,
    });

    lastSocket().emitMessage(tradePayload({ m: true }));
    expect(onTrade).toHaveBeenLastCalledWith(expect.objectContaining({ side: "sell" }));
  });

  it("does not cross-wire ticker and trade listeners", () => {
    const socket = createBinanceSocket();
    const onTicker = vi.fn();
    const onTrade = vi.fn();
    socket.onTicker(onTicker);
    socket.onTrade(onTrade);
    socket.connect();
    lastSocket().emitOpen();

    lastSocket().emitMessage(tickerPayload());
    expect(onTrade).not.toHaveBeenCalled();

    lastSocket().emitMessage(tradePayload());
    expect(onTicker).toHaveBeenCalledTimes(1);
  });

  it("ignores malformed trade payloads", () => {
    const socket = createBinanceSocket();
    const onTrade = vi.fn();
    socket.onTrade(onTrade);
    socket.connect();
    lastSocket().emitOpen();

    lastSocket().emitMessage({ e: "trade", s: "BTCUSDT" });
    expect(onTrade).not.toHaveBeenCalled();
  });

  it("reconnects automatically and resubscribes previously active streams after an unexpected close", async () => {
    const socket = createBinanceSocket();
    const statuses: string[] = [];
    socket.onConnectionChange((status) => statuses.push(status));
    socket.connect();
    lastSocket().emitOpen();
    socket.subscribeTicker("BTCUSDT");

    lastSocket().emitUnexpectedClose();
    expect(statuses[statuses.length - 1]).toBe("reconnecting");
    expect(instances).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(instances).toHaveLength(2);

    lastSocket().emitOpen();
    expect(statuses[statuses.length - 1]).toBe("connected");
    expect(JSON.parse(lastSocket().sent[0])).toMatchObject({ method: "SUBSCRIBE", params: ["btcusdt@ticker"] });
  });

  it("doubles the reconnect delay on consecutive failures", async () => {
    const socket = createBinanceSocket();
    socket.connect();
    lastSocket().emitOpen();

    lastSocket().emitUnexpectedClose();
    await vi.advanceTimersByTimeAsync(999);
    expect(instances).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(instances).toHaveLength(2);

    lastSocket().emitUnexpectedClose();
    await vi.advanceTimersByTimeAsync(1_999);
    expect(instances).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(instances).toHaveLength(3);
  });

  it("does not reconnect after an intentional disconnect()", async () => {
    const socket = createBinanceSocket();
    socket.connect();
    lastSocket().emitOpen();

    socket.disconnect();
    expect(socket.getStatus()).toBe("disconnected");

    await vi.advanceTimersByTimeAsync(60_000);
    expect(instances).toHaveLength(1);
  });

  it("destroy() clears all listeners so nothing fires after a subsequent reconnect", () => {
    const socket = createBinanceSocket();
    const onTicker = vi.fn();
    const onConnection = vi.fn();
    socket.onTicker(onTicker);
    socket.onConnectionChange(onConnection);
    socket.connect();
    lastSocket().emitOpen();

    socket.destroy();
    onConnection.mockClear();

    socket.connect();
    lastSocket().emitOpen();
    lastSocket().emitMessage(tickerPayload());

    expect(onTicker).not.toHaveBeenCalled();
    expect(onConnection).not.toHaveBeenCalled();
  });
});
