import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Ticker, Trade } from "../../types/market";
import { symbolCleared, symbolSelected } from "./marketSlice";
import type { RootState } from "./store";

const MAX_TRADES = 50;

export interface PriceHistoryState {
  symbol: string | null;
  ticker: Ticker | null;
  trades: Trade[];
}

const initialState: PriceHistoryState = {
  symbol: null,
  ticker: null,
  trades: [],
};

const priceHistorySlice = createSlice({
  name: "priceHistory",
  initialState,
  reducers: {
    tickerReceived(state, action: PayloadAction<Ticker>) {
      if (action.payload.symbol !== state.symbol) return;
      state.ticker = action.payload;
    },
    tradeReceived(state, action: PayloadAction<Trade>) {
      if (action.payload.symbol !== state.symbol) return;
      state.trades = [action.payload, ...state.trades].slice(0, MAX_TRADES);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(symbolSelected, (state, action) => {
        state.symbol = action.payload;
        state.ticker = null;
        state.trades = [];
      })
      .addCase(symbolCleared, (state) => {
        state.symbol = null;
        state.ticker = null;
        state.trades = [];
      });
  },
});

export const { tickerReceived, tradeReceived } = priceHistorySlice.actions;
export default priceHistorySlice.reducer;

export const selectPriceHistorySymbol = (state: RootState) => state.priceHistory.symbol;
export const selectLatestTicker = (state: RootState) => state.priceHistory.ticker;
export const selectRecentTrades = (state: RootState) => state.priceHistory.trades;
