# Layout override index

This file is the audit index of every template under `daprdocs/layouts/`. Its
purpose is to give a future Hugo/Docsy upgrade **one place to check**: which
files shadow a Docsy layout (and therefore need to be diffed/reconciled
against the new upstream version), and which are wholly project-owned (no
Docsy equivalent, so an upgrade cannot silently break them by renaming or
restructuring an upstream file).

Every forked file also carries an inline header comment of the form
`Project override of Docsy vX.Y.Z <path> — reason: ... Reconcile against
upstream on Docsy upgrade.` This index just makes the full set visible in one
place, with a risk tier per the ladder in
[`docs/superpowers/specs/2026-07-15-dapr-docs-restyle-design.md` §9](../../docs/superpowers/specs/2026-07-15-dapr-docs-restyle-design.md#9-upgrade-safety-the-override-risk-ladder):

| Tier | Layer | Upgrade risk |
|---|---|---|
| 1 | SCSS variables (`_variables_project*.scss`) | Very low |
| 2 | Custom SCSS on `td-*`/Bootstrap classes | Low |
| 3 | Extension hooks (`hooks/head-end`, `hooks/body-end`) | Low |
| 4a | Partial override (leaf) | Medium |
| 4b | Base/orchestration override (`baseof.html`, `docs/single.html`) | High |

Tiers 1–2 have no layout override (SCSS only) and are covered by the SCSS
audit, not this file. **We have no Tier 4b overrides** — `baseof.html`,
`docs/baseof.html`, `docs/single.html`, `blog/*`, `search.html`, `taxonomy.html`
etc. are all untouched Docsy files (not present in `git ls-files
daprdocs/layouts`, confirmed against the Docsy v0.12.0 module cache).

## Docsy overrides (reconcile on upgrade)

Confirmed against the Docsy v0.12.0 module at
`~/Library/Caches/hugo_cache/modules/filecache/modules/pkg/mod/github.com/google/docsy@v0.12.0/layouts/`
— every path below exists there too, so ours **shadows** it.

| File | Shadows (Docsy v0.12.0 path) | Risk tier | Reason forked | Reconcile-on-upgrade notes |
|---|---|---|---|---|
| `_partials/navbar.html` | `layouts/_partials/navbar.html` | 4a | Inline logo SVG, announcement-banner include, theme toggle | Diff against upstream `navbar.html`; re-apply our logo swap + `{{ partial "announcement-banner.html" . }}` + theme-toggle markup on top of any upstream navbar restructuring. |
| `_partials/sidebar.html` | `layouts/_partials/sidebar.html` | 4a | Renders an empty `#td-section-nav` container instead of serializing the full nav tree per page; tree is rendered once (see `home.sidebarnav.html`) and injected client-side by `js/sidebar-nav.js` | Diff against upstream `sidebar.html` for new sidebar features/markup (e.g. new `data-*` attributes, search-box changes) and re-apply the "empty container + client fetch" pattern on top. The `noscript` fallback list must stay in sync with upstream's server-rendered tree markup. |
| `_partials/footer.html` | `layouts/_partials/footer.html` | 4a | Custom link layout (user/developer icon columns + copyright/about center column), analytics/Scarf pixel scripts; uses raw Bootstrap utilities instead of Docsy's `.td-footer` structure | Diff against upstream `footer.html`/`footer/*.html` partials for structural or accessibility changes; re-apply the icon-column layout and pixel scripts. Colors are re-tokenized in `_footer.scss` (Task 12) — verify new upstream classes still map to our tokens. |
| `_partials/section-index.html` | `layouts/_partials/section-index.html` | 4a | Card-forward section landing page (uses page `title`+`description` front matter to render cards instead of Docsy's plain link list) | Diff against upstream for new front-matter fields or list-building logic (e.g. new weight/sort handling) and re-apply the card markup on top. |
| `_partials/page-meta-links.html` | `layouts/_partials/page-meta-links.html` | 4a | Legacy fork predating this restyle's header-comment convention (no `Project override` header). Diverges from current upstream in: variable names (`$pathFormatted` vs `$path`), issue URL scheme (`issues/new/choose` vs `issues/new`), icon classes (`fa`/`fab` vs `fa-solid`), missing `td-page-meta--view`/`--child` links and `td-page-meta__*` BEM classes that upstream added | **Needs attention now, not just at upgrade time**: this file has drifted furthest from upstream of any override (see diff taken during this audit). Recommend re-forking from the current Docsy `page-meta-links.html` and re-applying only the intentional local differences (if any are still wanted), and adding the standard header comment. |
| `_partials/search-input.html` | `layouts/_partials/search-input.html` | 4a | Adds the `#docsearch` mount point used by Algolia DocSearch (loaded from `hooks/body-end.html`) | Diff against upstream for markup/attribute changes to the search input; re-apply the `#docsearch` mount point. Input/button/modal styles are tokenized in `_search.scss`. |
| `_partials/feedback.html` | `layouts/_partials/feedback.html` | 4a | Feedback widget is fully disabled (entire body commented out), diverging from Docsy's always-on default | Diff against upstream to see if the widget's markup/logic changed; if the widget is ever re-enabled, re-apply on top of the new upstream version. Styles are pre-staged in `_page-extras.scss`. |
| `_partials/version-banner.html` | `layouts/_partials/version-banner.html` | 4a | Custom archived-version copy plus an added preview-feature banner (Docsy's version only covers the archived-version case) | Diff against upstream for changes to the archived-version condition/copy; re-apply the preview-feature banner addition. Banner look (`.pageinfo`) tokenized in `_page-extras.scss`. |
| `_partials/hooks/head-end.html` | `layouts/_partials/hooks/head-end.html` | 3 | Designated (empty) Docsy extension point; we inject font preloads, the pre-paint dark-mode flash-guard script, cookie-banner CSS, Reo analytics (consent-gated), Algolia DocSearch CSS, and announcement-banner CSS | Upstream hook is an empty file, so there is nothing to diff — no drift risk. Reconcile task is instead: periodically check whether newer Docsy versions add native support for any of these (e.g. built-in dark-mode flash guard, Algolia integration) that would let us shrink this file. Keep the hook thin. |
| `_partials/hooks/body-end.html` | `layouts/_partials/hooks/body-end.html` | 3 | Designated (empty) Docsy extension point; we inject the theme-toggle script bundle, Algolia DocSearch JS, mermaid init, cookie-banner + announcement-banner + sidebar-nav + TOC-scrollspy + heading-anchor-copy scripts | Same as `head-end.html`: upstream hook is empty, no drift risk. Watch for new Docsy-native equivalents (Docsy already ships its own `js/click-to-copy.js`, which is why we removed our redundant copy-button script — check for similar overlap on each upgrade, e.g. Docsy's own mermaid/TOC support). |
| `docs/list.html` | `layouts/docs/list.html` | 4a | Card-forward section landing (`docs` section equivalent of `section-index.html`) | Diff against upstream `docs/list.html` for changes to how it composes `_td-content.html`/pagination/section listing; re-apply the card grid on top. |
| `404.html` | `layouts/404.html` | 4a | Brand heading + short message + a `.d-card-grid` of top-level sections in place of Docsy's bare "Not found" text | Diff against upstream `404.html` (usually tiny) and re-apply the card grid + copy. |

## Custom files (no Docsy equivalent — considered, no reconciliation needed)

Checked against the Docsy v0.12.0 module cache; none of these paths exist
there, so there is no upstream file to reconcile against on a Hugo/Docsy
upgrade. Listed here so the reader knows they were audited, not overlooked.

- `_partials/announcement-banner.html` — site-wide announcement banner, included from our `navbar.html` override.
- `_partials/cookie-banner.html` — cookie-consent banner markup.
- `_partials/mermaid.html` — mermaid render partial (see Diagrams, spec §8).
- `_partials/components/*.html` (`bindings`, `componenttoc`, `configuration-stores`, `conversation`, `cryptography`, `description`, `locks`, `middleware`, `name-resolution`, `pubsub`, `secret-stores`, `state-stores`) — Dapr components-reference table/TOC partials, all Dapr-content-specific.
- `home.sidebarnav.html` — **project addition**, not a Docsy path (there is no `home.sidebarnav.html` in Docsy). Renders the client-fetched sidebar tree once per language via a custom `SidebarNav` output format. **Caveat:** its recursion (`dapr-sidebar-nav-section` define) is a renamed copy of Docsy's `layouts/_partials/sidebar-tree.html` (`section-tree-nav-section`), per its own header comment and per spec §9's explicit call-out. It has no Docsy path to "shadow," but on a Docsy upgrade its copied recursion logic should still be diffed against the new `sidebar-tree.html` for behavioral drift (e.g. new front-matter flags, truncation logic, translation handling).
- `_shortcodes/button.html`, `_shortcodes/dapr-latest-version.html`, `_shortcodes/partial.html`, `_shortcodes/table.html` — Dapr-specific shortcodes; none shadow a same-named Docsy shortcode.
- `shortcodes/dapr-perf-results.html`, `shortcodes/mermaid.html` — same as above (legacy `shortcodes/` dir alongside `_shortcodes/`). Note `shortcodes/mermaid.html` and `_partials/mermaid.html` currently have identical bodies; worth a follow-up dedupe but out of scope for this audit.

## SCSS-only components (no layout override)

Tabs, callouts, tables, cards, typography, and Chroma code-highlighting are
restyled entirely via SCSS on Docsy's public `td-*`/Bootstrap class contract
(Tier 1–2 in the ladder above: variables and `td-*` class targeting). They do
not fork any `.html` layout — the shortcodes rendering them (`_shortcodes/tab.html`,
`_shortcodes/tabpane.html`, `_shortcodes/card.html`, `_shortcodes/cardpane.html`,
`_shortcodes/alert.html`, etc.) are unmodified Docsy files, confirmed absent
from `git ls-files daprdocs/layouts`. They need no per-file reconciliation on
a Docsy upgrade — only the usual visual QA pass (spec §10) to confirm the
targeted classes still exist and render as expected.
