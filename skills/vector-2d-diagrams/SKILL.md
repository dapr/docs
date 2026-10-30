---
name: vector-2d-diagrams
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
- **The drawing is CENTRED in its canvas, and that is measured, not eyeballed.**
  A canvas is not a frame a drawing is centred in by construction: the parts
  land where the arithmetic puts them and the air left over falls wherever it
  falls. `sentry-selfhosted` ended a review with 106 units of air on the left
  and 38 on the right, and nothing showed it, because a figure that fills the
  content column has the page's own edges. The moment one renders narrower -
  `{{< diagram name="x" width="70" >}}` - the drawing sits visibly off to one
  side of its own white space.
  You do not fix this by moving coordinates. `diagrams/bbox.json` holds the
  viewBox ORIGIN that squares each scene up, `npm run measure:bbox` measures
  it in a browser and rewrites the file, and the exporter passes it to `svg()`.
  Measured, because most of a drawing's extent is TEXT and text has no width
  until a font renders it - the same reason `ink.json` exists. Run it after
  anything that moves a scene's extent, and the rendered test
  `centres its drawing in its canvas` will tell you when you forget.
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
  not in pixels a reader sees. Do not answer this by sizing a scene's labels
  against its canvas, which fights every rule about keeping one type size
  across the set: answer it with how wide the figure RENDERS, below.
- **A small canvas renders BIG, and the shortcode's `width` is the lever - set
  from a calculation, not by eye.** A scene unit renders at
  `columnWidth / canvasWidth`, so the narrower the canvas, the further it is
  stretched and the larger everything in it comes out. Measured across this set
  in a 900px column, a 13-unit label renders **17.2px** in
  `building-blocks-concept` (canvas 680) and **7.7px** in `overview`
  (canvas 1512). The same declared size, two and a bit times apart, decided by
  nothing but how wide the canvas happened to end up.
  So a diagram on a small canvas is narrowed where it is CALLED:

  ```
  {{< diagram name="sentry-selfhosted" width="70" >}}
  ```

  ```
  width = round(canvasWidth / 1100 * 20) * 5     // nearest 5, capped at 100
  ```

  Leave it out above 85: the difference is not worth the markup. The divisor is
  not a taste: the canvases in this set fall into two groups with a clear gap
  between 1050 and 1122 - full-page architecture diagrams above it, set-pieces
  below - and 1100 sits in that gap. It puts a 13-unit label near 10.6 CSS px
  in a 900px column, which is `sentry-selfhosted` at 70%, the size that was
  reviewed and accepted.

  | canvas | width | | canvas | width |
  | --- | --- | --- | --- | --- |
  | 680 | 60 | | 900 | 80 |
  | 730 | 65 | | 914 | 85 |
  | 770 | 70 | | 940 | 85 |
  | 880 | 80 | | 1050 and up | leave it out |

  This changes nothing in the scene, and it is not a way to make a diagram you
  think looks too big smaller - it is how the TYPE stays one size across the
  set. Shrinking the canvas instead does nothing at all; see the rule on that
  under Gotchas. `width` is ignored below the `md` breakpoint, where the column
  is already the smallest a drawing can usefully be.

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
- **App hexagons take `APP` in order, and every one is SOLID:** green, light
  blue, yellow, teal, dark blue - each outlined in `C.appInk` and carrying
  its name ON the fill, dark on the green and the yellow, white on the other
  three. Nothing in that list is tinted, and nothing in it changes with the
  theme: the name sits on the colour, not on the page. With more than five
  apps, colour by ROLE, so apps of one kind share a colour.
- **White on the light blue and on the teal is under the contrast floor, and
  it stays.** They measure 2.56:1 and 2.63:1, where even large type wants
  3:1. That is a house decision in favour of the brand colours, taken with
  the numbers in hand, and `engine.mjs` says so where the ink is set. Do not
  "fix" one diagram by inking those two differently: that makes a sixth app
  colour nothing else in the set shares. Dark ink on either measures about
  7:1, if the decision is ever revisited.
