import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "lg" | "xl";

export interface CardOwnProps {
  padding?: CardPadding;
  radius?: CardRadius;
  shadow?: boolean;
  outlined?: boolean;
  children?: ReactNode;
  className?: string;
}

export type CardStaticProps = CardOwnProps & {
  interactive?: false;
  as?: "div";
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "children">;

export type CardInteractiveButtonProps = CardOwnProps & {
  interactive: true;
  as: "button";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type CardInteractiveLinkProps = CardOwnProps & {
  interactive: true;
  as: "a";
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children">;

export type CardProps = CardStaticProps | CardInteractiveButtonProps | CardInteractiveLinkProps;

export type CardElement = HTMLDivElement | HTMLButtonElement | HTMLAnchorElement;
