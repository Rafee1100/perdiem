# Per Diem Menu Browser

A small multi-location menu browser on top of Square's Catalog + Locations APIs. Two workspaces: `server/` (Express + TS, owns the Square token) and `web/` (Next.js 16 + React 19). The browser never sees a Square access token — it talks only to the Express backend.

> 🎥 **Loom walkthrough:** [https://www.loom.com/share/1ad0443b3646444ca39e0d916b4b6ef2]

---

## Quickstart

Two terminals, Node 20+.

```bash
# 1. Backend
cd server
cp .env.example .env       # fill in SQUARE_ACCESS_TOKEN
npm install
npm run dev                # http://localhost:4000

# 2. Frontend (new terminal)
cd web
cp .env.example .env.local # points at http://localhost:4000 by default
npm install
npm run dev                # http://localhost:3000
```

Sanity check: `curl http://localhost:4000/api/health` should return `{ "ok": true }`.

Scripts available in both workspaces: `dev`, `build`, `start`, `typecheck`. The server also has `test` (Vitest) and `lint`.

---

## Square sandbox setup

**Sandbox only — never point this at a real merchant.** Here's exactly what I did to seed mine.

1. I signed in at [developer.squareup.com](https://developer.squareup.com) → **Apps → Create app** → picked **Sandbox**.
2. I copied the **Sandbox Access Token** into `server/.env` as `SQUARE_ACCESS_TOKEN` and left `SQUARE_ENVIRONMENT=sandbox`.
3. In the **Square Sandbox Dashboard → Items library**, I created:
   - 4 categories (e.g. *Breakfast*, *Coffee*, *Tea*, *Desserts*).
   - 10 items, each attached to a category, with prices and at least one image.
4. In **Account & Settings → Locations**, I made sure I had ≥ 2 locations (created one if not).
5. For per-location visibility, I opened each item's **Business Information → Locations** and set:
   - Most items to **Available at all locations**.
   - At least one item to **only one** location — so switching locations in the UI actually hides/shows it.

---

## Architecture & trade-offs

The backend is a thin, typed gateway in front of Square. The frontend is a state machine over the gateway's JSON contract. Every choice below is one I'd defend in code review.

### Two workspaces, one shared contract
The backend exposes a Zod-validated JSON contract (`server/src/shared/menus.ts`); the frontend mirrors it in `web/lib/types.ts`. The duplication is intentional — the server is a black box to the client. If a Square field name leaks into the UI, that schema mirror has failed.

### API surface
`GET /api/health`, `/api/locations`, `/api/menus?locationId=:id`, `/api/menus` (aggregated), `/api/items/:id?locationId=:id`. Every response sets `Cache-Control: no-store` — menu data changes between calls and stale cached totals are worse than no cache.

### Square client isolation
`server/src/square/client.ts` lazily constructs one `SquareClient`. Every request is wrapped in `withSquareRetry`: 3 attempts, exponential backoff (250/500/1000ms), retrying only on 429, 5xx, or unknown statuses. **Trade-off:** I deliberately don't retry 4xx other than 429 — Square's 400s won't fix themselves, and retrying just burns rate-limit budget.

Upstream errors are translated into a stable `ApiError` (429 → `UPSTREAM_RATE_LIMITED`, 5xx → 503, otherwise 502) so callers can distinguish *our* bugs (500) from Square's failures without leaking Square's status codes into the frontend.

### Visibility rules (`server/src/square/filter.ts`)
`absentAtLocationIds` wins → `presentAtAllLocations` → `presentAtLocationIds` → default visible. Items with zero valid `ITEM_VARIATION`s are dropped (not sellable). **Why this order:** absent is an explicit override; "all" is a coarse opt-in; "specific" is a precise opt-in. Anything else is treated as visible to keep legacy data from going dark.

### Money in cents, end-to-end
Square returns `bigint` cents; the backend downcasts to `number` (safe for sandbox; flagged for any future bigint work). The frontend formats with `Intl.NumberFormat` so any ISO 4217 currency renders correctly. **Trade-off:** downcasting is safe up to ~$90 trillion — fine for a menu, but a comment marks it as a load-bearing assumption if Square ever ships anything bigger than a coffee.

### Frontend state machine
Hooks return a tagged `ApiState<T>`: `loading | ready | empty | error`. A `stale` state keeps the previous menu visible during transitions with a translucent overlay. A `useRef`-based request id prevents out-of-order responses from clobbering newer ones when the user switches locations quickly. **Trade-off:** I'd rather show stale data with a clear "refreshing" affordance than flash a spinner on every location switch — but I keep the stale window short (one tick) so users never act on data they shouldn't.

### URL is the source of truth
Selected location + category live in the query string (`router.replace`), so URLs are shareable and the back button works.

### Cart is in-memory
A `useReducer` in `web/context/CartContext.tsx`; no persistence, no payment. Prices are snapshotted at add-time — re-validation belongs to a future checkout. **Why no persistence:** carts that outlive their prices are worse than no cart at all. A real version would either re-price on hydrate or persist a checkout id.

### Bonus choices
I picked **search + cart** from the bonus list. Search is client-side over name + description (`web/lib/search.ts`); the cart uses the reducer above. I deliberately skipped the time-of-day bonus — Square's category availability has shifted (legacy `Category.schedule` is deprecated; the Menu API replacement is partially documented and the sandbox doesn't expose it). Documenting that *and* proposing a path forward felt more honest than shipping a half-working version. See "What I'd build next" below for the proposed approach.

---

## Security

- Token is never serialized into responses. The Square SDK only runs in `server/`.
- CORS is locked to `WEB_ORIGIN`.
- Zod validates every route boundary — including query params, since `locationId` flows into a Square call.
- No client-supplied URLs hit Square, so there's no SSRF surface.
- `.env` is git-ignored; `.env.example` is checked in with placeholder values only.

---

## Testing

Tests live on both sides of the wire — same runner (Vitest), same principle: cover the seams where the next bug costs a weekend.

**Backend**
- `filter.test.ts` — visibility rules, the load-bearing business logic.
- `normalize.test.ts` — Square's `ITEM`/`ITEM_VARIATION`/`CATEGORY` shape is messy; this is the seam where it gets tamed.
- `catalog.test.ts` — pagination, partial pages, retryable vs. fatal errors.

**Frontend**
- `hooks/useMenu.test.ts` — the `ApiState` state machine, including the request-id guard against out-of-order responses.
- `hooks/useLocations.test.ts` — the locations hook's loading/empty/error transitions.
- `lib/money.test.ts` — cents → display formatting, the silent-corruption trap if it ever lies.
- `lib/search.test.ts` — the client-side search filter over name + description.
- `lib/cn.test.ts` — class-name composition utility.
- `lib/api.test.ts` — the typed fetch wrapper and its error translation.

---

## What I'd build next

1. **Time-of-day / day-of-week availability.**
2. **In-memory menu cache.**
3. **Offline-friendly menu.**
4. **Inventory management.**
5. **Extensive test coverage across both workspaces.**