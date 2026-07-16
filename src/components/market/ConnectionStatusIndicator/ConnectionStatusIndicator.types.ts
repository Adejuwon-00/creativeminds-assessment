import type { ConnectionStatus } from "../../../types/market";

export interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  isDemo?: boolean;
  className?: string;
}
