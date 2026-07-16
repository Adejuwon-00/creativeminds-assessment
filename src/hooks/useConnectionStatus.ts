import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import { connectionStatusChanged, selectConnectionStatus } from "../app/store/connectionSlice";
import { binanceSocket } from "./socketInstance";
import type { ConnectionStatus } from "../types/market";

export interface UseConnectionStatusResult {
  status: ConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  isDemo: boolean;
}

export function useConnectionStatus(): UseConnectionStatusResult {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectConnectionStatus);
  const [isDemo, setIsDemo] = useState(() => binanceSocket.isDemoMode());

  useEffect(() => {
    binanceSocket.connect();
    setIsDemo(binanceSocket.isDemoMode());
    return binanceSocket.onConnectionChange((next) => {
      dispatch(connectionStatusChanged(next));
      setIsDemo(binanceSocket.isDemoMode());
    });
  }, [dispatch]);

  return {
    status,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isReconnecting: status === "reconnecting",
    isDemo,
  };
}
