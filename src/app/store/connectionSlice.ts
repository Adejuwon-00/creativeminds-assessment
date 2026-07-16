import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ConnectionStatus } from "../../types/market";
import type { RootState } from "./store";

export interface ConnectionState {
  status: ConnectionStatus;
  error: string | null;
}

const initialState: ConnectionState = {
  status: "idle",
  error: null,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    connectionStatusChanged(state, action: PayloadAction<ConnectionStatus>) {
      state.status = action.payload;
      if (action.payload === "connected") {
        state.error = null;
      }
    },
    connectionErrorOccurred(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const { connectionStatusChanged, connectionErrorOccurred } = connectionSlice.actions;
export default connectionSlice.reducer;

export const selectConnectionStatus = (state: RootState) => state.connection.status;
export const selectConnectionError = (state: RootState) => state.connection.error;

export const selectIsConnected = createSelector([selectConnectionStatus], (status) => status === "connected");
