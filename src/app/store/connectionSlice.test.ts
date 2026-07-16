import { describe, expect, it } from "vitest";
import { connectionStatusChanged, selectConnectionStatus } from "./connectionSlice";
import { createAppStore as createTestStore } from "./store";

describe("connectionSlice", () => {
  it("starts idle", () => {
    const store = createTestStore();
    expect(selectConnectionStatus(store.getState())).toBe("idle");
  });

  it("tracks every documented connection status", () => {
    const store = createTestStore();
    for (const status of ["connecting", "connected", "reconnecting", "disconnected"] as const) {
      store.dispatch(connectionStatusChanged(status));
      expect(selectConnectionStatus(store.getState())).toBe(status);
    }
  });
});
