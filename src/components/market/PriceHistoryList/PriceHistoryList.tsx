import { memo } from "react";
import { Badge } from "../../ui/Badge";
import { formatPrice, formatQuantity, formatTime } from "../../../utils/formatters";
import { joinClassNames } from "../../../utils/joinClassNames";
import type { Trade } from "../../../types/market";
import type { PriceHistoryListProps } from "./PriceHistoryList.types";
import styles from "./PriceHistoryList.module.css";

const TradeRow = memo(function TradeRow({ trade }: { trade: Trade }) {
  return (
    <tr className={styles.row}>
      <td className={styles.time}>{formatTime(trade.timestamp)}</td>
      <td className={joinClassNames(styles.price, trade.side === "buy" ? styles.buy : styles.sell)}>
        {formatPrice(trade.price)}
      </td>
      <td className={styles.quantity}>{formatQuantity(trade.quantity)}</td>
      <td className={styles.side}>
        <Badge variant={trade.side === "buy" ? "success" : "error"} dot={false} size="sm">
          {trade.side === "buy" ? "Buy" : "Sell"}
        </Badge>
      </td>
    </tr>
  );
});

export function PriceHistoryList({ trades, className }: PriceHistoryListProps) {
  if (trades.length === 0) {
    return <p className={styles.empty}>No trades yet.</p>;
  }

  return (
    <table className={joinClassNames(styles.table, className)} aria-label="Recent trades">
      <thead>
        <tr className={styles.headerRow}>
          <th scope="col" className={styles.headerCell}>
            Time
          </th>
          <th scope="col" className={styles.headerCell}>
            Price
          </th>
          <th scope="col" className={styles.headerCell}>
            Quantity
          </th>
          <th scope="col" className={styles.headerCell}>
            Side
          </th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade) => (
          <TradeRow key={trade.id} trade={trade} />
        ))}
      </tbody>
    </table>
  );
}

PriceHistoryList.displayName = "PriceHistoryList";
