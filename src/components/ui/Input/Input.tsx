import { forwardRef, useId } from "react";
import type { InputProps } from "./Input.types";
import styles from "./Input.module.css";
import { joinClassNames } from "../../../utils/joinClassNames";


export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hideLabel = false,
    helperText,
    error = false,
    errorMessage,
    prefix,
    suffix,
    size = "md",
    disabled = false,
    className,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;

  const helperContent = error ? errorMessage ?? helperText : helperText;
  const hasHelper = Boolean(helperContent);

  return (
    <div className={joinClassNames(styles.root, className)}>
      <label htmlFor={inputId} className={joinClassNames(styles.label, hideLabel && styles.visuallyHidden)}>
        {label}
      </label>

      <span
        className={joinClassNames(
          styles.field,
          styles[size],
          error && styles.fieldError,
          disabled && styles.fieldDisabled,
        )}
      >
        {prefix && <span className={styles.affix}>{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={hasHelper ? helperId : undefined}
          className={styles.input}
          {...rest}
        />
        {suffix && <span className={styles.affix}>{suffix}</span>}
      </span>

      {hasHelper && (
        <p id={helperId} className={joinClassNames(styles.helperText, error && styles.helperTextError)}>
          {helperContent}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
