# Overview and Concepts D3 Diagrams Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 24 diagram images on `overview.md` and `concepts/**` with themed, fact-checked SVG diagrams generated from code committed to this repo.

**Architecture:** Scenes are ES modules that build a plain element tree; a Node exporter serializes each to an SVG file committed under `daprdocs/assets/diagrams/`; a Hugo shortcode inlines that SVG into the page. Colors are emitted as `var(--d-*)` so diagrams follow the site's `data-bs-theme` toggle with no JavaScript. Full-color brand marks are exempt and sit on a neutral plate. Nothing ships to the browser but the SVG itself.

**Tech Stack:** Node 22+ (ESM, no dependencies), `node --test`, Hugo 0.147.8 extended + Docsy, Playwright 1.56.1 (already present).

**Spec:** `docs/superpowers/specs/2026-10-26-docs-d3-diagrams-design.md`

## Global Constraints

- Target branch `v1.19`. Upmerge to `v1.20` as usual.
- **No runtime JavaScript.** Nothing in `daprdocs/assets/js/` gains a diagram file, and no `<script>` is emitted by the shortcode.
- **No new production dependencies.** The engine and exporter use Node built-ins only. No D3, no jsdom, no SVG library.
- **Every color is `var(--d-*)`**, except inside a vendor brand mark. Never a literal hex in a scene.
- **Never yellow.** `overview-vms-hosting.png` uses it today; it does not survive.
- App hexagon colors in order: `--d-sky`, `--d-blue`, `--d-teal`, `--d-orange`. Beyond four apps, color by role.
- Labels never smaller than 11px. Everything visible stays at least 10px inside the viewBox.
- `daprdocs/static/images/` is never modified or deleted from.
- Diagram `<desc>` copy contains no em dashes or en dashes, matching site copy rules.
- Brand marks are official files, unmodified, each with a row in `daprdocs/assets/icons/README.md` recording source and license.
- Exported SVG is deterministic: the same scene source always produces byte-identical output.
- Line numbers in this plan are from the branch point and drift as pages change. When swapping a page, match on the `src="/images/<file>"` string, never the line number.

## Review Focus

Input classes the spec implies but which no task's happy path exercises. Each has its test pinned to the task that owns the code.

- **Label text containing `&`, `<` or `>`** reaches the serializer unescaped and produces invalid XML that Hugo inlines into the page. Owned by Task 2.
- **A scene referencing an icon that does not exist** should fail the export loudly, not emit a blank hole or the string `undefined` (a trap the website skill records hitting). Owned by Task 4.
- **Narrow viewports (320–412px).** This repo shipped a mobile layout regression in #5443; an inline SVG with an intrinsic width is exactly the shape of element that overflows. Owned by Task 6.
- **`forced-colors` / high-contrast mode**, where CSS custom properties may not apply and a diagram can collapse to invisible. Owned by Task 6.
- **The out-of-scope pages and the `docs-zh` submodule** still resolving their PNGs after conversion. Owned by Task 8.

---

## File Structure

```
skills/vector-2d-diagrams/            Task 1 copies verbatim, Task 12 adapts
  SKILL.md
  reference/engine.md
  scripts/

diagrams/
  engine.mjs                      element tree, serializer, color tokens   (Task 2)
  shapes.mjs                      hex, arrow, cylinder, panel, tile, ...   (Task 3)
  icons.mjs                       brand-mark loader and plate              (Task 4)
  scenes/<name>.mjs               one per diagram                          (Tasks 9-11)
  scenes/index.mjs                the registry the exporter walks
  export.mjs                      CLI: write SVGs, or --check              (Task 5)

daprdocs/assets/diagrams/<name>.svg    generated, committed
daprdocs/assets/icons/<mark>.svg       vendored brand marks                (Task 4)
daprdocs/assets/icons/README.md        source + license per mark           (Task 4)
daprdocs/layouts/shortcodes/diagram.html                                   (Task 6)
daprdocs/assets/scss/_diagrams.scss                                        (Task 6)

tests/diagrams.spec.js            Playwright, structural                   (Task 7)
diagrams/*.test.mjs               node --test, colocated                   (Tasks 2-5)
```

