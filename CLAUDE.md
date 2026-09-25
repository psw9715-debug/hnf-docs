# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

혀니네홈패션 (a small home-fashion trading business) 거래문서 자동화 앱 — a personal, single-user tool for one person (김수현, suhyunfabric@gmail.com) to pick a customer, auto-fill their last transaction's line items, generate 거래명세표(transaction statement)/납품확인서(delivery confirmation)/견적서(quote) as pixel-accurate PDFs, email them via Gmail, and back them up. It ships as **two surfaces sharing one codebase**: a mobile-first GitHub Pages web app and a PC desktop app (Electron) that loads the same web app unmodified.

There is no build step, no bundler, no package manager at the repo root, and no test suite — `index.html` + `app.js` are the entire web app, loaded directly by the browser.

## Commands

- **Run the web app locally**: serve the repo root and open `index.html` (e.g. `python3 -m http.server 8080`). Do **not** edit `index.html`'s CDN `<script>` tags for local testing — instead make a throwaway copy with the CDN URLs swapped for `vendor/jspdf.umd.min.js` / `vendor/html2canvas.min.js` (needed in sandboxes where CDNs are blocked; never commit that swapped copy).
- **Run the desktop app**: `cd desktop && npm install && npm start` (Electron). On Linux/CI this needs `--no-sandbox` and a display (`xvfb-run -a npm start`) since Electron refuses to run as root without it.
- **Syntax-check after editing**: `node -c app.js` / `node -c desktop/main.js` (no linter/formatter is configured).
- **No automated tests exist.** Verification in this repo has historically meant driving the real UI with Playwright (including `playwright`'s Electron support, `require('playwright')._electron`, for the desktop app) — filling the doc screen, generating a PDF, and asserting on the rendered output or on stubbed network calls (Google/GitHub/Gmail APIs) — rather than unit tests.

## Architecture

### One app, two shells
`index.html`/`app.js` at the repo root are the single source of truth for **all** UI and business logic. `desktop/main.js` does not duplicate any of it — it opens an Electron `BrowserWindow` and calls `win.loadFile(path.join(__dirname, '..', 'index.html'))`, i.e. the desktop app *is* the web app running in Electron. Never fork logic into a separate `desktop/renderer/` copy; a fix or feature added to root `app.js`/`index.html` must automatically apply to both surfaces.

The only branching point between the two surfaces is `window.electronAPI` (injected by `desktop/preload.js` via `contextBridge`, absent in a normal browser). `app.js` checks `if (window.electronAPI)` in a handful of places — Google auth (`ensureValidToken`/`trySilentGoogleLogin`/`startGoogleLogin`), and an extra local-disk save step inside `generateDocsOnly()` — to swap in desktop-specific behavior. When adding a feature that needs desktop-only capability (filesystem, native dialogs, etc.), add an IPC handler in `desktop/main.js` + expose it in `desktop/preload.js`, then branch on `window.electronAPI` in the shared `app.js`, following that existing pattern.

### Data model & persistence
All app state lives in one in-memory object `appData = { supplier, customers[], transactions[], sends[] }`, persisted to `localStorage` (`loadData`/`saveData`). Cross-device sync is a GitHub Gist holding a JSON dump of `appData` (`syncPush`/`syncPull`, gated by a user-supplied PAT in `syncConfig.token`) — not a database. `googleConfig` (OAuth client id, `hasConsented` flag) and `syncConfig` (GitHub token/gist id) are separate `localStorage` keys.

`transactions[]` doubles as both "last items for this customer" (`loadLastItems`) and "last document types sent to this customer" (`lastDocTypesForCustomer`, used to default the doc-type selection when reopening a customer).

### PDF generation
`buildDocNode()` builds an off-screen DOM node styled to match the business's real paper templates pixel-for-pixel (flexbox rows with ratio-based heights derived from the original xlsx's column widths/row heights), then `renderDocToPdfBlob()` rasterizes it via `html2canvas` and embeds the image into a `jsPDF` document. This is a deliberate image-based (non-selectable-text) PDF, chosen specifically to avoid Korean font licensing/subsetting issues while reproducing the original layout exactly. Do not "fix" this into a text-based PDF without discussing it — the visual fidelity to the paper original is the whole point and has been tuned against a real reference PDF supplied by the business owner.

Filler-row counts, column widths, and box layouts differ per `docType` (`invoice`/`confirm`/`quote`, see `DOC_LABELS`) — when touching `buildDocNode`, preserve the per-type branches rather than unifying them.

### Backup fan-out
Generating a PDF (`generateDocsOnly`) immediately uploads it to **both**:
1. This same GitHub repo, via the Contents API, under `pdf-archive/{customer name}/` on `main` (`uploadPdfToGithub`) — this repo is **public** (required for free GitHub Pages), so this archive is a deliberate, acknowledged exposure of customer PDFs (names/contacts/prices), not an oversight.
2. A per-customer Google Drive folder (`uploadFileToDrive`/`ensureCustomerFolder`), which is private — treat this as the "real" backup for anything sensitive.

On desktop, a third copy is written straight to disk (`window.electronAPI.savePdfLocal`, default root `D:\hnf-docs-desktop\pdf-archive\...` on Windows). `sendGeneratedDocs()` only emails already-generated/already-backed-up blobs — it never re-renders or re-uploads. `resendHistoryItem()` re-sends a past `sends[]` entry by re-fetching its GitHub raw URL, without regenerating the PDF.

### Google OAuth — two different mechanisms, on purpose
- **Web**: Google Identity Services implicit token flow (`ensureValidToken`/`requestGoogleToken`). Browsers can't get a real `refresh_token` this way, so `app.js` fakes persistence with a `hasConsented` flag + silent `prompt:''` retries; Safari's ITP frequently blocks the silent retry, forcing a re-consent popup. This is a known, unfixable-from-the-app browser limitation — don't try to "solve" it further on the web side.
- **Desktop**: `desktop/main.js` runs a real PKCE + loopback-redirect OAuth flow and stores the resulting `refresh_token` with Electron's `safeStorage` (OS-level encryption). This gives genuinely permanent silent login, but only once the Google Cloud OAuth consent screen is switched from "Testing" to "In production" (otherwise Google expires refresh tokens after 7 days regardless of the app's code). The desktop OAuth client (client ID **and secret**, type "Desktop app") is a separate registration from the web client and is never committed — it's entered through the app's own Settings UI and stored via `desktop/main.js`'s `config:get`/`config:set` IPC handlers in Electron's `userData` dir, outside the repo.
- `desktop/main.js` has an `HNF_TEST_MODE=1` escape hatch that short-circuits both the loopback flow and the refresh call with canned tokens — used for Playwright-driven simulation without real Google credentials.

### Hard security constraint
Never hardcode a GitHub token, Google client secret, or any credential in source. Every credential in this app is entered through in-app Settings UI and persisted client-side only (`localStorage` on web, Electron `safeStorage`/local JSON outside the repo on desktop). This dates back to a real token leak in a sibling project (`psw9715-debug/fabric-calc`) and is non-negotiable.

### Deploying
GitHub Pages serves `main`. There is no CI/CD — pushing/merging to `main` *is* the deploy. This repo's git history has two independent lineages (an early manual-upload history and this session's commit history) that were joined with `--allow-unrelated-histories`; when merging a feature branch into `main`, prefer a real merge (not a rebase/force-push) since `main` also accumulates real user-generated commits (the app itself commits PDFs to `pdf-archive/` via the GitHub API when the owner uses it).
