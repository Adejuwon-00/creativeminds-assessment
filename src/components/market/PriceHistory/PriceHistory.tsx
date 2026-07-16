import { memo, useLayoutEffect, useRef } from "react";
import { Card } from "../../ui/Card";
import { SectionHeader } from "../../ui/SectionHeader";
import { PriceHistoryList } from "../PriceHistoryList";
import type { PriceHistoryProps } from "./PriceHistory.types";
import styles from "./PriceHistory.module.css";

const AUTO_SCROLL_THRESHOLD_PX = 8;

function joinClassNames(...classNames: Array<string | false | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const PriceHistory = memo(function PriceHistory({ trades, className }: PriceHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtTopRef = useRef(true);
  const previousScrollHeightRef = useRef(0);

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    isAtTopRef.current = container.scrollTop <= AUTO_SCROLL_THRESHOLD_PX;
  }

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (isAtTopRef.current) {
      container.scrollTop = 0;
    } else {

      container.scrollTop += container.scrollHeight - previousScrollHeightRef.current;
    }
    previousScrollHeightRef.current = container.scrollHeight;
  }, [trades]);

  return (
    <Card padding="md" className={joinClassNames(styles.card, className)}>
      <SectionHeader title="Recent Trades" level={2} />
      <div ref={scrollRef} onScroll={handleScroll} className={styles.scrollArea}>
        <PriceHistoryList trades={trades} />
      </div>
    </Card>
  );
});

PriceHistory.displayName = "PriceHistory";
