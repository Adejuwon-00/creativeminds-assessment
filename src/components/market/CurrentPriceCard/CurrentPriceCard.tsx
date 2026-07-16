import { Card } from "../../ui/Card";
import { TrendIndicator, type TrendDirection } from "../../ui/TrendIndicator";
import { formatPercent, formatPrice, formatSignedNumber, formatTime } from "../../../utils/formatters";
import type { CurrentPriceCardProps } from "./CurrentPriceCard.types";
import styles from "./CurrentPriceCard.module.css";

function joinClassNames(...classNames: Array<string | false | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function trendDirection(priceChange: number): TrendDirection {
  if (priceChange > 0) return "up";
  if (priceChange < 0) return "down";
  return "neutral";
}

export function CurrentPriceCard({
  symbol,
  price,
  priceChange,
  priceChangePercent,
  lastUpdated,
  className,
}: CurrentPriceCardProps) {
  return (
    <Card padding="md" className={joinClassNames(styles.card, className)}>
      <div className={styles.header}>
        <span className={styles.symbol}>{symbol}</span>
        <span className={styles.updated}>Updated {formatTime(lastUpdated)}</span>
      </div>

      <span className={styles.price}>{formatPrice(price)}</span>

      <div className={styles.meta}>
        <TrendIndicator direction={trendDirection(priceChange)}>
          {formatSignedNumber(priceChange)} ({formatPercent(priceChangePercent)})
        </TrendIndicator>
      </div>
    </Card>
  );
}

CurrentPriceCard.displayName = "CurrentPriceCard";
