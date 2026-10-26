---
name: d3-2d-diagrams
description: Create or change the 2D diagrams on the dapr.io homepage (the value-prop diagrams and the APIs overview, drawn with D3 in themes/bigspring/assets/js/diagrams.js). Use for a new diagram, animated or still, from a video or GIF, a still image, or a text description, and for changes to an existing scene's layout, colors, icons, timing or tests.
---

# 2D D3 diagrams for dapr.io

The homepage's 2D diagrams are drawn in code with D3. The four value-prop
sections show diagrams that replaced their MP4s, and "The APIs behind it" shows
a still that replaced an image. A diagram is either animated or a still. This
skill holds the design rules and the workflow that produced them, so a new
diagram matches the existing ones, wherever on the homepage it goes.

The 3D wireframe hero diagram (`themes/bigspring/assets/js/hero-diagram.js`) is a
separate piece of code. The style below borrows from it, but nothing here
changes it.

## Where things live

| What | Where |
| --- | --- |
| Engine and scenes | `themes/bigspring/assets/js/diagrams.js`: shapes, the `C` and `APP` colors, one entry per scene in `scenes`. It draws every `svg[data-scene]` on the page |
| Markup for one diagram | `themes/bigspring/layouts/partials/diagram.html`: the `<svg data-scene>` and its canvas size, title, description, fallback `<image>`, and the pause button for an animated one |
| Symbols and script, once per page | `themes/bigspring/layouts/partials/home/diagram-assets.html`, included by `themes/bigspring/layouts/index.html` |
| Where each diagram is shown | The section's data in `data/homepage.yml` names its scene. Value props use `diagram`, `diagramdesc` and `diagramstatic` on a `values.feature_item`; `partials/home/value-props.html` calls the partial at 600×480. The APIs overview uses the same fields on `buildingBlock`; `partials/home/apis.html` calls it at 1200×624 |
| Icons and brand marks | `assets/images/icons/<name>.svg`, with sources and terms in `assets/images/icons/README.md` |
| Static fallbacks | `assets/images/diagrams/<scene>.svg`, generated: `npm run export:diagram-fallbacks` in `tests/` |
| Styles | `svg.value-prop-diagram`, `svg.apis-diagram` and `.diagram-frame` in `themes/bigspring/assets/scss/_custom.scss` |
| D3 | `d3-selection` and `d3-timer` only, vendored in `themes/bigspring/static/plugins/d3/`, loaded by `themes/bigspring/layouts/index.html` |
| Tests | `tests/specs/diagrams.spec.js` (per scene), plus the diagram cases in `motion.spec.js`, `markup.spec.js` and `keyboard.spec.js` |

The engine's API is in [reference/engine.md](reference/engine.md).

## Design rules

### Animated or still

Decide this first; it changes which steps apply.

| Starting from | Animated or still |
| --- | --- |
| A video or GIF | Always animated, following the source's timing |
| A still image | Whatever the user asked for |
| A text description | Whatever the user asked for |

If a still image or a text description comes without instructions, ask whether
the diagram should animate. Do not assume.

- **A still** is a scene drawn once at its complete frame:
  - **Data:** set `diagramstatic: true` on its item in `data/homepage.yml`. The
    template then marks the svg `data-static` and leaves out the pause button.
    The script draws `still` once, with no timer.
  - **Scene:** it needs `build` and `still`. It can leave out `T`, and its
    `frame(t)` can ignore `t`. A scene without `T` is always drawn as a still,
    even without the flag; set the flag anyway, so the page has no pause button
    for it.
  - **Rules that don't apply:** [Motion](#motion) and the pause button.
    Everything else does.
- **Animated scenes can also be shown as a still** by setting
  `diagramstatic: true`.

### Canvas and style

- **2D only.**
- **Canvas size:** the svg's viewBox sets it, and the scene's coordinates use it.
  - **A value-prop diagram:** 600×480. It displays at 600×480 on desktop and at
    full width, up to 400px, on phones, the same as the videos they replaced.
  - **Anywhere else:** give the canvas the shape of what the diagram replaces, or
    of the space it fills, and display it at that size. Never make it larger.
    The APIs overview replaced a 1.92:1 image that fills its section's width,
    so it uses 1200×624 and `svg.apis-diagram` makes it fill the width too.
  - **A new placement** gets its own class with a CSS rule for its size.
- **Wireframe line art,** after the hero diagram:
  - outlines are 2.2px and arrows 2px
  - fills are light tints at `fill-opacity: 0.6`
  - hidden edges, such as the back of a cylinder's base, are drawn faint and dashed
