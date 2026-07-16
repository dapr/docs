# Dapr Docs Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Dapr documentation site (Docsy v0.12.0 on Hugo) to the approved "Structured" design — Geist headings, compact code tabs, card-forward navigation, Dapr brand palette, light + dark — through SCSS-first changes and minimal, documented layout overrides, keeping Hugo/Docsy upgrades low-risk.

**Architecture:** SCSS-first. Set brand tokens through Docsy's SCSS variable hooks, restyle Docsy's stable `td-*`/Bootstrap classes, extend only at Docsy's sanctioned hook points (`hooks/head-end`, `hooks/body-end`), and fully override a layout only where the DOM the design needs cannot come from CSS (card-forward section pages). Reuse Docsy's existing `data-bs-theme` color-mode system instead of a parallel toggle. Bundle mermaid through Hugo Pipes.

**Tech Stack:** Hugo extended (CI `0.147.9`, min `0.146.0`), Docsy `v0.12.0` (Hugo module), Bootstrap 5.3 (Docsy dependency), Dart Sass via Hugo Pipes, PostCSS (autoprefixer), npm (Node 18), mermaid (to be bundled).

## Verification model (read first)

This plan styles a static site; there is no unit-test harness. Each task's "test" cycle is:

1. **Build/compile check** — the SCSS asset pipeline compiles and the target page renders. Preferred: `hugo server` (see Task 1). Where the local build is blocked, use the fallback in Task 1.
2. **Concrete assertion** — a specific, checkable outcome: a compiled-CSS `grep`, or a named page loaded in **both** light and dark showing a specific visual state (e.g. "active code tab shows a 2px orange underline"). Every task names its assertion.
3. **Commit** — small, frequent commits.

"Expected: PASS/FAIL" below refers to these checks, not a test runner.

## Global Constraints

- **No content edits** in `daprdocs/content/**` or `sdkdocs/**` — EXCEPT replacing a diagram `<img>` line with a mermaid block (the single carve-out). No prose, heading, front-matter, or structural edits.
- **Styles + layouts + static assets only:** `daprdocs/assets/scss/**`, `daprdocs/layouts/**`, `daprdocs/static/**`, `package.json`.
- **No Hugo/Docsy version change.** Build against Docsy `v0.12.0` and Hugo `0.147.9`.
- **Every forked/overridden layout** starts with the header comment: `Project override of Docsy v0.12.0 <path> — reason: <...>. Reconcile against upstream on Docsy upgrade.` and is listed in `daprdocs/layouts/OVERRIDES.md`.
- **Both themes always.** Style light and dark with equal care; drive both from CSS custom properties redefined under `[data-bs-theme="dark"]`.
- **Brand palette (verbatim):** primary `#0D2192`, secondary/sky `#3ea9f5`, orange `#ff4e00`, gold `#efca08`. Dark accents: blue `#6f9fe8`, orange `#ff7a45`, gold `#f0d24a`.
- **Fonts:** Geist (headings), Inter (body), Geist Mono (code) — self-hosted `woff2`, no font CDN.
- **Accent rule:** blue = links/chrome, sky = active states, orange = active code tab / primary CTA / hover chevron, gold = warm secondary highlight (not dominant).

## File Structure

**SCSS (`daprdocs/assets/scss/`)** — target structure after Task 2:

- `_variables_project.scss` — pre-Bootstrap: brand `$primary/$secondary`, font families, radii, dark-mode seeds. (exists; extend)
- `_variables_project_after_bs.scss` — post-Bootstrap overrides. (new)
- `_styles_project.scss` — the single import hub `@import`-ing the partials below in order. (new)
- `_tokens.scss` — CSS custom properties (`--d-*`) for light + dark. (new)
- `_typography.scss` — `@font-face`, heading/body scale. (new)
- `_navbar.scss`, `_sidebar.scss`, `_toc.scss`, `_content.scss`, `_code-tabs.scss`, `_cards.scss`, `_callouts.scss`, `_buttons.scss`, `_tables.scss`, `_footer.scss`, `_mermaid.scss`, `_search.scss`, `_page-extras.scss` — component partials. (`_content.scss`/`_nav.scss` exist; refactor into these)

**Layouts (`daprdocs/layouts/`)** — touched files:

- Owned overrides (restyle in place): `_partials/navbar.html`, `_partials/sidebar.html`, `_partials/footer.html`, `_partials/section-index.html`, `_partials/page-meta-links.html`, `_partials/search-input.html`, `_partials/feedback.html`, `_partials/version-banner.html`, `_partials/announcement-banner.html`, `_partials/cookie-banner.html`, `_partials/hooks/head-end.html`, `_partials/hooks/body-end.html`, `_partials/mermaid.html`, `docs/list.html`, `shortcodes/mermaid.html`, `_shortcodes/button.html`.
- New: `_partials/OVERRIDES.md` note is at `layouts/OVERRIDES.md`; possible new render/asset partial for mermaid bundling.

**Static (`daprdocs/static/`)**: `fonts/*.woff2` (new), regenerated diagram images (replace in place under `images/`).

**Docs (`docs/superpowers/`)**: `diagram-catalog.md` (new, Task 17).

---

## Phase 0 — Foundations

### Task 1: Establish a working local preview

**Files:**
- Modify: `package.json` (scripts only, if needed)
- Create: `docs/superpowers/DEV.md` (how to preview locally)

**Interfaces:**
- Produces: a documented command that renders the site locally so every later task can be visually verified. Later tasks reference `npm run serve` (or the documented fallback).

> **Note:** The repo owner has a known working local-preview fix. Apply THAT first (it will be provided in the dispatch). The steps below are the fallback if the provided fix does not work.

- [ ] **Step 1: Reproduce the known build issue**

Run: `cd /Users/marcduiker/dev/dapr/docs && npm run serve`
Expected: FAIL — the full Hugo build is known-broken locally (PostCSS + Node `--permission`). Capture the exact error text.

- [ ] **Step 2: Attempt the standard preview without PostCSS permission friction**

The production pipeline runs PostCSS (autoprefixer). Locally, try rendering to memory and, if PostCSS is the blocker, disable it for local dev only (never for CI). Run in order until one renders:

```bash
# a) default
npm run serve
# b) render to memory (already in the serve script) with Node permission flag cleared
HUGO_ENV=dev npx hugo server -DFE --renderToMemory
# c) if PostCSS/autoprefixer is the blocker, disable it for local dev only
HUGO_ENABLEGITINFO=false npx hugo server -DFE --renderToMemory --disableFastRender
```

- [ ] **Step 3: If PostCSS is the blocker, gate it to production**

Docsy runs PostCSS only when `hugo.Environment` is `production` in most setups; confirm in the pipeline. If the repo forces PostCSS in dev, add a dev-safe path. Document the working command; do NOT change CI behavior. If no local render is achievable, document that verification falls back to pushing a branch and reading the CI (Hugo `0.147.9`) preview build.

- [ ] **Step 4: Verify a page renders in both themes**

Run the working command; open `http://localhost:1313/developing-applications/building-blocks/workflow/workflow-overview/`. Toggle theme (Docsy toggler).
Expected: PASS — page renders; theme toggle flips `data-bs-theme` on `<html>`.

- [ ] **Step 5: Write `docs/superpowers/DEV.md`**

