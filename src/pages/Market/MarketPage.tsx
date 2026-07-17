import { ConnectionStatusIndicator } from "../../components/market/ConnectionStatusIndicator";
import { CurrentPriceCard } from "../../components/market/CurrentPriceCard";
import { PriceHistory } from "../../components/market/PriceHistory";
import { EmptyState } from "../../components/ui/EmptyState";
import { TradingPairSearch } from "../../features/market/TradingPairSearch";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { useTicker } from "../../hooks/useTicker";
import styles from "./MarketPage.module.css";

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
    <path
      d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PulseIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
    <path
      d="M3 12h4l3-7 4 14 3-7h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function MarketPage() {
  const { status, isDemo } = useConnectionStatus();
  const { symbol, ticker, trades } = useTicker();

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Market</h1>
            <p className={styles.subtitle}>Live prices and trades, streamed from Binance</p>
          </div>
          <ConnectionStatusIndicator status={status} isDemo={isDemo} />
        </header>

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
              <EmptyState
                icon={<ChartIcon />}
                title="No pair selected"
                hint="Select a trading pair to see its live price and trade history."
              />
            )}

            {symbol && !ticker && (
              <EmptyState icon={<PulseIcon />} title={`Waiting for live data for ${symbol}…`} />
            )}

            {symbol && ticker && (
              <CurrentPriceCard
                symbol={ticker.symbol}
                price={ticker.lastPrice}
                priceChange={ticker.priceChange}
                priceChangePercent={ticker.priceChangePercent}
                highPrice={ticker.highPrice}
                lowPrice={ticker.lowPrice}
                volume={ticker.volume}
                quoteVolume={ticker.quoteVolume}
                lastUpdated={ticker.closeTime}
              />
            )}

            {symbol && <PriceHistory trades={trades} />}
          </div>
        </div>
      </div>
    </div>
  );
}

MarketPage.displayName = "MarketPage";