- **Yellow is the third app and the data store.** It used to be barred for
  being too light to outline on the light ground. It is in the palette now
  because it is only ever used SOLID with dark ink on it, which measures
  11.3:1 - the objection was to yellow as a TINT under body text.
- **A data store is gold and a message broker is green,** both solid, both
  outlined in `C.appInk`, both naming themselves in dark ink INSIDE the
  shape. The one exception: in a diagram with exactly ONE app, that app is
  the green, so the broker takes another standard Dapr fill. With two or more
  apps the broker stays green - a reader telling three apps apart by colour
  is not going to mistake the pipe between them for one of them, and a green
  broker in every such diagram is worth more than a local distinction.
- **An app colour on something that is not an app says it belongs to that
  app.** `secureLock()` was tinted with the first app's green, so the mTLS
  shield on `security-end-to-end` read as App A's rather than as the thing
  between the two sidecars, and the hand-drawn person shape that preceded the
  Fluent glyph had the same default, which would have made an operator look
  like App A in a hat. The shield is
  sky now and the operator is a navy Fluent glyph. Reach for an `APP` fill only
  for an app.
- **A dashed region's border is a colour that follows the theme.** The brand
  colours - sky among them - are deliberately the same value in both, so a
  region drawn in one does not re-theme with the page. `C.caption` is the
  default for a grouping border and the right answer nearly always; the
  theme test only samples the FIRST panel in a scene, so a scene whose only
  region is sky fails it and a scene whose second region is sky does not.
  That is the test being thin, not permission.
- **A large Dapr hexagon** is navy with the logo inside it.
- **What the other colors mean:**
  - `C.navy` for arrows and Dapr badges
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
- **A label sits under the thing it names, centered on it.** Centered is the
  default because it is the one position a reader never has to reason about:
  a label belongs to whatever it is centered on, and one that drifts has
  quietly changed what it names. A LINE's label may sit above the line
  instead, which is often the only place it fits when the space under the
  line is already carrying something else; either way it is centered on the
  SPAN, so pass `label()` the midpoint of the run rather than one end plus a
  guess.
- **Leave about two characters of clearance to every shape NEAR the label,**
  not just to the two the span runs between. A character of the page's font
  advances roughly half its size, so two of them is about the label's own
  size in units - a dozen at the default 11. The shape that crowds a label
  is usually one the span never touches: an app hexagon whose sloping edge
  hangs down beside the line, a card above it, a badge below. Clearing the
  label against the shapes at the ENDS of the span is the mistake, because
  those are the two it is furthest from.
- **Measure that clearance against the label's BOX, not its baseline.** A
  sloping edge is nearest the text at the TOP of the glyphs, about 0.72 of
  the size above the baseline, and `hexHalfWidthAt(r, dy)` gives a hexagon's
  edge at a height rather than at its widest point. `hexHalfWidth(r)` is the
  widest the shape ever gets, so a label cleared against it has not been
  cleared at all.
- **When the shapes leave too little room to clear both ends, break the
  centering, not the clearance.** Center the label in what the NEAREST edges
  leave rather than in the span's own ends, and say in the scene why it is
  off-center, because the next person to read the code will otherwise
  straighten it. In `observability-tracing`, "Subscribe" centered between the
  broker and Service C's SIDECAR ran INTO Service C's app hexagon, which
  hangs lower and further left than the sidecar it is docked on; centered in
  what that hexagon leaves, it clears both ends by a little over two
  characters. If no position clears both ends, the label is in the wrong
  place or the span is too short, and neither is fixed by shrinking the text
  - see `MIN_LABEL` below. Half a size is an estimate and caps run wider, so
  measure a tight fit on the rendered page before trusting it.
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
- **Every app hexagon is a solid brand fill with its name ON it.** `APP[0]`
  is `--d-green` (`#0bdda3`, sampled from the source images), then
  `--d-app-sky`, `--d-app-gold`, `--d-app-teal` and `--d-app-blue`, every one
  outlined in `--d-app-ink`. All of those tokens are identical in the two
  themes, because the ink sits on the FILL rather than on the page: dark ink
  measures 8.9:1 on the green either way, while the 0.6 tint other shapes use
  would drop that to about 3.6:1 on the dark ground. These are the shapes in
  the set that do NOT follow the theme, and `hex()` marks them `d-hex-solid`
  so the theme test knows to look past their names. Which ink goes on which
  fill is in the colour rules above; a name set in the wrong one is the
  failure those rules exist to stop.
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
  own - the sidecar hexagon, an API block, a Dapr service - AND the external
  systems Dapr connects to: the thing an output binding plugs into, the thing
  whose event fires an input binding trigger. Both are the EDGE of the
  picture, the points where your solution meets something else, and a reader
  following the blue is following that edge. Navy is for what sits under the
  picture instead: the lines themselves, the Dapr badge, the infrastructure,
  the user. A reader who learns that on one page should not have to relearn
  it on the next.
