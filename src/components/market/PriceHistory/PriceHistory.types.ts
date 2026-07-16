import type { Trade } from "../../../types/market";

export interface PriceHistoryProps {
  trades: Trade[];
  className?: string;
}