---

### Task 1: Vendor the skill from dapr/website

Copied verbatim first, adapted last (Task 12). The adapted version must describe paths that do not exist until Tasks 2–7 land, so adapting now would mean writing fiction and correcting it later.

**Files:**
- Create: `skills/vector-2d-diagrams/` (6 files, verbatim)
- Create: `skills/vector-2d-diagrams/UPSTREAM.md`
- Test: `skills/vector-2d-diagrams/upstream.test.mjs`

**Interfaces:**
- Produces: the skill text that Tasks 3, 4 and 9–11 follow for shape vocabulary, color order, icon policy and accessibility rules.

- [ ] **Step 1: Write the failing test**

`upstream.test.mjs` reads `UPSTREAM.md`'s checksum table and asserts each listed file's sha256 matches:

```js
test('vendored skill files match the pinned upstream checksums', ...)
test('UPSTREAM.md names the pinned commit b63be76d4d7e1cae589159ad65647128b95d791b', ...)
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test skills/vector-2d-diagrams/upstream.test.mjs`
Expected: FAIL, no such file or directory.

- [ ] **Step 3: Copy the six files**

From `dapr/website@b63be76d4d7e1cae589159ad65647128b95d791b`, path `skills/vector-2d-diagrams/`: `SKILL.md`, `reference/engine.md`, `scripts/lib.mjs`, `scripts/scene-frames.mjs`, `scripts/smoothness.mjs`, `scripts/video-frames.sh`. Byte-for-byte, no edits.

- [ ] **Step 4: Write `UPSTREAM.md`**

The source repo, the pinned commit, the date, and the sha256 table from the spec's "Where the skill comes from" section. One line stating the files are unmodified and that Task 12 adapts them.

- [ ] **Step 5: Run the test**

Run: `node --test skills/vector-2d-diagrams/upstream.test.mjs`
Expected: PASS.

---

### Task 2: Engine core

**Files:**
- Create: `diagrams/engine.mjs`
- Modify: `daprdocs/assets/scss/_tokens.scss`
- Test: `diagrams/engine.test.mjs`, `diagrams/tokens.test.mjs`

`_tokens.scss` today defines `--d-blue`, `--d-sky`, `--d-orange`, `--d-gold`, `--d-ground`, `--d-panel`, `--d-border`, `--d-muted`, `--d-body`, `--d-heading`, `--d-link`, `--d-active`, `--d-code-bg`, `--d-on-accent`, `--d-on-sky`, `--d-success` and `--d-danger`. The skill's palette also needs teal, mint, red, lavender, grey and a caption color, and none of those exist. `C` cannot reference tokens that are not defined, so this task adds them.

**Interfaces:**
- Produces:
  - `el(tag, attrs = {}, children = []) -> Node` — children may be nodes or strings
  - `text(content) -> Node` — a text node, escaped on serialize
  - `serialize(node) -> string` — deterministic; attributes in insertion order
  - `svg({ width, height, title, desc, children }) -> string` — a complete document with `<title>` and `<desc>` wired to `role="img"` and `aria-labelledby`
  - `C` — frozen map of token name to `var(--d-*)` string, e.g. `C.navy === 'var(--d-blue)'`
  - `APP` — frozen 4-element array of `{ stroke, fill }`, in the order sky, blue, teal, orange

- [ ] **Step 1: Write the failing tests**

```js
test('serialize escapes & < > in text content')              // "A & B" -> "A &amp; B"
test('serialize escapes " and & in attribute values')
test('serialize emits attributes in insertion order')        // determinism
test('svg() sets role=img and aria-labelledby matching the title and desc ids')
test('C exposes only var(--d-*) strings, never a hex literal')
test('APP has 4 entries in sky, blue, teal, orange order')
```

And in `tokens.test.mjs`, the guard that keeps the two files honest:

