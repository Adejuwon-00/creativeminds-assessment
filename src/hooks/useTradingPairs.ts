import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import {
  fetchTradingPairs,
  selectMarketError,
  selectMarketStatus,
  selectSelectedSymbol,
  selectTradingPairs,
  symbolSelected,
} from "../app/store/marketSlice";
import type { ApiError, TradingPair } from "../types/market";

export interface UseTradingPairsResult {
  pairs: TradingPair[];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  selectedSymbol: string | null;
  selectSymbol: (symbol: string) => void;
  refetch: () => void;
}

export function useTradingPairs(): UseTradingPairsResult {
  const dispatch = useAppDispatch();
  const pairs = useAppSelector(selectTradingPairs);
  const status = useAppSelector(selectMarketStatus);
  const error = useAppSelector(selectMarketError);
  const selectedSymbol = useAppSelector(selectSelectedSymbol);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTradingPairs());
    }
  }, [status, dispatch]);

  const selectSymbol = useCallback((symbol: string) => dispatch(symbolSelected(symbol)), [dispatch]);
  const refetch = useCallback(() => {
    dispatch(fetchTradingPairs());
  }, [dispatch]);

  return {
    pairs,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
    selectedSymbol,
    selectSymbol,
    refetch,
  };
}
