const LOCALE = "en-US";

const decimalFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const subUnitDecimalFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

const signedFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const percentFormat = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function formatDecimal(value: number): string {

  return Math.abs(value) >= 1 ? decimalFormat.format(value) : subUnitDecimalFormat.format(value);
}

export const formatPrice = formatDecimal;
export const formatQuantity = formatDecimal;

export function formatSignedNumber(value: number): string {
  return signedFormat.format(value);
}

export function formatPercent(percent: number): string {
  return percentFormat.format(percent / 100);
}

export function formatTime(epochMs: number): string {
  return timeFormat.format(new Date(epochMs));
}
