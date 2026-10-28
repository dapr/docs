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
| The Dapr API catalogue | `diagrams/apis.mjs`: one definition per API and cross-cutting concern, and `apiTile()`, which draws the block |
| One scene per diagram | `diagrams/scenes/<name>.mjs`, registered in `diagrams/scenes/index.mjs` |
| Exporter | `diagrams/export.mjs`, run as `npm run export:diagrams` |
| Generated SVGs, committed | `daprdocs/assets/diagrams/<name>.svg` |
| Standalone SVGs, for download and copy | `daprdocs/static/diagrams/<name>.svg`, written by the same export |
| Shortcode | `daprdocs/layouts/shortcodes/diagram.html` |
| Download and copy buttons | `daprdocs/assets/js/diagram-actions.js`, loaded per page by `_partials/hooks/body-end.html` |
| Figure styles | `daprdocs/assets/scss/_diagrams.scss` |
| Color tokens | `daprdocs/assets/scss/_tokens.scss`, light and `[data-bs-theme="dark"]` |
| Vendored marks | `daprdocs/assets/icons/<name>.svg`, with sources and terms in `daprdocs/assets/icons/README.md` |
| Unit tests | `diagrams/*.test.mjs`, run as `npm run test:diagrams` |
| Rendered tests | `tests/diagrams.spec.js`, run as `npm run test:layout` |

The engine's API is in [reference/engine.md](reference/engine.md).

## Design rules

### Canvas and style

- **2D only.**
- **A small band of air on every side, and no more.** Nothing should touch the
  viewBox: the inlined SVG has no padding of its own, so geometry on the
  boundary sits against the prose. Aim for 2-5% of the canvas on that axis -
  width for left and right, height for top and bottom - and never less than
  about 12 units, whatever the percentage says on a small canvas. The rendered
  tests already fail anything within 10 units of the edge.
- **Padding is also the only scale control, so expect one axis to carry it.**
  The SVG always fills the content column, so the only thing that changes how
  BIG a drawing renders is its ratio to the canvas: ask for a diagram at 80%
  and what you are really asking for is 20% more canvas around it. That air
  has to go somewhere. Put it on ONE axis - the one the drawing is widest
  against - and trim the other back to the band. `sidecar-apis` carries 17% on
  the left and right for exactly this reason and 5% top and bottom; what is
  wrong is not that figure but letting BOTH axes drift, which is dead space
  rather than scale.
- **Landscape, and ideally 16:9.** A diagram that fits a slide frame can be
  dropped into a deck as it is, and these diagrams get reused in talks. The
  rule is a FLOOR on the ratio, never a band: a drawing WIDER than 16:9 loses
  nothing, because a wide shape in a wide frame just leaves space above and
  below, while a drawing taller than the frame has to be shrunk to fit its
  height and arrives as a stamp. `diagrams/aspect.test.mjs` enforces the floor,
  with 10% of slack - a frame is not a caliper.
- **So when a layout has to give, give it WIDTH.** Portrait is the shape to
  design away from, not a neutral alternative: a column that runs off the
  bottom becomes two columns side by side, a stack of rows becomes a row of
  groups, and a long list splits into two shorter ones. The content is usually
  indifferent - it is the layout that chose to go down the page. Reach for a
  taller canvas only when the thing being drawn is genuinely vertical, such as
  a sequence that the reader follows top to bottom.
- **A scene that cannot fit is an exception, named in that test with its
  reason.** The list is the record of the exceptions and is meant to stay
  short; it is not somewhere to park a scene that was simply never laid out
  with the frame in mind. Before adding to it, try the cheap fixes: pad the
  canvas on the short axis, trim dead margin on the long one, or re-pitch a
  column. Only a diagram whose CONTENT is the wrong shape - a reference table
  of fifteen columns, say - genuinely belongs there.
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