```js
test('every token C references is defined in _tokens.scss')
test('every diagram token is defined under [data-bs-theme="dark"] too')
```

The escaping tests are the Review Focus item for this task: a label reading `Publish & Subscribe` must not produce invalid XML.

- [ ] **Step 2: Run them and watch them fail**

Run: `node --test diagrams/engine.test.mjs`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Add the diagram tokens to `_tokens.scss`**

Add `--d-teal`, `--d-teal-fill`, `--d-mint`, `--d-red`, `--d-lavender`, `--d-grey`, `--d-caption` and `--d-diagram-plate` to both `:root` and the `[data-bs-theme="dark"]` block. Light values come from the skill's palette; dark values are chosen for contrast on `--d-ground: #0b0e14`, not derived mechanically.

- [ ] **Step 4: Implement `diagrams/engine.mjs`**

Plain object nodes (`{ tag, attrs, children }`), a recursive serializer, no dependencies. Self-closing only for genuinely empty elements. Ids in `svg()` derive from a slug of the title so output stays deterministic.

- [ ] **Step 5: Run the tests**

Run: `node --test diagrams/engine.test.mjs diagrams/tokens.test.mjs`
Expected: PASS.

---

### Task 3: Shape builders

**Files:**
- Create: `diagrams/shapes.mjs`
- Test: `diagrams/shapes.test.mjs`

**Interfaces:**
- Consumes: `el`, `text`, `C`, `APP` from Task 2.
- Produces, each returning a `Node`, mirroring `skills/vector-2d-diagrams/reference/engine.md` so the vendored skill still describes reality:
  `group`, `label({ x, y, text, size = 11, weight = 600, color = C.body, halo = false, anchor = 'middle' })`, `hex`, `badge`, `daprApp`, `box`, `node`, `cylinder`, `envelope`, `broker`, `lockBox`, `person`, `secureLock`, `panel`, `pill`, `tile`, `arrow({ from, to, head = true, color = C.navy })`.

  The website's engine defaults labels to literal black and arrows to a navy hex. Here `C.body` and `C.navy` resolve to `var(--d-body)` and `var(--d-blue)`, which is what makes a label readable in dark mode.
- Dropped from the upstream API, with no animation: `retry`, `failure`, `mix`, `step`, `inOut`, and `arrow`'s `grow`/`paint`/`head` returns. `arrow` returns a static node.

- [ ] **Step 1: Write the failing tests**

```js
test('hex draws a pointy-top hexagon with 6 points at radius r')
test('daprApp docks the badge bottom-right by default, bottom-left with badgeLeft')
test('label splits on \\n into two tspans')
test('label with halo:true emits a stroked copy beneath the fill')
test('arrow stops at the shape edge, not the centre')
test('every builder emits only var(--d-*) colors')   // guards the no-hex constraint
test('no builder emits a font-family')               // inherits Noto Sans from the page
```

- [ ] **Step 2: Run them and watch them fail**

Run: `node --test diagrams/shapes.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement `diagrams/shapes.mjs`**

Follow `skills/vector-2d-diagrams/SKILL.md` for geometry and defaults: outlines 2.2px, arrows 2px with an open 8px head, fills at `fill-opacity: 0.6`, hidden edges faint and dashed, app radius 42.5px (32px when crowded).

- [ ] **Step 4: Run the tests**

Run: `node --test diagrams/shapes.test.mjs`
Expected: PASS.

---

### Task 4: Brand marks and the icon pipeline

Decision 11 keeps every logo, so this is load-bearing infrastructure, not a detail. `overview.png` alone needs twelve marks.

**Files:**
- Create: `diagrams/icons.mjs`
- Create: `daprdocs/assets/icons/README.md`
- Create: `daprdocs/assets/icons/<mark>.svg` (the twelve `overview.png` marks; later tasks add theirs)
- Test: `diagrams/icons.test.mjs`

**Interfaces:**
- Consumes: `el`, `C` from Task 2.
- Produces:
  - `icon({ name, x, y, size, w, h, color, label, labelDy, labelSize = 13 }) -> Node`
  - `plate({ x, y, w, h }) -> Node` — the neutral backing that keeps a full-color mark legible on both `--d-ground` values
  - `listMarks() -> string[]` — every `.svg` in the icons dir, for the README test

- [ ] **Step 1: Write the failing tests**

```js
test('icon throws a named error when the mark file does not exist')     // Review Focus
test('icon never emits the string "undefined" when label is omitted')   // recorded upstream trap
test('icon prefixes every id and class in the inlined file')            // no collisions on a page with 12 marks
test('icon rejects a mark containing <script>, an event handler, or an external href')
test('a single-color mark is filled with the color argument; a full-color mark is left untouched')
test('every file in daprdocs/assets/icons has a row in README.md')
test('wide marks keep their aspect ratio when given w and h')
```

- [ ] **Step 2: Run them and watch them fail**

Run: `node --test diagrams/icons.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Source the twelve marks for `overview.png`**

