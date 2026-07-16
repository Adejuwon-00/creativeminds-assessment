import type { Trade } from "../../../types/market";

export interface PriceHistoryListProps {
  trades: Trade[];
  className?: string;
}
