import { memo } from "react";
import { Badge } from "../../ui/Badge";
import { formatPrice, formatQuantity, formatTime } from "../../../utils/formatters";
import type { Trade } from "../../../types/market";
import type { PriceHistoryListProps } from "./PriceHistoryList.types";
import styles from "./PriceHistoryList.module.css";

function joinClassNames(...classNames: Array<string | false | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

const TradeRow = memo(function TradeRow({ trade }: { trade: Trade }) {
  return (
    <li className={styles.row}>
      <span className={styles.time}>{formatTime(trade.timestamp)}</span>
      <span className={joinClassNames(styles.price, trade.side === "buy" ? styles.buy : styles.sell)}>
        {formatPrice(trade.price)}
      </span>
      <span className={styles.quantity}>{formatQuantity(trade.quantity)}</span>
      <Badge variant={trade.side === "buy" ? "success" : "error"} dot={false} size="sm">
        {trade.side === "buy" ? "Buy" : "Sell"}
      </Badge>
    </li>
  );
});

export function PriceHistoryList({ trades, className }: PriceHistoryListProps) {
  if (trades.length === 0) {
    return <p className={styles.empty}>No trades yet.</p>;
  }

  return (
    <ul className={joinClassNames(styles.list, className)} aria-label="Recent trades">
      {trades.map((trade) => (
        <TradeRow key={trade.id} trade={trade} />
      ))}
    </ul>
  );
}

PriceHistoryList.displayName = "PriceHistoryList";
