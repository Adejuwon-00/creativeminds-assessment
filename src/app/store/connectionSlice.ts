import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ConnectionStatus } from "../../types/market";
import type { RootState } from "./store";

export interface ConnectionState {
  status: ConnectionStatus;
}

const initialState: ConnectionState = {
  status: "idle",
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    connectionStatusChanged(state, action: PayloadAction<ConnectionStatus>) {
      state.status = action.payload;
    },
  },
});

export const { connectionStatusChanged } = connectionSlice.actions;
export default connectionSlice.reducer;

export const selectConnectionStatus = (state: RootState) => state.connection.status;
