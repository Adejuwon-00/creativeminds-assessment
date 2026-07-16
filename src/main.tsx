import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./design-system/globals.css";
import { AppProviders } from "./app/providers";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { MarketPage } from "./pages/Market";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <MarketPage />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