- **Font:** labels inherit the page's font, so never set `font-family` in a
  scene. The one exception is a **terminal command, a path or other code**,
  which takes `mono: true` on `label()` or `richLabel()`. That sets
  `var(--font-mono)`, the same variable the page's `code` and `pre` elements
  use, so the diagram borrows the site's code font rather than introducing one.
  A command set in the body font reads as prose. Never write a literal font
  stack: an inlined SVG can see the page's CSS variables, so use them.
- **Sizes:** use `label()`. 11 units at weight 600 by default; app names at
  about a third of the hexagon's radius; section captions in `C.caption`. Use
  `\n` for a second line, which `label()` centers vertically for you.
- **Text over a line** gets `halo: true` so the line does not run through it.
- **Never below `MIN_LABEL`, which is 10 units.** It is declared once, in
  `diagrams/shapes.mjs`, and every builder that derives a size imports it
  rather than carrying its own copy - three of them did carry copies, which is
  how a floor ends up being three different numbers. `label()` throws below it,
  and `cardSizes()` and `serviceLabel()` REFUSE a component drawn too small to
  carry a legible name rather than clamping it: a clamped name is a drawing
  that silently stops scaling, while a refusal says the shape has to be bigger.
  Lowering the floor is a change in one place; raising it will fail the scenes
  that no longer fit. See the canvas-relative note above before choosing a size
  on a wide canvas.
- **The FIRST app in a diagram is Dapr green, solid, with dark ink on it.**
  `APP[0]` is `--d-green` (`#0bdda3`, sampled from the source images) filled
  SOLID, outlined in `--d-app-ink` and carrying its name in the same dark ink.
  Both tokens are identical in the two themes, because the ink sits on the
  green rather than on the page: dark ink measures 8.9:1 on it either way,
  while the 0.6 tint every other shape uses would drop that to about 3.6:1 on
  the dark ground. It is the one shape in the set that does not follow the
  page. Apps AFTER the first take the tinted palette in order - `APP[1]` sky,
  `APP[2]` blue, `APP[3]` teal - so a second and third app are told apart by
  colour without competing with the first.
- **Spread a whole palette entry; never pick properties off it.** Write
  `hex({ x, y, label, ...APP[0] })`, not `stroke: APP[0].stroke, fill:
  APP[0].fill`: the entry carries four properties and picking two silently
  drops the other two. For the same reason every entry states all four, even
  where it agrees with the builder's default - a missing property spreads as
  `undefined`, which is exactly what makes a default parameter fire, and an
  entry that left `ink` and `solid` out drew the second app solid with the
  FIRST app's dark ink on it: invisible on the dark theme, where its own fill
  is already near-black. `diagrams/engine.test.mjs` fails an incomplete entry.
- **A colour in the source image is not otherwise permission to use it.** One
  of these diagrams had a YELLOW app; the palette has no yellow, and it is too
  light to carry an outline on the light ground. Map what the source MEANS -
  "this is an app", "this is a second app" - onto the palette, and record the
  swap in the scene header, because the next person to compare the drawing
  with the old PNG will otherwise think it is a mistake.
- **Colour carries a role, and the role holds across the set.** Blue is Dapr's
  own - the sidecar hexagon, an API block, a Dapr service. Navy is for what is
  NOT Dapr: the user, the outside world, the infrastructure underneath. A
  reader who learns that on one page should not have to relearn it on the next.
- **A description is BLUE, not a second grey.** Names take body ink; the line
  explaining them takes `C.blue`, the same blue a Dapr hexagon is outlined in.
  Grey under black is one colour at two strengths, and a diagram built from it
  goes monochrome however many shapes it has. `C.caption` stays for what is
  genuinely furniture: a dashed region's border, a section heading over a band.
