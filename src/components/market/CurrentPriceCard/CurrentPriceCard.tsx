import { Card } from "../../ui/Card";
import { TrendIndicator, type TrendDirection } from "../../ui/TrendIndicator";
import { formatPercent, formatPrice, formatQuantity, formatSignedNumber, formatTime } from "../../../utils/formatters";
import { joinClassNames } from "../../../utils/joinClassNames";
import type { CurrentPriceCardProps } from "./CurrentPriceCard.types";
import styles from "./CurrentPriceCard.module.css";

function trendDirection(priceChange: number): TrendDirection {
  if (priceChange > 0) return "up";
  if (priceChange < 0) return "down";
  return "neutral";
}

interface StatTile {
  label: string;
  value: string;
}

function buildStats({ highPrice, lowPrice, volume, quoteVolume }: CurrentPriceCardProps): StatTile[] {
  const stats: StatTile[] = [];
  if (highPrice !== undefined) stats.push({ label: "24h High", value: formatPrice(highPrice) });
  if (lowPrice !== undefined) stats.push({ label: "24h Low", value: formatPrice(lowPrice) });
  if (volume !== undefined) stats.push({ label: "24h Volume", value: formatQuantity(volume) });
  if (quoteVolume !== undefined) stats.push({ label: "24h Quote Volume", value: formatQuantity(quoteVolume) });
  return stats;
}

export function CurrentPriceCard(props: CurrentPriceCardProps) {
  const { symbol, price, priceChange, priceChangePercent, lastUpdated, className } = props;
  const stats = buildStats(props);

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

      {stats.length > 0 && (
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

CurrentPriceCard.displayName = "CurrentPriceCard";
