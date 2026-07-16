import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ButtonSize } from "../Button";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ReactNode;
  "aria-label": string;
  size?: ButtonSize;
  isLoading?: boolean;
}