- **Use the palette; do not invent a colour to satisfy a contrast number.**
  `C.blue` measures 2.56:1 on the light ground and `C.orange` 3.31:1, so as
  type both are under the 4.5:1 that body copy wants. They are used anyway,
  deliberately: the house palette is the house palette, and a near-miss
  mixed for one diagram is a colour nothing else in the set shares. What
  follows from that is a constraint on CONTENT, not on the palette - a line
  in `C.blue` or `C.orange` is a second reading of something the diagram
  already says in body ink, never the only place a fact appears. If a
  description is the only place a fact appears, it belongs in body ink.
- **One constant for every label and description in a scene.** A description
  set a point smaller than the name above it does not read as quieter, it reads
  as a different class of thing. One `TEXT` constant also stops the two drifting
  apart later. Reach for a second size only when something genuinely is a
  different class, such as a section caption.
- **A label anchored `start` beside a repeated element overflows at the END of
  the row.** Each one extends to the right of its own anchor, so the last is the
  only one that can cross the container's border. Stop the ROW short of the
  border rather than shrinking the text: shrinking fixes one label and leaves
  the next author to rediscover it.

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

### Compose, do not re-create

A scene is assembled from parts that already exist. Before drawing anything,
open the scenes that are already in `diagrams/scenes/` and look for what this
one needs: most of it is there, and a part that is reused is a part that
cannot disagree with itself on another page.

- **Survey first.** `grep` the scenes for the thing you are about to draw - a
  Dapr hexagon, a dashed region with a caption, a column of cards off a bus, a
  row of cloud marks. Reuse what fits. Re-creating it is how two pages end up
  drawing the same object two ways.
- **A motif used twice is a builder.** The second time you need something, do
  not copy the first one: extract it, give it a test, and put both call sites
  on it. A copy is a thing that drifts; the drift is invisible because every
  test still passes.
- **A builder owns its drawing.** Share the DECISIONS, not just the shape:
  if a caller can still pass something that changes the layout, nothing has
  been made consistent. `apiTile()` drops `glyphSize`, `glyphDy` and `nameDy`
  before they reach `tile()` for exactly this reason.
- **A component takes ONE size and derives the rest.** The same part appears
  large in a sparse diagram and small in a dense one, and that is fine - but
  it must be the same drawing at two sizes, not two drawings. Express every
  offset inside the component as a multiple of its one dimension, name those
  ratios as exported constants, and let the scene choose only the dimension.
  `serviceHex()` takes `r`; the name sits at `r * NAME_DY` and the role at
  `r * ROLE_DY`, so the five services are the same component at three sizes
  across three diagrams. `apiTile()` takes the card's size and the mark
  follows at `TILE_GLYPH` of it. A test asserts that halving the one dimension
  halves everything derived from it.
- **Derive from the side that constrains the part, not the first one to hand.**
  `apiTile()` takes its glyph from the card's SHORT side: the cross-cutting
  blocks on the overview are 160 by 76, with the mark beside the name rather
  than above it, and a glyph taken from the width would be twice the height of
  the card holding it.
- **Resizing is then one number.** When a column has to fit a space - clearing
  a band below it, say - change the component's one dimension and the pitch
  around it. Nothing inside needs touching, and nothing can be left behind at
  the old size.
- **A shape and its name are ONE component, so the name scales with it.** This
  holds whether the name sits inside the shape or under it: a hexagon with
  "Sentry" beneath it is not a hexagon that happens to have a caption nearby,
  it is the service, and shrinking the shape while leaving the type behind
  gives a smaller drawing with the old name crowding it. Derive the size from
  the same dimension as everything else.
- **Near-equal is a default, not a law.** A component may be drawn larger
  where the diagram around it is larger - the self-hosted containers stand
  beside 104 cards and read as minor at the reference radius, so they are
  drawn at 44 and their names come out at 16.8 against 13 elsewhere. That is
  allowed BECAUSE the component scales as a whole: the mark, the offsets and
  the type all move together, so it is the same drawing bigger. What is not
  allowed is changing one of them by hand. Say in the scene why it differs.
