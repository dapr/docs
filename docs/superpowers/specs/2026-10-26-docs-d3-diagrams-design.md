# Replace the Overview and Concepts diagram images with D3-drawn SVG

Design document for [dapr/docs#5446](https://github.com/dapr/docs/issues/5446).

Status: approved design, not yet planned.
Target branch: `v1.19`.

## Intent

The docs draw their diagrams as PNGs. Nobody can review a PNG, nobody can
update one without the original design file, and the colors are baked in, so
every diagram stays light even though the site now has a dark-mode toggle.

dapr.io solved this for its homepage: diagrams are D3 code, shipped as SVG,
styled from the theme. It left behind a skill, `d3-2d-diagrams`, that records
the shape vocabulary and the rules that keep diagrams looking like one set.

This work brings that approach to the docs and uses it on the two sections a
new reader hits first: Overview and Concepts. When it is done, those pages'
diagrams are code in this repo, they match each other and the homepage, they
follow the dark-mode toggle, and they are sharp at any zoom.

### Why these pages

They are the front door. They are also the densest concentration of true
architecture diagrams in the docs: 24 of them across 13 pages, with no UI
screenshots or terminal captures mixed in, so the whole set converts cleanly
with no judgment calls about what qualifies.

## Goals

- All 24 diagrams on `overview.md` and `concepts/**` are drawn from code
  committed to this repo.
- The 24 look like one set, and like the dapr.io homepage diagrams.
- They follow the site's dark-mode toggle.
- They are SVG: sharp at any zoom and size, with real text that screen readers
  read and browsers find.
- The `d3-2d-diagrams` skill lives in this repo, adapted to it, so the next
  diagram matches without anyone rediscovering the rules.
- Playwright covers them, so a rendering or layout regression fails CI.

## Non-goals

- Converting diagrams outside these 13 pages. The rest of the docs keep their
  images; this work only has to not break them.
- Deleting any image file. See Constraints.
- Animation of any kind.
- Touching the Chinese translation.
- Rewriting prose that the diagrams do not touch. Prose *is* in scope where a
  diagram's corrected content makes a sentence wrong; see decision 10.

## Anti-goals

These would make the work a failure even if every diagram rendered:

- **24 diagrams in 24 styles.** Consistency is the point. A diagram that is
  technically SVG but visually its own thing has not been converted.
- **Client-side JavaScript on content pages.** Explicitly rejected; see
  Decisions.
- **A committed SVG that no longer matches its scene source.** The moment the
  artifact and the code can drift silently, the "easy to update, easy to
  review" benefit is gone. CI must make this impossible.
- **A broken page anywhere else in the docs**, English or Chinese, because an
  image was moved or removed.

## Constraints

### The PNG files must stay on disk

The issue's task list ends with "remove image files that are no longer used."
That does not apply to this scope. Of the 24 images:

- **22 are referenced by `translations/docs-zh`**, a submodule pinned to
  `v1.15_content`. We do not control that repo and are not updating it. Its
  pages reference `/images/...` and must keep resolving.
- **7 are also used by English pages outside this scope:**

  | Image | Also used by |
  | --- | --- |
  | `concepts-building-blocks.png` | `develop-components/pluggable-components/pluggable-components-overview.md` |
  | `dapr-agents/concepts-agents-overview.png` | `developing-ai/dapr-agents/dapr-agents-introduction.md` |
  | `observability-app-health.webp` | `operations/resiliency/health-checks/app-health.md` |
  | `observability-tracing.png` | `operations/observability/tracing/tracing-overview.md` |
  | `overview-kubernetes.png` | `operations/hosting/kubernetes/kubernetes-overview.md` |
  | `scheduler/scheduler-architecture.png` | `developing-applications/building-blocks/jobs/jobs-overview.md` |
  | `security-mTLS-dapr-system-services.png` | `operations/resiliency/health-checks/sidecar-health.md` |

So this work **adds** diagrams to 13 pages and leaves `daprdocs/static/images`
untouched. Removing the PNGs becomes possible only once the remaining pages
convert and the zh submodule moves; that is a separate job.

Third parties may also hotlink `docs.dapr.io/images/...`, which is a further
reason not to delete. Nobody has audited this and nobody needs to for this work.

### Environment

- Hugo 0.147.8 extended, pinned, with Docsy as a Hugo module.
- `daprdocs/assets` mounts to `assets`, so `resources.Get` reaches anything put
  there. `daprdocs/static` mounts to `static`.
- Playwright 1.56.1 is already a dev dependency, with `tests/layout.spec.js`
  and `npm run test:layout`. The diagram spec joins that harness; it does not
  introduce one.
- The site has a **manual** dark-mode toggle: `daprdocs/assets/js/theme-toggle.js`
  flips `data-bs-theme` on `<html>` and persists to `localStorage`, with an
  inline no-flash script in `layouts/_partials/hooks/head-end.html`. Design
  tokens are CSS custom properties in `daprdocs/assets/scss/_tokens.scss`
  (`--d-blue`, `--d-sky`, `--d-orange`, `--d-panel`, `--d-border`, `--d-muted`,
  `--d-body`, and so on), redefined under `[data-bs-theme="dark"]`.
- Diagrams are currently embedded as raw HTML in Markdown, for example
  `<img src="/images/overview.png" width=1200 style="padding-bottom:15px;">`.

## Decisions

Decided by the maintainer:

1. **Scope is `overview.md` plus everything under `concepts/`** — 13 pages,
   24 unique diagram images. Done means those are converted.
2. **Every diagram is a still.** No animation, no pause button, no
   reduced-motion variant. The skill's Motion section, the timing helpers and
   the smoothness tooling are all out.
3. **Build-time SVG, no client JavaScript.** Scenes are code; an export step
   renders each to SVG; a shortcode inlines the SVG into the page. The browser
   never runs the engine. The SVG is the artifact, not a fallback — there is
   nothing to drift, nothing to download twice, no blank frame before scripts
   draw, and the diagrams survive print and reader modes.
4. **Redraw in the dapr.io wireframe style**, keeping each diagram's
   information and message but rebuilding it with the skill's vocabulary. A
   close trace of the existing layouts was considered and rejected: it would
   have produced an easier PR and missed the point.
5. **Target `v1.19`**, the live branch, upmerging to `v1.20` as usual.
10. **Correct the content, do not just restyle it.** Every diagram is
    fact-checked against current Dapr behaviour and signed off by a maintainer
    with subject knowledge before it merges. Two are already known to need it:
    - `security-threat-model.png` is a raw draw.io export. Its grid background
      is still visible, every green label box contains a broken-image
      placeholder, three group titles carry one too, and "Dapr Microservice
      Service B" is clipped at the frame edge. It cannot be reproduced
      faithfully because what it shows today is broken.
    - `overview-vms-hosting.png` puts Consul on all three VMs for DNS name
      resolution, which needs checking against what Dapr recommends now. It
      also colors App B yellow, which the skill forbids outright.

    Where a correction makes the surrounding prose wrong, the prose changes
    with it.
11. **Keep every brand mark.** All vendor and language logos survive the
    redraw, sourced as official files per the skill, each with a row in an
    icons README recording source and license. `overview.png` alone carries
    twelve: Node, Python, .NET, Go, Java, C++, PHP, Rust, Azure, AWS, Google
    Cloud and Kubernetes. Full-color marks are exempt from the CSS-variable
    rule in decision 6 and instead need a neutral plate that holds up on both
    `--d-ground` values.
12. **Phone legibility stays at parity with today.** One layout per scene at
    its natural aspect ratio, `max-width: 100%`. Readers zoom, as they do now,
    but the SVG stays sharp when they do.
13. **Every diagram is signed off individually** before it merges. Batches are
    small and the schedule is paced by review availability.

Decided during design, as my call:

6. **Colors are CSS custom properties, not hex.** The website engine hardcodes
   `C` and `APP` and assumes a `#FDFDFD` tile. Here, every stroke and fill
   emits `var(--d-*)` so the inlined SVG re-themes instantly when the toggle
   flips, with no JavaScript and no second copy of the diagram. This is the
   single largest adaptation of the engine and the reason decision 3 works at
   all. It also removes the need for `mix()` and `grow.paint()`, which only
   existed for animated color transitions.
7. **A shortcode, not a partial.** The website calls a partial from its
   homepage layout. Docs diagrams sit in Markdown body text, so authors need
   `{{< diagram name >}}`. The repo already has `daprdocs/layouts/shortcodes/`.
8. **Exported SVGs live in `daprdocs/assets/diagrams/`**, not `static/`, so the
   shortcode can `resources.Get` them and Hugo fingerprints and minifies them
   as part of the build.
9. **The skill lives at `skills/d3-2d-diagrams/`** in the repo root, matching
   the website's convention of a generic `skills/` folder rather than a
   Claude-specific one.
14. **No D3, and no DOM, in the export path.** With nothing animating and
    nothing running in the browser, `d3-selection`'s reason to exist (mutating
    a live DOM) is gone and `d3-timer`'s with it. The engine builds a plain
    element tree and serializes it, in Node, with no dependencies. The scene
    *shape* of the website's engine is kept so the skill still describes
    reality; its D3 plumbing is not.
