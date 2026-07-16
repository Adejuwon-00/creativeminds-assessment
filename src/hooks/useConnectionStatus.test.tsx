import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppStore } from "../app/store/store";
import type { ConnectionStatus } from "../types/market";

vi.mock("./socketInstance", () => ({
  binanceSocket: {
    connect: vi.fn(),
    onConnectionChange: vi.fn(),
    isDemoMode: vi.fn(() => false),
  },
}));

import { binanceSocket } from "./socketInstance";
import { useConnectionStatus } from "./useConnectionStatus";

function renderWithStore() {
  const store = createAppStore();
  const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(() => useConnectionStatus(), { wrapper }) };
}

describe("useConnectionStatus", () => {
  beforeEach(() => {
    vi.mocked(binanceSocket.connect).mockClear();
    vi.mocked(binanceSocket.onConnectionChange).mockClear();
    vi.mocked(binanceSocket.isDemoMode).mockReturnValue(false);
  });

  it("connects the socket and registers a connection listener on mount", () => {
    const unsubscribe = vi.fn();
    vi.mocked(binanceSocket.onConnectionChange).mockReturnValueOnce(unsubscribe);

    const { unmount } = renderWithStore();

    expect(binanceSocket.connect).toHaveBeenCalledTimes(1);
    expect(binanceSocket.onConnectionChange).toHaveBeenCalledTimes(1);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("reflects status changes reported by the socket", () => {
    let emit: ((status: ConnectionStatus) => void) | undefined;
    vi.mocked(binanceSocket.onConnectionChange).mockImplementationOnce((listener) => {
      emit = listener;
      return vi.fn();
    });

    const { result } = renderWithStore();
    expect(result.current.status).toBe("idle");

    act(() => emit?.("connecting"));
    expect(result.current.status).toBe("connecting");
    expect(result.current.isConnecting).toBe(true);

    act(() => emit?.("connected"));
    expect(result.current.isConnected).toBe(true);

    act(() => emit?.("reconnecting"));
    expect(result.current.isReconnecting).toBe(true);
  });

  it("reports demo mode from the socket service as statuses change", () => {
    let emit: ((status: ConnectionStatus) => void) | undefined;
    vi.mocked(binanceSocket.onConnectionChange).mockImplementationOnce((listener) => {
      emit = listener;
      return vi.fn();
    });

    const { result } = renderWithStore();
    expect(result.current.isDemo).toBe(false);

    vi.mocked(binanceSocket.isDemoMode).mockReturnValue(true);
    act(() => emit?.("connected"));
    expect(result.current.isDemo).toBe(true);
  });
});