Record the exact working preview command, the theme-toggle behavior, and the CI-fallback note.

- [ ] **Step 6: Commit**

```bash
git add package.json docs/superpowers/DEV.md
git commit -m "docs: document working local preview for restyle work"
```

---

### Task 2: SCSS restructure + token system + dark-mode wiring

**Files:**
- Modify: `daprdocs/assets/scss/_variables_project.scss`
- Create: `daprdocs/assets/scss/_variables_project_after_bs.scss`
- Create: `daprdocs/assets/scss/_styles_project.scss`
- Create: `daprdocs/assets/scss/_tokens.scss`
- Modify: `daprdocs/assets/scss/_content.scss`, `_nav.scss` (fold into new partials over later tasks; keep compiling now)

**Interfaces:**
- Produces: CSS custom properties available site-wide: `--d-blue, --d-sky, --d-orange, --d-gold, --d-ground, --d-panel, --d-border, --d-muted, --d-body, --d-heading` (light) redefined under `[data-bs-theme="dark"]`. Later tasks style through these tokens.

- [ ] **Step 1: Confirm how Docsy imports project SCSS**

Docsy's `assets/scss/main.scss` imports `_variables_project` (pre-BS) and `_styles_project` (post-BS) by convention. Confirm `_styles_project.scss` is picked up by adding a temporary loud rule and checking the compiled output.

Add to a new `daprdocs/assets/scss/_styles_project.scss`:

```scss
// TEMP probe — remove in Step 3
body::before { content: ""; outline: 3px solid #ff00ff; }
```

- [ ] **Step 2: Verify the probe compiles and applies**

Run `npm run serve`, load any page.
Expected: PASS — a magenta outline probe is visible (proves `_styles_project.scss` is on the import path). If NOT visible, Docsy in this version uses a different hook; check `main.scss` in the module cache and adjust (fallback: import via `_variables_project_after_bs.scss`).

- [ ] **Step 3: Replace the probe with the token layer**

Create `daprdocs/assets/scss/_tokens.scss`:

```scss
// Design tokens — single source of truth for both themes.
:root {
  --d-blue:   #0D2192;
  --d-sky:    #3ea9f5;
  --d-orange: #ff4e00;
  --d-gold:   #efca08;
  --d-ground: #ffffff;
  --d-panel:  #f6f7f9;
  --d-border: #e3e6eb;
  --d-muted:  #5b6472;
  --d-body:   #1c2330;
  --d-heading:#0f1522;
  --d-link:   var(--d-blue);
  --d-active: var(--d-orange);
  --d-code-bg:#f6f7f9;
  --d-radius: 9px;
}
[data-bs-theme="dark"] {
  --d-blue:   #6f9fe8;
  --d-sky:    #3ea9f5;
  --d-orange: #ff7a45;
  --d-gold:   #f0d24a;
  --d-ground: #0b0e14;
  --d-panel:  #12161f;
  --d-border: #212838;
  --d-muted:  #8b95a7;
  --d-body:   #dfe4ee;
  --d-heading:#ffffff;
  --d-link:   #6f9fe8;
  --d-active: #ff7a45;
  --d-code-bg:#0f131c;
}
```

Replace `_styles_project.scss` body with the import hub:

```scss
// Dapr restyle — import hub. Order matters (later wins).
@import "tokens";
@import "typography";
@import "content";
@import "code-tabs";
@import "callouts";
@import "buttons";
@import "tables";
@import "cards";
@import "navbar";
@import "sidebar";
@import "toc";
@import "footer";
@import "mermaid";
@import "search";
@import "page-extras";
```

- [ ] **Step 4: Set pre-Bootstrap brand + dark-mode seeds**

In `daprdocs/assets/scss/_variables_project.scss`, keep the existing brand vars and add the Bootstrap 5.3 color-mode + font seeds (keep existing `$primary` etc.):

```scss
// Brand (existing)
$primary:   #0D2192;
$secondary: #3ea9f5;
$highlight1:#ff4e00;
$highlight2:#efca08;

// Enable Bootstrap dark mode support
$enable-dark-mode: true;
$color-mode-type: data;   // uses [data-bs-theme]
```

- [ ] **Step 5: Create empty component partials so the hub compiles**

Create empty files (each gets a header comment) so `@import`s resolve: `_typography.scss _content.scss _code-tabs.scss _callouts.scss _buttons.scss _tables.scss _cards.scss _navbar.scss _sidebar.scss _toc.scss _footer.scss _mermaid.scss _search.scss _page-extras.scss`. If `_content.scss`/`_nav.scss` already hold rules, move `_nav.scss` content into `_navbar.scss` and keep `_content.scss`.

- [ ] **Step 6: Verify tokens exist in compiled CSS**

Run `npm run serve`; in devtools console on any page:
```js
getComputedStyle(document.documentElement).getPropertyValue('--d-blue')
```
Expected: PASS — returns `#0D2192` in light; after theme toggle returns `#6f9fe8`.

- [ ] **Step 7: Commit**

```bash
git add daprdocs/assets/scss/
git commit -m "style: establish SCSS structure, design tokens, and dark-mode wiring"
```

---

### Task 3: Self-hosted fonts + typography base

**Files:**
- Create: `daprdocs/static/fonts/geist-{400,500,600,700}.woff2`, `inter-{400,500,600}.woff2`, `geist-mono-{400,500}.woff2`
- Modify: `daprdocs/assets/scss/_typography.scss`
- Modify: `daprdocs/assets/scss/_variables_project.scss` (font families)
- Modify: `daprdocs/layouts/_partials/hooks/head-end.html` (preload)

**Interfaces:**
- Produces: `--font-head`, `--font-body`, `--font-mono` usable by later tasks; Bootstrap `$font-family-*` set so all `td-*` text inherits.

- [ ] **Step 1: Add the woff2 files**

Download Geist, Inter, Geist Mono (all OFL) and place the listed weights under `daprdocs/static/fonts/`. Served at `/fonts/<file>.woff2`.

- [ ] **Step 2: Declare @font-face + font tokens in `_typography.scss`**

```scss
@font-face { font-family:"Geist"; font-weight:400; font-display:swap; src:url("/fonts/geist-400.woff2") format("woff2"); }
@font-face { font-family:"Geist"; font-weight:500; font-display:swap; src:url("/fonts/geist-500.woff2") format("woff2"); }
@font-face { font-family:"Geist"; font-weight:600; font-display:swap; src:url("/fonts/geist-600.woff2") format("woff2"); }
@font-face { font-family:"Geist"; font-weight:700; font-display:swap; src:url("/fonts/geist-700.woff2") format("woff2"); }
@font-face { font-family:"Inter"; font-weight:400; font-display:swap; src:url("/fonts/inter-400.woff2") format("woff2"); }
@font-face { font-family:"Inter"; font-weight:500; font-display:swap; src:url("/fonts/inter-500.woff2") format("woff2"); }
@font-face { font-family:"Inter"; font-weight:600; font-display:swap; src:url("/fonts/inter-600.woff2") format("woff2"); }
@font-face { font-family:"Geist Mono"; font-weight:400; font-display:swap; src:url("/fonts/geist-mono-400.woff2") format("woff2"); }
@font-face { font-family:"Geist Mono"; font-weight:500; font-display:swap; src:url("/fonts/geist-mono-500.woff2") format("woff2"); }

:root {
  --font-head: "Geist", ui-sans-serif, -apple-system, "Segoe UI", Arial, sans-serif;
  --font-body: "Inter", ui-sans-serif, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
body { font-family: var(--font-body); }
h1,h2,h3,h4,h5,h6,.td-content h1,.td-content h2,.td-content h3 { font-family: var(--font-head); letter-spacing:-0.015em; text-wrap:balance; }
code,pre,kbd,samp { font-family: var(--font-mono); }
```