Node, Python, .NET, Go, Java, C++, PHP, Rust, Azure, AWS, Google Cloud, Kubernetes. Follow `SKILL.md` → Brand marks: Simple Icons (CC0, pinned) first, then the vendor's official architecture set. Files unmodified. Java's mark is not freely licensed and needs the maintainers' recorded go-ahead, as the website did.

- [ ] **Step 4: Write `daprdocs/assets/icons/README.md`**

One row per mark: file, what it is, source URL, license, attribution where the license requires it.

- [ ] **Step 5: Implement `diagrams/icons.mjs`**

Read the file at export time, strip the outer `<svg>`, prefix ids and classes (including inside any `<style>` block), derive a missing `viewBox` from `width`/`height`, and wrap in a positioned `<g>`.

- [ ] **Step 6: Run the tests**

Run: `node --test diagrams/icons.test.mjs`
Expected: PASS.

---

### Task 5: Export pipeline

**Files:**
- Create: `diagrams/export.mjs`
- Create: `diagrams/scenes/index.mjs` (empty registry to start)
- Modify: `package.json` (add `export:diagrams`, `test:diagrams`)
- Test: `diagrams/export.test.mjs`

**Interfaces:**
- Consumes: `serialize`, `svg` from Task 2; the registry from `scenes/index.mjs`.
- Produces:
  - `npm run export:diagrams` — writes `daprdocs/assets/diagrams/<name>.svg` for every registered scene
  - `npm run export:diagrams -- --check` — writes nothing; exits 1 and prints the differing names if any committed file does not match a fresh render
  - `npm run test:diagrams` — `node --test diagrams/`
- A scene module's contract: default export `{ width, height, title, desc, build() }`, where `build()` returns an array of nodes.

- [ ] **Step 1: Write the failing tests**

```js
test('exporting twice produces byte-identical output')          // determinism
test('--check exits 0 when committed files match')
test('--check exits 1 and names the file when one differs')
test('--check does not write to disk')
test('a scene missing title or desc fails the export')          // accessibility is not optional
```

- [ ] **Step 2: Run them and watch them fail**

