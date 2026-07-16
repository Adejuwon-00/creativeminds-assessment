import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CurrentPriceCard } from "./CurrentPriceCard";

const baseProps = {
  symbol: "BTCUSDT",
  price: 65000,
  priceChange: 100.5,
  priceChangePercent: 0.2,
  lastUpdated: Date.UTC(2024, 0, 1, 12, 30, 45),
};

describe("CurrentPriceCard", () => {
  it("renders the symbol and formatted price", () => {
    render(<CurrentPriceCard {...baseProps} />);
    expect(screen.getByText("BTCUSDT")).toBeInTheDocument();
    expect(screen.getByText("65,000.00")).toBeInTheDocument();
  });

  it("renders the signed 24h change alongside the percent change", () => {
    render(<CurrentPriceCard {...baseProps} />);
    expect(screen.getByText("+100.50 (+0.20%)")).toBeInTheDocument();
  });

  it("renders the last-updated time", () => {
    render(<CurrentPriceCard {...baseProps} />);
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it("shows an upward trend for a positive change and a downward trend for a negative one", () => {
    const { rerender } = render(<CurrentPriceCard {...baseProps} priceChange={100.5} />);
    expect(screen.getByText(/Increased/)).toBeInTheDocument();

    rerender(<CurrentPriceCard {...baseProps} priceChange={-100.5} priceChangePercent={-0.2} />);
    expect(screen.getByText(/Decreased/)).toBeInTheDocument();
    expect(screen.getByText("-100.50 (-0.20%)")).toBeInTheDocument();
  });

  it("shows a neutral trend for a zero change", () => {
    render(<CurrentPriceCard {...baseProps} priceChange={0} priceChangePercent={0} />);
    expect(screen.getByText(/No change/)).toBeInTheDocument();
  });

  it("takes only what it's given as props — no API calls, no internal state", () => {
    const { rerender } = render(<CurrentPriceCard {...baseProps} price={65000} />);
    expect(screen.getByText("65,000.00")).toBeInTheDocument();

    rerender(<CurrentPriceCard {...baseProps} price={70000} />);
    expect(screen.getByText("70,000.00")).toBeInTheDocument();
    expect(screen.queryByText("65,000.00")).not.toBeInTheDocument();
  });

  it("merges a caller-supplied className", () => {
    const { container } = render(<CurrentPriceCard {...baseProps} className="custom-class" />);
    expect(container.firstElementChild?.className).toContain("custom-class");
  });

  it("renders 24h stat tiles when the values are provided", () => {
    render(
      <CurrentPriceCard {...baseProps} highPrice={65500} lowPrice={64500} volume={1234.5} quoteVolume={80000000} />,
    );

    expect(screen.getByText("24h High")).toBeInTheDocument();
    expect(screen.getByText("65,500.00")).toBeInTheDocument();
    expect(screen.getByText("24h Low")).toBeInTheDocument();
    expect(screen.getByText("64,500.00")).toBeInTheDocument();
    expect(screen.getByText("24h Volume")).toBeInTheDocument();
    expect(screen.getByText("1,234.50")).toBeInTheDocument();
    expect(screen.getByText("24h Quote Volume")).toBeInTheDocument();
    expect(screen.getByText("80,000,000.00")).toBeInTheDocument();
  });

  it("omits the stats block entirely when no 24h values are given", () => {
    render(<CurrentPriceCard {...baseProps} />);
    expect(screen.queryByText("24h High")).not.toBeInTheDocument();
  });
});