- [ ] **Step 3: Set Bootstrap font variables**

In `_variables_project.scss`:

```scss
$font-family-sans-serif: "Inter", ui-sans-serif, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
$font-family-monospace:  "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

- [ ] **Step 4: Preload primary weights in `head-end.html`**

Add near the top of `daprdocs/layouts/_partials/hooks/head-end.html` (keep existing content):

```html
<link rel="preload" href="/fonts/geist-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
```

- [ ] **Step 5: Verify fonts load and apply**

Run `npm run serve`; on a docs page, devtools → Network filter "font": Geist/Inter woff2 load (200, no CDN). Computed font-family of an `<h2>` starts with `Geist`; body with `Inter`.
Expected: PASS in both themes.

- [ ] **Step 6: Commit**

```bash
git add daprdocs/static/fonts daprdocs/assets/scss/_typography.scss daprdocs/assets/scss/_variables_project.scss daprdocs/layouts/_partials/hooks/head-end.html
git commit -m "style: self-host Geist/Inter/Geist Mono and set typography base"
```

---

### Task 2b: Enable dark mode + theme toggle (discovered gap)

**Why:** The site currently has NO dark mode — no `data-bs-theme` in the DOM, no toggle, no color-mode config. The design requires light + dark, and every later task verifies "in both themes", so a real, user-operable toggle must exist now. Our tokens (Task 2) and mermaid (Task 16) key off `[data-bs-theme]`, so the toggle just needs to set that attribute on `<html>`.

**Files:**
- Modify: `daprdocs/layouts/_partials/navbar.html` (toggle button)
- Modify: `daprdocs/layouts/_partials/hooks/head-end.html` (no-flash init)
- Create: `daprdocs/assets/js/theme-toggle.js` (bundled via Hugo Pipes like mermaid)
- Modify: `daprdocs/layouts/_partials/hooks/body-end.html` (load the bundled toggle)
- Modify: `daprdocs/assets/scss/_navbar.scss` (button styling)
- Modify: `hugo.yaml` (only if enabling a Docsy built-in param)

**Interfaces:**
- Produces: `document.documentElement`'s `data-bs-theme` is `"light"|"dark"`, user-toggleable and persisted. Consumed by tokens (Task 2) and mermaid (Task 16).

- [ ] **Step 1: Prefer Docsy's built-in, fall back to custom**

First check whether Docsy v0.12.0 exposes a light/dark menu via config (e.g. `params.ui.showLightDarkModeMenu`) and a `theme-toggler.html` partial. If enabling it cleanly renders a toggle in our forked navbar, use that (least fork). If not, implement the minimal custom toggle below. Record which path you took.

- [ ] **Step 2: No-flash init in `head-end.html`** (runs before paint)

```html
<script>
  (function () {
    try {
      var s = localStorage.getItem("dapr-theme");
      var d = s ? s === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-bs-theme", d ? "dark" : "light");
    } catch (e) {}
  })();
</script>
```

- [ ] **Step 3: Toggle button in `navbar.html`** (sun/moon, accessible)

Add to the nav-right cluster (keep the header override comment intact):

```html
<button id="dapr-theme-toggle" class="dapr-theme-toggle" type="button" aria-label="Toggle light and dark theme">
  <span class="dapr-theme-toggle__sun" aria-hidden="true">☀️</span>
  <span class="dapr-theme-toggle__moon" aria-hidden="true">🌙</span>
