import { memo } from "react";
import { Badge, type BadgeVariant } from "../../ui/Badge";
import { ConnectedIcon, ConnectingIcon, DisconnectedIcon, IdleIcon, ReconnectingIcon } from "./icons";
import type { ConnectionStatusIndicatorProps } from "./ConnectionStatusIndicator.types";
import styles from "./ConnectionStatusIndicator.module.css";
import { joinClassNames } from "../../../utils/joinClassNames";

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


export const ConnectionStatusIndicator = memo(function ConnectionStatusIndicator({
  status,
  isDemo = false,
  className,
}: ConnectionStatusIndicatorProps) {
  const Icon = isDemo ? ReconnectingIcon : ICON[status];
  const label = isDemo ? "Simulated" : LABEL[status];
  const variant: BadgeVariant = isDemo ? "warning" : BADGE_VARIANT[status];

  return (
    <span
      role="status"
      aria-live="polite"
      className={joinClassNames(styles.indicator, isDemo ? styles.demo : styles[status], className)}
    >
      <span className={styles.icon}>
        <Icon />
      </span>
      <Badge variant={variant} dot={false} size="sm">
        {label}
      </Badge>
    </span>
  );
});

ConnectionStatusIndicator.displayName = "ConnectionStatusIndicator";
