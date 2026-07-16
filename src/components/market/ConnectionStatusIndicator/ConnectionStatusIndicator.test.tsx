import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConnectionStatus } from "../../../types/market";

vi.mock("./icons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./icons")>();
  return { ...actual, ConnectedIcon: vi.fn(actual.ConnectedIcon) };
});

import { ConnectedIcon } from "./icons";
import { ConnectionStatusIndicator } from "./ConnectionStatusIndicator";

const STATUSES: ConnectionStatus[] = ["idle", "connecting", "connected", "reconnecting", "disconnected"];
const LABEL: Record<ConnectionStatus, string> = {
  idle: "Idle",
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
};

describe("ConnectionStatusIndicator", () => {
  beforeEach(() => {
    vi.mocked(ConnectedIcon).mockClear();
  });

  it.each(STATUSES)("renders the %s label as visible, accessible text", (status) => {
    render(<ConnectionStatusIndicator status={status} />);
    expect(screen.getByText(LABEL[status])).toBeInTheDocument();
  });

  it("exposes the status as a live region so screen readers announce transitions", () => {
    const { rerender } = render(<ConnectionStatusIndicator status="connecting" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("Connecting");

    rerender(<ConnectionStatusIndicator status="connected" />);
    expect(region).toHaveTextContent("Connected");
  });

  it("marks the icon as decorative so the text label is the only announced signal", () => {
    render(<ConnectionStatusIndicator status="reconnecting" />);
    const icon = screen.getByRole("status").querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("does not rely on color alone: each status renders distinct icon markup", () => {
    const rendered = STATUSES.map((status) => {
      const { container, unmount } = render(<ConnectionStatusIndicator status={status} />);
      const markup = container.querySelector("svg")!.innerHTML;
      unmount();
      return markup;
    });
    expect(new Set(rendered).size).toBe(STATUSES.length);
  });

  it("merges a caller-supplied className", () => {
    render(<ConnectionStatusIndicator status="connected" className="custom-class" />);
    expect(screen.getByRole("status").className).toContain("custom-class");
  });

  it("overrides the label with Simulated when demo mode is active", () => {
    render(<ConnectionStatusIndicator status="connected" isDemo />);
    expect(screen.getByText("Simulated")).toBeInTheDocument();
    expect(screen.queryByText("Connected")).not.toBeInTheDocument();
  });

  it("is memoized: does not re-render when its parent re-renders but `status` stays the same", () => {
    function Harness() {
      const [, forceRerender] = useState(0);
      return (
        <>
          <button onClick={() => forceRerender((n) => n + 1)}>rerender parent</button>
          <ConnectionStatusIndicator status="connected" />
        </>
      );
    }

    render(<Harness />);
    expect(ConnectedIcon).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "rerender parent" }));
    fireEvent.click(screen.getByRole("button", { name: "rerender parent" }));

    expect(ConnectedIcon).toHaveBeenCalledTimes(1);
  });
});
