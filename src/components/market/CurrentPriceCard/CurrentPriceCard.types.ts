export interface CurrentPriceCardProps {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;

  lastUpdated: number;
  className?: string;
}
