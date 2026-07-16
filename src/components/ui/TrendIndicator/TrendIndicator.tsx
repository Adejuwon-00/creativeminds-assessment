import type { TrendDirection, TrendIndicatorProps } from "./TrendIndicator.types";
import styles from "./TrendIndicator.module.css";
import { joinClassNames } from "../../../utils/joinClassNames";

const DIRECTION_PREFIX: Record<TrendDirection, string> = {
  up: "Increased: ",
  down: "Decreased: ",
  neutral: "No change: ",
};

function TrendArrow({ direction }: { direction: TrendDirection }) {
  if (direction === "neutral") {
    return (
      <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
        <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 12 12"
      width="10"
      height="10"
      fill="none"
      aria-hidden="true"
      className={direction === "down" ? styles.arrowDown : undefined}
    >
      <path
        d="M6 10V2M2.5 5.5 6 2l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export function TrendIndicator({ direction, children, className }: TrendIndicatorProps) {
  return (
    <span className={joinClassNames(styles.trend, styles[direction], className)}>
      <span className={styles.visuallyHidden}>{DIRECTION_PREFIX[direction]}</span>
      <TrendArrow direction={direction} />
      {children}
    </span>
  );
}

TrendIndicator.displayName = "TrendIndicator";
