import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("render exploded");
  }
  return <p>All good</p>;
}

function Harness() {
  const [shouldThrow, setShouldThrow] = useState(true);
  return (
    <>
      <button onClick={() => setShouldThrow(false)}>defuse</button>
      <ErrorBoundary>
        <Bomb shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </>
  );
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>Healthy content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Healthy content")).toBeInTheDocument();
  });

  it("renders an alert fallback with the error message when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(screen.getByText("render exploded")).toBeInTheDocument();
  });

  it("reports the error through onError", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("recovers via Try again once the underlying problem is fixed", () => {
    render(<Harness />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "defuse" }));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("supports a custom fallback title", () => {
    render(
      <ErrorBoundary fallbackTitle="Market view crashed">
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("heading", { name: "Market view crashed" })).toBeInTheDocument();
  });
});