</button>
```
(Use inline SVG icons matching the design rather than emoji if the navbar already uses SVGs.)

- [ ] **Step 4: `theme-toggle.js` (bundled via Hugo Pipes)**

```js
const root = document.documentElement;
function set(theme) {
  root.setAttribute("data-bs-theme", theme);
  try { localStorage.setItem("dapr-theme", theme); } catch (e) {}
}
const btn = document.getElementById("dapr-theme-toggle");
if (btn) btn.addEventListener("click", () => {
  set(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
});
```
Load it from `body-end.html` via `js.Build` + fingerprint (same pattern as Task 15).

- [ ] **Step 5: Button styling in `_navbar.scss`**

Show the sun in dark mode and the moon in light mode; brand the button per the design (token colors, hover state, focus-visible outline).

- [ ] **Step 6: Verify (macOS `hugo server`)**

Load any page. Confirm: on first visit the theme follows the OS preference; clicking the toggle flips `data-bs-theme`, tokens change live (background/text), the icon swaps, and the choice persists across reload; no flash of the wrong theme on load.
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add daprdocs/layouts/_partials/navbar.html daprdocs/layouts/_partials/hooks/head-end.html daprdocs/layouts/_partials/hooks/body-end.html daprdocs/assets/js/theme-toggle.js daprdocs/assets/scss/_navbar.scss hugo.yaml
git commit -m "feat: enable dark mode with a persisted theme toggle (data-bs-theme)"
```

---

## Phase 1 — Core reading experience

### Task 4: Content elements (prose, links, code, blockquote, lists, images)

**Files:**
- Modify: `daprdocs/assets/scss/_content.scss`

**Interfaces:**
- Consumes: tokens (`--d-*`), fonts (Task 3).

- [ ] **Step 1: Write content styles through tokens**

```scss
.td-content {
  color: var(--d-body); font-size: .95rem; line-height: 1.65;
  h1 { color: var(--d-heading); font-weight: 600; }
  h2 { color: var(--d-heading); border-bottom: 1px solid var(--d-border); padding-bottom: .4rem; position: relative; }
  h2::after { content:""; position:absolute; left:0; bottom:-1px; width:42px; height:2px; background:var(--d-gold); }
  a, a:visited { color: var(--d-link); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--d-link) 35%, transparent); }
  a:hover { border-bottom-color: var(--d-link); }
  p code, li code, td code { font-family: var(--font-mono); font-size:.82em; background: var(--d-panel); border:1px solid var(--d-border); border-radius:4px; padding:1px 5px; color: var(--d-heading); }
  blockquote { border-left: 3px solid var(--d-sky); color: var(--d-muted); padding: .2rem 0 .2rem 1rem; }
  ul li::marker { color: var(--d-sky); }
  img { max-width: 100%; height: auto; }
}
```

- [ ] **Step 2: Verify on a prose-heavy page in both themes**

Load the workflow-overview page. Confirm: H2 has a gold accent under the left edge; links are blue (dark: lighter blue); inline `code` has a panel background/hairline border; blockquote has a sky left border. Toggle dark — all remain legible.
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/assets/scss/_content.scss
git commit -m "style: content typography, links, code, blockquote, lists"
```

---

### Task 5: Compact code / OS tabs (SCSS only — do NOT fork the shortcode)

**Files:**
- Modify: `daprdocs/assets/scss/_code-tabs.scss`

**Interfaces:**
- Consumes: tokens. Targets Docsy `tabpane`/`tab` output: `.td-content .nav-tabs`, `.nav-item`, `.nav-link`, `.tab-content`, `.tab-pane`. (Used 2,200+ times — SCSS covers all at once.)

- [ ] **Step 1: Restyle the tab bar to the compact underline selector**

```scss
.td-content {
  .nav-tabs {
    border-bottom: 1px solid var(--d-border); gap: 2px; flex-wrap: nowrap; overflow-x: auto;
    scrollbar-width: none; margin-bottom: 0;
  }
  .nav-tabs::-webkit-scrollbar { display: none; }
  .nav-tabs .nav-item { margin-bottom: -1px; }
  .nav-tabs .nav-link {
    font-family: var(--font-head); font-size: .8rem; font-weight: 500; color: var(--d-muted);
    background: none; border: none; border-bottom: 2px solid transparent; border-radius: 0;
    padding: 7px 12px; white-space: nowrap;
  }
  .nav-tabs .nav-link:hover { color: var(--d-body); border-color: transparent; }
  .nav-tabs .nav-link.active {
    color: var(--d-heading); background: none; border-bottom-color: var(--d-orange);
  }
  .tab-content {
    border: 1px solid var(--d-border); border-top: none; border-radius: 0 0 var(--d-radius) var(--d-radius);
    background: var(--d-code-bg); max-width: 100%;
  }
  .tab-content .tab-pane { background: none !important; border: none !important; padding: 0; }
  .tab-content pre { margin: 0; padding: 14px 16px; overflow-x: auto; background: none; font-size: .82rem; line-height: 1.6; }
}
```

- [ ] **Step 2: Verify on the quickstart page (nested language tabs) in both themes**

Load a page using `tabpane` (e.g. the service-invocation quickstart in real docs, or workflow-overview SDK tabs). Confirm: tab bar is a thin underline selector; the active tab shows a 2px **orange** underline and heading-colored label; code panel is a bordered `--d-code-bg` well; the bar scrolls horizontally on narrow widths without the page scrolling sideways.
Expected: PASS in light and dark.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/assets/scss/_code-tabs.scss
git commit -m "style: compact underline code/OS tabs (Docsy tabpane restyle)"
```

---

### Task 6: Callouts (Docsy `alert`)

**Files:**
- Modify: `daprdocs/assets/scss/_callouts.scss`

**Interfaces:**
- Consumes: tokens. Targets Docsy `alert` output: `.td-content .alert` and its variants (`.alert-primary/-info/-warning/-success/-danger`).

- [ ] **Step 1: Restyle alerts to the design's callouts**

```scss
.td-content .alert {
  border: 1px solid var(--d-border); border-left: 3px solid var(--d-sky);
  background: color-mix(in srgb, var(--d-sky) 7%, var(--d-ground));
  color: var(--d-body); border-radius: 0 var(--d-radius) var(--d-radius) 0; padding: 13px 15px;
}
.td-content .alert-warning { border-left-color: var(--d-orange); background: color-mix(in srgb, var(--d-orange) 7%, var(--d-ground)); }
.td-content .alert-primary { border-left-color: var(--d-blue);  background: color-mix(in srgb, var(--d-blue) 8%, var(--d-ground)); }
.td-content .alert-success { border-left-color: #2b9a66; }
.td-content .alert-danger  { border-left-color: #d64545; }
.td-content .alert a { color: var(--d-link); }
```

- [ ] **Step 2: Verify**

Load a page with `{{% alert %}}` (e.g. any concept page). Confirm the callout has a colored left border + tinted background, legible in both themes.
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/assets/scss/_callouts.scss
git commit -m "style: callout/alert variants"
```

---

### Task 7: Tables

**Files:**
- Modify: `daprdocs/assets/scss/_tables.scss`

**Interfaces:**
- Consumes: tokens. Targets `.td-content table` (markdown tables + the custom `table` shortcode) and `_partials/components/*` compatibility tables.

- [ ] **Step 1: Restyle tables**

```scss
.td-content table {
  width: 100%; border-collapse: collapse; font-size: .86rem; margin: 1rem 0;
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--d-border); vertical-align: top; }
  thead th { font-family: var(--font-head); color: var(--d-heading); border-bottom: 2px solid var(--d-border); background: var(--d-panel); }
  tbody tr:hover { background: color-mix(in srgb, var(--d-sky) 5%, transparent); }
}
```

- [ ] **Step 2: Verify**

Load the concepts overview (large building-blocks table) and an SDK component compatibility page. Confirm header row is Geist/panel-backed, rows have hairline separators and hover tint, no horizontal page scroll (table scrolls in its own container if wide).
Expected: PASS in both themes.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/assets/scss/_tables.scss
git commit -m "style: tables and component compatibility tables"
```

---

### Task 8: Buttons

**Files:**
- Modify: `daprdocs/assets/scss/_buttons.scss`
- Read (no change): `daprdocs/layouts/_shortcodes/button.html`

**Interfaces:**
- Consumes: tokens. The `button` shortcode defaults `color="tertiary"` → `.btn-tertiary`; primary CTAs should read orange.

- [ ] **Step 1: Restyle buttons**

```scss
.td-content a.btn, .td-content .btn {
  font-family: var(--font-head); font-weight: 600; font-size: .86rem;
  border-radius: 8px; padding: 10px 16px; text-decoration: none; border: none;
}
.td-content a.btn-tertiary, .td-content .btn-tertiary { background: var(--d-orange); color: #fff; }
.td-content a.btn-tertiary:hover { filter: brightness(1.06); color:#fff; }
.td-content .btn-primary { background: var(--d-blue); color: #fff; }
.td-content .btn-secondary { background: var(--d-sky); color: #06263f; }
```

- [ ] **Step 2: Verify**

Load a page ending in a `{{< button >}}` (e.g. workflow-overview "Next steps"). Confirm default button is orange, readable in both themes.
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/assets/scss/_buttons.scss
git commit -m "style: buttons and CTA"
```

---

## Phase 2 — Chrome (nav, sidebar, TOC, secondary)

### Task 9: Navbar

**Files:**
- Modify: `daprdocs/assets/scss/_navbar.scss`
- Modify: `daprdocs/layouts/_partials/navbar.html` (only if structure needs it; prefer SCSS)

**Interfaces:**
- Consumes: tokens. Targets Docsy `.td-navbar`, `.navbar-brand`, `.nav-link`, `.td-search-input`.

- [ ] **Step 1: Restyle the navbar via SCSS**

```scss
.td-navbar {
  background: var(--d-ground); border-bottom: 1px solid var(--d-border); min-height: 56px; box-shadow: none;
  .navbar-brand, .nav-link { color: var(--d-heading); }
  .nav-link { font-family: var(--font-head); font-weight: 500; font-size: .85rem; }
  .nav-link:hover { color: var(--d-blue); }
  .nav-link.active { color: var(--d-heading); position: relative; }
  .nav-link.active::after { content:""; position:absolute; left:.6rem; right:.6rem; bottom:6px; height:2px; background:var(--d-orange); border-radius:2px; }
  .td-search-input, .td-search__input { background: var(--d-panel); border:1px solid var(--d-border); border-radius:7px; color: var(--d-body); }
}
[data-bs-theme="dark"] .td-navbar { background: var(--d-ground); }
```

- [ ] **Step 2: Reconcile the forked navbar partial**

Open `daprdocs/layouts/_partials/navbar.html`. Confirm/add the header comment (Global Constraints). Only change markup if the SCSS cannot achieve the layout (e.g. the current markup hardcodes the old blue background inline). Keep the announcement-banner include and logo SVG.

- [ ] **Step 3: Verify**

Load any page. Navbar is light (dark: near-black), 1px bottom hairline (no heavy blue bar), brand + links legible, active link has an orange underline, search field brand-styled. Toggle theme.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add daprdocs/assets/scss/_navbar.scss daprdocs/layouts/_partials/navbar.html
git commit -m "style: navbar"
```

---

### Task 10: Sidebar

**Files:**
- Modify: `daprdocs/assets/scss/_sidebar.scss`
- Modify: `daprdocs/layouts/_partials/sidebar.html` (header comment only, unless needed)

**Interfaces:**
- Consumes: tokens. Targets `.td-sidebar`, `.td-sidebar-nav`, `.td-sidebar-link`, active states. Note the tree is injected client-side by `js/sidebar-nav.js` — do not change that behavior.

- [ ] **Step 1: Restyle the sidebar**

```scss
.td-sidebar {
  background: var(--d-ground); border-right: 1px solid var(--d-border);
  .td-sidebar-nav__section-title, .td-sidebar-link {
    font-size: .84rem; color: var(--d-body); border-radius: 6px; border-left: 2px solid transparent; padding: 4px 8px;
  }
  .td-sidebar-link:hover { background: var(--d-panel); color: var(--d-heading); }
  .td-sidebar-link.active, .td-sidebar-nav-active-item {
    color: var(--d-heading); font-weight: 500;
    background: color-mix(in srgb, var(--d-blue) 12%, transparent);
    border-left: 2px solid var(--d-blue); border-radius: 0 6px 6px 0;
  }
  // section group labels
  .tree-root { font-family: var(--font-head); text-transform: uppercase; letter-spacing:.08em; font-size:.7rem; color: var(--d-muted); }
}
```

- [ ] **Step 2: Verify (including client-injected tree)**

Load a deep docs page; confirm the sidebar tree renders (client-injected), the active item has a blue left-border + tint, hover states work, and it scrolls independently. Toggle theme.
Expected: PASS. If the tree fails to inject, STOP — that's a `sidebar-nav.js` regression, not styling.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/assets/scss/_sidebar.scss daprdocs/layouts/_partials/sidebar.html
git commit -m "style: sidebar navigation"
```

---

### Task 11: Right "On this page" TOC + scrollspy

**Files:**
- Modify: `daprdocs/assets/scss/_toc.scss`
- Modify: `daprdocs/layouts/_partials/hooks/body-end.html` (scrollspy JS, only if Docsy's is absent/insufficient)

**Interfaces:**
- Consumes: tokens. Targets Docsy `.td-toc` and its `nav#TableOfContents a`.

- [ ] **Step 1: Restyle the TOC rail**

```scss
.td-toc {
  font-size: .8rem;
  #TableOfContents a, a { display:block; color: var(--d-muted); border-left: 2px solid var(--d-border); padding: 4px 0 4px 11px; text-decoration:none; }
  #TableOfContents a:hover, a:hover { color: var(--d-body); }
  #TableOfContents a.active, a.active { color: var(--d-heading); font-weight:500; border-left-color: var(--d-orange); }
  .td-toc__title, .td-page-meta__title { font-family: var(--font-head); text-transform: uppercase; letter-spacing:.1em; font-size:.68rem; color: var(--d-muted); }
}
```

- [ ] **Step 2: Add scrollspy only if needed**

Check whether Docsy already adds an `.active` class to the current TOC link on scroll (Bootstrap scrollspy). If not, add a minimal IntersectionObserver in `body-end.html` that toggles `.active` on `.td-toc a[href="#<id>"]` for the heading currently in view. Keep it dependency-free and behind a `document.querySelector('.td-toc')` guard.

- [ ] **Step 3: Verify**

Load a long page (concepts overview). Confirm the right rail lists H2/H3s, the current section's link is highlighted with an **orange** left border as you scroll, hidden below 1024px. Toggle theme.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add daprdocs/assets/scss/_toc.scss daprdocs/layouts/_partials/hooks/body-end.html
git commit -m "style: right-hand TOC with scrollspy"
```

---

### Task 12: Secondary chrome — breadcrumbs, pager, footer

**Files:**
- Modify: `daprdocs/assets/scss/_content.scss` (breadcrumbs) or a small `_page-extras.scss`
- Modify: `daprdocs/assets/scss/_footer.scss`
- Modify: `daprdocs/layouts/_partials/footer.html` (header comment; restyle markup only if needed)

**Interfaces:**
- Consumes: tokens. Targets `.td-breadcrumbs`, Docsy pager (`.td-content` prev/next / `.pagination`), `footer`.

- [ ] **Step 1: Breadcrumbs + pager (in `_page-extras.scss`)**

```scss
.td-breadcrumbs { font-family: var(--font-head); font-size:.72rem; text-transform: uppercase; letter-spacing:.1em; }
.td-breadcrumbs a, .td-breadcrumbs a:visited { color: var(--d-muted); text-decoration:none; }
.td-breadcrumbs .active { color: var(--d-blue); }
// prev/next pager cards
.td-content .pagination, .td-content nav[aria-label="Pagination"] { gap:12px; }
.td-content .page-link { border:1px solid var(--d-border); border-radius: var(--d-radius); color: var(--d-body); background: var(--d-ground); }
.td-content .page-link:hover { border-color: var(--d-orange); color: var(--d-heading); }
```

- [ ] **Step 2: Footer (in `_footer.scss`)**

```scss
footer.td-footer, .td-footer, body > footer {
  background: var(--d-ground); border-top: 1px solid var(--d-border); color: var(--d-muted); box-shadow:none;
  a, a:visited { color: var(--d-link); }
}
```

Reconcile `footer.html` (header comment). Remove any hardcoded `bg-dark` that fights the token background; if the footer must stay structural, override via SCSS with sufficient specificity rather than editing markup.

- [ ] **Step 3: Verify**

Load a docs single page. Breadcrumbs are uppercase/muted with blue current crumb; prev/next render as bordered cards with orange hover; footer is quiet (light/dark) not the old dark bar.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add daprdocs/assets/scss/_footer.scss daprdocs/assets/scss/_page-extras.scss daprdocs/layouts/_partials/footer.html
git commit -m "style: breadcrumbs, pager, footer"
```

---

## Phase 3 — Cards & card-forward landing

### Task 13: Card component SCSS

**Files:**
- Modify: `daprdocs/assets/scss/_cards.scss`

**Interfaces:**
- Consumes: tokens. Targets Docsy `.card`/`.card-deck`/`.card-body` (used in SDK docs) AND a project card class `.d-card` used by the section-index override (Task 14).
- Produces: `.d-card`, `.d-card-grid`, color modifiers `.c-blue/.c-sky/.c-orange/.c-gold` for later reuse.

- [ ] **Step 1: Write the card styles**

```scss
.d-card-grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px; margin:12px 0; }
@media (min-width:1180px){ .d-card-grid.cols-3 { grid-template-columns: repeat(3, minmax(0,1fr)); } }
@media (max-width:560px){ .d-card-grid { grid-template-columns:1fr; } }

.d-card {
  display:flex; flex-direction:column; gap:8px; text-decoration:none; color:var(--d-body);
  border:1px solid var(--d-border); border-top-width:2px; border-radius:var(--d-radius);
  padding:15px; background:var(--d-ground); transition:border-color .13s, transform .1s, box-shadow .13s;
}
.d-card:hover { transform:translateY(-2px); box-shadow:0 4px 14px rgba(15,21,34,.08); }
[data-bs-theme="dark"] .d-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.4); }
.d-card .d-card-title { font-family:var(--font-head); font-weight:600; font-size:.9rem; color:var(--d-heading); }
.d-card .d-card-desc { font-size:.8rem; color:var(--d-muted); flex:1; }
.d-card .d-card-more { font-family:var(--font-head); font-size:.76rem; font-weight:600; color:var(--d-link); }
.d-card.c-blue{border-top-color:var(--d-blue);} .d-card.c-sky{border-top-color:var(--d-sky);}
.d-card.c-orange{border-top-color:var(--d-orange);} .d-card.c-gold{border-top-color:var(--d-gold);}

// Docsy built-in cards (SDK docs)
.td-content .card { border:1px solid var(--d-border); border-radius:var(--d-radius); background:var(--d-ground); }
.td-content .card .card-title { font-family:var(--font-head); color:var(--d-heading); }
```

- [ ] **Step 2: Verify Docsy cards**

Load an SDK docs page using `{{< cardpane >}}`/`{{< card >}}`. Confirm cards use the new border/radius/heading font in both themes.
Expected: PASS. (`.d-card` is verified in Task 14.)

- [ ] **Step 3: Commit**

```bash
git add daprdocs/assets/scss/_cards.scss
git commit -m "style: card component (Docsy cards + project .d-card)"
```

---

### Task 14: Card-forward section/list rendering + home

**Files:**
- Modify: `daprdocs/layouts/docs/list.html` (owned override)
- Modify: `daprdocs/layouts/_partials/section-index.html` (owned override)

**Interfaces:**
- Consumes: `.d-card`, `.d-card-grid` (Task 13). Reads each child page's `.Title` and `.Params.description` — **no content edits** (front-matter is read, not written). Pages without a `description` render title-only.

- [ ] **Step 1: Add header comments**

Ensure both files carry the override header comment (Global Constraints), naming the Docsy v0.12.0 source they shadow.

- [ ] **Step 2: Render child pages as a card grid in `section-index.html`**

Replace the list markup that enumerates section children with a card grid (rotating accent color by index):

```go-html-template
{{/* Project override of Docsy v0.12.0 layouts/_partials/section-index.html —
     reason: render section children as a card grid (card-forward design).
     Reconcile against upstream on Docsy upgrade. */}}
{{ $pages := where .Page.Pages "Params.toc_hide" "!=" true }}
{{ with $pages }}
<div class="d-card-grid cols-3">
  {{ range $i, $p := . }}
  {{ $c := index (slice "c-blue" "c-sky" "c-orange" "c-gold") (mod $i 4) }}
  <a class="d-card {{ $c }}" href="{{ $p.RelPermalink }}">
    <span class="d-card-title">{{ $p.LinkTitle }}</span>
    {{ with $p.Params.description }}<span class="d-card-desc">{{ . }}</span>{{ end }}
    <span class="d-card-more">Learn more →</span>
  </a>
  {{ end }}
