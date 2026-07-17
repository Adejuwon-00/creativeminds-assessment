# Real-Time Market Dashboard

A real-time market dashboard consuming the Binance REST and WebSocket APIs, built for the CreativeMinds Frontend Engineer technical assessment.

## How to run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # run the unit/component test suite
npm run typecheck  # TypeScript, no emit
npm run build      # typecheck + production build (dist/)
```

Requires Node 18+. The dev server proxies `/binance-api` to `https://api.binance.com` (see `vite.config.ts`); `vercel.json` provides the same rewrite in production.

### Environment variables (all optional)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_BINANCE_REST_URL` | `/binance-api` | REST base URL (proxied in dev/Vercel) |
| `VITE_BINANCE_WS_URL` | `wss://stream.binance.com:443/ws` | WebSocket endpoint |

## What it does

- Fetches all trading pairs from Binance REST (`/api/v3/exchangeInfo`) into a searchable, filterable list with loading, error (with retry), and empty states.
- Selecting a pair opens a WebSocket to `wss://stream.binance.com:9443/ws` and subscribes to that symbol's ticker and trade streams.
- Shows the live price with 24h change and trend, plus a capped history of recent trades.
- Shows connection status (Connecting / Connected / Disconnected / Reconnecting) with automatic exponential-backoff reconnection and full resubscription after a drop.
- Persists the selected trading pair to `localStorage` and restores it on reload.
- If Binance is unreachable from the current network (it is DNS-blocked in some regions), the socket layer falls back to a clearly labeled demo simulation instead of failing silently.

## Architecture

```
src/
  services/       Framework-free API layers. api/binance.ts (REST: fetch, timeout,
                  normalization, typed errors) and websocket/binanceSocket.ts
                  (connect/reconnect/subscribe/cleanup, listener dedup, no leaks).
                  Neither imports React or Redux.
  app/store/      Redux Toolkit slices: market (pairs, fetch status, selection),
                  connection (socket status), priceHistory (latest ticker + trades).
                  Typed hooks and memoized selectors. Selection is persisted via a
                  store subscription; hydration re-dispatches symbolSelected so all
                  slices stay consistent.
  hooks/          useTradingPairs / useTicker / useConnectionStatus bridge services
                  to Redux and expose UI-friendly state. Components never touch
                  fetch() or WebSocket directly.
  components/     Presentational components (props in, markup out): price card,
                  trade history, connection indicator, and the ui/ primitives they
                  compose. Styled with CSS Modules against design tokens.
  features/       TradingPairSearch — the one connected feature component, owning
                  local search text and composing primitives.
  pages/          MarketPage composes the feature, hooks, and presentational pieces.
  design-system/  CSS custom-property tokens (colors, spacing, type, radius).
```

Data flows one way: services → hooks → Redux → selectors → components. The WebSocket service is a factory (`createBinanceSocket()`), instantiated exactly once for the app in `hooks/socketInstance.ts`, which keeps the service unit-testable in isolation.

## State management

Redux Toolkit, as preferred by the brief:

- `createAsyncThunk` only where a genuine promise lifecycle exists (the REST fetch). WebSocket-driven updates are plain synchronous actions — a deliberate choice, since socket events are not promises.
- No duplicated state: `priceHistory` reacts to `market`'s `symbolSelected` action via `extraReducers` rather than owning a second copy of the selection, and guards against stale messages when switching symbols quickly.
- Local UI state (search text, input values) stays in components.

## Rendering performance

Measured, targeted memoization rather than blanket `React.memo`: the pair list re-renders only rows whose selection state changed (verified by tests that count renders), the trade history skips ticker-only updates by relying on Immer's structural sharing, and `Intl` formatters are constructed once at module level instead of per render. Trade history is capped at 50 entries.

## Assumptions & trade-offs

- `exchangeInfo` was chosen over `ticker/24hr` for the pair list because it returns asset/status metadata; 24h stats arrive via the ticker stream once a pair is selected.
- Trade history is capped at 50 entries — enough to demonstrate live flow without unbounded memory growth.
- The pair list is not virtualized; row-level memoization keeps interaction cheap at Binance's ~3k symbols, and virtualization was judged not worth the dependency for this scope.
- Reconnection backs off exponentially (1s → 30s cap) and never gives up; a real product might surface a "give up after N attempts" state.
- The demo-mode fallback exists because Binance is network-blocked in some regions; it activates only after a real connection failure and is labeled in the UI.

## Testing

Vitest + Testing Library. Services are tested against fakes (`FakeWebSocket`, stubbed `fetch`), slices against a real store, hooks with `renderHook` + Provider, and components/pages through user-visible behavior (roles, labels, text). Run with `npm test`.

## Error handling

Every failure mode maps to explicit UI: REST failures surface a retry-able error state (with a rate-limit-specific message on HTTP 418/429) and degrade to labeled demo data when Binance is unreachable; socket drops trigger automatic reconnection with visible status; malformed API entries are skipped and logged rather than crashing normalization; and a top-level `ErrorBoundary` catches render-time exceptions with an accessible fallback and a "Try again" reset.

## Regional availability (VPN note)

Binance geo-restricts its public API. From a blocked or restricted region — including the **US, UK, Canada, Netherlands, Belgium, Singapore, and Japan** — the REST API returns **HTTP 451** and the WebSocket will not connect. The app handles both explicitly:

- REST 451 → a visible error state with an actionable message and a Retry button.
- WebSocket failure → automatic fallback to a clearly labelled demo simulation, with the connection indicator showing **Simulated** instead of a false "Connected".

If you are using a VPN, pick an exit region where Binance operates (for example Germany, France, Italy, Spain, Brazil, South Africa, or UAE), then press Retry — no reload required. Note that some networks also block `binance.com` at the DNS level; in that case the app degrades the same way until the network allows the lookup.

## Deployment

The app is a static Vite build plus one API rewrite:

```bash
npm run build   # outputs dist/
```

- **Vercel** — import the repo; `vercel.json` already rewrites `/binance-api/*` to `https://api.binance.com/*`. No other configuration needed.
- **Netlify** — publish `dist/` and add the equivalent redirect: `/binance-api/* https://api.binance.com/:splat 200`.

The WebSocket connects directly to `wss://stream.binance.com:9443/ws` and needs no proxying.

## Future improvements

- Virtualize the trading-pair list for very low-end devices.
- Surface a "reconnect attempts exhausted" state instead of retrying indefinitely.
- Add ESLint (+ hooks/a11y plugins) to enforce conventions mechanically.
- Multi-symbol watchlists — the socket layer already supports concurrent subscriptions.
- E2E smoke tests (Playwright) against a stubbed Binance backend.
