import type { ElementType } from "react";
import styles from "./SectionHeader.module.css";

export interface SectionHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: SectionHeaderAction;
  level?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

function joinClassNames(...classNames: Array<string | false | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function SectionHeader({ title, description, action, level = 2, className }: SectionHeaderProps) {
  const HeadingTag = `h${level}` as ElementType;
  const ActionTag: ElementType = action?.href ? "a" : "button";

  return (
    <div className={joinClassNames(styles.header, className)}>
      <div className={styles.text}>
        <HeadingTag className={styles.title}>{title}</HeadingTag>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && (
        <ActionTag
          className={styles.action}
          href={action.href}
          onClick={action.onClick}
          type={action.href ? undefined : "button"}
        >
          {action.label}
          <ArrowIcon />
        </ActionTag>
      )}
    </div>
  );
}

SectionHeader.displayName = "SectionHeader";
