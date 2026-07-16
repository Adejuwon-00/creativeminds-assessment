import { memo } from "react";
import { Badge, type BadgeVariant } from "../../ui/Badge";
import { ConnectedIcon, ConnectingIcon, DisconnectedIcon, IdleIcon, ReconnectingIcon } from "./icons";
import type { ConnectionStatusIndicatorProps } from "./ConnectionStatusIndicator.types";
import styles from "./ConnectionStatusIndicator.module.css";

const LABEL: Record<ConnectionStatusIndicatorProps["status"], string> = {
  idle: "Idle",
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
};

const BADGE_VARIANT: Record<ConnectionStatusIndicatorProps["status"], BadgeVariant> = {
  idle: "neutral",
  connecting: "primary",
  connected: "success",
  reconnecting: "warning",
  disconnected: "error",
};

const ICON: Record<ConnectionStatusIndicatorProps["status"], () => JSX.Element> = {
  idle: IdleIcon,
  connecting: ConnectingIcon,
  connected: ConnectedIcon,
  reconnecting: ReconnectingIcon,
  disconnected: DisconnectedIcon,
};

function joinClassNames(...classNames: Array<string | false | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const ConnectionStatusIndicator = memo(function ConnectionStatusIndicator({
  status,
  className,
}: ConnectionStatusIndicatorProps) {
  const Icon = ICON[status];
  const label = LABEL[status];

  return (
    <span
      role="status"
      aria-live="polite"
      className={joinClassNames(styles.indicator, styles[status], className)}
    >
      <span className={styles.icon}>
        <Icon />
      </span>
      <Badge variant={BADGE_VARIANT[status]} dot={false} size="sm">
        {label}
      </Badge>
    </span>
  );
});

ConnectionStatusIndicator.displayName = "ConnectionStatusIndicator";
