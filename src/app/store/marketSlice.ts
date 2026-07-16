import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getTradingPairs } from "../../services/api/binance";
import type { ApiError, RequestStatus, TradingPair } from "../../types/market";
import type { RootState } from "./store";

export interface MarketState {
  pairs: TradingPair[];
  status: RequestStatus;
  error: ApiError | null;
  selectedSymbol: string | null;
}

const initialState: MarketState = {
  pairs: [],
  status: "idle",
  error: null,
  selectedSymbol: null,
};

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    !(error instanceof Error) &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

export const fetchTradingPairs = createAsyncThunk<TradingPair[], void, { rejectValue: ApiError }>(
  "market/fetchTradingPairs",
  async (_, { rejectWithValue }) => {
    try {
      return await getTradingPairs();
    } catch (error) {
      return rejectWithValue(isApiError(error) ? error : { message: "Failed to fetch trading pairs." });
    }
  },
);

const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    symbolSelected(state, action: PayloadAction<string>) {
      state.selectedSymbol = action.payload;
    },
    symbolCleared(state) {
      state.selectedSymbol = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTradingPairs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTradingPairs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pairs = action.payload;
      })
      .addCase(fetchTradingPairs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? { message: action.error.message ?? "Failed to fetch trading pairs." };
      });
  },
});

export const { symbolSelected, symbolCleared } = marketSlice.actions;
export default marketSlice.reducer;

export const selectTradingPairs = (state: RootState) => state.market.pairs;
export const selectMarketStatus = (state: RootState) => state.market.status;
export const selectMarketError = (state: RootState) => state.market.error;
export const selectSelectedSymbol = (state: RootState) => state.market.selectedSymbol;