Run: `node --test diagrams/export.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement `diagrams/export.mjs`**

Walk the registry, render, compare or write. Trailing newline on every file so git is happy.

- [ ] **Step 4: Add the npm scripts**

`"export:diagrams": "node diagrams/export.mjs"`, `"test:diagrams": "node --test diagrams/"`.

- [ ] **Step 5: Run the tests**

Run: `npm run test:diagrams`
Expected: PASS.

---

### Task 6: Shortcode and styles

**Files:**
- Create: `daprdocs/layouts/shortcodes/diagram.html`
- Create: `daprdocs/assets/scss/_diagrams.scss`
- Modify: `daprdocs/assets/scss/_variables_project.scss` (or wherever partials are imported — follow the existing pattern)
- Test: covered by Task 7's spec, which is written against the pilot in Task 9.

**Interfaces:**
- Produces: `{{< diagram name >}}`, resolving `assets/diagrams/<name>.svg` via `resources.Get` and inlining it. Fails the Hugo build with a clear message when the named SVG is missing, rather than rendering nothing.

- [ ] **Step 1: Implement the shortcode**

`resources.Get` the SVG, inline its contents with `safeHTML`, wrap in `<figure class="dapr-diagram">`. `errorf` on a missing resource so a typo breaks the build loudly.

- [ ] **Step 2: Implement `_diagrams.scss`**

`.dapr-diagram svg { max-width: 100%; height: auto; }` — decision 12, parity with today, and the guard against the narrow-viewport overflow in Review Focus. Add a `@media (forced-colors: active)` block giving strokes and text `currentColor` so the diagram survives high-contrast mode.

- [ ] **Step 3: Verify Hugo builds**

Run: `npm run build`
Expected: completes with no new warnings.

---

### Task 7: Playwright diagram spec

**Files:**
- Create: `tests/diagrams.spec.js`
- Modify: `package.json` if a separate script is wanted; `test:layout` already runs everything in `tests/`.

**Interfaces:**
- Consumes: the rendered site.
- Produces: `SCENES`, a table of `{ name, page, labels }` that later tasks append to. The spec fails if a page contains a `.dapr-diagram` whose name is not in the table, so no diagram can ship untested.

- [ ] **Step 1: Write the spec**

Structural assertions only, per decision 15. Per scene:

```js
test('<name> renders an inline svg with a title and desc')
test('<name> shows every expected label')
test('<name> has no element outside its viewBox')
test('<name> resolves its token colors in light and in dark')   // toggle data-bs-theme, assert computed fill changes
test('<name> does not overflow at 320, 360 and 412px')          // Review Focus
test('page ships no diagram JavaScript')                        // no <script> from the shortcode
test('every .dapr-diagram on a visited page is listed in SCENES')
```

- [ ] **Step 2: Run it**

Run: `npm run test:layout -- diagrams`
Expected: FAIL until Task 9 registers the first scene. That is the correct state at the end of this task.

---

### Task 8: CI wiring and the no-regression guard

**Files:**
- Modify: `.github/workflows/layout_tests.yaml`
- Test: `tests/images-still-resolve.spec.js`

**Interfaces:**
- Produces: CI that fails on a stale committed SVG, and a guard that out-of-scope pages keep working.

- [ ] **Step 1: Write the failing test**

The Review Focus item for this task. For each of the 7 shared images and a sample of the `docs-zh` pages, assert the page still renders its `<img>` and the file still exists under `daprdocs/static/images/`:

```js
test('pages outside this scope still reference an existing image file')
test('daprdocs/static/images is unchanged relative to the merge base')
```

- [ ] **Step 2: Run it**

Run: `npm run test:layout -- images-still-resolve`
Expected: PASS immediately — this is a guard, not a driver. Confirm it fails if an image is temporarily renamed.

- [ ] **Step 3: Extend the workflow**

Add a step before the Playwright run:

```yaml
      - name: Check diagrams are up to date
        run: npm run export:diagrams -- --check
