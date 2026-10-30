// An API allow list, and what it does to the sidecar's APIs.
//
// Replaces security-dapr-API-scoping.png on concepts/security-concept.md
// ("API access policy").
//
// Fact-check, against operations/configuration/api-allowlist.md, which is the
// page the paragraph beside this diagram links to and the authority for the
// names:
//   - "If you've only defined an allowlist, only the Dapr APIs listed in the
//     allowlist are allowed", which is why the two APIs not named in the
//     config are refused rather than merely unused.
//   - its own gRPC example is `version: v1`, `protocol: grpc`, as drawn.
//   - the table "List of Dapr APIs" gives the gRPC name of each API. Service
//     invocation is `invoke`; Pub/Sub is `publish`.
//
// Where this departs from the source image, and why:
//   - the source's config allows `pubsub`. There is no such API name: the
//     table above calls it `publish`, and a reader who copies the YAML out of
//     a picture gets a config that allows nothing by that name. Corrected.
//   - `metadata.name` is `myappconfig`, the name the linked how-to uses, so
//     the picture and the page a reader lands on agree. The source has
//     `appconfig`.
//   - the source marks the allowed APIs with a green tick. Nothing in this
//     palette is a safe green on the light ground - the mint fails contrast
//     and the builders refuse it - so allowed is drawn the way everything
//     permitted is drawn in this set: a solid navy run. Orange is already the
//     set's failure colour, so the refusals keep theirs.
//   - the config is joined to the sidecar by an arrow. In the source the two
//     sit side by side with nothing between them, which leaves the reader to
//     guess which of the three things on the page the YAML belongs to.

import { APP, C } from '../engine.mjs';
import { arrow, hexHalfWidth, label, region, roundedPath } from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { apiTile } from '../apis.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';

const W = 880;
const H = 545;

const TEXT = 13;
const CODE = 12;
// Leading spaces in SVG text collapse, so an indent has to be a character
// that does not. `app-health` indents its command the same way.
const NBSP = ' ';
const pad = (n, s) => NBSP.repeat(n) + s;

// ---- the configuration ------------------------------------------------------
const CONFIG = { x: 48, y: 127.5, w: 258, h: 290 };
const CODE_X = CONFIG.x + 28;
const CONFIG_RIGHT = CONFIG.x + CONFIG.w;

const YAML = [
  'apiVersion: dapr.io/v1alpha1',
  'kind: Configuration',
  'metadata:',
  pad(2, 'name: myappconfig'),
  pad(2, 'namespace: default'),
  'spec:',
  pad(2, 'api:'),
  pad(4, 'allowed:'),
  pad(6, '- name: invoke'),
  pad(8, 'version: v1'),
  pad(8, 'protocol: grpc'),
  pad(6, '- name: publish'),
  pad(8, 'version: v1'),
  pad(8, 'protocol: grpc'),
].join('\n');

// ---- the app and its sidecar ------------------------------------------------
// The HEXAGON is centred between the configuration and the APIs, not the pair:
// the sidecar hangs off its right, so centring the pair would leave the app
// itself sitting left of the middle, which is the shape a reader sees.
const APP_R = 54;
const APP_SIZE = 16;
const GAP = 162; // config edge to hexagon, and hexagon to the APIs' line
const APP_X = CONFIG_RIGHT + GAP;
// The pair centred on the canvas, which is not the hexagon centred on it.
const APP_Y = +(H / 2 - 24.3).toFixed(2);
const SIDE = sidecarAt({ x: APP_X, y: APP_Y, r: APP_R, size: APP_SIZE });
const SIDE_RIGHT = +(SIDE.x + hexHalfWidth(SIDE.r)).toFixed(2);

// ---- the APIs the sidecar serves, or refuses --------------------------------
// [key, allowed]. The two allowed are the two the config names; the API the
// allow list leaves out is refused, which is the whole point of the picture.
const TILES = [
  ['service-invocation', true],
  ['state', false],
  ['pubsub', true],
  ['bindings', false],
];

// The square card and the pitch every other capability grid in the set uses.
const CARD = 112;
const ROW_PITCH = 126;
const ROW_0 = +(H / 2 - ((TILES.length - 1) * ROW_PITCH) / 2).toFixed(2);
const rowY = (i) => ROW_0 + i * ROW_PITCH;

// The sidecar's API surface: one run out of it, and a branch per API. The
// allow list is enforced AT the sidecar, so the call always gets this far -
// what differs is whether it goes any further.
const SPINE_X = APP_X + GAP;
const SPINE_R = 14;
// The run out of the sidecar and the run into a card are the same length, so
// neither reads as the main one.
const BRANCH = +(SPINE_X - SIDE_RIGHT - 2).toFixed(2);
const TILE_LEFT = SPINE_X + BRANCH;
const TILE_CX = TILE_LEFT + CARD / 2;
const MARK = 24;
const MARK_X = +((SPINE_X + TILE_LEFT) / 2).toFixed(2);

export default {
  width: W,
  height: H,
  title: 'An API allow list, and the sidecar APIs it permits',
  desc:
    'On the left, a configuration headed "Sidecar configuration" holds a Dapr Configuration resource whose spec allows two APIs over gRPC: invoke and publish. An arrow runs from it to the Dapr sidecar beside MyApp in the middle. From the sidecar a line reaches a column of four Dapr APIs on the right. Service invocation and Publish and subscribe are reached by a solid arrow with a tick, because the allow list names them. State management and Bindings are reached by a dashed orange arrow with a cross, because it does not.',

  build() {
    return [
      // ---- the configuration ----------------------------------------------
      region({
        x: CONFIG.x, y: CONFIG.y, w: CONFIG.w, h: CONFIG.h, stroke: C.caption,
        caption: 'Sidecar configuration', captionW: 164, captionH: 26, captionSize: TEXT,
      }),
      label({
        x: CODE_X, y: CONFIG.y + CONFIG.h / 2 + 10, text: YAML,
        size: CODE, mono: true, weight: 400, anchor: 'start',
      }),
      // Into the SIDECAR, not the app: an allow list is the sidecar's
      // configuration. At the sidecar's own height the run passes under the
      // app hexagon rather than through it.
      arrow({
        from: [CONFIG.x + CONFIG.w + 2, SIDE.y],
        to: [SIDE.x - hexHalfWidth(SIDE.r) - 2, SIDE.y],
      }),

      // ---- the app ----------------------------------------------------------
      appSidecar({ x: APP_X, y: APP_Y, r: APP_R, label: 'MyApp', size: APP_SIZE, ...APP[0] }),

      // ---- out to the APIs --------------------------------------------------
      arrow({ from: [SIDE_RIGHT + 2, SIDE.y], to: [SPINE_X, SIDE.y], head: false }),
      roundedPath({
        points: [[SPINE_X, rowY(0)], [SPINE_X, rowY(TILES.length - 1)]],
        r: SPINE_R,
      }),

      TILES.map(([key, allowed], i) => {
        const y = rowY(i);
        return [
          arrow({
            from: [SPINE_X, y],
            to: [TILE_LEFT - 2, y],
            color: allowed ? C.navy : C.orange,
            dash: !allowed,
          }),
          // Above the run it marks, never on it.
          icon({
            name: allowed ? 'fluent-checkmark-circle' : 'fluent-dismiss-circle',
            x: MARK_X, y: y - MARK, size: MARK,
            color: allowed ? C.navy : C.orange,
          }),
          apiTile({ key, wrap: true, x: TILE_CX, y, w: CARD, h: CARD }),
        ];
      }),
    ];
  },
};
