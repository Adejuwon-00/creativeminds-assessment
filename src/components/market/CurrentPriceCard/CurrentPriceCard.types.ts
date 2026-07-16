export interface CurrentPriceCardProps {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: number;
  quoteVolume?: number;
  lastUpdated: number;
  className?: string;
}