15. **Tests are structural, not pixel baselines.** This repo has a stated
    position against screenshot diffs (`playwright.config.js`, the header of
    `tests/layout.spec.js`), and here it holds for a second reason: the SVG is
    committed, so a moved arrow already shows up as a reviewable diff in the
    PR. A snapshot harness would be a second copy of that signal with
    per-platform baselines to manage. The Playwright spec asserts presence,
    `<title>`/`<desc>`, expected labels, no overflow, and that token colors
    resolve in both themes.

### Where the skill comes from

`dapr/website` at commit `b63be76d4d7e1cae589159ad65647128b95d791b` (the merge
of PR #196, 2026-10-26), path `skills/d3-2d-diagrams/`. It is not in any local
`dapr-website` checkout on this machine; those forks predate it. Six files:

| File | sha256 |
| --- | --- |
| `SKILL.md` | `d0b63dafb0e5068145a8c216e696387c55201e7da8aea2e83f18bc3ebeea52de` |
| `reference/engine.md` | `641e3c9ab509caa5deaf1ddd06fc669b7ce743c9239d63ca77b0ccdfd0232869` |
| `scripts/lib.mjs` | `fc8bf44f4417732d04f72613e604defc92f21b3ef3fe07445770f2cf74b82378` |
| `scripts/scene-frames.mjs` | `366f8d21b9082d8a79a408772bd660f666bfd65f710ded27e9737d7395aacb7e` |
| `scripts/smoothness.mjs` | `9b773ec3c0ae6238e5a75468295cd78a740fae436bc2fdc3d7cb1b3c5700ff19` |
| `scripts/video-frames.sh` | `6f85ef9c234c30639e1b36e206e5de07b9232532938a28fccb6cf42eb2162eb6` |

## Shape of the solution

```
skills/d3-2d-diagrams/          ported and adapted from dapr/website
  SKILL.md
  reference/engine.md

diagrams/                       scene sources, one module per diagram
  engine.mjs                    shapes, CSS-variable color names, label()
  scenes/overview.mjs
  scenes/building-blocks.mjs
  ... 24 in total
  export.mjs                    renders every scene to SVG

daprdocs/assets/diagrams/       generated, committed
  overview.svg
  ... 24 in total

daprdocs/layouts/shortcodes/diagram.html
daprdocs/assets/scss/           a block for .dapr-diagram sizing

tests/diagrams.spec.js          Playwright, alongside layout.spec.js
```

Page markup goes from:

```html
<img src="/images/overview.png" width=1200 style="padding-bottom:15px;">
```

to a shortcode call naming the scene.

## What is left to the builder

Decide and own these; none of them change what the work is for.

- **How CI enforces that committed SVGs match their scenes.** Re-export and
  diff is the obvious approach; the mechanics are yours.
- **Canvas sizes.** The website fixes 600x480 for value props. These diagrams
  replace images of varying aspect ratio displayed at `width=1200`. Per the
  skill's own rule, give each canvas the shape of what it replaces and never
  display it larger.
- **The neutral plate for full-color marks.** Decision 11 requires one; its
  shape, padding and whether it is drawn at all in light mode are yours.
- **Accessibility details.** Each diagram needs a title and a description. The
  skill specifies this; wiring it through the shortcode is yours.
- **Dark-mode review.** Every diagram has to be looked at in both themes. The
  `--d-*` tokens are not simple inversions; `--d-blue` goes from `#0D2192` to
  `#6f9fe8`, so contrast has to be checked, not assumed.
- **Who the subject-matter reviewer is per diagram**, and how the fact-check
  for decision 10 is recorded. Security and the `dapr-services` pages likely
  need different people.

## The 24 diagrams

| Page | Images |
| --- | --- |
| `overview.md` | `overview.png`, `building_blocks.png`, `overview-sidecar-model.png`, `overview-standalone.png`, `overview-kubernetes.png`, `overview-vms-hosting.png`, `dapr-agents/concepts-agents-overview.png` |
| `concepts/building-blocks-concept.md` | `concepts-building-blocks.png`, `building_blocks.png` |
| `concepts/components-concept.md` | `concepts-components.png` |
| `concepts/observability-concept.md` | `observability-tracing.png`, `observability-sidecar.png` |
| `concepts/resiliency-concept.md` | `resiliency_diagram.png`, `observability-app-health.webp`, `sidecar-health.png` |
| `concepts/security-concept.md` | `security-end-to-end-communication.png`, `security-mTLS-sentry-selfhosted.png`, `security-mTLS-sentry-kubernetes.png`, `security-mTLS-dapr-system-services.png`, `security-dapr-API-scoping.png`, `security-overview-capabilities-example.png`, `security-threat-model.png` |
| `concepts/dapr-services/sidecar.md` | `overview-sidecar-apis.png`, `overview-sidecar-model.png` |
| `concepts/dapr-services/scheduler.md` | `scheduler/scheduler-architecture.png` |
| `concepts/dapr-services/sentry.md` | `security-mTLS-sentry-selfhosted.png`, `security-mTLS-sentry-kubernetes.png` |
| `concepts/faq/service-mesh.md` | `service-mesh.png` |

`building_blocks.png`, `overview-sidecar-model.png` and the two
`security-mTLS-sentry-*` images each appear on two in-scope pages: one scene,
two call sites.

`concepts/_index.md`, `concepts/configuration-concept.md`,
`concepts/isolation-concept.md`, `concepts/terminology.md`,
`concepts/dapr-services/_index.md`, `operator.md`, `placement.md`,
`sidecar-injector.md`, `concepts/faq/_index.md` and `concepts/faq/faq.md`
contain no diagrams.

## Done

- All 24 render as inlined SVG on the 13 pages, in both themes.
- Each of the 24 has been fact-checked and individually signed off.
- Every brand mark present today is still present, from an official file, with
  a licensing row in the icons README.
- No JavaScript is shipped for them.
- `daprdocs/static/images` is unchanged and every other page in the repo,
  English and Chinese, still renders.
- Re-exporting produces no diff; CI fails if it would.
- `npm run test:layout` passes, including the new diagram spec.
- `skills/d3-2d-diagrams/` describes the engine and conventions as they
  actually are in this repo.
