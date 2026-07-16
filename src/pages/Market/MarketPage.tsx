import { ConnectionStatusIndicator } from "../../components/market/ConnectionStatusIndicator";
import { CurrentPriceCard } from "../../components/market/CurrentPriceCard";
import { PriceHistory } from "../../components/market/PriceHistory";
import { TradingPairSearch } from "../../features/market/TradingPairSearch";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { useTicker } from "../../hooks/useTicker";
import styles from "./MarketPage.module.css";

export function MarketPage() {
  const { status, isDemo } = useConnectionStatus();
  const { symbol, ticker, trades } = useTicker();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Market</h1>
        <ConnectionStatusIndicator status={status} />
      </div>

      {isDemo && (
        <div className={styles.demoBanner} role="status" aria-live="polite">
          <span className={styles.demoDot} aria-hidden="true" />
          Demo Mode — Binance is unreachable from this network. Prices are simulated.
        </div>
      )}
      <div className={styles.body}>
        <TradingPairSearch />

        <div className={styles.liveColumn}>
          {!symbol && (
            <p className={styles.placeholder}>Select a trading pair to see its live price and trade history.</p>
          )}

          {symbol && !ticker && <p className={styles.placeholder}>Waiting for live data for {symbol}…</p>}

          {symbol && ticker && (
            <CurrentPriceCard
              symbol={ticker.symbol}
              price={ticker.lastPrice}
              priceChange={ticker.priceChange}
              priceChangePercent={ticker.priceChangePercent}
              lastUpdated={ticker.closeTime}
            />
          )}

          {symbol && <PriceHistory trades={trades} />}
        </div>
      </div>
    </div>
  );
}

MarketPage.displayName = "MarketPage";
