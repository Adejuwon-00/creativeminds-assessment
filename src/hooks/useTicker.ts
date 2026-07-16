import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import { selectSelectedSymbol } from "../app/store/marketSlice";
import {
  selectLatestTicker,
  selectPriceHistorySymbol,
  selectRecentTrades,
  tickerReceived,
  tradeReceived,
} from "../app/store/priceHistorySlice";
import { binanceSocket } from "./socketInstance";
import type { Ticker, Trade } from "../types/market";

export interface UseTickerResult {
  symbol: string | null;
  ticker: Ticker | null;
  trades: Trade[];
}

export function useTicker(): UseTickerResult {
  const dispatch = useAppDispatch();
  const selectedSymbol = useAppSelector(selectSelectedSymbol);
  const symbol = useAppSelector(selectPriceHistorySymbol);
  const ticker = useAppSelector(selectLatestTicker);
  const trades = useAppSelector(selectRecentTrades);

  useEffect(() => {
    const unsubscribeTicker = binanceSocket.onTicker((nextTicker) => {
      dispatch(tickerReceived(nextTicker));
    });
    const unsubscribeTrade = binanceSocket.onTrade((nextTrade) => {
      dispatch(tradeReceived(nextTrade));
    });
    return () => {
      unsubscribeTicker();
      unsubscribeTrade();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!selectedSymbol) return;

    binanceSocket.connect();
    binanceSocket.subscribeTicker(selectedSymbol);
    binanceSocket.subscribeTrade(selectedSymbol);

    return () => {
      binanceSocket.unsubscribeTicker(selectedSymbol);
      binanceSocket.unsubscribeTrade(selectedSymbol);
    };
  }, [selectedSymbol]);

  return { symbol, ticker, trades };
}
