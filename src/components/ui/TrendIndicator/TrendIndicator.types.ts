import type { ReactNode } from "react";

export type TrendDirection = "up" | "down" | "neutral";

export interface TrendIndicatorProps {
  direction: TrendDirection;

  children: ReactNode;
  className?: string;
}
