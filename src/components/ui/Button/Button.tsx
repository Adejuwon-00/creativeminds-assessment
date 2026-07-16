import { forwardRef } from "react";
import type { ButtonProps } from "./Button.types";
import styles from "./Button.module.css";
import { joinClassNames } from "../../../utils/joinClassNames";


export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    isLoading = false,
    disabled = false,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={joinClassNames(
        styles.button,
        styles[variant],
        styles[size],
        isLoading && styles.loading,
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" data-testid="button-spinner" />
      ) : (
        leadingIcon && (
          <span className={styles.iconSlot} aria-hidden="true">
            {leadingIcon}
          </span>
        )
      )}
      {children !== undefined && <span className={styles.label}>{children}</span>}
      {!isLoading && trailingIcon && (
        <span className={styles.iconSlot} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = "Button";
