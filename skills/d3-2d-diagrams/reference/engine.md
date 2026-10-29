# Engine reference

The engine is `diagrams/engine.mjs`, the shape builders are
`diagrams/shapes.mjs` and the brand-mark loader is `diagrams/icons.mjs`.
Coordinates are in the scene's canvas, set by its `width` and `height`.

Every builder takes a single options object and returns a plain node, so a
scene is an array of nodes rather than a sequence of side effects. Builders are
pure: the same input always gives byte-identical output.

## Engine

| Export | Returns |
| --- | --- |
| `el(tag, attrs, children)` | a node; children may be nodes or strings |
| `text(content)` | a text node, escaped on serialize |
| `serialize(node)` | a string; attributes keep insertion order, so output is deterministic |
| `svg({ width, height, title, desc, id, children })` | a complete document with `<title>` and `<desc>` wired to `role="img"` and `aria-labelledby` |
| `C` | the color tokens, every one a `var(--d-*)` string |
| `APP` | five `{ stroke, fill, ink, solid }` entries for app hexagons, in order |

## Shape builders

| Builder | Options | Draws |
| --- | --- | --- |
| `group(children)` | an array, or `{ children }` | a `<g>`, for positioning or grouping |
| `slots(x0, x1, n)` | — | `n` evenly spaced centers across the span (returns numbers, not a node) |
| `label(o)` | `x, y, text, size` (11), `weight` (600), `color` (`C.body`), `halo`, `anchor`, `mono` | text; `\n` starts a second line, vertically centered. `mono: true` sets the page's code font, for a command or a path |
| `hex(o)` | `x, y, r` (42.5), `stroke, fill, label, size, labelDx` | a pointy-top app hexagon with its name |
| `hexPoints(x, y, r)` | — | the six points, for an arrow descriptor |
| `hexHalfWidth(r)` | — | half a pointy-top hexagon's width, for aligning one shape to another's edge |
| `hexHalfWidthAt(r, dy)` | — | the same at a height `dy` from the centre, for clearing a label past a sloping edge |
| `badge(o)` | `x, y, r` (19), `mark` | the small Dapr hexagon with the logo |
| `daprApp(o)` | `x, y, r, stroke, fill, label, size, labelDx, badgeLeft, mark` | an app with its Dapr badge, bottom right or bottom left |
| `box(o)` | `x, y, w` (194), `h` (30), `label, stroke, fill, size` | a workflow activity rectangle |
| `node(o)` | `x, y, r` (16), `stroke, fill, label, labelDy` | a workflow start or end circle |
| `cylinder(o)` | `x, top, bottom, rx` (54), `ry` (14), `label`, `ink`, `size` | a data store: standing, wider than tall, gold, named inside |
| `pipe(o)` | `x1, x2, y, ry` (34), `rx` (14), `label`, `ink`, `size` | a message broker: lying down, 2-3 diameters long, green, named inside |
| `envelope(o)` | `x, y, w` (35), `color, stroke, fill, label, labelDy` | a message |
| `broker(o)` | `x, y, w` (46), `label, labelDy, stroke, fill` | a message broker, two stacked envelopes |
| `lockBox(o)` | `x, y, size` (44), `stroke, fill, label, labelDy` | a secret store, padlock in a square |
| `person(o)` | `x, y, size` (40), `stroke, fill, label, labelDy` | a person, for an external system |
| `secureLock(o)` | `x, y, size` (44), `stroke, label, labelDy` | secure service communication, padlock and shield |
| `region(o)` | `x, y, w, h, stroke` (`C.caption`), `r` (10), `caption, captionW, captionX, captionH` (26), `captionSize` (15) | a dashed area with its name on the border; the pill takes the region's colour and the text is body ink |
| `panel(o)` | `x, y, w, h, stroke` (`C.caption`), `r` (10) | a dashed, rounded area grouping part of a diagram. `x, y` is the top-left corner |
| `pill(o)` | `x, y, w, h` (26), `text, color, filled, size` (15) | a rounded caption tag, outlined or filled |
| `tile(o)` | `x, y, icon, label, color, filled, size` (99), `w, h, inline, inlinePad` (26), `inlineGap` (24), `tag, labelSize, glyphSize, glyphGap, glyphDy, nameDy, desc, descSize` | a card with an icon over a label, or beside it with `inline: true`. `tag` puts a small word such as `alpha` in the corner |
| `lineWidth()` | the stroke for arrows, buses and dashed borders, derived from the canvas the exporter set so every diagram renders at `LINE_TARGET` |
| `roundedPath(o)` | `points` ([[x,y],…]), `r` (10), `color, width` (2) | a connector that turns each corner with an arc; the radius clamps to half the shortest leg |
| `arrow(o)` | `from, to, head` (true), `color` (`C.navy`), `gap` (2) | a static arrow with an open head, stopping at each shape's edge |
| `MIN_LABEL` | — | the smallest type anywhere, 10; `label()` throws below it |
| `richLabel(o)` | `x, y, parts, size, weight, color, anchor, mono` | one line of text whose segments take different colours or weights |
| `MONO` | — | the page's code font, the one font-family a scene may set |
| `BALL_R`, `SOCKET_R` | — | the UML lollipop and socket radii, 10 and 21 |
| `CAPTION_INSET` | — | where `region()` puts its caption, 20 units in from the left |
| `lollipop(o)` | `x, y, to, toY, elbowX, elbowR` (10), `r` (10), `color` | a UML provided interface: a hollow ball on a stalk back to the provider, elbowing at `elbowX` when `toY` differs, with the turn rounded |
| `socket(o)` | `x, y, from, r` (21), `color` | a UML required interface: the arc that cups a ball, and the consumer's stalk out to it |