- **An external system is a MARK in that blue, never a shape with a fill.**
  It is outside the boundary, so it gets no card, no region and no colour of
  its own - a glyph and a name in body ink, as `resiliency-policies` draws
  the flash that triggers it and the plug it binds out to. Naming both ends
  the same way is what says they are the same kind of thing.
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
- **An arrow starts at whoever ACTS, not at where the data happens to sit.**
  In self-hosted mode the trust anchors come out of files on disk, so the
  first draft of `sentry-selfhosted` ran the line from the filesystem to the
  sidecars - which drew a directory reaching into a process on its own. A
  person reads those files and sets three environment variables; the run
  starts at the operator, and the label names the files. When a step has a
  human in it, the human is in the picture.
- **An elbowed line with a head is `elbowArrow()`, not a `roundedPath()` with
  an `arrow()` laid over it.** Five scenes had written that pair by hand before
  it was one function, which is two shapes to keep in step every time a point
  moves. Give it the points; `heads` puts the chevron on the end, the start,
  both or neither. A feeder that runs INTO a bus takes `heads: 'none'` - the
  head belongs at the far end of the bus, where the traffic actually arrives.
- **A caption is centred ON its border, so HALF of it hangs INSIDE the box.**
  `region()` and `pod()` put the pill across the top edge, which spends the top
  13 units of the box - directly over whatever stands at the top of the
  contents, which in a pod is the app hexagon's own top node. Pad a region from
  the PILL's lower edge, not from the border: `captionReach()` is exported for
  that, and `sentry-kubernetes` derives its pod height from it rather than
  choosing a number. This is the clearance that goes first when a pod is
  shrunk to buy height elsewhere, and nothing warns you - the scene still
  exports, the bbox is still inside the viewBox, every label is still drawn,
  and both app hexagons are drawn through their own pod names. That shipped
  through a review round here, which is why there is now a rendered test,
  `keeps every caption clear of the contents it names`.
- **A Kubernetes pod is `pod()`.** A dashed sky box with rounded corners and
  the pod's name on its top edge, the same everywhere. The caption width is
  measured, like every pill in the set, and `captionX` moves it along the top
  edge - which it has to when a line leaves the shape underneath it, as Pod B's
  did in `sentry-kubernetes`.
- **An app on the right-hand side of a picture turns its sidecar inward:
  `appSidecar({ mirror: true })`.** The sidecar's near edge still sits on the
  app's centre and still drops below it by the same clearance; only the side
  changes. Without it the line between two sidecars has to cross the right-hand
  app to reach its own.
- **A line leaves a hexagon at a NODE, or square out of an edge - never along
  one.** The trust anchors arrive at the sidecar's bottom node, which reads as
  arriving; the certificate request first left the upper outer node going
  straight UP, which lies along the vertical edge below it and reads as the
  line sliding off the shape rather than leaving it. It now leaves that node
  sideways, square to both edges that meet there, and turns up once it is
  clear. The sidecar's own top node is not available: the app hexagon hangs
  over it, and a riser from there would emerge from behind the app.
