---
name: d3-2d-diagrams
description: Create or change the generated SVG diagrams in the Dapr docs (scenes in diagrams/scenes/, inlined by the {{< diagram >}} shortcode). Use for a new diagram from a source image or a text description, and for changes to an existing scene's layout, colors, icons, labels or tests.
---

# 2D diagrams for the Dapr docs

Diagrams on these pages are drawn in code, not stored as images. A scene is an
ES module that builds a plain element tree; an exporter serializes it to an SVG
committed under `daprdocs/assets/diagrams/`; a Hugo shortcode inlines that SVG
into the page.

```
{{< diagram overview >}}
```

Because the SVG is inlined and every color is a `var(--d-*)` token, a diagram
follows the site's dark-mode toggle with **no JavaScript on the page**. The
engine and exporter use Node built-ins only: no D3, no jsdom, no SVG library.

Every diagram here is a **still**. There is no animation, no timeline, no pause
button and no reduced-motion path.

## Where things live

| What | Where |
| --- | --- |
| Element tree, serializer, color tokens | `diagrams/engine.mjs`: `el`, `text`, `serialize`, `svg`, and the `C` and `APP` colors |
| Shape builders | `diagrams/shapes.mjs`: hexagons, arrows, cylinders, panels, tiles and the rest |
| Brand marks and icons | `diagrams/icons.mjs`: reads a vendored SVG, screens it, prefixes its ids, returns nodes |
| One scene per diagram | `diagrams/scenes/<name>.mjs`, registered in `diagrams/scenes/index.mjs` |
| Exporter | `diagrams/export.mjs`, run as `npm run export:diagrams` |
| Generated SVGs, committed | `daprdocs/assets/diagrams/<name>.svg` |
| Shortcode | `daprdocs/layouts/shortcodes/diagram.html` |
| Figure styles | `daprdocs/assets/scss/_diagrams.scss` |
| Color tokens | `daprdocs/assets/scss/_tokens.scss`, light and `[data-bs-theme="dark"]` |
| Vendored marks | `daprdocs/assets/icons/<name>.svg`, with sources and terms in `daprdocs/assets/icons/README.md` |
| Unit tests | `diagrams/*.test.mjs`, run as `npm run test:diagrams` |
| Rendered tests | `tests/diagrams.spec.js`, run as `npm run test:layout` |

The engine's API is in [reference/engine.md](reference/engine.md).

## Design rules

### Canvas and style

- **2D only.**
- **Canvas size:** the `width` and `height` on the scene set the viewBox, and
  the scene's coordinates use it. Give the canvas the shape of what the diagram
  replaces, or of the space it fills. Never make it larger.
- **Wireframe line art:**
  - outlines are 2.2px and arrows 2px
  - fills are light tints at `fill-opacity: 0.6`
  - hidden edges, such as the back of a cylinder's base, are drawn faint and dashed
- **No backdrop and no glow.**
- **Keep everything at least 10px inside the edges.** The rendered tests fail
  anything outside the viewBox.
- **Label sizes are canvas-relative.** `_diagrams.scss` sets `svg { width: 100% }`,
  so a label's rendered size is `size x columnWidth / viewBoxWidth`. On a
  1512-wide canvas a 12-unit label lands near 6 to 7 CSS px in a docs column.
  The 11-unit floor the tests enforce is therefore a floor in **user units**,
  not in pixels a reader sees. A wide canvas needs proportionally larger labels.

### Colors

Defined once, as `C` and `APP` in `engine.mjs`. Every one resolves to a
`var(--d-*)` token defined in `_tokens.scss` under both `:root` and
`[data-bs-theme="dark"]`.

- **Never a literal hex in a scene.** A color that is not yet a token gets one,
  in both themes. The only hex values in a diagram are the ones inside a
  vendored brand mark, which is left untouched.
- **A token name is lowercase letters and hyphens, with no digits.** The tests
  match `--d-[a-z-]+`, so `--d-brand-k8s` fails three of them at once, in ways
  that look unrelated to the token. Spell the word out.
- **A vendor's own color is still a token,** and it is the same value in both
  themes, because the mark is. `--d-brand-kubernetes` exists so the helm can be
  tinted its own blue without a hex in the scene. The brand-mark exemption
  covers color *inside* a vendored file, not a tint the diagram applies.