`arrow`'s `from` and `to` take either a point `[x, y]` or a shape descriptor
such as `{ x, y, r, hex: true }`, so the arrow and the shape cannot drift apart.

## An app and its Dapr sidecar

`diagrams/app.mjs` draws the pair that appears on every hosting diagram.

| Export | Returns |
| --- | --- |
| `appSidecar(o)` | `x, y, r` (54), `label, size, stroke, fill` | the app hexagon with the Dapr sidecar overlapping it |
| `sidecarAt(o)` | the sidecar as an arrow descriptor `{ x, y, r, hex }`, so a scene's arrows cannot drift from the drawing |
| `sidecarDx(r)` | how far right of the app's centre the sidecar sits, for placing the app from a wanted sidecar position |
| `SIDECAR_R` | the sidecar's radius as a multiple of the app's, 0.75 |
| `SIDECAR_CLEARANCE` | how far below the app's lowest point the sidecar's centre sits, 0.15 of `r` |
| `SIDECAR_GAP` | the floor between the app's name and the sidecar's top, 7 |

`r` is the only size a scene picks. The colour and name are per call - each app
takes its own `APP[n]` - but the sidecar is always the Dapr hexagon.

## Brand marks and icons

| Export | Returns |
| --- | --- |
| `icon(o)` | `name, x, y, size` (32), `w, h, color, label, labelDy, labelSize` (13), `scope, dir`. `x, y` is the box center; the mark is scaled to fit and keeps its aspect ratio. `color` tints single-color marks only |
| `markHex(o)` | `x, y, r, mark, size, stroke` (`C.blue`), `fill, color` | a hexagon with a mark centred in it: a Dapr service, a sidecar, a container. The Dapr wordmark gets a plate fill and `DAPR_MARK` of the radius; any other mark needs a `size` |
| `DAPR_MARK` | the wordmark's width as a multiple of the hexagon's radius, 4/3 |
| `plate(o)` | `x, y, w, h, fill` (`C.plate`) | the neutral backing that keeps a full-color mark legible on both grounds. `x, y` is the center |
| `brand(o)` | `name, x, y, w, h, content, plate, dx, inside, insideDx, insideSize, plateH, pad` | a brand mark on its plate, with an optional name set beside it inside the plate |
| `listMarks(dir)` | every `.svg` in the icons directory, as mark names |
| `parseMark(svgText, { name, prefix })` | the parsed mark, for tooling |
| `setIconScope(scope)` | sets the id scope; the exporter calls this around `build()` |
| `setCanvasWidth(w)` | sets the canvas `lineWidth()` derives from; the exporter calls this around `build()` |
| `MARK_IN_HEX` | a non-Dapr mark's size inside a hexagon, 0.8 of `r` |
| `PLATE_H`, `PLATE_PAD` | the shared plate height and padding |
| `IconError` | thrown for a missing mark, a bad name, or a file that fails the screen |

`icon()` scopes its ids to the scene automatically, so two diagrams on one page
cannot collide. Pass `scope` only to override that.

## Cards

`diagrams/cards.mjs` draws every card in the set - a rounded box with a mark
and a name - and owns the two things a caller must not vary.

| Export | Returns |
| --- | --- |
| `card(o)` | `mark, name, w, h, inline, color, filled, tag`, plus any `tile()` option | the card, with the mark and the name sized from it |
| `cardSizes(o)` | `{ glyph, label }` for a card of these dimensions; throws below the 10px floor |
| `CARD_W`, `CARD_GLYPH` | the reference card's width, 112, and the mark as a fraction of the card's short side |
| `STACKED_LABEL`, `INLINE_LABEL` | the name as a fraction of the short side, for the two forms |

The placement is fixed: `glyphSize`, `glyphDy` and `nameDy` are dropped before
`tile()` sees them, because passing the first of those switches `tile()` to its
other layout rule and the same card then sits differently on two pages.

