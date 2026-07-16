import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonSize = "sm" | "md";

export interface ButtonSharedProps {
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  isLoading?: boolean;
}

export type ButtonLabelledProps = ButtonSharedProps & {
  variant?: "primary" | "gradient" | "tonal" | "secondary" | "ghost";
  children: ReactNode;
};

export type ButtonIconOnlyProps = ButtonSharedProps & {
  variant: "icon";
  children?: never;
  "aria-label": string;
};

export type ButtonProps = (ButtonLabelledProps | ButtonIconOnlyProps) &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;