</div>
{{ end }}
```

- [ ] **Step 3: Ensure `docs/list.html` calls `section-index`**

Confirm `docs/list.html` renders `{{ partial "section-index.html" . }}` after the page content (it already includes section-index). Keep the h1 + `.Content` above the grid so any intro prose still shows.

- [ ] **Step 4: Verify**

Load a section landing page (e.g. `/developing-applications/building-blocks/`). Confirm child pages appear as a 3-col card grid with rotating top-border colors, titles + descriptions from front-matter, "Learn more →", hover lift. Confirm a page whose children lack descriptions still renders (title-only cards). Toggle theme.
Expected: PASS. No content files changed (verify `git status` shows only layouts).

- [ ] **Step 5: Commit**

```bash
git add daprdocs/layouts/docs/list.html daprdocs/layouts/_partials/section-index.html
git commit -m "feat(layout): card-forward section landing pages"
```

---

## Phase 4 — Mermaid & diagrams

### Task 15: Bundle mermaid via Hugo Pipes

**Files:**
- Modify: `package.json` (add mermaid dependency)
- Create: `daprdocs/assets/js/mermaid-init.js`
- Modify: `daprdocs/layouts/_partials/hooks/body-end.html` (replace CDN import with bundled asset)

**Interfaces:**
- Produces: a fingerprinted local `mermaid` bundle loaded only when `hasMermaid` is set; a global `window.__daprMermaidRender()` used by Task 16.

- [ ] **Step 1: Add mermaid as a pinned npm dependency**

```bash
cd /Users/marcduiker/dev/dapr/docs
npm install --save-exact mermaid@11.4.1   # pin exact; adjust to latest verified 11.x
```
Expected: `package.json` gets `"mermaid": "11.4.1"` (exact).

- [ ] **Step 2: Create the init module `daprdocs/assets/js/mermaid-init.js`**

```js
import mermaid from "mermaid";