- **ONE line weight for everything in a diagram, outlines included.** An
  arrow, a bus, a dashed border, a hexagon's outline and a card's outline all
  take `lineWidth()`. Deriving a border from its own SHAPE was tried and is
  wrong: the three shapes in the building block concept came out at 1.4, 2.75
  and 3.6, a two-and-a-half-fold spread between things sitting next to each
  other, because shapes in one drawing are not meant to read as different
  weights of the same thing.
- **The weight comes from the CANVAS, which is what makes it consistent.** The
  inlined svg fills the content column, so a stroke of n units renders at
  `n * column / width`: a fixed 2 came out at 1.05px on the 1512-wide overview
  and 2.34px on the 680-wide building block concept. `lineWidth()` returns the
  units that render at `LINE_TARGET` (1.5px) for the canvas the exporter set,
  clamped to `LINE_MIN` 1.4 and `LINE_MAX` 3.2, so every diagram in the set
  draws at the same apparent thickness. Scaling a diagram therefore needs no
  thought about its lines - they follow the canvas.
- **Then keep the dimension itself close across diagrams.** Once type is
  derived, a component drawn at r = 30 on one page and r = 44 on another has
  names at 11.5 and 16.8 - correct by the ratio and wrong on the page, because
  the same object now reads as two sizes. The point of deriving is that
  choosing near-equal dimensions gives near-equal outlines AND near-equal
  type for free, so pick radii near the reference rather than per scene.
  These three diagrams run 58.9, 58.9 and 62.4 units wide with names at 13, 13
  and 13.76.
- **A component too small to carry a legible name is refused.** The floor is
  11px. Clamping silently would ship an unreadable label; throwing says the
  block has to be drawn larger. Note that this makes "half the size" an
  invalid test case for a small component - scale UP to prove the ratio.
- **A text baseline does not scale in the same ratio as the shape** around it,
  because it carries a type term. When testing that a component scales,
  compare how far an offset MOVED, not where the baseline landed.
- **A part that sits beside a component copies its offsets.** The Consul
  hexagon on the VM diagram is not a Dapr service, but its name uses the same
  `NAME_DY`, or the four names in a column would not line up.
- **A diagram that mirrors a drawing published elsewhere says so, and says
  where it stops.** The overview follows an existing published layout band for
  band and keeps its hub mark larger than `DAPR_MARK` would give; both are
  deliberate and both are written into the scene. Without that note the next
  person measures the inconsistency and "fixes" it.
- **One exception, named, beats a free option.** Where a scene genuinely must
  differ, let it pass the one value and say in a comment why - the overview's
  hub is matched to a drawing published elsewhere, so it sets its own mark
  size and nothing else does.
- **What there is to compose from today:**

  | Part | Where | Used by |
  | --- | --- | --- |
  | A card: a box with a mark and a name | `card()` in `diagrams/cards.mjs` | every card in the set, through `apiTile()` or directly |
  | A Dapr API block | `apiTile()` in `diagrams/apis.mjs` | overview, building-blocks, all three hosting scenes |
  | A hexagon with a mark in it | `markHex()` in `diagrams/icons.mjs` | sidecar-model, overview, all three hosting scenes |
  | A Dapr control plane service | `serviceHex()` in `diagrams/services.mjs` | all three hosting scenes |
  | An app, with or without its sidecar badge | `hex()`, `daprApp()`, `badge()` | overview, sidecar-model, hosting, agents |
  | A dashed region with a caption on its border | `panel()` + `pill()` | overview's bands, the pods, the VMs, Docker Desktop, agents |
  | A column of cards fed by one vertical bus | `el('polyline')` + `arrow()` per card | standalone, kubernetes, vms, agents |
  | Evenly spaced centres | `slots()` | overview, building-blocks, agents |
  | A brand mark on a plate, with its name beside it | `brand()`, `plate()` | overview, hosting-kubernetes |

  The bus-and-column row is four copies of the same twelve lines. It is the
  next thing that should become a builder; it has not yet because the four
  differ in where the bus starts and what feeds it, and a builder that takes
  six options to cover four callers is not yet worth writing. Extract it when
  the fifth one needs it.

