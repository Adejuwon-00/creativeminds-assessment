import { forwardRef, useRef, type FormEvent, type Ref, type RefCallback } from "react";
import { Input } from "../Input";
import { IconButton } from "../IconButton";
import type { SearchInputProps } from "./SearchInput.types";
import styles from "./SearchInput.module.css";

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (element) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(element);
      else if (ref) (ref as { current: T | null }).current = element;
    }
  };
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { onSubmit, loading = false, clearable = false, onClear, value, type = "search", className, ...rest },
  ref,
) {
  const internalRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(typeof value === "string" ? value : "");
  }

  function handleClear() {
    onClear?.();
    internalRef.current?.focus();
  }

  const showClear = clearable && Boolean(value) && !loading;

  return (
    <form role="search" onSubmit={handleSubmit} className={className ? `${styles.root} ${className}` : styles.root}>
      <Input
        ref={mergeRefs(ref, internalRef)}
        type={type}
        value={value}
        suffix={
          (loading || showClear) && (
            <span className={styles.suffixGroup}>
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {showClear && (
                <IconButton
                  icon={
                    <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
                      <path
                        d="M1 1 L15 15 M15 1 L1 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  aria-label="Clear search"
                  size="sm"
                  onClick={handleClear}
                />
              )}
            </span>
          )
        }
        {...rest}
      />
      <span role="status" className={styles.visuallyHidden}>
        {loading ? "Searching…" : ""}
      </span>
    </form>
  );
});

SearchInput.displayName = "SearchInput";
