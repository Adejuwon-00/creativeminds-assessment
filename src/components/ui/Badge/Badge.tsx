import { forwardRef } from "react";
import type { BadgeProps } from "./Badge.types";
import styles from "./Badge.module.css";
import { joinClassNames } from "../../../utils/joinClassNames";


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