### Dapr API blocks

A Dapr API is always drawn the same way: a rounded square, its Fluent mark,
its name in blue, and `alpha` in the corner where that applies. That drawing
is `apiTile()` and the definitions behind it are `diagrams/apis.mjs`.

- **Never re-declare a mark or a name in a scene.** Name the API and let the
  catalogue supply both: `apiTile({ key: 'pubsub', x, y, w, h })`. A scene that
  writes `['mail-copy', 'Publish & subscribe']` for itself has made a private
  copy that nothing keeps in step with the others.
- **An unknown key throws.** A typo that fell through would draw a tile with no
  mark and the word `undefined` on it, which no layout test can see.
- **Two forms of each name are kept, and both are in the catalogue.** `name` is
  the one-line form; `wrap: true` asks for the agreed two-line break for a
  narrow tile. Where a name breaks is a decision made once, not per call, and a
  test asserts the two forms are the same words.
- **The `alpha` tag comes from the catalogue,** so no scene can ship an alpha
  API untagged, or tag one that has gone stable. Changing an API's status is a
  change in one file.
- **Adding an API is a change to the catalogue, once.** Scenes that show the
  whole set pick it up; scenes that show a handful name the handful.
- **`glyph` is the drawn size of the mark** and is separate from `tile()`'s own
  `glyphSize`, which asks for the mark and the name to be centred as one group.
  A square tile with a two-line name wants both; a wide one wants only `glyph`.
- **Descriptions stay in the scene.** They are broken to a particular card
  width, so they are layout, not identity.

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
- **Center a region, and a ROW of regions, in its container.** Derive the
  position from the container's centre and the group's own width; never type a
  left margin and hope the right one matches. A row of five boxes is one group
  whose width is `n * BOX + (n - 1) * GAP`:

  ```js
  const ROW_W = n * BOX_W + (n - 1) * GAP;
  const X0 = BOX.x + (BOX.w - ROW_W) / 2 + BOX_W / 2;   // first box's CENTRE
  ```

  Then read the two margins back off the rendered page and check they match.
- **After centring, re-check whatever extends beyond the group's own boxes.**
  Labels anchored `start` beside each item stick out to the right of it, so
  centring the boxes can push the last label through the container's border.
  The boxes being centred and the contents fitting are two different checks.
- **Center a repeated group in its region by computing its extent,** from the
  first shape's top edge to the last label's descender, rather than choosing a
  starting y that looks about right. Derive the start from the region's center
  and the group's height, so it stays centered when the region, the spacing or
  the number of items changes:

  ```js
  const GROUP_H = (count - 1) * PITCH + R + LABEL_DY + 4;
  const TOP = REGION.y + REGION.h / 2 - GROUP_H / 2 + R;
  ```

- **When a group is asymmetric, derive its anchor from its own extent.** Two
  overlapping hexagons, one down and to the right of the other, have a group
  centre that is NOT either hexagon's centre. Measure the group's left, right,
  top and bottom from the shapes' own radii, then place the anchor shape from
  the container's centre and that asymmetry, instead of nudging both shapes
  until the gaps look even:

  ```js
  const APP_X = BOX_CX - (GROUP_R - GROUP_L) / 2;
  const APP_Y = BOX_CY - (GROUP_B - GROUP_T) / 2;
  ```

- **Centring and alignment can conflict, and over a SHORT run alignment wins.**
  A shape centred in its container may sit a little off the column it connects
  to; a lean of fifteen units is invisible over a long arrow and obvious over a
  short one. When the connector is short, align the shape to what it points at
  and let the group sit slightly off centre, which nobody reads as a mistake.
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

