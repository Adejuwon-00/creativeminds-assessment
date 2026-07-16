export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";

export type TradingPairStatus =
  | "TRADING"
  | "PRE_TRADING"
  | "POST_TRADING"
  | "END_OF_DAY"
  | "HALT"
  | "AUCTION_MATCH"
  | "BREAK";

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: TradingPairStatus;
}

export interface Ticker {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  openTime: number;
  closeTime: number;
}

export type TradeSide = "buy" | "sell";

export interface Trade {
  id: number;
  symbol: string;
  price: number;
  quantity: number;
  side: TradeSide;
  timestamp: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: number;
}