- **App hexagons take `APP` in order:** sky, blue, teal, orange, each with a
  light fill. With more than four apps, color by role, so apps of one kind
  share a color.
- **A large Dapr hexagon** is navy with the logo inside it.
- **Never yellow.** It is too light on the light ground.
- **What the other colors mean:**
  - `C.navy` for arrows, Dapr badges and databases
  - `C.mint` for a workflow start
  - `C.orange` for a workflow end and failure marks
  - `C.red` for a failed call
  - `C.blue` for secure communication and resiliency
  - `C.caption` for section captions
  - `C.body` for labels
- **Teal and mint fail contrast on the light ground.** The builders enforce this
  rather than trusting you to remember: `label()` and `arrow()` refuse them
  outright, and an outlined shape refuses them unless it also carries a text
  label. `panel()` is the one exception, because a dashed grouping border is
  decorative and its contents are each labelled.
- **Anything drawn on a plate takes `C.plateInk`, never `C.body`.**
  `--d-diagram-plate` is deliberately near-white in **both** themes, so a mark
  tinted with `C.body` disappears onto its own plate in dark mode. A glyph you
  are already drawing in a theme color does not need a plate and should not
  get one.

### Labels

- **Font:** labels inherit the page's font (Noto Sans), so never set
  `font-family` in a scene.
- **Sizes:** use `label()`. 11 units at weight 600 by default; app names at
  about a third of the hexagon's radius; section captions in `C.caption`. Use
  `\n` for a second line, which `label()` centers vertically for you.
- **Text over a line** gets `halo: true` so the line does not run through it.
- **Never below 11 units,** which the builders enforce. See the canvas-relative
  note above before choosing a size on a wide canvas.

### Shapes and arrows

- **Apps** are pointy-top hexagons. An app that runs Dapr has the Dapr badge
  docked on it, bottom right by default and bottom left when space needs it:
  use `daprApp()`.
- **Arrows** have an open 8px head and stop at the shape's edge, not its center.
  Pass a shape descriptor rather than a raw point where you can, so the arrow
  and the shape cannot drift apart.
- **Groups and captions:** a dashed rounded `panel()` groups part of a diagram,
  a `pill()` captions it, and a `tile()` shows one capability with an icon and
  a label.
- **Even rows:** `slots(x0, x1, n)` gives evenly spaced centers, so the gaps at
  each end match the gaps between items.
- **A mark inside a shape is centered in it, both ways,** whenever the mark
  carries no label of its own. Its name goes outside the shape, below it, in
  ordinary body ink: a name sitting on the shape's outline reads as a mistake,
  and a name outside a plate is not on the plate, so it does not take plate ink.
- **Capability cards are square,** like the other capability grids. A square
  card with a two-line name needs `glyphDy` and `nameDy` set explicitly: the
  proportional default puts the second line on the bottom edge. Leave about
  twice as much room under the last line as the line is tall.
- **Overlap means overlap.** Two shapes drawn as one thing beside another, such
  as an app and its sidecar, have to visibly overlap. Shapes that merely touch
  read as a rendering error. Check the centre distance against the sum of the
  radii rather than trusting the picture in your head.

### Grouping and centering

Most "that looks slightly off" notes are one mistake: a part was positioned
instead of the group it belongs to. Three rules cover it.

- **Center the group, not the parts.** A glyph with a name under it is one
  thing. Measure the stack (glyph height, the gap, and the name block's height,
  which depends on how many lines it has) and center that total in the shape.
  Placing the glyph and the name each at its own offset means a two-line name
  drags the pair up the card and a one-line name leaves it sitting low, and no
  single pair of offsets fixes both. `tile()` does this for you when given
  `glyphSize`.
- **Center a repeated group in its region by computing its extent,** from the
  first shape's top edge to the last label's descender, rather than choosing a
  starting y that looks about right. Derive the start from the region's center
  and the group's height, so it stays centered when the region, the spacing or
  the number of items changes:

  ```js
  const GROUP_H = (count - 1) * PITCH + R + LABEL_DY + 4;
  const TOP = REGION.y + REGION.h / 2 - GROUP_H / 2 + R;
  ```

