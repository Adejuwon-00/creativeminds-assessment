import { forwardRef, type ElementType } from "react";
import type { CardElement, CardProps } from "./Card.types";
import styles from "./Card.module.css";
import { joinClassNames } from "../../../utils/joinClassNames";


export const Card = forwardRef<CardElement, CardProps>(function Card(
  { padding = "md", radius = "lg", shadow = false, outlined = true, interactive = false, as, className, children, ...rest },
  ref,
) {
  const Component = (as ?? "div") as ElementType;
  const extraProps: Record<string, unknown> = { ...rest };

  if (Component === "button" && extraProps.type === undefined) {
    extraProps.type = "button";
  }

  return (
    <Component
      ref={ref}
      className={joinClassNames(
        styles.card,
        styles[`padding-${padding}`],
        styles[`radius-${radius}`],
        outlined && styles.outlined,
        shadow && styles.shadow,
        interactive && styles.interactive,
        className,
      )}
      {...extraProps}
    >
      {children}
    </Component>
  );
});

Card.displayName = "Card";