## The Dapr API catalogue

`diagrams/apis.mjs` holds one definition per Dapr API and per cross-cutting
concern, so no scene declares a mark or a name of its own.

| Export | Returns |
| --- | --- |
| `APIS` | the sixteen APIs, in the website's order |
| `CROSS_CUTTING` | observability, security, resiliency |
| `api(key)` | one entry; throws on a key that is not in the catalogue |
| `apiTile(o)` | `key, filled, wrap, glyph`, plus any `tile()` option | the block: rounded square, mark, name, and `alpha` where it applies. The mark is `TILE_GLYPH` of the card's short side unless `glyph` says otherwise |
| `TILE_W`, `TILE_GLYPH` | the reference card's width, 112, and the mark as a fraction of the card's short side |
| `TILE_LABEL`, `INLINE_LABEL` | the name as a fraction of the card's short side, for the stacked and the inline form. The name is derived, not passed; a card too small for an 11px name throws |

Each entry is `{ key, mark, name, wrap, tag }`. `name` is the one-line form and
`wrap` the agreed two-line break for a narrow tile; `tag` is `alpha` or empty.

```js
import { APIS, apiTile } from '../apis.mjs';

APIS.map((a, i) => apiTile({ key: a.key, wrap: true, x: slot[i], y: 100, w: 112, h: 118 }));
apiTile({ key: 'secrets', x: 300, y: 100, w: 96, h: 96, glyph: 28, glyphSize: 28 });
```

## The Dapr control plane services

`diagrams/services.mjs` holds one definition per service - placement,
scheduler, sentry, operator, injector - and draws it.

| Export | Returns |
| --- | --- |
| `SERVICES` | the five, in that order; each `{ key, name, role, wrap }` |
| `service(key)` | one entry; throws on anything else, Consul included |
| `serviceHex(o)` | `key, x, y, r` (`SERVICE_R`), `role, wrap` | a Dapr hexagon with the service's name under it, and its role under that when `role` is set. `r` is the only size: the name is derived from it |
| `serviceLabel(r)` | the name size for that radius, for a neighbour that is not a Dapr service; throws below 10px |
| `SERVICE_LABEL` | the name's size as a multiple of `r` |
| `SERVICE_R` | the reference radius, 34 |
| `NAME_DY`, `ROLE_DY` | the name's and role's offsets, as multiples of `r` |

`r` is the only size a scene chooses: every offset AND the name's size are
derived from it, so the same service is one drawing whether it is drawn large
or small. Keep `r` near `SERVICE_R` across diagrams and the services come out
near-equal everywhere.

```js
serviceHex({ key: 'sentry', x: 300, y: 120, r: 34, role: true, wrap: true });
serviceHex({ key: 'placement', x: 100, y: 400, r: 30 }); // smaller, same drawing, smaller name
```

## Colors

`C` holds `navy`, `blue`, `orange`, `teal`, `tealFill`, `mint`, `red`,
`lavender`, `grey`, `caption`, `body`, `bg`, `plate`, `plateInk`, `markPlate`,
`green`, `appInk`, `kubernetes`, and the solid app fills `appSky`, `appGold`,
`appTeal`, `appBlue` with the white `paper` that names three of them.

`APP[0]` to `APP[4]` are the app hexagon colors, in order: Dapr green, light
blue, yellow, teal, dark blue. Each is `{ stroke, fill, ink, solid }` and
every entry states all four, so a scene can spread one whole - `hex({ ...,
...APP[1] })` - without a missing property falling back to another entry's.
Every entry is `solid: true`, outlined in `--d-app-ink`, with `ink` the
colour its name takes ON that fill: dark on the green and the yellow, white
(`--d-app-paper`) on the light blue, the teal and the dark blue.

Every one is a `var(--d-*)` string. Never put a hex value in a scene; add a
token to `_tokens.scss`, in both themes, instead.

## A scene

```js
import { C, APP } from '../engine.mjs';
import { arrow, cylinder, daprApp, label } from '../shapes.mjs';

export default {
  width: 600,
  height: 480,
  title: 'An app stores state through Dapr',
  desc: 'An application calls Dapr, which writes to a state store.',

  build() {
    return [
      daprApp({ x: 150, y: 200, ...APP[0] }),
      arrow({ from: { x: 150, y: 200, r: 42.5, hex: true }, to: [300, 200] }),
      cylinder({ x: 340, top: 190, bottom: 215, label: 'State store' }),
    ];
  },
};
```

`build()` returns an array; nested arrays and `null` entries are fine, so
`.map()` over a list and a conditional both work without ceremony.

The exporter validates the scene before writing: the name, a non-empty `title`
and `desc`, positive dimensions, that `build()` returns an array, and that no
two elements share an id.
