import { memo, useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { SearchInput } from "../../../components/ui/SearchInput";
import { useTradingPairs } from "../../../hooks/useTradingPairs";
import type { TradingPair } from "../../../types/market";
import styles from "./TradingPairSearch.module.css";

function joinClassNames(...classNames: Array<string | false | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function matchesQuery(pair: TradingPair, query: string): boolean {
  if (!query) return true;
  return pair.symbol.includes(query) || pair.baseAsset.includes(query) || pair.quoteAsset.includes(query);
}

interface PairRowProps {
  pair: TradingPair;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
}

const PairRow = memo(function PairRow({ pair, isSelected, onSelect }: PairRowProps) {
  return (
    <li>
      <button
        type="button"
        className={joinClassNames(styles.row, isSelected && styles.selected)}
        aria-pressed={isSelected}
        onClick={() => onSelect(pair.symbol)}
      >
        <span className={styles.symbol}>{pair.symbol}</span>
        <Badge variant={pair.status === "TRADING" ? "success" : "neutral"} dot={false} size="sm">
          {pair.status}
        </Badge>
      </button>
    </li>
  );
});

export const TradingPairSearch = memo(function TradingPairSearch() {
  const [query, setQuery] = useState("");
  const { pairs, isLoading, isError, error, selectedSymbol, selectSymbol, refetch } = useTradingPairs();

  const normalizedQuery = query.trim().toUpperCase();
  const filteredPairs = pairs.filter((pair) => matchesQuery(pair, normalizedQuery));

  return (
    <Card padding="md" className={styles.card}>
      <SearchInput
        label="Search trading pairs"
        hideLabel
        placeholder="Search by symbol, e.g. BTCUSDT"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        clearable
        onClear={() => setQuery("")}
        loading={isLoading && pairs.length === 0}
      />

      {isError && (
        <div role="alert" className={styles.state}>
          <p>{error?.message ?? "Something went wrong loading trading pairs."}</p>
          <Button variant="secondary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {!isError && isLoading && pairs.length === 0 && <p className={styles.state}>Loading trading pairs…</p>}

      {!isError && !isLoading && filteredPairs.length === 0 && (
        <p className={styles.state}>
          {pairs.length === 0 ? "No trading pairs available." : `No pairs match "${query}".`}
        </p>
      )}

      {filteredPairs.length > 0 && (
        <ul className={styles.list} aria-label="Trading pairs">
          {filteredPairs.map((pair) => (
            <PairRow key={pair.symbol} pair={pair} isSelected={pair.symbol === selectedSymbol} onSelect={selectSymbol} />
          ))}
        </ul>
      )}
    </Card>
  );
});

TradingPairSearch.displayName = "TradingPairSearch";
