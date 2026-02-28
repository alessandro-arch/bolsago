

## Plan: Version Stamp + Environment Badge + /health Route

### 1. Create `src/lib/version.ts` — Version & Environment utility

- Define `APP_VERSION` from Vite's `import.meta.env.VITE_APP_VERSION` with fallback to build timestamp injected via `define` in vite config
- Define `ENVIRONMENT`: check `window.location.hostname` — if `bolsago.innovago.app` return `"PROD"`, else `"PREVIEW"`
- Define `BUILD_TIME` from a Vite define constant
- Export a `logVersion()` helper that logs version+environment to console (only when `ENVIRONMENT !== "PROD"`)

### 2. Update `vite.config.ts` — Inject build-time constants

- Add `define` block to inject `__BUILD_TIME__` (ISO timestamp) and `__APP_VERSION__` (short timestamp-based version like `2026.02.28.1422`) at build time

### 3. Update `src/components/layout/Footer.tsx` — Display version stamp

- Below the existing copyright line, add a small muted text line:
  `BolsaGO by InnovaGO • v{APP_VERSION} • {ENVIRONMENT}`

### 4. Update `src/contexts/AuthContext.tsx` — Log version on login/logout

- Import `logVersion` from version utility
- Call `logVersion()` inside `signIn` (on success) and `signOut`

### 5. Add `/health` route

- Create `src/pages/Health.tsx` — a simple page rendering JSON `{ version, environment, buildTime }` in a `<pre>` block
- Add route `<Route path="/health" element={<Health />} />` in `App.tsx`

### Technical Details

- `vite.config.ts` `define` block generates compile-time constants accessible anywhere
- Hostname check (`bolsago.innovago.app`) determines environment at runtime, no env var needed
- Version format: `YYYY.MM.DD.HHmm` generated at build time for human readability
- Console logging is gated to non-PROD environments only

