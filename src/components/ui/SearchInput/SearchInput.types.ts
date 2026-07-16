import type { InputProps } from "../Input";

export interface SearchInputProps extends Omit<InputProps, "prefix" | "suffix" | "onSubmit"> {
  onSubmit?: (value: string) => void;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}