function currentTheme() {
  return document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light";
}

// Preserve each diagram's source so we can re-render on theme change.
function cacheSources() {
  document.querySelectorAll(".mermaid").forEach((el) => {
    if (!el.dataset.src) el.dataset.src = el.textContent.trim();
  });
}

window.__daprMermaidRender = function render() {
  const theme = currentTheme() === "dark" ? "dark" : "base";
  mermaid.initialize({
    startOnLoad: false,
    theme,
    themeVariables: currentTheme() === "dark"
      ? { primaryColor: "#12161f", primaryTextColor: "#dfe4ee", primaryBorderColor: "#6f9fe8", lineColor: "#8b95a7", fontFamily: "Geist, sans-serif" }
      : { primaryColor: "#f6f7f9", primaryTextColor: "#0f1522", primaryBorderColor: "#0D2192", lineColor: "#5b6472", fontFamily: "Geist, sans-serif" },
  });
  document.querySelectorAll(".mermaid").forEach((el) => {
    el.removeAttribute("data-processed");
    el.innerHTML = el.dataset.src;
  });
  mermaid.run({ querySelector: ".mermaid" });
};

cacheSources();
window.__daprMermaidRender();
```

- [ ] **Step 3: Replace the CDN import in `body-end.html`**

Swap the current unpinned CDN block for a Hugo-Pipes-bundled, fingerprinted asset, still gated on `hasMermaid`:

```go-html-template
{{ if .Store.Get "hasMermaid" }}
  {{ with resources.Get "js/mermaid-init.js" }}
    {{ $opts := dict "minify" hugo.IsProduction "targetPath" "js/mermaid-init.js" }}
    {{ with . | js.Build $opts }}
      {{ if hugo.IsProduction }}{{ with . | fingerprint }}
        <script type="module" src="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}"></script>
      {{ end }}{{ else }}
        <script type="module" src="{{ .RelPermalink }}"></script>
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}
```

(`js.Build` bundles the `mermaid` npm module imported by `mermaid-init.js`. Requires the npm dependency from Step 1 and Hugo extended, both already in place.)

- [ ] **Step 4: Verify the bundle loads (no CDN)**

Load a page containing a `{{< mermaid >}}` diagram (e.g. an existing one — inventory listed 10). Devtools → Network: `mermaid-init.js` loads locally (200), **no** request to `cdn.jsdelivr.net`. Diagram renders.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json daprdocs/assets/js/mermaid-init.js daprdocs/layouts/_partials/hooks/body-end.html
git commit -m "build: bundle mermaid via Hugo Pipes (pinned, local, fingerprinted)"
```

