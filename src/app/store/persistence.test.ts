import { describe, expect, it, vi } from "vitest";
import { selectSelectedSymbol, symbolCleared, symbolSelected } from "./marketSlice";
import { selectPriceHistorySymbol } from "./priceHistorySlice";
import { createAppStore } from "./store";

describe("selected-symbol persistence", () => {
  it("starts with no selection when storage is empty", () => {
    const store = createAppStore();
    expect(selectSelectedSymbol(store.getState())).toBeNull();
  });

  it("hydrates the persisted symbol into both market and priceHistory state", () => {
    window.localStorage.setItem("market.selectedSymbol", "BTCUSDT");
    const store = createAppStore();
    expect(selectSelectedSymbol(store.getState())).toBe("BTCUSDT");
    expect(selectPriceHistorySymbol(store.getState())).toBe("BTCUSDT");
  });

  it("persists the symbol when one is selected", () => {
    const store = createAppStore();
    store.dispatch(symbolSelected("ETHUSDT"));
    expect(window.localStorage.getItem("market.selectedSymbol")).toBe("ETHUSDT");
  });

  it("removes the persisted symbol when the selection is cleared", () => {
    const store = createAppStore();
    store.dispatch(symbolSelected("ETHUSDT"));
    store.dispatch(symbolCleared());
    expect(window.localStorage.getItem("market.selectedSymbol")).toBeNull();
  });

  it("a fresh store restores the selection a previous store persisted", () => {
    const first = createAppStore();
    first.dispatch(symbolSelected("SOLUSDT"));

    const second = createAppStore();
    expect(selectSelectedSymbol(second.getState())).toBe("SOLUSDT");
  });

  it("falls back to no selection when storage is unavailable", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    const store = createAppStore();
    expect(selectSelectedSymbol(store.getState())).toBeNull();
    expect(() => store.dispatch(symbolSelected("BTCUSDT"))).not.toThrow();
    expect(selectSelectedSymbol(store.getState())).toBe("BTCUSDT");

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
