const SELECTED_SYMBOL_KEY = "market.selectedSymbol";

export function loadSelectedSymbol(): string | null {
  try {
    return window.localStorage.getItem(SELECTED_SYMBOL_KEY);
  } catch {
    return null;
  }
}

export function saveSelectedSymbol(symbol: string | null): void {
  try {
    if (symbol === null) {
      window.localStorage.removeItem(SELECTED_SYMBOL_KEY);
    } else {
      window.localStorage.setItem(SELECTED_SYMBOL_KEY, symbol);
    }
  } catch {
    return;
  }
}