- **No backdrop and no glow.** A hex-grid background and glowing dots were
  both tried and rejected.
- **Keep everything at least 10px inside the edges.** The tests fail anything
  visible outside the frame. On an animated value-prop diagram, the pause
  button covers the bottom-right corner, about 590 to 556 in x and 470 to 436
  in y, so keep that area empty too.

### Colors

Defined once, as `C` and `APP` at the top of `diagrams.js`. Use those
names, never new hex values in a scene.

- **App hexagons take `APP` in order:**
  - one app is light blue (`#3EA9F5`)
  - two add dark blue (`#0D2192`)
  - three add teal (`#4EA4AF`)
  - four add orange (`#F03E00`)

  Each has a light fill. With more than four apps, color by role, so that apps
  of one kind share a color. The adopt scene does this: its existing system is
  teal and its two Dapr apps are light and dark blue. The hero diagram
  (`hero-diagram.js`) follows the same order.
- **A large Dapr hexagon,** as in the APIs overview, is navy with the logo
  inside it.
- **Never yellow.** It is too light on the white background.
- **Other colors and what they mean:**
  - navy `C.navy` (`#1D168E`) for arrows, Dapr badges and databases
  - mint `C.mint` for a workflow start and a retry in progress
  - orange for a workflow end and failure marks
  - red `C.red` for a failed call
  - blue `C.blue` (`#45AEEE`) for secure communication and resiliency
  - grey `C.caption` for platform captions
  - black for labels
- **The tile background is `#FDFDFD`.** `C.bg` matches it, and labels use it for
  their halo.

### Labels

- **Font:** labels use the page's font (Noto Sans) through inheritance, so
  never set `font-family` in a scene.
- **Sizes:** use `label()`.
  - 11px at weight 600 by default
  - app names at a third of the hexagon's radius
  - brand marks 13px at weight 700
  - platform captions 16px in `C.caption`

  Use `\n` for a second line.
- **Text over a line** gets `halo: true`, as the "Resiliency" label does, so the
  line does not run through it.
- **Small screens:** at phone width the diagram is about half size. An 11px
  label then reads at about 6px, so do not go below 11px.

### Shapes and arrows

- **Apps** are pointy-top hexagons. An app that runs Dapr has the Dapr badge
  docked on it, bottom right by default and bottom left when space needs it:
  use `daprApp()`.
- **Arrows** have an open 8px head.
  - **Growth:** they grow from source to target, easing in and out, over
    0.3 to 0.5 seconds.
  - **Fade-in:** they fade in over the first 60% of their growth, so the head
    never pops in.
  - **Color changes:** use `grow.paint()`, blended with `mix()` over at least
    0.3 seconds, never switched instantly.
- **Groups and captions:** a dashed rounded `panel()` groups part of a diagram,
  a `pill()` captions it, and a `tile()` shows one capability with an icon and
  a label. The APIs overview uses all three.
- **Do not hand-draw a company's logo or product mark.** Use its official
  file; see the next section.
- **Generic icons** (a key, a clock, a database) come from
  [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons)
  (MIT), the set the homepage's API cards already use. Download the 24px regular
  variant from `https://api.iconify.design/fluent/<name>-24-regular.svg`, save it
  as `assets/images/icons/fluent-<name>.svg` unmodified, and draw it with
  `icon({ name: 'fluent-<name>', color })`. These icons are drawn in
  `currentColor`, which `icon()` sets.

### Brand marks