- **A mark that annotates a line sits CLEAR of it, and so does its name.** The
  mTLS shield was placed by eye at `ROW_Y + 16` and its lower edge landed on
  the arrow it marks; the name beside it then had to fit between two risers
  that had moved in. Put the shield above the line by half its height plus the
  name's, and stack the name under the shield rather than beside it: a vertical
  group needs a third of the width and can be centred between whatever else is
  in the column.
- **Centre a pair in its box with `appSidecarCentre()`, never on the app
  hexagon.** The sidecar hangs off one side and below, so the pair's centre is
  not the app's. `hosting-kubernetes` worked this out inline and had the
  sidecar's circumradius standing in for its half width, which put the pair two
  units off.
- **Two scenes that are the same picture with one thing different share a
  skeleton only for as long as BOTH pictures want that shape.**
  `sentry-selfhosted` and `sentry-kubernetes` were built on identical
  coordinates, which is what made the one difference between them readable.
  Then the self-hosted one was rearranged to follow its own source image - the
  certs in the apps' row, Sentry centred over the apps, the operator centred
  under them - and the Kubernetes one could not follow it, because it has two
  pods and an injector to place that the other does not draw. Letting the
  skeleton break was the right call; the cost is paid in the header comments,
  where each scene now says where the other one stands and why, so the next
  reader does not take the divergence for drift.
- **A line arriving at a hexagon's BOTTOM NODE takes the place its name wanted,
  so move the name - through the component, not around it.** The two
  certificate requests in `sentry-selfhosted` merge below Sentry and come up
  into its bottom node, which is exactly where `serviceHex()` puts the name and
  the role. The scene does not draw its own labels there - scenes doing that by
  hand is how the offsets drifted before `services.mjs` existed - it asks for
  `side: 'right'`, which stacks the name and the role beside the hexagon,
  centred on it, off the same radius as every other measurement.
- **A mark with its name under it has THREE sides, not four.** A point-like
  mark - an icon, a glyph - looks like something a line can reach from any
  direction, and then its name takes one of those directions away. The
  operator in `sentry-selfhosted` sends the trust anchors up and the optional
  certs sideways because those are the only exits it has left: its own name
  holds the bottom. The same count is why the certs' name sits UNDER the mark
  in that scene and ABOVE it in `sentry-kubernetes` - whichever side carries no
  line is the side the name gets. Count the lines a mark has to carry before
  choosing where its name goes, not after.
- **A line may arrive at the NAME.** A mark and its name are one object, and
  the name is often the nearer edge of it. The operator's run to the certs in
  `sentry-selfhosted` ends on the underside of "Filesystem" rather than at the
  mark's own side, which let it rise in the certs' own column: one corner
  instead of two, and the whole left of the picture - the read coming down, the
  mark, the name, the optional run coming up - standing on one vertical line.
  Arriving at the side would have bought a dogleg and said nothing more.
- **Centring two marks on one axis SPENDS that axis.** In `sentry-selfhosted`
  Sentry is centred over the two apps and the operator is centred under them,
  so the column between the apps already carries the request trunk going up and
  the trust riser coming down. The lock that marks the line between the two
  sidecars could not be centred on it as well: it went in the gap left between
  the two risers, and the risers were placed where they are to leave that gap.
  Before centring a third thing, count what the line already carries. A centre
  line is the most contested space in a picture, not the emptiest.
- **A canvas is as wide as the distance between its parts, and every unit of
  that distance is a line a reader has to follow.** The first
  `sentry-selfhosted` was 920x566: the certs top left, Sentry centred over two
  apps 350 apart, the operator stacked under the certs. Nothing stood in the
  middle, so every run crossed a hole to get anywhere. Moving Sentry in beside
  the certs it reads, closing the apps to the width the lock between them
  needs, and wrapping the two long labels so they fit INTO the gap the runs
  were crossing took it to 800x490 with the same content - a quarter less
  picture, and no run longer than its job. The 16:9 floor is a minimum WIDTH,
  not a licence to spread: a scene that meets it by growing has only moved the
  whitespace somewhere else.