- **One line weight for every arrow, bus and dashed border, and it is derived
  from the CANVAS.** A constant does not work: the inlined svg fills the
  content column, so a stroke of n units renders at `n * column / width`, and
  the same 2 came out at 1.05px on the 1512-wide overview and 2.34px on the
  680-wide building block concept - the thin ones looked faint and the fat
  ones looked clumsy. `lineWidth()` returns the units that render at
  `LINE_TARGET` (1.5px) for whatever canvas the exporter set, so the lines look
  identical from one diagram to the next. Outlines take the same weight - see
  the line rule above.
- **A line turns with an ARC, never a mitre.** Use `roundedPath()` for any run
  that changes direction: a square corner reads as two lines that happen to
  meet, a rounded one as a single line going somewhere. 14 units is the house
  radius for a bus and 10 for the smaller elbow on a lollipop; the builder
  clamps to half the shortest leg, so a tight turn cannot fold back on itself.
- **A turn means the run is ONE path, not two that touch.** This is the part
  that is easy to get wrong: a bus drawn as a polyline with arrows standing on
  it has no corner to round, because the corner lives in the gap between two
  separate elements. Draw the whole run - along, around, along - as one
  `roundedPath()`, and start the arrows that leave its ENDS beyond the radius
  so they pick up where the curve stops. Only the joins in the MIDDLE of a run
  are genuine T-joins, and those stay square because nothing turns there.
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
- **Two things that talk to each other both ways share ONE line with a head at
  each end,** not two lines side by side. Draw the same arrow twice, once in
  each direction; the line is drawn over itself and only the heads differ. Put
  the two shapes at the same height so that line is straight, and let anything
  else that joins them, such as a bus dropping in, land on the same line rather
  than running a second one beside it.
- **Two dashed regions need a clear gap between them.** Edges that nearly touch
  read as a mistake. Leave several times the dash pitch.
- **A region and its caption are ONE object: use `region()`.** The pill on a
  dashed area takes the area's own stroke, because a caption outlined in a
  different colour from the border it sits on reads as a separate thing that
  happens to overlap it. Drawing the two together is what stops them diverging,
  and they had: the Kubernetes pods were dashed in blue with navy pills, and
  the overview's first band was dashed in teal with a navy pill.
- **The caption's TEXT is body ink, whatever colour the region is.** It is a
  name, not a piece of the border. Tinting it with the region's colour both
  weakens it and, for the paler strokes, takes it under the contrast a label
  needs - teal and mint are refused as ink for exactly that reason.
- **A diagram's own caption is body ink too** - the line under the drawing that
  qualifies it, such as "some of the components for each block". It is the
  quietest thing on the canvas by position, not by colour, and in the dark
  theme body ink is the off-white, so it follows the theme without a second
  token.
- **A caption and the things it captions need a drawn relationship.** A heading
  floating above a row of marks is just a heading near some marks. Put both
  inside one dashed region with the caption on its border, as the overview
  scene's bands do.
- **An annotation with nothing attached to it reads as lost.** If a thing acts
  on something in the diagram, draw the arrow. Route it clear of what is
  already there: below the lowest point of a drop line, not across it.
- **Equal spacing is `slots()` when the items are the same width.** Anything
  you space by typing coordinates will be unequal the first time the count
  changes.
- **When the items differ in width, equal spacing means equal GAPS, not equal
  centres.** `slots()` spaces centres, so a narrow item in a row of wide ones
  gets a hole beside it. Give each item the width it VISIBLY draws, then share
  the leftover space out as equal gaps:

  ```js
  const GAP = (BAND.w - 2 * EDGE - items.reduce((a, m) => a + m.span, 0)) / (items.length - 1);
  ```

  Two things make `span` easy to get wrong. A mark plus a name beside it is one
  item, so its span is mark plus gap plus the name's width - and the exporter
  has no font metrics, so measure the name once on the rendered page and write
  the number down. And padding that is invisible in one theme, such as a
  plate behind a wordmark, is NOT part of the span; counting it widens the gaps
  around exactly those items. Measure the gaps afterwards and check they match.