- **Source, in order of preference:**
  1. [Simple Icons](https://simpleicons.org), pinned to a version (CC0).
  2. The vendor's official architecture icon set, if Simple Icons lacks it:
     [Azure](https://learn.microsoft.com/azure/architecture/icons/),
     [AWS](https://aws.amazon.com/architecture/icons/) or
     [Google Cloud](https://cloud.google.com/icons) (legacy set for product icons).
- **Keep the file unmodified.** The Azure terms forbid cropping, flipping,
  rotating, distorting or recoloring. Save it as
  `assets/images/icons/<name>.svg` and add a row to that folder's `README.md`.
  The template prefixes every file's ids and classes when it inlines it, so the
  Google Cloud files' `<style>` blocks cannot leak into the page.
- **Company and language logos** (Microsoft Azure, AWS, Google Cloud, Node.js,
  Java) are not covered by the architecture icon terms.
  - **By default,** name the platform in text, as the integrate diagram does.
  - **Logos only when asked,** as for the APIs overview. Use the official full
    logo, in its own colors and proportions, not a single-color stand-in.
    Wikimedia Commons hosts most of them with their license recorded. Get the
    file URL and license from the Commons API:
    `https://commons.wikimedia.org/w/api.php?action=query&titles=File:<name>.svg&prop=imageinfo&iiprop=url|extmetadata&format=json`.
  - **Record each logo's source and license** in the icons README. Credit the
    author when the license requires it, as CC BY does.
  - **A logo that is not freely licensed** needs the maintainers' explicit
    go-ahead, recorded in the README. Java's coffee cup, hosted on English
    Wikipedia as fair use only, is used that way.
  - **Wide logos and wordmarks** keep their proportions: give `icon()` a `w` and
    `h`. A logo that carries its name needs no text label beside it.
  - **Missing files:** if the user names no source and no official file can be
    found, ask before using a substitute.
- **Check every file before adding it:** no `<script>`, no event handlers, no
  external `href`. The template prefixes every id and class name (including
  those in a `<style>` block), and takes a missing viewBox from the file's
  width and height.

### Motion

Animated diagrams only.

- **Timeline:** a scene is a function of time `t` in seconds, over a loop of `T`
  seconds. Every step is `step(t, start, end)`, eased in and out and clamped,
  so the same `t` always draws the same frame.
- **Durations:**
  - fades take 0.3 to 0.5 seconds
  - a slide moves at most about 8px per frame at 60 fps, which means 50 to 100px
    over 0.3 to 0.7 seconds
- **Redrawing a video:** use its order and timing exactly, measured from its
  frames (see Workflow). Shift everything by a short opening hold of 0.3 to
  0.4 seconds.
- **No hard cuts, especially at the loop.**
  - End by fading out what was added, sliding back if the scene moved, and
    holding briefly empty or at the start.
  - Frame 0 must match the end of the loop.
- **`still`:** the moment that shows the complete diagram. Reduced-motion
  visitors see it, and the static fallback is made from it.
- **Smoothness limits,** checked by `scripts/smoothness.mjs`:
  - 55 fps or better
  - no frame gap over 20ms
  - no visible move over 12px per frame
  - no visible opacity change over 0.35 per frame

### Accessibility and behavior

These come with the engine and the partial. Keep them working:

- **Description:** `<title>` is the section name (the image's alt text for the
  APIs overview), and `<desc>` is the `diagramdesc` text.
  - Describe what the diagram shows, plainly and accurately. It is read as an
    official statement by the project.
  - Avoid em dashes and en dashes, as in all site copy.
  - **Alpha APIs:** name them alpha, close to each mention. The description is
    part of the page, and `tests/specs/content-119.spec.js` fails any mention of
    an alpha API (such as Binary Store, Search or Vector) without "alpha" within
    60 characters. Give the alpha APIs their own sentence, as the APIs overview
    does: "Six more APIs are in alpha: binary store, search, vector, ...".
- **Pause button (animated only):** it starts hidden and is shown by the
  script, labeled "Pause animation: <name>" or "Play animation: <name>". A still
  has none.
- **Motion settings (animated only):** under `prefers-reduced-motion` the diagram
  shows `still` and starts paused. It stops while offscreen.
- **Fallback:** without JavaScript, the static fallback image shows, laid over the
  svg. It is in a `<noscript>`, so visitors running the script never download it.

## Workflow

Pick the first step by what you start from, then continue at step 2. Settle
[animated or still](#animated-or-still) first.

| Starting from | Step 1 |
| --- | --- |
| A video or GIF | [1a. Analyze the source animation](#1a-analyze-the-source-animation) |
| A still image (PNG, JPG or SVG) | [1b. Analyze the still and design the reveal](#1b-analyze-the-still-and-design-the-reveal) |
| A text description | [1c. Turn the description into a layout](#1c-turn-the-description-into-a-layout) |

### 1a. Analyze the source animation

```bash
skills/d3-2d-diagrams/scripts/video-frames.sh path/to/video.mp4 /tmp/frames 140
```

This prints the frame count, size and fps. It writes numbered contact sheets of
every 4th frame, and the frames you ask for at 1200px wide.

- **Timing:** from the sheets, write down when each element starts and finishes
  appearing. Sheet label `k` is frame `4k`, which is `4k / fps` seconds.
- **Layout:** measure positions on a 1200px frame and halve them for the 600×480
  viewBox. A source that is not 5:4 is scaled to 600 wide and centered
  vertically: add `(480 - height / 2) / 2` to every y. For another canvas, scale
  by its width over 1200 instead.
- **Colors:** sample them in the middle of a stroke, never on an antialiased edge:

  ```bash
  skills/d3-2d-diagrams/scripts/video-frames.sh --color /tmp/frames/frame-140.png 239 230
  ```

  Map each one to the nearest `C` or `APP` color. App hexagons follow the
  `APP` rule whatever the source used.

### 1b. Analyze the still and design the reveal

The scripts take an image as well as a video:

```bash
skills/d3-2d-diagrams/scripts/video-frames.sh path/to/diagram.png /tmp/frames
```

This writes `frame-0.png` at 1200px wide. Measure from the original instead if
it is larger, for more precision. The APIs overview was measured at 2000px wide
and scaled by 0.6 to its 1200×624 canvas.

- **Layout and colors:** measure and sample them exactly as in 1a.
- **For a still diagram,** that is all: continue at step 2.
- **For an animated diagram,** the image has no timing, so you design the
  animation yourself, as follows.
- **Reveal order.** Follow how the diagram reads:
  - **Direction:** usually along the data flow, or left to right and top to
    bottom.
  - **Shapes before arrows:** a shape appears before the arrows that leave it.
  - **Arrows before targets:** an arrow grows before its target appears.

    In adopt, an arrow grows from Kafka, and only then does the app it feeds
    fade in.
  - **What already exists:** draw it first, as one step. In adopt, the existing
    system is there from the start, and the new parts are added to it.
  - **One idea at a time:** add new parts one per step, and give a point the
    diagram makes its own beat. For example, secure shows a failure and a retry
    before the call goes through.
- **Pacing,** from the existing scenes:

  | Step | Duration |
  | --- | --- |
  | A shape fades in | 0.3–0.5s |
  | An arrow grows | 0.4–0.5s |
  | Gap between steps | 0.1–0.4s; longer, 0.5–1s, before a step that should land |
  | Complete diagram holds | 1–1.5s |
  | Loop fade-out | 0.5s, then a short empty or starting hold |

  A diagram of 8 to 12 elements loops in about 8 to 15 seconds. The existing
  scenes run 8.4 to 15.2 seconds.
- **Before you animate:** write the reveal down as a timetable of what appears
  and when. Have it agreed if someone asked for the diagram.
- **Checking the result:** `scene-frames.mjs --video path/to/diagram.png` puts
  the image next to the scene's frames. Every moment is compared with the same
  image, so use a time when the scene is complete. This works for a still
  diagram too.

### 1c. Turn the description into a layout

1. **Components:** list every one the description names: apps, Dapr, brokers,
   stores, external systems, people, workflow steps.
2. **Connections:** list how they connect, and in which direction.
3. **Shapes:** map each component to an engine shape (see
   [reference/engine.md](reference/engine.md)).
   - **Branded products:** use the product's mark, sourced as in
     [Brand marks](#brand-marks).
   - **No matching shape:** pick the nearest existing shape, or add a new
     builder in the same style.
   - **Labels:** use the words the description uses.
4. **Layout on the 600×480 canvas:** put the main flow on one axis, left to
   right or top to bottom, and side services on the other. The existing scenes
   use these spacings:

   | Element | Measurement |
   | --- | --- |
   | Space between app centers | about 140–150px (adopt). Up to about 250px when the arrow between them carries a mark, such as a lock or a retry (secure) |
   | App radius | 42.5px normally; 32px in a crowded scene |
   | Arrow length | 30–110px, running between shape edges, not centers |
   | Workflow activity boxes | 194×30px, about 65px apart vertically (automate) |
   | Margins | at least 10px from the edges; leave room for labels under shapes |

   Center the whole layout in the canvas, and keep the pause button's corner
   empty.
5. **Get the layout agreed before animating.** Render it as a still:
   - Give the scene a `still` and run it under reduced motion.
   - Or run `scene-frames.mjs` at that time.

   Then share the frame. Layout changes are cheap now and expensive once the
   timeline exists.
6. **Animate, if the diagram is animated:** follow 1b's reveal order and
   pacing. A still is finished at step 5.
7. **Write `diagramdesc` from the description:** plain and accurate, with only
   what the diagram actually shows.

### 2. Build the scene

Add an entry to `scenes` in `diagrams.js`:

- `T`: the loop length in seconds. A still can leave it out.
- `still`: when the diagram is complete. For a still, any value its `frame`
  draws completely.
- `build(root)`: creates the shapes once and returns `frame(t)`.

`frame(t)` only sets opacity, transforms and arrow growth, and never creates
elements. Above the scene, write a comment that describes what it shows. If
it was redrawn from a video, the comment also names the source and its frame
count, and says how the scene's timing relates to it. The existing scenes all do
this.

**Showing it.** In a value-prop section, switch the item in `data/homepage.yml`:

```yaml
    - name: "Section title"
      diagram: "myscene"
      diagramdesc: "What the diagram shows, in one or two plain sentences."
      diagramstatic: true   # only for a still; leave out for an animated diagram
      content: "..."
```

Anywhere else, give the section's data the same three fields, and call the
partial from its template at the scene's canvas size:

```go-html-template
{{ partial "diagram.html" (dict "scene" .diagram "name" "Title" "desc" .diagramdesc
    "static" .diagramstatic "width" 1200 "height" 624 "class" "apis-diagram") }}
```

Add a CSS rule for the new class's display size. `partials/home/apis.html`
shows the pattern: it falls back to the section's image when no `diagram` is
set. The Markdown rendering of the homepage still uses the section's `image`,
so point that at the generated fallback, `images/diagrams/<scene>.svg`.

A new icon or brand mark goes in `assets/images/icons/`, with its README row,
and is used as `icon(parent, { name: '<file name>', ... })`.

### 3. Compare and measure

```bash
# the scene next to the source at the same moments (the offset is the opening hold)
node skills/d3-2d-diagrams/scripts/scene-frames.mjs myscene --times 1,2.5,4,6 \
  --video path/to/video.mp4 --offset 0.4
# then look at tests/.site-frames/myscene/compare.png (source on top)

node skills/d3-2d-diagrams/scripts/smoothness.mjs myscene --seconds <T>
```

Iterate until layout, colors and timing match, and smoothness passes. Without a
source, leave out `--video` and review the frames on their own.

For a still, take one frame at `still` and skip `smoothness.mjs`. A still's
frame does not change over time.

### 4. Fallbacks, tests, docs

```bash
cd tests
npm run export:diagram-fallbacks   # regenerates every diagram's fallback, hero included
npx playwright test diagrams motion markup keyboard
```

- **Fallback:** commit the new or changed `assets/images/diagrams/<scene>.svg`.
  The hero's fallback should come out byte-identical; if it changed, find out why.
- **Tests:** add the scene and the labels its still frame must show to `SCENES` in
  `tests/specs/diagrams.spec.js`, whether it is animated or still. The spec fails
  until every scene on the page is listed.
  - **Animated diagrams:** the animation and pause tests in `motion.spec.js`
    cover them.
  - **Stills:** the still test in `diagrams.spec.js` checks the still path: no
    pause button and no change over time.
- **Full suite:** run `npm test` before pushing.
- **Source files:** delete a replaced video, GIF or image only after the
  comparisons are done. Check nothing links to it first:
  - `git grep`
  - a GitHub code search for `dapr.io/images/<file>`, for files under
    `static/`. Files under `assets/` are only published when the site uses
    them, so nothing outside can depend on them.

## Traps already hit

- **`test.use({ reducedMotion: 'reduce' })` does not apply here.** The page
  plays from `t = 0` instead of showing `still`. Call
  `page.emulateMedia({ reducedMotion: 'reduce' })` before `page.goto`.
- **After `page.clock.install()`, Playwright's fake clock keeps running in real
  time.** Screenshots then drift later by about 60ms each. Pause it:
  `install({ time })`, then `pauseAt(...)` before `goto`, then step with
  `runFor`. `scene-frames.mjs` does this.
- **Diagrams only run while on screen.** Scroll a diagram into view before
  stepping its clock.
- **Do not give the value-prop svg `max-width: 100%` in the desktop rules.** The
  flex layout then shrinks it to about 445px. The mobile rule already handles
  narrow screens.
- **`icon()` without a `label`** draws only the icon. Before labels were
  optional, a missing one rendered the word "undefined".
- **A vendor svg's ids and classes collide** with other icons and the page when
  inlined. The template prefixes them; never inline one by hand.
- **The fallback is an svg shown as an image.** It cannot load the web font or
  external files. The exporter copies the symbols it uses into the file and drops
  elements the still frame hides. Its labels render in Arial.
- **Keep the fallback in its `<noscript>`.** It sits next to the svg and CSS lays
  it over the svg's box. An `<image>` inside the svg would be downloaded by every
  visitor, about 165 KB across the homepage, though the script draws over it.
- **`d3.range` and other d3-array helpers are not loaded.** Only d3-selection
  and d3-timer are.
- **Keep the hero script's lookups scoped to `.hero-diagram`.** The page has
  more than one `.diagram-toggle`.
- **The engine is ES5 style** (`var`, `function`), like `hero-diagram.js`.
  Match it.