```

and a step running `npm run test:diagrams`. Both are fast and need no browser, so they go first and fail early.

- [ ] **Step 4: Confirm the workflow parses**

Run: `npx --yes action-validator .github/workflows/layout_tests.yaml` or equivalent.
Expected: valid.

---

### Task 9: Pilot — `overview`

The first scene deliberately exercises everything hardest: twelve brand marks, the widest canvas, the most-viewed page. Get it right before volume starts.

**Files:**
- Create: `diagrams/scenes/overview.mjs`
- Modify: `diagrams/scenes/index.mjs`, `daprdocs/content/en/overview.md:18`, `tests/diagrams.spec.js` (`SCENES`)
- Create: `daprdocs/assets/diagrams/overview.svg` (generated)

- [ ] **Step 1: Fact-check the content**

Per decision 10, before drawing. The current image lists Workflow, Publish/Subscribe, Service Invocation, State Management, Actors, Jobs, External Configuration, Secrets, Bindings, Cryptography, Distributed lock, Conversation, plus Observability, Security, Resiliency, and the language and platform rows. Confirm against the current building-block set and note any change for sign-off.

- [ ] **Step 2: Add the scene and register it**

Default export `{ width, height, title, desc, build() }`. Canvas keeps the source's aspect ratio (decision 12, and the skill's canvas rule).

- [ ] **Step 3: Export**

Run: `npm run export:diagrams`
Expected: writes `daprdocs/assets/diagrams/overview.svg`.

- [ ] **Step 4: Swap the page**

Replace the `<img src="/images/overview.png" ...>` line at `daprdocs/content/en/overview.md:18` with the shortcode call. Leave the PNG in place.

- [ ] **Step 5: Add it to `SCENES` and run the spec**

Run: `npm run test:layout -- diagrams`
Expected: PASS.

- [ ] **Step 6: Review gate**

Produce the diagram at both themes and at 360px. Get the maintainer's sign-off on the visual language before Task 10 begins. Decisions made here (plate treatment, label sizing, row spacing) become the house style for the remaining 23.

---

### Task 10: Second diagram — `building-blocks`

Confirms the style transfers and that a scene shared by two pages works from one source.

**Files:**
- Create: `diagrams/scenes/building-blocks.mjs`
- Modify: `diagrams/scenes/index.mjs`, `daprdocs/content/en/overview.md:39`, `daprdocs/content/en/concepts/building-blocks-concept.md:19`, `tests/diagrams.spec.js`

- [ ] **Step 1–5:** As Task 9, steps 1–5. Both call sites use `{{< diagram building-blocks >}}`.
- [ ] **Step 6: Review gate.** Sign-off, and confirm the house style held without new decisions. If it did not, fix the style in `shapes.mjs` and re-export both scenes before continuing.

---

### Task 11: The remaining 22 diagrams

Every one follows the identical six-step cycle from Task 9 — fact-check, scene, export, swap the page, extend `SCENES` and pass the spec, individual sign-off. Each is its own task and its own gate; none starts before the previous one is signed off.

Do not begin this task until Tasks 9 and 10 are both signed off.

| # | Scene | Replaces | Page(s) and line |
| --- | --- | --- | --- |
| 11.1 | `sidecar-model` | `overview-sidecar-model.png` | `overview.md:76`, `concepts/dapr-services/sidecar.md:22` |
| 11.2 | `hosting-standalone` | `overview-standalone.png` | `overview.md:90` |
| 11.3 | `hosting-kubernetes` | `overview-kubernetes.png` | `overview.md:110` |
| 11.4 | `hosting-vms` | `overview-vms-hosting.png` | `overview.md:116` |
| 11.5 | `agents-overview` | `dapr-agents/concepts-agents-overview.png` | `overview.md:150` |
| 11.6 | `building-blocks-concept` | `concepts-building-blocks.png` | `concepts/building-blocks-concept.md:15` |
| 11.7 | `components-concept` | `concepts-components.png` | `concepts/components-concept.md:42` |
| 11.8 | `sidecar-apis` | `overview-sidecar-apis.png` | `concepts/dapr-services/sidecar.md:19` |
| 11.9 | `scheduler-architecture` | `scheduler/scheduler-architecture.png` | `concepts/dapr-services/scheduler.md:22` |
| 11.10 | `service-mesh` | `service-mesh.png` | `concepts/faq/service-mesh.md:29` |
| 11.11 | `observability-tracing` | `observability-tracing.png` | `concepts/observability-concept.md:36` |
| 11.12 | `observability-sidecar` | `observability-sidecar.png` | `concepts/observability-concept.md:49` |
| 11.13 | `resiliency-policies` | `resiliency_diagram.png` | `concepts/resiliency-concept.md:12` |
| 11.14 | `app-health` | `observability-app-health.webp` | `concepts/resiliency-concept.md:23` |
| 11.15 | `sidecar-health` | `sidecar-health.png` | `concepts/resiliency-concept.md:32` |
| 11.16 | `security-end-to-end` | `security-end-to-end-communication.png` | `concepts/security-concept.md:22` |
| 11.17 | `sentry-selfhosted` | `security-mTLS-sentry-selfhosted.png` | `concepts/security-concept.md:178`, `concepts/dapr-services/sentry.md:19` |
| 11.18 | `sentry-kubernetes` | `security-mTLS-sentry-kubernetes.png` | `concepts/security-concept.md:191`, `concepts/dapr-services/sentry.md:25` |
| 11.19 | `mtls-system-services` | `security-mTLS-dapr-system-services.png` | `concepts/security-concept.md:229` |
| 11.20 | `api-scoping` | `security-dapr-API-scoping.png` | `concepts/security-concept.md:262` |
| 11.21 | `security-capabilities` | `security-overview-capabilities-example.png` | `concepts/security-concept.md:313` |
| 11.22 | `security-threat-model` | `security-threat-model.png` | `concepts/security-concept.md:335` |

Two carry extra work under decision 10:

- **11.4 `hosting-vms`.** The source puts Consul on all three VMs for DNS name resolution; confirm that is still what Dapr recommends before drawing it. Its App B is yellow today and must not be.
- **11.22 `security-threat-model`.** The source is a broken draw.io export: visible grid, placeholder icons in every label box and beside three group titles, a clipped "Dapr Microservice Service B". There is nothing faithful to reproduce; it is drawn fresh from the surrounding prose and signed off by a security maintainer. Schedule it last; it is the one most likely to need several rounds.

---

### Task 12: Adapt the vendored skill to this repo

Last, so it describes what exists rather than what was planned.

**Files:**
- Modify: `skills/vector-2d-diagrams/SKILL.md`, `skills/vector-2d-diagrams/reference/engine.md`
- Delete: `skills/vector-2d-diagrams/scripts/smoothness.mjs`
- Modify: `skills/vector-2d-diagrams/UPSTREAM.md`
- Test: `skills/vector-2d-diagrams/paths.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
test('every repo path named in SKILL.md and engine.md exists')
test('SKILL.md names no path under themes/bigspring')      // website-only, must all be rewritten
test('UPSTREAM.md records which files were adapted and which are still verbatim')
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --test skills/vector-2d-diagrams/paths.test.mjs`
Expected: FAIL, the paths are all the website's.

- [ ] **Step 3: Rewrite "Where things live"**

Point every row at this repo: `diagrams/engine.mjs`, `diagrams/shapes.mjs`, `diagrams/icons.mjs`, `diagrams/scenes/`, `daprdocs/assets/diagrams/`, `daprdocs/layouts/shortcodes/diagram.html`, `daprdocs/assets/icons/`, `tests/diagrams.spec.js`. Remove the D3 row.

- [ ] **Step 4: Cut what does not apply**

Delete the Motion section, the pause button and reduced-motion rules, the static-fallback and `<noscript>` rules, workflow step 1a (video sources), the animation half of 1b, and the smoothness step in 3. Replace the `data/homepage.yml` instructions with the shortcode. Keep every design rule, the brand-marks section, the canvas rule and the accessibility rules.

- [ ] **Step 5: Add what is new here**

Stills only. Colors are `var(--d-*)` tokens, never hex, with the dark-mode review requirement. Full-color marks are exempt and sit on a plate. Fact-check and individual sign-off are part of making a diagram. Export with `npm run export:diagrams`; CI runs `--check`.

- [ ] **Step 6: Update `reference/engine.md`**

Match the real `shapes.mjs` and `icons.mjs` API from Tasks 3 and 4. Remove `retry`, `failure`, `step`, `inOut`, `mix` and the `grow` protocol.

- [ ] **Step 7: Run the test**

Run: `node --test skills/vector-2d-diagrams/paths.test.mjs`
Expected: PASS.

- [ ] **Step 8: Full suite**

Run: `npm run test:diagrams && npm run export:diagrams -- --check && npm run test:layout`
Expected: all pass, no diff.