- **Marks that stand together are fitted the same way, and `fit: 'ink'` is the
  way.** `icon()` scales a mark by its 24-unit viewBox by default, and a Fluent
  glyph leaves margin inside that box: at `size: 42` only 35 units of it are
  drawing. The operator on the sentry scenes was drawn that way under a
  filesystem mark at `fit: 'ink'`, and read as much the smaller of the two
  although the two numbers were close. `fit: 'ink'` sizes a mark by what it
  DRAWS, measured into `ink.json` by `npm run measure:ink`. Two marks a reader
  will compare - one above the other in a column, or along a row - are both
  fitted to their ink.
- **An app hexagon hangs over the LEFT of its own sidecar.** The badge docks
  bottom RIGHT, so its centre sits about a sixth of the app radius below the
  hexagon's lowest point and well to the right of the hexagon's centre: a
  line leaving that sidecar to the LEFT passes under the app, and the space
  above it belongs to the app, not to the line. Two labels in
  `resiliency-policies` were written into that space before anyone measured
  it. Either move the shape at the other end until the label fits beside the
  app, or set that one label under its line and say why.
- **A data store is drawn `STORE_RATIO` wide to tall - a little wider than
  tall, and no flatter.** Give `cylinder()` a centre and a WIDTH and it takes
  care of the rest: the height follows the ratio and the rim follows the
  width, so two stores of different sizes are the same shape. The `top` and
  `bottom` form is for a store that has to fit a space it did not choose.
  Flatter than the ratio is the mistake to avoid - the first store drawn here
  was nearly twice as wide as it was tall, which left a body too shallow for
  its own name and put the text across the back rim.
- **A data store is a STANDING cylinder, wider than it is tall. A message
  broker is one LYING on its side, two to three times as long as it is
  across.** `cylinder()` and `pipe()` refuse the other proportions rather
  than drawing them, because proportion is the ONLY thing that tells the two
  apart: a store is a tank things sit IN, a broker a pipe they pass THROUGH.
  A tall narrow "store" is a broker stood on its end, and a pipe five
  diameters long stops reading as a shape and starts reading as a line with
  ends on it. Both carry their name inside the shape, and `cylinder()`
  refuses a body too shallow to hold one rather than setting the name
  smaller - the fix is a deeper store, as with `MIN_LABEL`.
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
- **When a NEIGHBOUR sets the radius, the name is chosen, not derived.** The
  Scheduler on `scheduler-architecture` is as big as the sidecar beside it,
  because one of two shapes that call each other drawn smaller reads as the
  lesser of them. That radius is three times `SERVICE_R`, and a name derived
  from it comes out at 23 in a scene whose body type is 13 - the names stop
  being names and become the subject. `serviceHex()` takes a `size` for this,
  and the rule that comes with it is the point: every name under a hexagon in
  that scene takes the SAME chosen size, so the exception is one decision in
  one place rather than the drift the module exists to prevent. A scene that
  passes `size` says in a comment which neighbour set the radius.
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
- **A region's contents are centred in it on BOTH axes.** The vertical is the
  one people remember; a card whose contents are centred top to bottom and
  left-aligned by accident reads as unfinished. Derive both from the region
  box, not from an inset that happened to look right.
- **Contents that pass UNDER a caption pill centre in the space it leaves.**
  The pill straddles the top edge, so it hangs into the region by half its
  height; contents centred in the whole box come up against it. Centre them
  between the pill and the far border instead, which moves them down by half
  the intrusion and leaves the same gap above as below:

  ```js
  const PILL_BOTTOM = REGION.y + CAPTION_H / 2;
  const Y = (PILL_BOTTOM + REGION.y + REGION.h) / 2;
  ```

  Half the intrusion is the whole nudge. Pushing further to buy a comfortable
  gap under the pill spends it at the bottom instead, and the block then
  reads as sitting on the floor of the card - that mistake was made here
  first, with a hand-picked clearance of 18 that left 18 above and 11 below.
  Nothing moves when the pill and the contents do not overlap: the metrics
  card's mark sits to the right of its own pill, so it stays centred in the
  card. And this is the VERTICAL axis only - sideways, a label moved off
  centre to dodge something reads as a label that missed.