- **A repeated element's box must be NARROWER than its pitch,** or adjacent
  boxes touch. Name the margin you want from a border once, as a constant, and
  derive positions from it rather than repeating the number:

  ```js
  const EDGE = 24;                                  // least space to any border
  const POD_Y = REGION.y + EDGE + POD_H / 2;
  ```
- **A row of marks is plated or it is not; never half and half.** A
  full-colour mark needs a plate to stay legible on the dark ground, and once
  one mark in a row has one the single-colour marks beside it need one too, or
  the row reads as two kinds of thing. The overview plates every language mark
  for this reason, including the ones that are a single colour.
- **A plated mark takes PLATE ink, not body ink.** `icon()` tints a
  single-colour mark with whatever `color` says, and body ink is near-white in
  the dark theme - on a light plate that is invisible. `C.plateInk` exists for
  exactly this.
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
- **Some projects publish their logo as a raster inside an svg wrapper.**
  Zipkin's is one: every variant in its own repository is a base64 PNG in an
  `<image>`. Use it anyway when it is the official mark, but know the cost: it
  does not scale crisply like the vector marks, and it adds its whole payload
  to the generated file, which is tens of kilobytes. Check it has an alpha
  channel rather than a baked-in background, or it will show as a rectangle in
  one of the two themes. A raster is never tinted: it carries its own colours.
- **Every file is screened on load:** no `<script>`, no event handlers, no
  external `href`, and only an allowlist of elements. The single exception is
  an `<image>` carrying a base64 image payload, which cannot run or fetch
  anything; a data URI anywhere else, or of any other type, is still refused. Metadata namespaces
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

- **The page's words beat the picture's.** Where a source image and the prose
  disagree about what something is called, the prose wins and the diagram
  follows the docs: "Configuration" not "External Configuration",
  "Publish & subscribe" not "Publish / Subscribe". A diagram that labels an API
  differently from the page it sits on teaches the reader a name they will not
  find anywhere else.
- **Say once what is true of every copy.** Where a row repeats across several
  groups - the same four services on three machines - describe it ONCE, in a
  gutter beside the row, rather than labelling each copy. The source for the VM
  diagram said the same thing three times over and the repetition was most of
  its ink.

### 2. Turn the source into a layout

Start by shopping, not drawing. List what the diagram needs, then find each
item in the scenes that already exist and in the builder tables in
[reference/engine.md](reference/engine.md). Anything already drawn somewhere
is reused as it is; anything you would be drawing for the second time in the
set becomes a builder before you use it. Only what is genuinely new to this
diagram is designed from scratch.


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
      daprApp({ x: 150, y: 200, ...APP[0] }),
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

**Swap only the pages the plan names.** A shared image does NOT imply a shared
scene: several in-scope images are also used by pages outside this conversion,
and those pages keep their PNG until someone decides otherwise. Converting one
of them is a scope decision, not a tidy-up. `tests/images-still-resolve.spec.js`
fails when an out-of-scope page stops showing its image, which is how you find
out you have done it.

Above the scene, write a comment saying what it shows and recording any place
it deliberately departs from its source, with the reason.

Before rendering, read back through **Grouping and centering** and **Laying out
connections** against what you have just drawn. Those rules exist because every
one of them was a review note on an earlier scene, and they are cheaper to apply
now than to be told about twice.

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
- **Equal ink weight means equal `size`.** `icon()` fits a 24-unit viewBox by
  scaling it `size / 24`, and a Fluent glyph's stroke is part of that drawing,
  so the stroke scales with it: a mark at 52 and one at 64 beside it differ in
  weight by a quarter, which reads as one of them being wrong. Give every mark
  that stands alone in a scene ONE size and every mark inside a card ANOTHER,
  named as constants, rather than sizing each by eye. A shape builder that
  draws its own outline is a third weight again - `person()` draws at the
  shared 2.2 whatever its `size`, so beside a glyph it looks light. Where they
  must match, use the Fluent mark instead of the hand-drawn shape; they then
  match by construction rather than by a number someone tuned.
