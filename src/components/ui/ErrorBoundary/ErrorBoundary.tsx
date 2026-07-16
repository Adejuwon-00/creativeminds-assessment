import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../Button";
import styles from "./ErrorBoundary.module.css";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = "ErrorBoundary";

  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error === null) {
      return this.props.children;
    }

    return (
      <div role="alert" className={styles.fallback}>
        <h1 className={styles.title}>{this.props.fallbackTitle ?? "Something went wrong"}</h1>
        <p className={styles.message}>{this.state.error.message}</p>
        <Button variant="secondary" onClick={this.handleRetry}>
          Try again
        </Button>
      </div>
    );
  }
}