- **Align shapes to each other by a named feature, not by eye.** "The sidecar's
  leftmost point sits on the app's lowest point" is a position you can compute
  and check; "a bit to the left" is not. `hexHalfWidth(r)` gives a pointy-top
  hexagon's half width, so its leftmost point is `x - hexHalfWidth(r)` and its
  lowest is `x`.

**Measure the result.** After any of these, read the numbers back out of the
rendered page with `getBBox` - group center against region center, label bottom
against shape bottom - rather than deciding from the picture. Every spacing
note in this skill came from a number that disagreed with how it looked.

### Laying out connections

- **Collect parallel connections onto one bus.** Several arrows that run from
  one place to a column of things should leave a single vertical line rather
  than fanning out from their source. Put that line close to the column it
  serves, so the horizontal runs stay short and the middle of the canvas stays
  open.
- **Keep a central element equidistant from the buses on either side.** If a
  hexagon sits between a left-hand bus and a right-hand one, the two gaps
  should match; an element closer to one side reads as drift rather than
  design.
- **An arrow ends on something.** An arrow drawn to a bare coordinate ends in
  empty space and looks broken. Give it a shape descriptor or a bus, and check
  it does not cut through whatever sits between its ends - move the endpoint
  below a shape rather than through it.
- **A label on an arrow rides above the line,** not beside it, when the arrow
  is long enough to carry text over it.
- **Two dashed regions need a clear gap between them.** Edges that nearly touch
  read as a mistake. Leave several times the dash pitch.
- **Do not hand-draw a company's logo or product mark.** Use its official file;
  see the next section.
- **Generic icons** (a key, a clock, a database) come from
  [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons)
  (MIT). Download the 24px regular variant from
  `https://api.iconify.design/fluent/<name>-24-regular.svg`, save it as
  `daprdocs/assets/icons/fluent-<name>.svg` unmodified, and draw it with
  `icon({ name: 'fluent-<name>', color })`.

### Brand marks