- **`slots()` decides spacing WITHIN a span, not the span itself.** It spreads
  centres evenly across what you give it, which leaves half a pitch of margin
  at each END. Handing it the whole canvas therefore bakes that half-pitch in
  as padding you did not choose: the components page carried 95 units on the
  right, and shrinking the canvas could not reduce it because the columns moved
  in with it. Lay a grid out from a left edge by PITCH and let the margin be a
  number you picked.
- **A definition copied into a scene drifts, and nothing tells you.** The
  overview drew sixteen API tiles while the building-blocks page listed
  fifteen - the same set, two different lengths - because each scene carried
  its own copy of the list. Every test passed: each scene was internally
  consistent, and no test compared two scenes. Shared facts belong in one
  module that the scenes name, not in a literal each scene repeats.
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
- **Do not read a Playwright run with `tail`.** It prints the failures and
  their names BEFORE the pass count, so the last two lines of a failing run are
  a test name and "N passed", which looks green. Grep for `failed` or the cross
  mark instead.
- **A label wider than its own card passes every other check.** The scene
  resolves, fits its viewBox, shows every expected label and holds its colours
  in both themes; only the box is too small. `tests/diagrams.spec.js` compares
  each tile's label against its tile in both axes, so a card that is too small
  for its name now fails rather than shipping.
- **`getBBox()` on a transformed element returns its LOCAL box, not where it
  sits on the page.** Every inlined mark is in a translated and scaled `<g>`,
  so sweeping a scene with `getBBox` mixes placed coordinates with local ones
  and produces nonsense: negative margins, contents apparently outside their
  own container. Measure untransformed elements (a `<rect>`, a `<text>`, a
  `<polygon>` you placed yourself) with `getBBox`, and anything transformed
  with `getBoundingClientRect`.
- **A NEW svg needs the dev server restarted.** Hugo's watcher picks up
  CHANGES to an asset it already knows, but a file created after the server
  started is invisible to `resources.Get`, so the shortcode errors and the page
  returns 500 while the file sits on disk. The first export of a new scene is
  therefore always a restart. Changing an existing scene is not.
- **An inlined SVG is not portable.** Every colour in a scene is a
  `var(--d-*)`, which resolves against the PAGE. The same markup saved to a
  file or pasted into another tool has nothing to resolve against and paints
  black on black. Anything offered for download or copy is therefore a
  separate, standalone export with the light values substituted in; the
  exporter reads them out of `_tokens.scss` and fails loudly on a token it
  cannot find, so a new token can never ship a half-resolved file. The rendered
  suite asserts the served file starts with `<svg` and contains no `var(`.
- **An output directory that defaults is an output directory a test will
  delete.** The exporter removes files in its output directory that no scene
  claims. A test that redirects one output directory and lets a second default
  points the cleanup pass at the REAL one and empties it — a green run that
  silently destroys committed files. Make the second argument required
  whenever the first is overridden: refuse, do not guess. Both directories are
  siblings in the test, never nested, or a directory snapshot reads one as a
  file in the other.
- **Shrinking the canvas and a shape together changes nothing you can see.**
  The inlined SVG scales to the content column, so only RATIOS inside the scene
  are visible: halve every number and the page looks identical. When a shape is
  too big next to another, change the two sizes against each other and check
  the ratio of their rendered widths, not their coordinates. Name the shape
  everything else is sized against, and say in the scene what the ratio is, or
  the next edit drifts it back.
- **A measurement that comes back unchanged after a change usually means the
  change did not land.** Check that the export actually succeeded before
  concluding a layout fix had no effect: a failed export leaves the previously
  committed SVG in place, and the page keeps serving it.
