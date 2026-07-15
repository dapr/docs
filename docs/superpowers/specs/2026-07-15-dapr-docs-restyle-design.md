# Dapr Docs Restyle — Design Spec

- **Date:** 2026-07-15
- **Status:** Draft for review
- **Owner:** Marc Duiker
- **Chosen direction:** "Structured" (dense, reference-grade, LangChain-like) with added Dapr brand color and a card-forward treatment for linked pages.
- **Approved visual references (mockups):**
  - [Workflow overview (Structured v2, cards + gold)](https://claude.ai/code/artifact/4e9d1f33-fe87-4010-85be-be8fe221c7cc)
  - [Service Invocation quickstart (Structured, nested code tabs)](https://claude.ai/code/artifact/7bf8b243-651d-4792-a49a-682397939fa9)

---

## 1. Goal

Modernize the look and feel of the Dapr documentation site (Docsy v0.12.0 on Hugo, consumed as a Hugo module) to match the approved "Structured" design: Geist headings, a clean body font, compact code/OS selectors, card-forward navigation instead of walls of text, and the Dapr brand palette — while keeping the site easy to maintain across Hugo and Docsy upgrades.

## 2. Palette & type (design tokens)

Derived from `daprdocs/assets/scss/_variables_project.scss` and the approved mockups.

| Token | Light | Dark |
|---|---|---|
| Primary (blue) | `#0D2192` | `#6f9fe8` |
| Secondary (sky) | `#3ea9f5` | `#3ea9f5` |
| Accent (orange) | `#ff4e00` | `#ff7a45` |
| Highlight (gold) | `#efca08` | `#f0d24a` |
| Ground | `#ffffff` | `#0b0e14` |
| Panel / subtle | `#f6f7f9` | `#12161f` |
| Border (hairline) | `#e3e6eb` | `#212838` |
| Muted text | `#5b6472` | `#8b95a7` |
| Body text | `#1c2330` | `#dfe4ee` |
| Heading text | `#0f1522` | `#ffffff` |

- **Headings / display:** Geist (self-hosted; see §7).
- **Body:** Inter (self-hosted).
- **Code / mono:** Geist Mono (self-hosted).
- **Accent usage:** blue for links & primary chrome; sky for active states; orange for the active code tab, primary CTAs, and hover chevrons; gold as a warm secondary highlight (card top-borders, section-accent rule, badges, info-callout border) — present but not dominant.

## 3. Constraints (non-negotiable)

1. **Content is (almost) untouched.** No edits to prose, headings, front-matter, or structure in `daprdocs/content/**` or the `sdkdocs/**` submodules. **Single carve-out:** a diagram `<img>` line may be replaced by a mermaid shortcode/code-fence (see §8). Nothing else in content changes.
2. **Styles + layouts only** otherwise — `daprdocs/assets/scss/**`, `daprdocs/layouts/**`, `daprdocs/static/**` (fonts, regenerated images, JS).
3. **Upgrade-safe.** The site must remain straightforward to upgrade for both Hugo and Docsy. Every layout we fork or override is documented with the upstream Docsy version it was taken from, and justified against the risk ladder in §9.
4. **Complete coverage.** Every layout the repo renders — including ones currently inherited from Docsy with no local file — is accounted for in this restyle (§6).
5. **Diagrams as code, themed.** Mermaid-able diagrams become mermaid (light + dark). Complex diagrams are regenerated as new-style images, kept to a minimum (§8).
6. **Versions.** Restyle against the currently pinned Hugo (extended, CI `0.147.9`) and Docsy `v0.12.0`. No Hugo/Docsy upgrade in this effort; we only make future upgrades safe.

## 4. Scope

**In scope:** core docs (single page, section/list, home), primary nav, sidebar, right-hand "On this page" TOC, breadcrumbs, pager, footer, search & 404, blog list/single, and all UI-producing shortcodes (`tab`/`tabpane`, `alert`, `button`, `card`/`cardpane`, `table`, `mermaid`, `dapr-perf-results`). Localized `zh-hans` pages must render correctly under the new styles. Both light and dark themes.

**Out of scope:** taxonomy/term pages (disabled via `disableKinds: [taxonomy]`); RSS/sitemap (disabled in production build); content rewrites; information-architecture / nav-tree restructuring; a Hugo or Docsy version upgrade; changes inside the `sdkdocs` submodules' content.

## 5. Architecture: how the design attaches to Docsy

**Principle: SCSS-first, override sparingly, extend at sanctioned points.** We climb the risk ladder (§9) only as far as each component demands, and no further.

Docsy v0.12.0 uses Hugo's current layout dirs (`_partials/`, `_shortcodes/`, `_markup/`) and Bootstrap 5.3 with `td-*` classes and a `data-bs-theme` color-mode system. We attach in four layers:

1. **SCSS variables** — set brand palette, fonts, radii, and spacing through Docsy's variable hooks so Bootstrap and Docsy compute the rest.
2. **Custom SCSS rules** — style Docsy's stable `td-*` / Bootstrap classes (`.td-navbar`, `.td-sidebar*`, `.td-content`, `.td-toc`, `.nav-tabs`, `.alert`, `.card`, `.btn`, `.pagination`) to achieve the Structured look. This is where the bulk of the work lives and where tab compaction, callouts, typography, and cards are delivered.
3. **Docsy extension hooks** — `_partials/hooks/head-end.html` (font preloads, theme-color meta) and `_partials/hooks/body-end.html` (mermaid theming JS, TOC scrollspy, any progressive enhancement). These are Docsy's designated injection points and already overridden here.
4. **Layout overrides** — only where the DOM the design needs cannot be produced by CSS on Docsy's markup (e.g. rendering section children as a card grid). Each override carries a header comment naming the Docsy v0.12.0 file and the reason.

### 5.1 Establish a clean SCSS structure (prerequisite)

Today `_variables_project.scss` exists, but `_variables_project_after_bs.scss` and `_styles_project.scss` do not, and `_content.scss` / `_nav.scss` are not on Docsy's auto-import path (their current load path must be confirmed — they may be dormant). We will:

- Keep **`_variables_project.scss`** for pre-Bootstrap variables: brand colors, `$font-family-sans-serif`, `$font-family-monospace`, heading font stack, `$border-radius*`, `$primary`/`$secondary`, and Docsy's dark-mode variable seeds.
- Add **`_variables_project_after_bs.scss`** for values that must win after Bootstrap defaults compute.
- Add **`_styles_project.scss`** as the single entry that `@import`s our partials in order: `variables` (tokens for CSS custom properties), `typography`, `navbar`, `sidebar`, `toc`, `content`, `code-tabs`, `cards`, `callouts`, `buttons`, `tables`, `footer`, `mermaid`, `search`, `page-extras`.
- Refactor the existing `_content.scss` / `_nav.scss` into that structure (rename/split as needed) so styling is deterministically imported and no rules are dormant.
- Express the palette as **CSS custom properties** scoped to Docsy's color-mode roots (`:root` / `[data-bs-theme="dark"]`) so both themes and mermaid read the same tokens.

### 5.2 Light/dark

Reuse Docsy's existing `theme-toggler` and Bootstrap `data-bs-theme`. We do **not** introduce a second toggle or a competing attribute. Our tokens redefine under `[data-bs-theme="dark"]`; mermaid re-renders on toggle (§8.3).

## 6. Component-by-component plan

Legend for **Mechanism**: `SCSS` (layer 1–2), `Hook` (layer 3), `Override` (layer 4, forks a Docsy file), `Owned` (already a local file we maintain).

| Component | Docsy source | Mechanism | Notes / design intent |
|---|---|---|---|
| Global typography | `.td-content`, headings | SCSS | Geist headings, Inter body, type scale from mockups; `text-wrap: balance` on headings. |
| Color palette / dark mode | Bootstrap vars, `data-bs-theme` | SCSS (vars) | Tokens + CSS custom properties; both themes. |
| Top navbar | `_partials/navbar.html` | **Owned override** | Already forked (logo SVG + announcement banner). Restyle compact, brand blue, search + version + theme toggle cluster. |
| Left sidebar | `_partials/sidebar.html` + `home.sidebarnav.html` + `js/sidebar-nav.js` | **Owned override** | Already forked (client-injected tree). Restyle spacing, active state (blue left-border), group labels. No behavior change. |
| Right "On this page" TOC | `toc.html` (inherited) + placement in `docs/single.html` | SCSS + Hook | Restyle `.td-toc` to the compact right rail; add scrollspy JS in `body-end` if Docsy's is insufficient. Prefer **no** `single.html` override. |
| Breadcrumbs | `breadcrumb.html` (inherited) | SCSS | Uppercase, letter-spaced, gold underline accent. Override only if markup blocks it. |
| Pager (prev/next) | `pager.html` (inherited) | SCSS | Restyle `.pagination` / Docsy pager to card-like prev/next. |
| Docs single page | `docs/single.html` (inherited) | SCSS (+ Hook) | Aim for SCSS-only. Highest-risk to override (§9) — avoid. |
| Section / list page | `docs/list.html` (**owned**) + `section-index.html` (**owned**) | **Owned override** | Deliver the card-forward experience: render child pages as a card grid from page metadata (title + description), no content edits. |
| Home page | Docsy `home` (inherited) | SCSS (+ Override if needed) | Restyle; add card grid via `section-index` reuse if the landing needs it. |
| Code / OS tabs | `tabpane` / `tab` (Docsy built-ins, 2,200+ uses) | **SCSS only** | Restyle `.nav-tabs`/`.nav-link`/`.tab-content` to the compact underline selector. Never fork the shortcode (usage too high; SCSS covers all at once). |
| Callouts | `alert` (Docsy built-in, 880+ uses) | SCSS | Restyle `.alert` variants to the design's info/warn callouts (gold/orange borders). |
| Buttons | `_shortcodes/button.html` (**custom**) | Owned + SCSS | Keep shortcode; restyle `.btn`/`.btn-tertiary` to the orange primary CTA. |
| Cards | `card`/`cardpane` (Docsy, SDK docs) | SCSS | Restyle `.card` to the design's card; reused by list/section overrides. |
| Tables | `_shortcodes/table.html` (**custom**) + Markdown tables | Owned + SCSS | Restyle `.td-content table`; keep striped/responsive behavior. |
| Component compat tables | `_partials/components/*.html` (**custom**, 11 files) | SCSS | Restyle to match new table styling. |
| Footer | `_partials/footer.html` (**owned**) | Owned override | Restyle to the quiet footer (helpful? + edit link + copyright). |
| Search | `search-input.html` (**owned**) + Docsy `search.html` (inherited) + Algolia | SCSS | Restyle input + DocSearch modal to brand. |
| 404 | `404.html` (inherited) | SCSS (+ Override if needed) | Brand the not-found page. |
| Blog list / single | `blog/*` (inherited) | SCSS (+ Override if needed) | Apply typography/cards; minimal, blog is lightly used. |
| Announcement / cookie banners | custom partials (**owned**) | Owned + SCSS | Restyle to brand. |
| Version / archived banner | `version-banner.html` (**owned**) | Owned + SCSS | Restyle. |
| Feedback widget | `feedback.html` (**owned**) | Owned + SCSS | Restyle thumbs UI. |
| Print / PDF | `docs/list.print.html` + `_partials/print/*` (inherited) | SCSS (print) | Ensure print stylesheet stays legible; low priority. |
| Perf results | `shortcodes/dapr-perf-results.html` (**custom**) | Owned + SCSS | Restyle chart container. |
| Mermaid | `shortcodes/mermaid.html` + `_partials/mermaid.html` (**custom**) + `body-end` | Owned + Hook | Pin version, add light/dark theming, re-render on toggle (§8). |

Every component above is covered; none is left to Docsy defaults unstyled.

## 7. Fonts (self-hosted)

- Self-host **Geist**, **Inter**, and **Geist Mono** (all OFL-licensed) as `woff2` under `daprdocs/static/fonts/` (or `assets/fonts/` piped through Hugo). No external font CDN (matches CSP posture and avoids a runtime dependency).
- Declare `@font-face` in a `_typography` SCSS partial; set Docsy/Bootstrap font variables in `_variables_project.scss` so all `td-*` text inherits them.
- Preload the primary weights in `hooks/head-end.html`.
- Note: CI deletes vendored Font Awesome/Bootstrap dirs from `themes/docsy` pre-build; our font assets live outside `themes/` and are unaffected.

## 8. Diagrams → mermaid (and complex-image regeneration)

### 8.1 Classification (from repo inventory)
- ~238 image references in content; ~82% are raw `<img>` tags with fixed `width`/`height`; all under `/images/`.
- Of ~90–110 true diagram images, roughly **40–55% are mermaid-able** (building-block flow/box diagrams, pub/sub patterns, service-invocation flows, dapr-agents workflow patterns, dapr-shared topologies) and **45–60% are complex** architecture diagrams mermaid can't cleanly reproduce.
- Deliverable: a **diagram catalog** (table of every diagram image → `mermaid` | `complex` | `keep-as-is`) reviewed before conversion.

### 8.2 Mermaid-able diagrams
- Because they are raw `<img>` tags (uninterceptable by render hooks), each is converted by **replacing that single `<img>` line** in content with a mermaid block (the sole content carve-out). Diagram source thus lives as code next to its content.
- Author each diagram to read well in both themes (neutral labels, semantic node classes mapped to CSS custom-property tokens).

### 8.3 Mermaid theming & robustness (shortcode/partial + `body-end`)
- **Bundle mermaid via Hugo Pipes** (decided). Add mermaid as an npm dependency, import/bundle it through Hugo's asset pipeline (`js.Build` / resources), and load the pinned, fingerprinted local asset instead of the unpinned `cdn.jsdelivr.net/npm/mermaid` import. This removes the runtime CDN dependency, pins the version deterministically, and matches the upgrade-safe goal.
- Initialize mermaid with a `theme` derived from the current `data-bs-theme`; supply light and dark theme variables mapped to our tokens.
- On theme toggle, **re-render** all diagrams (store each diagram's source, re-run `mermaid.render`). Wire this in `body-end.html` alongside the existing mermaid loader.
- Keep the existing `hasMermaid` page-store gate so pages without diagrams don't load mermaid.

### 8.4 Complex diagrams (regenerate as images — minimize)
- Listed explicitly in the catalog; regenerate in the new visual style.
- **No content edit needed:** replace the file at the existing `/images/...png` path (the `<img src>` in content is unchanged).
- To satisfy light/dark without per-theme swaps (which would need content edits), regenerate complex diagrams as **theme-neutral** assets (transparent background, mid-tone strokes/legible on both grounds). This avoids a dark-variant swap mechanism and keeps the effort minimal.
- Track the regeneration list; target the smallest set that removes the most visually jarring legacy diagrams first.

## 9. Upgrade-safety: the override risk ladder

The user's explicit concern: *what is the risk when layouts are customized/overridden?* Risk rises as we move down this ladder; we justify every step past SCSS.

| Layer | Example here | Upgrade risk | Why / mitigation |
|---|---|---|---|
| **1. SCSS variables** | palette, fonts, radii in `_variables_project*.scss` | **Very low** | Docsy-sanctioned; Bootstrap/Docsy var names are stable across minor versions. Mitigation: none needed beyond a build check. |
| **2. Custom SCSS on `td-*`/BS classes** | tabs, callouts, cards, typography, TOC | **Low** | Targets Docsy's public class contract. Risk: Docsy renames a class or restructures DOM (rare, usually announced). Mitigation: prefer semantic Docsy classes over deep descendant selectors; visual QA after upgrade. |
| **3. Extension hooks** | `hooks/head-end`, `hooks/body-end` | **Low** | Designated Docsy extension points. Risk: our fork drifts from upstream's copy of the same hook. Mitigation: keep hooks thin; document forked-from version. |
| **4a. Partial override (leaf)** | `navbar`, `sidebar`, `footer`, `feedback`, `search-input`, `version-banner`, `section-index`, `page-meta-links`, `docs/list` | **Medium** | Forking a partial freezes it. On upgrade you miss upstream fixes/features, and the fork may call partials/vars that were renamed or removed → build break or silent divergence. Mitigation: (a) header comment naming the Docsy v0.12.0 source; (b) fork minimally — keep upstream structure, change only what's required; (c) on each Docsy upgrade, diff our fork against the new upstream file and reconcile. |
| **4b. Base/orchestration override** | `baseof.html`, `docs/single.html` | **High** | These wire together many blocks/partials; Docsy changes them most and their blast radius is largest. Mitigation: **avoid** — achieve the goal via SCSS or a leaf partial/hook instead. Only override with an explicit note and an upgrade-diff checklist. |

**Specific risks to record in the plan:**
- The already-forked `hooks/body-end.html` and `hooks/head-end.html` bundle analytics/cookie/Algolia logic; adding mermaid-theming and font preloads is low-risk but grows a file that must be reconciled on upgrade.
- Unpinned mermaid CDN is a supply-chain and breakage risk today — pinning/bundling is part of this work.
- The client-injected sidebar (`home.sidebarnav.html` + `js/sidebar-nav.js`) copies Docsy's `sidebar-tree` recursion; on a Docsy upgrade that recursion may change — diff it.
- `tab`/`tabpane` restyle is SCSS-only precisely to avoid forking a shortcode used 2,200+ times.

**Maintainability convention (applies to every override):** each forked file begins with a comment: `Project override of Docsy vX.Y.Z <path> — reason: <...>. Reconcile against upstream on Docsy upgrade.` A short `daprdocs/layouts/OVERRIDES.md` index lists every override, its Docsy source version, and its risk tier, so an upgrader has one place to audit.

## 10. Testing & validation

- **Build sanity:** `hugo list` / `hugo --renderToMemory` (full local `hugo` build is known-broken due to PostCSS + node `--permission`; validate accordingly; rely on CI Hugo `0.147.9` for the real build).
- **Visual QA matrix:** representative page per type (single, section/list, home, quickstart with nested tabs, blog, 404, search) × light/dark × desktop/tablet/mobile.
- **Shortcode coverage:** a page exercising `tabpane`/`alert`/`button`/`card`/`table`/`mermaid`.
- **i18n:** spot-check `zh-hans` pages for layout integrity.
- **Mermaid:** verify light/dark render and re-render on toggle; verify `hasMermaid` gating.
- **Upgrade rehearsal (optional):** dry-run diff of each forked partial against a fresh Docsy `v0.12.0` checkout to confirm the fork delta is understood and documented.

## 11. Deliverables

1. SCSS: restructured `assets/scss/` (`_variables_project.scss`, `_variables_project_after_bs.scss`, `_styles_project.scss` + component partials) implementing the Structured design and both themes.
2. Self-hosted fonts (Geist, Inter, Geist Mono) + `@font-face` + head preloads.
3. Restyled owned overrides (navbar, sidebar, footer, list/section-index, feedback, search-input, version/announcement/cookie banners) with documented headers.
4. Card-forward section/list rendering from page metadata (no content edits).
5. Mermaid: bundled via Hugo Pipes (pinned, local, fingerprinted), light+dark themed, re-render-on-toggle; enhanced shortcode/partial.
6. Diagram catalog + converted mermaid-able diagrams (content `<img>`→mermaid, the one carve-out) + minimal set of regenerated complex images (theme-neutral).
7. `daprdocs/layouts/OVERRIDES.md` index with Docsy source version + risk tier per override.
8. Visual QA pass across the matrix in §10.

## 12. Open questions / assumptions

- **Mermaid delivery:** RESOLVED — bundle via Hugo Pipes (npm dependency, pinned, local, fingerprinted). See §8.3.
- **Card metadata:** section/list cards will use each child page's `title` + `description` front-matter. Assumption: descriptions are populated enough to make good cards; where missing, fall back to title-only (still no content edit — pages without a description simply render a leaner card).
- **Complex-image dark mode:** assumed theme-neutral regeneration (one asset per diagram). If per-theme variants are wanted, that needs a swap mechanism and possibly content edits — flag if desired.
- **`_content.scss` / `_nav.scss` current load path** to be confirmed during implementation (may be dormant); the restructure in §5.1 makes it deterministic regardless.

## 13. Implementation phasing (high level — detailed plan follows separately)

1. SCSS foundation: structure, tokens, fonts, dark-mode wiring (no visual regressions yet).
2. Core reading experience: typography, content, code tabs, callouts, tables, buttons.
3. Chrome: navbar, sidebar, TOC, breadcrumbs, pager, footer.
4. Card-forward section/list + home.
5. Mermaid theming + diagram catalog + conversions + complex-image regeneration.
6. Peripheral pages: search, 404, blog, banners, print.
7. `OVERRIDES.md`, QA matrix, upgrade-rehearsal diff.