---

### Task 16: Mermaid light/dark theming + re-render on toggle

**Files:**
- Modify: `daprdocs/assets/js/mermaid-init.js`
- Modify: `daprdocs/layouts/_partials/hooks/body-end.html` (hook the theme toggle)
- Modify: `daprdocs/assets/scss/_mermaid.scss`

**Interfaces:**
- Consumes: `window.__daprMermaidRender` (Task 15), Docsy's `data-bs-theme` toggle.

- [ ] **Step 1: Re-render diagrams when the theme changes**

Append to `mermaid-init.js`:

```js
// Re-render on Docsy theme toggle (data-bs-theme mutates on <html>).
const obs = new MutationObserver((muts) => {
  for (const m of muts) {
    if (m.attributeName === "data-bs-theme") { window.__daprMermaidRender(); break; }
  }
});
obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
```

- [ ] **Step 2: Container styling**

`_mermaid.scss`:

```scss
.mermaid { display:flex; justify-content:center; margin:1rem 0; background:var(--d-panel); border:1px solid var(--d-border); border-radius:var(--d-radius); padding:16px; overflow-x:auto; }
.mermaid svg { max-width:100%; height:auto; }
```

- [ ] **Step 3: Verify light/dark + toggle**

Load a mermaid page. Confirm the diagram uses light theme colors in light mode; toggle to dark → the diagram **re-renders** with dark colors (not just inverted). No console errors.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add daprdocs/assets/js/mermaid-init.js daprdocs/assets/scss/_mermaid.scss daprdocs/layouts/_partials/hooks/body-end.html
git commit -m "feat(mermaid): light/dark theming with re-render on toggle"
```

---

### Task 17: Diagram catalog (classification)

**Files:**
- Create: `docs/superpowers/diagram-catalog.md`

**Interfaces:**
- Produces: the authoritative list driving Tasks 18–19.

- [ ] **Step 1: Enumerate diagram images**

```bash
cd /Users/marcduiker/dev/dapr/docs
grep -rhoE '/images/[^")[:space:]]+\.(png|webp|svg)' daprdocs/content | sort -u > /tmp/imgs.txt
wc -l /tmp/imgs.txt
```

- [ ] **Step 2: Classify each into a table**

Create `docs/superpowers/diagram-catalog.md` with a table: `image path | referencing file(s) | type (diagram/screenshot/logo) | decision (mermaid | regenerate | keep) | notes`. Seed decisions from the spec §8.1 buckets (building-block / pubsub-pattern / service-invocation / dapr-agents-pattern / dapr-shared → **mermaid**; overview-*, buildingblocks-overview, security/secrets architecture, actors_background → **regenerate**; screenshots/logos → **keep**). Keep `regenerate` minimal.

- [ ] **Step 3: Verify the catalog covers every diagram**

Every path in `/tmp/imgs.txt` that is a diagram appears in the catalog with a decision. Screenshots/logos may be grouped.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/diagram-catalog.md
git commit -m "docs: diagram catalog and conversion decisions"
```

---

### Task 18: Convert mermaid-able diagrams (content carve-out)

**Files:**
- Modify: specific `daprdocs/content/**/*.md` diagram `<img>` lines ONLY (the single allowed carve-out)

**Interfaces:**
- Consumes: the mermaid rendering from Tasks 15–16. Process is iterative — one diagram (or one small content file) per commit so a reviewer can gate each.

- [ ] **Step 1: Pick the next `mermaid` row from the catalog**

Open the referencing markdown file; locate the exact `<img src="/images/<name>.png" ...>` line.

- [ ] **Step 2: Replace ONLY that line with a mermaid shortcode**

Author an equivalent diagram. Example (service-invocation flow):

````markdown
{{< mermaid >}}
flowchart LR
  A[checkout] -->|"invoke (dapr-app-id)"| S1[Dapr sidecar]
  S1 -->|mTLS + discovery| S2[Dapr sidecar]
  S2 --> B[order-processor]
{{< /mermaid >}}
````

Do not touch any other line in the file. (Confirm the `mermaid` shortcode sets `hasMermaid` — the existing one does.)

- [ ] **Step 3: Verify parity in both themes**

Load the page; the diagram conveys the same relationships as the original image, renders in light and dark, and re-renders on toggle. `git diff` shows only the single line swapped in that file.
Expected: PASS.

- [ ] **Step 4: Commit (one diagram or one file per commit)**

```bash
git add daprdocs/content/<path>.md
git commit -m "docs(diagram): convert <name> to themed mermaid"
```

- [ ] **Step 5: Repeat** Steps 1–4 for each `mermaid` row in the catalog.

---

### Task 19: Complex-diagram regeneration specs (agent catalogs; you/design produce images)

**Decision:** A coding agent cannot produce polished replacement PNGs. The agent therefore writes a **regeneration brief** per complex diagram; the actual image work is done by you/design. No image files are created by the agent in this task; content `<img src>` references stay unchanged (image files are later dropped in at the same paths).

**Files:**
- Create: `docs/superpowers/complex-diagram-briefs.md`

**Interfaces:**
- Consumes: the `regenerate` rows from the catalog (Task 17).

- [ ] **Step 1: For each `regenerate` row, view the current image and write a brief**

The agent can Read PNGs (the Read tool renders images). For each complex diagram, record in `complex-diagram-briefs.md`: image path; exact current dimensions (from the `<img width/height>`); what the diagram must convey (nodes, groupings, arrows, labels); the target style (Dapr palette, Geist labels, **theme-neutral**: transparent background + mid-tone strokes legible on both grounds); and any text that must remain accurate.

- [ ] **Step 2: Prioritize**

Order the briefs by visual impact (the most jarring legacy diagrams first) and mark a **minimal** must-do set vs nice-to-have, per the spec's "keep to a minimum".

- [ ] **Step 3: Verify coverage**

