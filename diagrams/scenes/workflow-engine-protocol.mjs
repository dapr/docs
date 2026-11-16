// THE WORKFLOW ENGINE PROTOCOL: three exchanges over one gRPC channel, all
// of them opened by the application.
//
// Replaces /images/workflow-overview/workflow-engine-protocol.png on
// developing-applications/building-blocks/workflow/workflow-architecture.md,
// under "Sidecar interactions".
//
// Fact-check, against the two paragraphs the image sits between:
//   - "it uses a workflow authoring SDK to send a gRPC request to the Dapr
//     sidecar and get back a stream of workflow work items" - runs 1 and 2,
//     in the source's own numbering and words.
//   - "The workflow app executes the appropriate workflow code and then
//     sends a gRPC request back to the sidecar with the execution results" -
//     run 3.
//   - "All interactions happen over a single gRPC channel and are initiated
//     by the application, which means the application doesn't need to open
//     any inbound ports." THIS is why run 2 is drawn dashed and pointing
//     back at the app while runs 1 and 3 are solid and point at the engine:
//     the work items are a stream the app is served on a channel it opened,
//     not a call the engine makes to it. The source draws the same three
//     lines the same three ways.
//
// NOTHING NEW IS DRAWN HERE. The two hexagons, their radii, their names and
// the name's offset are `workflow-overview`'s, which replaced the picture at
// the top of the page this one links to. The two diagrams are a reader's
// first and second sight of the same two things, and they now wear the same
// shapes: the app in the second app fill with its definitions named under
// it, and the engine as the house Dapr hexagon rather than the source's
// outlined logo.

import { APP, C } from '../engine.mjs';
import {
  arrow, group, hex, hexHalfWidth, hexHalfWidthAt, label,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;

const TEXT = 13;
const NAME = 17;

// The same two radii `workflow-overview` uses, so the pair is the same pair.
const APP_R = 82;
const SIDE_R = 62;

// Between the two hexagons' bounding boxes. Set by the longest run name -
// "3. Send workflow results" - with room at both ends so the words are not
// grazing either shape.
const GAP = 320;

// How far the outer runs sit above and below the middle one. Three runs have
// to clear each other's names, and a name is TEXT deep with air around it.
const RUN_DY = 46;

const APP_X = EDGE + hexHalfWidth(APP_R);
const SIDE_X = APP_X + hexHalfWidth(APP_R) + GAP + hexHalfWidth(SIDE_R);

const ROW_Y = V_EDGE + Math.max(APP_R, SIDE_R);
const NAME_Y = Math.round(ROW_Y + Math.max(APP_R, SIDE_R) * HEX_NAME_DY);

// How far a run's name rides above the run it names.
const WORD_DY = 11;

const W = Math.ceil(SIDE_X + hexHalfWidth(SIDE_R) + EDGE);
const H = Math.ceil(NAME_Y + TEXT * 2.4 + V_EDGE);

// Each run starts at the hexagon's TRUE edge at its own height, not at the
// bounding box: a hexagon is narrower away from its centre line, and a run
// drawn to the box would stop short of the shape on the outer two rows.
const RUNS = [
  { dy: -RUN_DY, text: '1. Get work item stream', toEngine: true, dash: false },
  { dy: 0, text: '2. Fetch work items', toEngine: false, dash: true },
  { dy: RUN_DY, text: '3. Send workflow results', toEngine: true, dash: false },
];

export default {
  width: W,
  height: H,
  title: 'The three exchanges between a workflow app and the Dapr Workflow engine',
  desc:
    'On the left, a hexagon named Workflow App with Workflow and Activity '
    + 'definitions under it. On the right, the Dapr hexagon named Dapr '
    + 'Workflow engine. Three runs join them: Get work item stream, an arrow '
    + 'from the app to the engine; Fetch work items, a dashed arrow back from '
    + 'the engine to the app, because the work items are a stream served on '
    + 'the channel the app opened; and Send workflow results, an arrow from '
    + 'the app to the engine. Every one of them is opened by the application, '
    + 'so the application needs no inbound port.',

  build() {
    return [
      RUNS.map(({ dy, text, toEngine, dash }) => {
        const y = ROW_Y + dy;
        const appEdge = APP_X + hexHalfWidthAt(APP_R, dy);
        const engineEdge = SIDE_X - hexHalfWidthAt(SIDE_R, dy);
        return [
          arrow({
            from: toEngine ? [appEdge + 6, y] : [engineEdge - 6, y],
            to: toEngine ? [engineEdge - 6, y] : [appEdge + 6, y],
            dash,
          }),
          label({
            x: (appEdge + engineEdge) / 2,
            y: y - WORD_DY,
            text,
            size: TEXT,
            weight: 500,
            color: C.caption,
          }),
        ];
      }),

      // ---- the two hexagons, named under them, as the overview names them --
      group({
        class: 'd-named-mark',
        children: [
          hex({ x: APP_X, y: ROW_Y, r: APP_R, label: 'Workflow App', size: NAME, ...APP[1] }),
          label({
            x: APP_X, y: NAME_Y, text: 'Workflow and\nActivity definitions', size: TEXT,
          }),
        ],
      }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE_X, y: ROW_Y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE_X, y: NAME_Y, text: 'Dapr Workflow\nengine', size: TEXT }),
        ],
      }),
    ];
  },
};
