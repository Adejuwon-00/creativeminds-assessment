import { forwardRef } from "react";
import type { BadgeProps } from "./Badge.types";
import styles from "./Badge.module.css";

function joinClassNames(...classNames: Array<string | false | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "neutral", size = "sm", dot = true, className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={joinClassNames(styles.badge, styles[variant], styles[size], className)} {...rest}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </span>
  );
});

Badge.displayName = "Badge";
