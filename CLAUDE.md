# Hub — personal life-hub PWA

A home screen of tiles, each opening a small mini-app. For the owner's personal daily use on iPhone and iPad, installed via Safari → Share → Add to Home Screen. It must feel like a native app.

## Constraints
- **Free only.** No paid services, no backend (for now). Hosting must be free static hosting (GitHub Pages or Cloudflare Pages).
- **Target: iOS/iPadOS Safari, standalone PWA.** iPhone portrait; iPad portrait and landscape. Light and dark mode follow the system.
- **Dev machine: Linux, Node 18.19.** Dependencies are pinned to Node-18-compatible versions (Vite 6, @vitejs/plugin-react 4, vite-plugin-pwa 1.1, workbox 7.3, sharp 0.33 via `overrides`). Don't bump them past those lines unless Node is upgraded to ≥ 20.19.
- A native Swift port of parts is possible later. Keep logic in plain TS with no React or DOM UI where that's cheap: shared logic in `src/core/`, a mini-app's own logic in non-`.tsx` files in its folder (e.g. `src/apps/mental-math/drills.ts`).

## Stack
Vite + React 19 + TypeScript, vite-plugin-pwa (generateSW with skipWaiting + clientsClaim, `injectRegister: false`: a new version's worker takes over as soon as it installs, and `src/updates.ts` registers it and reloads the page once the user is on Home, so updates never interrupt a mini-app. Don't make new workers wait: a page from an older build can't release them, and iOS doesn't reliably activate them on app close), lucide-react icons, STIX Two Text (self-hosted via @fontsource, Latin subset) for display type, system font for UI.

## Layout
```
src/registry.ts          the single list of mini-apps
src/apps/<id>/index.tsx  one folder per built mini-app (default-export a component); its own CSS file, imported there, classes prefixed per app
src/core/                framework-free logic: router.ts (hash routes), time.ts, storage/
src/updates.ts           service-worker registration and update policy
src/screens/             Home, MiniAppScreen (placeholder or lazy app), NotFound
src/ui/                  Tile, AppBadge, TopBar (back button), YearRule, useRoute
src/styles/global.css    design tokens (light/dark), safe areas, shell styles
public/icon.svg          source icon; `npm run icons` regenerates the PNGs next to it
```

## Mini-app registry convention
- Every mini-app is one entry in `src/registry.ts`: `id` (stable, URL-safe; also its storage namespace), `name`, `subtitle`, `icon` (lucide component), `accent` (mid-tone hex readable in light and dark), `status` (`'planned' | 'ready'`), `load?`.
- The route is always `#/app/<id>`, derived from the id.
- `planned` entries have no `load` and show the shared "Coming soon" screen. To build one: create `src/apps/<id>/index.tsx` with a default-exported component, add `load: () => import('./apps/<id>')`, and set `status: 'ready'`. Nothing else changes. The shell provides the top bar and back button, and the tile badge switches to a solid accent.
- The body of a mini-app renders inside `<main class="miniapp">`, below the top bar. It is a flex column filling the rest of the screen, and sets `--accent` to the app's accent.

## Built mini-apps
- **mental-math**: Zetamac-style timed drills (Standard + − × ÷, Products, Squares, Decimals, Fractions; 1/2/3/5 min). Custom keypad (fires on pointerdown) plus hardware keys; an answer is accepted the moment it is typed correctly. Collections: `sessions` (score, per-problem times) and `prefs` (last drill and length). Bests and history are per drill + length.
- **games**: a home-style page that will list games. No games yet: it shows a dashed placeholder tile. When the first game is built, add a games list in the folder and a sub-route (e.g. `#/app/games/<game>`) to `src/core/router.ts`.

## Storage convention
- Mini-apps import only from `src/core/storage` (`storage`, `newId`, the types). They never call IndexedDB or localStorage directly.
- `storage.collection<T>(appId, name)` gives `get / list / put / delete`. Records extend `StoredRecord` (`id`, `updatedAt`, `deleted?`). `put` sets `updatedAt`; `delete` is a soft delete (tombstone). This lets a future sync layer merge by id plus last-write-wins without changing the mini-apps.
- Current backend: IndexedDB db `hub`, store `records`, key `[appId/name, id]`. Use `newId()`, not `crypto.randomUUID()` (not available over plain-http LAN testing).

## iOS/PWA rules (keep these when adding UI)
- Pad with `env(safe-area-inset-*)` (vars `--safe-*`). The status bar style is `default`, colored by the `theme-color` metas in `index.html`; keep those equal to `--paper`.
- Input font ≥ 16px (enforced globally). Tap targets ≥ 44px. No hover-only interactions. Tappable chrome uses `user-select: none`.
- Respect `prefers-reduced-motion`. Transitions are short (≈260ms) and subtle.
- `base: './'` + hash routing, so the build works on any static host or sub-path.

## Commands
- `npm run dev` — dev server on all interfaces (http://localhost:5173, and http://<LAN-IP>:5173 for the phone)
- `npm run build` — type-check and build to `dist/`
- `npm run phone` — build, then serve `dist/` on the LAN at port 4173 (closest to production)
- `npm run icons` — regenerate icons from `public/icon.svg`

## Deploy
Live at https://aramayiskhachatryan.github.io/pocketapp/ (repo AramayisKhachatryan/pocketapp, public). GitHub Pages via `.github/workflows/deploy.yml`: every push to `main` builds (Node 18, `npm ci && npm run build`) and publishes `dist/`. Repo must be public (free plan) and Settings → Pages → Source must be "GitHub Actions". Never push or create remote repos without asking.
Note: iOS storage is per-origin. Data saved while on the LAN URL won't carry over to the hosted URL.
