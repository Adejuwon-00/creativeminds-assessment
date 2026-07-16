import { describe, expect, it } from "vitest";
import {
  connectionErrorOccurred,
  connectionStatusChanged,
  selectConnectionError,
  selectConnectionStatus,
  selectIsConnected,
} from "./connectionSlice";
import { createAppStore as createTestStore } from "./store";

describe("connectionSlice", () => {
  it("starts idle with no error", () => {
    const store = createTestStore();
    expect(selectConnectionStatus(store.getState())).toBe("idle");
    expect(selectConnectionError(store.getState())).toBeNull();
    expect(selectIsConnected(store.getState())).toBe(false);
  });

  it("tracks every documented connection status", () => {
    const store = createTestStore();
    for (const status of ["connecting", "connected", "reconnecting", "disconnected"] as const) {
      store.dispatch(connectionStatusChanged(status));
      expect(selectConnectionStatus(store.getState())).toBe(status);
    }
  });

  it("selectIsConnected is only true when status is exactly connected", () => {
    const store = createTestStore();
    store.dispatch(connectionStatusChanged("connecting"));
    expect(selectIsConnected(store.getState())).toBe(false);

    store.dispatch(connectionStatusChanged("connected"));
    expect(selectIsConnected(store.getState())).toBe(true);
  });

  it("records a connection error", () => {
    const store = createTestStore();
    store.dispatch(connectionErrorOccurred("socket error"));
    expect(selectConnectionError(store.getState())).toBe("socket error");
  });

  it("clears a previous error once the connection succeeds", () => {
    const store = createTestStore();
    store.dispatch(connectionErrorOccurred("dropped"));
    store.dispatch(connectionStatusChanged("reconnecting"));
    expect(selectConnectionError(store.getState())).toBe("dropped");

    store.dispatch(connectionStatusChanged("connected"));
    expect(selectConnectionError(store.getState())).toBeNull();
  });
});
