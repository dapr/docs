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
| `APP` | four `{ stroke, fill }` pairs for app hexagons, in order |

## Shape builders

| Builder | Options | Draws |
| --- | --- | --- |
| `group(children)` | an array, or `{ children }` | a `<g>`, for positioning or grouping |
| `slots(x0, x1, n)` | — | `n` evenly spaced centers across the span (returns numbers, not a node) |
| `label(o)` | `x, y, text, size` (11), `weight` (600), `color` (`C.body`), `halo`, `anchor`, `mono` | text; `\n` starts a second line, vertically centered. `mono: true` sets the page's code font, for a command or a path |
| `hex(o)` | `x, y, r` (42.5), `stroke, fill, label, size, labelDx` | a pointy-top app hexagon with its name |
| `hexPoints(x, y, r)` | — | the six points, for an arrow descriptor |
| `hexHalfWidth(r)` | — | half a pointy-top hexagon's width, for aligning one shape to another's edge |
| `badge(o)` | `x, y, r` (19), `mark` | the small Dapr hexagon with the logo |
| `daprApp(o)` | `x, y, r, stroke, fill, label, size, labelDx, badgeLeft, mark` | an app with its Dapr badge, bottom right or bottom left |
| `box(o)` | `x, y, w` (194), `h` (30), `label, stroke, fill, size` | a workflow activity rectangle |
| `node(o)` | `x, y, r` (16), `stroke, fill, label, labelDy` | a workflow start or end circle |
| `cylinder(o)` | `x, top, bottom, rx` (24), `ry` (8) | a database, with its hidden back rim dashed |
| `envelope(o)` | `x, y, w` (35), `color, stroke, fill, label, labelDy` | a message |
| `broker(o)` | `x, y, w` (46), `label, labelDy, stroke, fill` | a message broker, two stacked envelopes |
| `lockBox(o)` | `x, y, size` (44), `stroke, fill, label, labelDy` | a secret store, padlock in a square |
| `person(o)` | `x, y, size` (40), `stroke, fill, label, labelDy` | a person, for an external system |
| `secureLock(o)` | `x, y, size` (44), `stroke, label, labelDy` | secure service communication, padlock and shield |
| `panel(o)` | `x, y, w, h, stroke` (`C.caption`), `r` (10) | a dashed, rounded area grouping part of a diagram. `x, y` is the top-left corner |
| `pill(o)` | `x, y, w, h` (26), `text, color, filled, size` (15) | a rounded caption tag, outlined or filled |
| `tile(o)` | `x, y, icon, label, color, filled, size` (99), `w, h, inline, inlinePad` (26), `inlineGap` (24), `tag, labelSize, glyphSize, glyphGap, glyphDy, nameDy, desc, descSize` | a card with an icon over a label, or beside it with `inline: true`. `tag` puts a small word such as `alpha` in the corner |
| `arrow(o)` | `from, to, head` (true), `color` (`C.navy`), `gap` (2) | a static arrow with an open head, stopping at each shape's edge |
| `OUTLINE` | — | the shared outline width, 2.2 |

`arrow`'s `from` and `to` take either a point `[x, y]` or a shape descriptor
such as `{ x, y, r, hex: true }`, so the arrow and the shape cannot drift apart.

## Brand marks and icons

| Export | Returns |
| --- | --- |
| `icon(o)` | `name, x, y, size` (32), `w, h, color, label, labelDy, labelSize` (13), `scope, dir`. `x, y` is the box center; the mark is scaled to fit and keeps its aspect ratio. `color` tints single-color marks only |
| `plate(o)` | `x, y, w, h, fill` (`C.plate`) | the neutral backing that keeps a full-color mark legible on both grounds. `x, y` is the center |
| `brand(o)` | `name, x, y, w, h, content, plate, dx, inside, insideDx, insideSize, plateH, pad` | a brand mark on its plate, with an optional name set beside it inside the plate |
| `listMarks(dir)` | every `.svg` in the icons directory, as mark names |
| `parseMark(svgText, { name, prefix })` | the parsed mark, for tooling |
| `setIconScope(scope)` | sets the id scope; the exporter calls this around `build()` |
| `PLATE_H`, `PLATE_PAD` | the shared plate height and padding |
| `IconError` | thrown for a missing mark, a bad name, or a file that fails the screen |

`icon()` scopes its ids to the scene automatically, so two diagrams on one page
cannot collide. Pass `scope` only to override that.

## The Dapr API catalogue

`diagrams/apis.mjs` holds one definition per Dapr API and per cross-cutting
concern, so no scene declares a mark or a name of its own.

| Export | Returns |
| --- | --- |
| `APIS` | the sixteen APIs, in the website's order |
| `CROSS_CUTTING` | observability, security, resiliency |
| `api(key)` | one entry; throws on a key that is not in the catalogue |
| `apiTile(o)` | `key, glyph` (30), `filled, wrap`, plus any `tile()` option | the block: rounded square, mark, name, and `alpha` where it applies |

Each entry is `{ key, mark, name, wrap, tag }`. `name` is the one-line form and
`wrap` the agreed two-line break for a narrow tile; `tag` is `alpha` or empty.

```js
import { APIS, apiTile } from '../apis.mjs';

APIS.map((a, i) => apiTile({ key: a.key, wrap: true, x: slot[i], y: 100, w: 112, h: 118 }));
apiTile({ key: 'secrets', x: 300, y: 100, w: 96, h: 96, glyph: 28, glyphSize: 28 });
```

## Colors

`C` holds `navy`, `blue`, `orange`, `teal`, `tealFill`, `mint`, `red`,
`lavender`, `grey`, `caption`, `body`, `bg`, `plate`, `plateInk`, `markPlate`
and `kubernetes`. `APP[0]` to `APP[3]` are the app hexagon colors, each
`{ stroke, fill }`, in order: sky, blue, teal, orange.

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
      daprApp({ x: 150, y: 200, stroke: APP[0].stroke, fill: APP[0].fill }),
      arrow({ from: { x: 150, y: 200, r: 42.5, hex: true }, to: [300, 200] }),
      cylinder({ x: 340, top: 185, bottom: 225 }),
      label({ x: 340, y: 250, text: 'State store' }),
    ];
  },
};
```

`build()` returns an array; nested arrays and `null` entries are fine, so
`.map()` over a list and a conditional both work without ceremony.

The exporter validates the scene before writing: the name, a non-empty `title`
and `desc`, positive dimensions, that `build()` returns an array, and that no
two elements share an id.