- **A line that threads THROUGH a region does not move its contents off
  centre.** Contents centre in the region; keeping them clear of the line is
  the REGION's job, so widen the card until both fit rather than sliding the
  label sideways - a label off its own centre reads as a label that missed,
  and the next person will "fix" it. In `observability-sidecar` the logs
  card's column runs up through its right third, past four levels centred in
  the card with three characters to spare. The caption pill is the same
  problem on the other axis: it sits ON the top edge, so a card centred on
  its own line would have the two meet, and the fix there IS to move the line
  off centre, because a pill, unlike the contents, belongs to the border.
- **`slots()` spaces CENTRES, so it is for items of one size.** A row of
  marks, tiles or hexagons that are all the same width is what it is for.
  Three shapes of three different widths spaced by their centres overlap at
  the wide one - a state store, a broker and a block laid out that way had
  the first two touching. Space those by their SPANS instead, with the gap
  that makes the two end margins match:

  ```js
  const GAP = (ROW_W - EDGE * 2 - items.reduce((a, i) => a + i.w, 0)) / (items.length - 1);
  ```
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
- **A note ABOUT the drawing is a `callout()`, and it is the one thing
  allowed to point at an angle.** A white card with a black border and a
  dashed leader: every part of that says annotation rather than traffic, so
  a reader never mistakes it for a call. The leader may run at any angle -
  it POINTS rather than carries, and bending it into elbows would make it
  read as flow, which is the opposite of what it is. Keep the card outside
  the region it annotates and the leader clear of every shape between: a
  leader that crosses a hexagon on its way reads as touching it. When every
  approach to the arrow is blocked - a state store sat between the card and
  the arrow it named from every angle - point the callout at the SHAPE that
  call reaches instead. It names the same thing and the line is clear. It is
  also
  the one card that does not follow the theme, because it is paper laid over
  the picture - white in both, with plate ink on it.
- **Run lines along the AXES; a line that has to get somewhere else turns,
  rather than cutting across.** Horizontal and vertical is the house route,
  and an angled line is the exception that has to earn itself: it crosses
  whatever happens to lie between its ends, it meets its shapes at an angle
  nothing else in the set uses, and two of them at slightly different angles
  read as a mistake rather than as a pair. Leave a shape on one of its axes,
  run along, and turn into the target with a `roundedPath()` elbow - two
  corners buy a route the reader can follow. A short diagonal between two
  shapes with nothing between them and no second line beside it can stand;
  the moment there are two of them, or one is long enough to pass something,
  they all become elbows.
- **Lines that arrive at the same place arrive ON the same line.** Pick the
  trunk first - whichever source is already square to the target - and route
  the rest onto it. In `observability-tracing` three sidecars send the
  tracing context to one region: Service B sits above it and drops straight
  down, and A and C come down onto a shared bus and turn into that drop with
  two elbows each. What reaches the region is ONE line arriving once, with
  one head, rather than three arrows converging on a box from three angles -
  and the three carry the same thing, so one line is also the truer picture.
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
- **An interface is a ball and socket, and it needs no arrowhead.** The side
  that PROVIDES the interface gets `lollipop()`, the side that REQUIRES it
  gets `socket()` cupping the same ball, and the notation already says which
  way the call runs - from the socket to the ball. Draw the socket first, so
  the ball's fill covers where the two stalks meet it. Use it wherever one
  side exposes something the other calls - a health endpoint, an API - and
  name the endpoint under the ball in the code font. `app-health` and
  `sidecar-health` are the same two shapes with the ball on the other one,
  which is the whole difference between the two pages.
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
- **The one edit allowed is a `<style>` block that would restyle the PAGE,**
  and only when the file is otherwise the best mark available. `icons.mjs`
  refuses a bare element selector, because these files are inlined into the
  page: CNCF's `fluentd-icon-color.svg` opens with `<style>svg
  {enable-background:...}</style>`, a dead SVG 1.1 property no browser
  implements. Remove that element, touch nothing else, and record the edit in
  the README with what was removed and why. What the trademark guidelines
  protect is the artwork; dead CSS in the wrapper is not the artwork. If
  removing it would change how the mark DRAWS, it is not this exception -
  find another file.
- **Record every mark** in `daprdocs/assets/icons/README.md`: the file, what it
  is, the source URL, the license, whether it is single or full color, and a
  SHA-256 prefix. The tests fail if a file there has no row. Get the file URL
  and license from the Commons API:
  `https://commons.wikimedia.org/w/api.php?action=query&titles=File:<name>.svg&prop=imageinfo&iiprop=url|extmetadata&format=json`