Every `regenerate` row in the catalog has a brief with dimensions + content description. Note explicitly that dropping a new PNG at the same path requires **no** content edit.
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/complex-diagram-briefs.md
git commit -m "docs: regeneration briefs for complex diagrams (design hand-off)"
```

---

## Phase 5 — Peripheral pages & partials

### Task 20: Search, 404, blog, banners, feedback, perf, print

**Files:**
- Modify: `daprdocs/assets/scss/_search.scss`, `_page-extras.scss`
- Modify (header comment + minimal restyle): `daprdocs/layouts/_partials/search-input.html`, `feedback.html`, `announcement-banner.html`, `cookie-banner.html`, `version-banner.html`, `shortcodes/dapr-perf-results.html`
- Possibly create: `daprdocs/layouts/404.html`, `daprdocs/layouts/blog/list.html`, `daprdocs/layouts/blog/single.html` (only if SCSS can't achieve it)

**Interfaces:**
- Consumes: tokens, cards. Each new override gets the header comment + `OVERRIDES.md` entry (Task 21).

- [ ] **Step 1: Search input + DocSearch modal (`_search.scss`)**

```scss
.td-search-input, .td-search__input, #docsearch .DocSearch-Button {
  background: var(--d-panel); border:1px solid var(--d-border); border-radius:7px; color: var(--d-body);
}
#docsearch .DocSearch-Button:hover { border-color: color-mix(in srgb, var(--d-muted) 40%, var(--d-border)); }
:root { --docsearch-primary-color: var(--d-blue); --docsearch-highlight-color: var(--d-blue); }
[data-bs-theme="dark"] { --docsearch-modal-background: var(--d-panel); --docsearch-text-color: var(--d-body); }
```

- [ ] **Step 2: 404**

If Docsy's inherited `404.html` looks acceptable after global styles, leave it (SCSS-only). If it needs brand structure, add `daprdocs/layouts/404.html` with the header comment, a large heading, a short message, and a `.d-card-grid` of top sections. Verify `/404.html` renders in both themes.

- [ ] **Step 3: Blog**

Apply global typography/cards to Docsy's inherited blog templates via SCSS. Override `blog/list.html`/`blog/single.html` only if the layout needs cards; blog is lightly used, keep changes minimal.

- [ ] **Step 4: Banners, feedback, perf-results**

Restyle announcement/cookie/version banners and the feedback thumbs and perf-results container through tokens (add rules to `_page-extras.scss`); reconcile each partial's header comment. Do not change banner scheduling logic.

- [ ] **Step 5: Print stylesheet**

Confirm `docs/list.print.html` output stays legible: ensure `@media print` doesn't inherit dark tokens (force light tokens in print). Add if missing:

```scss
@media print { :root { --d-ground:#fff; --d-body:#000; --d-heading:#000; --d-border:#ccc; } .td-sidebar, .td-toc, .td-navbar { display:none !important; } }
```

- [ ] **Step 6: Verify each peripheral page in both themes**

Load: search modal, `/404.html`, a blog post, a page with each banner, a perf page, and print-preview a docs page. Each is legible and on-brand.
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add daprdocs/assets/scss/_search.scss daprdocs/assets/scss/_page-extras.scss daprdocs/layouts/
git commit -m "style: search, 404, blog, banners, feedback, perf, print"
```

---

## Phase 6 — Documentation & QA

### Task 21: `OVERRIDES.md` index

**Files:**
- Create: `daprdocs/layouts/OVERRIDES.md`

**Interfaces:**
- Produces: the single audit surface for upgraders (spec §9).

- [ ] **Step 1: List every override**

Table: `file | shadows (Docsy v0.12.0 path) | risk tier (§9) | reason | reconcile notes`. Include every file under `daprdocs/layouts/` that shadows a Docsy layout (navbar, sidebar, footer, section-index, page-meta-links, search-input, feedback, version-banner, hooks/*, docs/list, plus any new 404/blog). Mark SCSS-only components as "no layout override".

- [ ] **Step 2: Verify completeness**

Cross-check against `git log`/`git status`: every forked layout touched in this plan appears in `OVERRIDES.md` with a Docsy source version and risk tier.
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add daprdocs/layouts/OVERRIDES.md
git commit -m "docs: OVERRIDES index with Docsy source versions and risk tiers"
```

---

### Task 22: QA matrix + upgrade-rehearsal diff

**Files:** none (verification + notes)

- [ ] **Step 1: Run the visual QA matrix**

For each page type — docs single, section/list, home, a tabpane-heavy quickstart, a mermaid page, blog, 404, search — check **light + dark** at desktop / tablet (~900px) / mobile (~380px):
- no horizontal page scroll; code/tab bars scroll internally;
- active states use the right accents (orange tab underline, blue sidebar/link, orange TOC marker, gold section accent);
- fonts are Geist/Inter (no FOUT to system fonts on reload);
- mermaid renders and re-renders on toggle.
Record results in `docs/superpowers/qa-<date>.md`.

- [ ] **Step 2: i18n spot check**

Load 2–3 `zh-hans` pages; confirm layout integrity (nav, sidebar, tabs, cards) in both themes.
Expected: PASS.

- [ ] **Step 3: Content-untouched audit**

```bash
git diff --stat origin/v1.18...HEAD -- daprdocs/content sdkdocs
```
Expected: the ONLY content changes are single-line `<img>`→mermaid swaps from Task 18. Any other content diff is a plan violation — revert it.

- [ ] **Step 4: Upgrade-rehearsal diff**

For each forked partial in `OVERRIDES.md`, diff against a fresh Docsy `v0.12.0` copy of the same file to confirm the fork delta is minimal and understood:

```bash
# example
git clone --depth 1 --branch v0.12.0 https://github.com/google/docsy /tmp/docsy
diff /tmp/docsy/layouts/_partials/navbar.html daprdocs/layouts/_partials/navbar.html || true
```
Record the delta size per file in `OVERRIDES.md`.
Expected: PASS — deltas are small and documented.

- [ ] **Step 5: Production build sanity via CI**

Push the branch; confirm the CI Hugo `0.147.9` build (`hugo --minify --disableKinds RSS,sitemap,taxonomy,term`) succeeds and the preview looks correct. (Local full build is known-broken; CI is authoritative.)
Expected: PASS.

- [ ] **Step 6: Commit QA notes**

```bash
git add docs/superpowers/qa-*.md daprdocs/layouts/OVERRIDES.md
git commit -m "docs: QA matrix results and upgrade-rehearsal deltas"
```

---

## Self-Review (author's check against the spec)

- **Spec coverage:** §2 tokens → Task 2/3; §3 constraints → Global Constraints + Task 18/19 (carve-out) + Task 22 audit; §5 architecture/SCSS restructure → Task 2; §6 every component → Tasks 4–14, 20 (each spec row maps to a task); §7 fonts → Task 3; §8 mermaid/diagrams → Tasks 15–19; §9 risk ladder/OVERRIDES → Task 21 + Task 12/9/10 header comments; §10 testing → Task 22; §11 deliverables → all; §13 phasing → phases here. No uncovered spec section.
- **Placeholder scan:** no "TBD/appropriate/etc." — every code step shows real SCSS/JS/Go-template. Iterative Tasks 18/19 intentionally repeat a defined process per catalog row (not a placeholder).
- **Type/name consistency:** tokens `--d-*` defined in Task 2 are used verbatim throughout; `.d-card`/`.d-card-grid`/`.c-*` defined in Task 13 and consumed in Task 14; `window.__daprMermaidRender` defined in Task 15 and consumed in Task 16; `hasMermaid` gate consistent with existing shortcode.
- **Known adaptation:** verification is build+visual (no unit harness) — stated up front; Task 1 secures the local preview, Task 22 Step 5 makes CI authoritative.






