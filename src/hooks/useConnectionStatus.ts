import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import { connectionStatusChanged, selectConnectionError, selectConnectionStatus } from "../app/store/connectionSlice";
import { binanceSocket } from "./socketInstance";
import type { ConnectionStatus } from "../types/market";

export interface UseConnectionStatusResult {
  status: ConnectionStatus;
  error: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
}

export function useConnectionStatus(): UseConnectionStatusResult {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectConnectionStatus);
  const error = useAppSelector(selectConnectionError);

  useEffect(() => {
    binanceSocket.connect();
    return binanceSocket.onConnectionChange((next) => {
      dispatch(connectionStatusChanged(next));
    });
  }, [dispatch]);

  return {
    status,
    error,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isReconnecting: status === "reconnecting",
  };
}