- **Source, in order of preference:**
  1. [Simple Icons](https://simpleicons.org), pinned to a version (CC0).
     Single-color; the diagram tints them with `icon({ color })`.
  2. Wikimedia Commons, for company logos and full-color marks Simple Icons
     does not carry in the form the diagram needs.
  3. The vendor's official architecture icon set, if neither has it:
     [Azure](https://learn.microsoft.com/azure/architecture/icons/),
     [AWS](https://aws.amazon.com/architecture/icons/) or
     [Google Cloud](https://cloud.google.com/icons).
- **Keep the file unmodified, byte for byte.** The Azure terms forbid cropping,
  flipping, rotating, distorting or recoloring, and the others expect the same.
  `icons.mjs` changes only its in-memory copy. `.gitattributes` marks these
  files `-text` so git does not normalize their line endings.
- **Record every mark** in `daprdocs/assets/icons/README.md`: the file, what it
  is, the source URL, the license, whether it is single or full color, and a
  SHA-256 prefix. The tests fail if a file there has no row. Get the file URL
  and license from the Commons API:
  `https://commons.wikimedia.org/w/api.php?action=query&titles=File:<name>.svg&prop=imageinfo&iiprop=url|extmetadata&format=json`
- **A mark that is not freely licensed** needs the maintainers' explicit
  go-ahead, recorded in the README with the decision and who made it.
- **Wide logos and wordmarks** keep their proportions: give `icon()` a `w` and
  `h`. A logo that carries its own name needs no text label beside it.
- **A dark-on-light wordmark cannot be recolored for dark mode,** and freely
  licensed reversed variants mostly do not exist. Put it on a backing drawn in
  `C.markPlate`, which is transparent in light mode and a light plate in dark.
  The light rendering is then unchanged and the mark stays legible on the dark
  ground. A mark that is already a light or saturated color needs no backing.
- **Every file is screened on load:** no `<script>`, no event handlers, no
  external `href`, and only an allowlist of elements. Metadata namespaces
  (`cc:`, `dc:`, `rdf:`) are tolerated because `<metadata>` is dropped whole.
- **Missing files:** if the user names no source and no official file can be
  found, ask before using a substitute.

### Accessibility and copy

- **Every scene needs a `title` and a `desc`.** The export fails without them.
  `title` names the diagram; `desc` describes what it shows, plainly and
  accurately. It is read as an official statement by the project.
- **No em dashes or en dashes,** as in all site copy.
- **Alpha APIs:** name them alpha close to each mention, and give them their
  own sentence rather than scattering the word.
- **Ids are scoped to the scene** by the exporter, and the export fails if two
  elements in one scene share an id. Several diagrams on one page is normal, so
  never assume a scene is alone on its page.
- **High contrast:** `_diagrams.scss` redraws strokes and text in the system's
  own colors under `forced-colors: active`. Geometry drawn `fill="none"` is left
  unfilled, because filling it would close the implied path.

## Workflow

### 1. Fact-check the content first

Before drawing anything, confirm what the diagram claims is still true, against
this repository's own pages. A diagram that contradicts the page it sits on is
worse than the image it replaced.

List any discrepancy you find and put it to the maintainers. Do not resolve it
silently, and do not quietly change the content set to match a source image.

### 2. Turn the source into a layout

1. **Components:** list every one the source names: apps, Dapr, brokers,
   stores, external systems, people, workflow steps.
2. **Connections:** list how they connect, and in which direction.
3. **Shapes:** map each component to a builder (see
   [reference/engine.md](reference/engine.md)). For a branded product use its
   mark. With no matching shape, pick the nearest or add a builder in the same
   style, in `shapes.mjs` rather than in the scene.
4. **Layout:** put the main flow on one axis and side services on the other.
   Useful spacings:

   | Element | Measurement |
   | --- | --- |
   | Space between app centers | about 140 to 150px, up to about 250px when the arrow between them carries a mark |
   | App radius | 42.5px normally; 32px in a crowded scene |
   | Arrow length | 30 to 110px, running between shape edges |
   | Workflow activity boxes | 194x30px, about 65px apart vertically |
   | Margins | at least 10px from the edges; leave room for labels under shapes |

5. **Keep shared helpers out of the scene.** If a helper is not specific to one
   diagram, it belongs in `shapes.mjs` or `icons.mjs`. The next scene author
   will otherwise import from your scene or copy it.
6. **Derive constants from each other instead of repeating a number.** A row's
   centre line comes from its band (`const LANG_Y = B1.y + B1.h / 2`), and one
   label-size constant drives every tile that should match. A hard-coded centre
   silently stops being the centre the first time the band changes, and two
   sizes that are meant to be equal drift the first time one of them moves.

#### Matching an existing diagram

When a diagram already exists somewhere and this one should look like it, read
**its source**, not a screenshot of it. Two things fall out of that which
eyeballing will not give you:

- **Carry its numbers, scaled.** Put its coordinates and sizes through one
  factor (`const S = ourPanelWidth / theirPanelWidth`) and a helper that maps
  its x into ours, rather than re-laying the scene out by eye. The mapping then
  reads in the source instead of being baked into constants nobody can check.
  A reference's positions are often hand-placed and unevenly spaced, which no
  amount of nudging an even layout will ever reproduce.
- **The vertical may not scale with the horizontal.** If our canvas keeps a
  different aspect from the reference, scaling every band by the same factor
  will push content outside the viewBox. Scale what reads as proportion, such
  as a band's height against the canvas width, and hand-fit the rest.

A reference is not automatically right. Measure contrast on anything you copy,
and keep a departure only with its reason written next to it in the scene.

### 3. Build the scene

A scene module default-exports `{ width, height, title, desc, build() }`, where
`build()` returns an array of nodes:

```js
import { C, APP } from '../engine.mjs';
import { arrow, cylinder, daprApp } from '../shapes.mjs';

export default {
  width: 600,
  height: 480,
  title: 'What the diagram is called',
  desc: 'What the diagram shows, in plain accurate sentences.',

  build() {
    return [
      daprApp({ x: 150, y: 200, stroke: APP[0].stroke, fill: APP[0].fill }),
      arrow({ from: [195, 200], to: [300, 200] }),
      cylinder({ x: 340, top: 185, bottom: 225 }),
    ];
  },
};
```

Register it in `diagrams/scenes/index.mjs`, then export and place it:

```bash
npm run export:diagrams
```

Put `{{< diagram <name> >}}` on the page, replacing the `<img>` it supersedes.
Match on the image's `src` string rather than a line number: line numbers drift.
**Leave the replaced image file on disk** unless you have checked that nothing
else uses it, including the `translations/docs-zh` submodule and any external
page that may hotlink it.

Above the scene, write a comment saying what it shows and recording any place
it deliberately departs from its source, with the reason.

### 4. Render it and look at it

```bash
node skills/d3-2d-diagrams/scripts/render-scene.mjs <name>
```

This is not optional and it is not a formality. The numeric tests pass on a
mark that is invisible, on a label drawn twice in the same place, and on a
glyph scaled to nothing inside a slack viewBox. Every one of those has shipped
past a green suite here.

Look at **both themes** before you commit.

### 5. Test

```bash
npm run test:diagrams                  # unit tests
npm run export:diagrams -- --check     # the committed SVG matches a fresh render
npm run test:layout                    # rendered tests
npm run build                          # Hugo builds clean
```

Add the scene to `SCENES` in `tests/diagrams.spec.js`, with every label it must
draw. The spec fails if an exported scene or a `{{< diagram >}}` call site in
the content has no row, so no diagram can ship untested.

### 6. Get it signed off

Each diagram is reviewed individually, at both themes and at narrow width,
before the next one starts. Report visual choices as proposals, not decisions.

## Traps already hit

- **A green suite is not a correct diagram.** Structural tests are necessary
  and not sufficient. Render and look.
- **Check that a label still fits by measuring it,** not by looking at it. Run
  `getBBox` over every tile's rect and its text in the browser and compare the
  edges. Raising a label size or a glyph size is exactly the change that pushes
  text past its tile, and `inlinePad` is the icon centre's inset, so a glyph
  that grows eats the gap it was given.
- **A mark's viewBox is not its content.** Several vendored files leave slack
  (`go.svg` draws 24x9 inside a 24x24 box), and `icon()` fits the viewBox, not
  the ink, so two marks given the same size can come out at very different
  optical weights. Measure the drawn bounding box with `getBBox` in a headless
  browser and size from that.
- **Contrast before copying.** Measure a fill-and-text pair before using it,
  even when it is lifted from an existing diagram that ships somewhere. A
  treatment that works on a light-only page has not necessarily been checked
  against a dark one. Navy is the safe filled color.
- **A token must be chosen against the surface it lands on,** not against the
  page. This is what `C.plateInk` exists for.
- **Fluent glyphs paint `fill="currentColor"`,** which beats the `fill` on a
  wrapping group. `icon()` sets `color` as well as `fill` for single-color
  marks; if you wrap a glyph yourself, do the same or it renders in the page's
  inherited text color, which looks plausible and is wrong.
- **A vendored SVG's ids collide** with other marks and with the page when
  inlined, and some files repeat an id internally (Sketch exports do). `icons.mjs`
  prefixes and de-duplicates them; never inline one by hand.
- **`test.use({ forcedColors: 'active' })` may not apply.** The media query can
  stay unmatched, so the test measures the ordinary theme while looking like a
  high-contrast test. Use `page.emulateMedia({ forcedColors: 'active' })` and
  assert that `matchMedia('(forced-colors: active)').matches` is true.
- **`icon()` without a `label`** draws only the mark. A missing one must never
  render the word "undefined".
- **Every builder takes `x, y` as the shape's CENTRE,** except `panel()`, which
  takes its top-left corner because a region is placed by its extent. Passing a
  left edge to `pill()` hangs the caption off the side of the canvas; the
  viewBox test catches it, and it is the one geometry mistake the suite can
  see for you.
- **Generated SVGs are pinned to LF** in `.gitattributes`. A vendored mark that
  contains CR would otherwise be rewritten on commit, so a fresh clone would
  never match a fresh render. The exporter normalizes CR before writing and
  comparing.
- **The shortcode validates the scene name** against the same rule the exporter
  enforces. Both sides of that contract must agree.
