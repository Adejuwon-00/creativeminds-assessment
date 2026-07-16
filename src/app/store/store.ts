import { configureStore } from "@reduxjs/toolkit";
import { loadSelectedSymbol, saveSelectedSymbol } from "../../utils/storage";
import connectionReducer from "./connectionSlice";
import marketReducer, { symbolSelected } from "./marketSlice";
import priceHistoryReducer from "./priceHistorySlice";

export function createAppStore() {
  const store = configureStore({
    reducer: {
      market: marketReducer,
      connection: connectionReducer,
      priceHistory: priceHistoryReducer,
    },
  });

  const persistedSymbol = loadSelectedSymbol();
  if (persistedSymbol) {
    store.dispatch(symbolSelected(persistedSymbol));
  }

  let previousSymbol = store.getState().market.selectedSymbol;
  store.subscribe(() => {
    const symbol = store.getState().market.selectedSymbol;
    if (symbol !== previousSymbol) {
      previousSymbol = symbol;
      saveSelectedSymbol(symbol);
    }
  });

  return store;
}

export const store = createAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
