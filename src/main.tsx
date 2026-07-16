import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./design-system/globals.css";
import { AppProviders } from "./app/providers";
import { MarketPage } from "./pages/Market";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <MarketPage />
    </AppProviders>
  </StrictMode>,
);