- **A mark that is not freely licensed** needs the maintainers' explicit
  go-ahead, recorded in the README with the decision and who made it.
- **Wide logos and wordmarks** keep their proportions: give `icon()` a `w` and
  `h`. A logo that carries its own name needs no text label beside it.
- **One glyph means one thing across the set.** The README names what every
  mark is FOR, and that column is the check before reusing one: a trigger
  drawn with `fluent-arrow-step-in-right` was borrowing the set's service
  invocation mark, so two unrelated ideas looked like the same idea. Vendor a
  second glyph instead - it costs one download and a README row.
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

When the diagram REPLACES one that readers already know, it is a redraw, not
a redesign. Keep what the source shows and keep its arrangement; change what
is wrong, what the house style draws differently, and nothing else. The
resiliency diagram was first drawn here as three tidy rows - one per
resiliency target - which said everything the page says and was rejected on
sight: the source shows five applications and every call between them, and
the SPREAD is the point. A diagram that teaches the taxonomy correctly can
still be the wrong diagram. If a regrouping genuinely reads better, it is a
proposal to make before drawing it, not a thing to discover at the review.

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

While you are still moving things, use the fast one:

```bash
npm run export:diagrams
node skills/vector-2d-diagrams/scripts/preview-scene.mjs <name>
```

Once the layout has settled, re-measure where the drawing sits in its canvas
and export again, or it will lean:

```bash
npm run measure:bbox
npm run export:diagrams
```

It borrows the last build's stylesheet and webfonts out of `daprdocs/public`
and inlines the exported scene into a page of its own, so it needs no dev
server and takes a couple of seconds instead of a rebuild. It writes both
themes, and it prints the scene's bbox, its four margins and **the measured
box of every label** - which is how a wrap, a clearance or a canvas size gets
decided rather than estimated. Put a label where the numbers say, not where it
looked about right.

Finish on the real page, which is the honest check:

```bash
node skills/vector-2d-diagrams/scripts/render-scene.mjs <name>
```

Only this one shows that the shortcode inlines the scene and that the figure
sits properly in the content column. It needs the dev server.

Neither is optional and neither is a formality. The numeric tests pass on a
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
  draws its own outline is a third weight again: it draws at the shared 2.2
  whatever its `size`, so beside a glyph scaled up it looks light. That is what
  retired the hand-drawn person shape in favour of `fluent-person`. Where a
  drawn shape and a glyph must match, the glyph wins - it matches by
  construction rather than by a number someone tuned.
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
- **Fast Render Mode serves a stale page for anything you were not looking
  at, and it does not look stale.** `npm run serve` runs with it on. Change a
  SHORTCODE - a new `width`, a renamed scene - and the page you have open
  updates while the others keep serving the markup they were built with, with
  no warning in the log, which reads as a change that did not take. It can also
  hold an error after you have fixed it: a shortcode error kept being reported
  at a line and column that were already correct until the server was
  restarted. When a content change seems not to have landed, restart before
  you debug it, and confirm against the served HTML rather than the file:
  `curl -s localhost:1313/<page>/ | grep dapr-diagram`. Note the minifier
  strips attribute quotes, so grep for `data-diagram=name`, not
  `data-diagram="name"`.
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
