import { describe, expect, it } from "vitest";
import { formatPercent, formatPrice, formatSignedNumber, formatTime } from "./formatters";

describe("formatPrice", () => {
  it("uses 2 decimal places for prices at or above 1", () => {
    expect(formatPrice(65000)).toBe("65,000.00");
    expect(formatPrice(1)).toBe("1.00");
  });

  it("allows up to 8 decimal places for sub-$1 prices", () => {
    expect(formatPrice(0.00000012)).toBe("0.00000012");
  });
});

describe("formatSignedNumber", () => {
  it("always shows a sign, even for positive values", () => {
    expect(formatSignedNumber(100.5)).toBe("+100.50");
    expect(formatSignedNumber(-100.5)).toBe("-100.50");
  });

  it("omits the sign for exactly zero", () => {
    expect(formatSignedNumber(0)).toBe("0.00");
  });
});

describe("formatPercent", () => {
  it("treats the input as a whole-number percent, matching Binance's own field convention", () => {
    expect(formatPercent(0.2)).toBe("+0.20%");
    expect(formatPercent(-1.5)).toBe("-1.50%");
  });
});

describe("formatTime", () => {
  it("formats an epoch-ms timestamp as a local time string", () => {
    const formatted = formatTime(Date.UTC(2024, 0, 1, 12, 30, 45));
    expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });
});
