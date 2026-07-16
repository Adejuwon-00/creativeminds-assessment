import type { InputHTMLAttributes, ReactNode } from "react";

export type InputSize = "sm" | "md";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label: string;
  hideLabel?: boolean;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: InputSize;
  className?: string;
}
