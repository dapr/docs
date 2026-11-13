// THE WORKFLOW ARCHITECTURE IN KUBERNETES MODE: one pod holding the sidecar
// and the application, and the one gRPC stream between them.
//
// Replaces /images/workflow-overview/workflows-architecture-k8s.png on
// developing-applications/building-blocks/workflow/workflow-architecture.md,
// at the top of the page.
//
// Fact-check, against the three paragraphs around it:
//   - "The Dapr Workflow engine is internally powered by Dapr's actor
//     runtime" - the workflow actor and the activity actor are inside the
//     sidecar, not in the app, and both are marked internal.
//   - "you write workflow code in your application using the Dapr Workflow
//     SDK, which internally connects to the sidecar using a gRPC stream" -
//     the SDK is inside the workflow code, inside the app, and the stream is
//     the only thing crossing between app and sidecar.
//   - "The engine is embedded directly into the sidecar" - which is why the
//     workflow engine is drawn inside the sidecar's boundary rather than
//     beside it.
//   - The three lines under the stream are the source's own, and they match
//     "Sidecar interactions" further down the page: the app initiates, the
//     sidecar sends work items, the app sends results back.
// Nothing here disagrees with the prose.
//
// DEPARTURES FROM THE SOURCE:
//
//   1. THE TWO ACTORS ARE CIRCLES. The source draws them as Dapr hexagons,
//      because they are internal to Dapr. In these docs an actor is a solid
//      circle - `actors-communication` and the actors pages draw it that way
//      - and this page has already drawn the workflow actor as a circle
//      twice, in `workflow-actor-reminder-flow` and
//      `workflow-state-store-interactions`. A hexagon here would make the
//      same object a different shape in its third appearance.
//
//      Their names sit BELOW them, which is node()'s own default. At the
//      scale a pod diagram needs, a circle big enough to carry "Workflow
//      actor" and "(internal)" inside it would be larger than the sidecar
//      that holds it.
//
//   2. THE BOUNDARIES ARE NOT COLOUR-CODED. The source draws four nested
//      boundaries in four colours - navy pod, sky sidecar, black app, green
//      workflow code. Here the pod is pod(), the house Kubernetes pod, and
//      the three inside it are regions in one stroke. What says which is
//      which is the caption on each border, and nesting says the rest; four
//      dashed colours in one picture would be four conventions a reader has
//      to learn for one diagram.
//
//   3. THE SIDECAR IS THE BOUNDARY, not a boundary plus a Dapr hexagon on
//      its edge. The source draws both. The engine inside it already carries
//      the Dapr mark, so the second one was naming the same thing twice.
//
//   4. "Workflow App" IS A REGION, not the app hexagon this page uses
//      elsewhere. Here it has to CONTAIN the workflow code and the SDK, and
//      a hexagon cannot hold anything. Containment in this set is a region.

import { APP, C } from '../engine.mjs';
import {
  arrow, elbowArrow, group, hex, hexHalfWidth, label, node, pod, region,
} from '../shapes.mjs';
import { markHex } from '../icons.mjs';

const EDGE = 29;
// 26, not 14: the outermost boundary carries a caption pill, and a pill is
// centred ON its border, so it reaches captionReach() above it. At 14 the
// pill came within 7.5 units of the viewBox, under the 10 the rendered suite
// asks for.
const V_EDGE = 26;

const TEXT = 13;

const ACTOR_R = 32;
const ENG_R = 40;
const SDK_R = 46;

// How far a region stands off what it holds, and how far a name sits under
// the shape it names.
const PAD = 30;
// The app region and the workflow code inside it are nested one border apart,
// and a caption pill is CAPTION_H tall centred ON its border. At PAD the two
// pills left four units between them and overlapped horizontally, because
// both sit at their own border's left inset. This is the gap that holds them
// apart.
const NEST_PAD = 48;
const NAME_GAP = 14;
const NAME_H = TEXT * 2.4;

// Room outside the pod for the two API runs and their names.
const API_RUN = 214;

// ---- the sidecar's contents --------------------------------------------------
// The two actors stack on the left; the engine sits between them on the
// right, which is what the two runs out of it say.
const ACTOR_NAME_W = 118;
const SIDE_GAP = 196;

const POD_X = EDGE + API_RUN;
const SIDE_X0 = POD_X + PAD;
const ACTOR_X = SIDE_X0 + PAD + Math.max(ACTOR_R, ACTOR_NAME_W / 2);
const ENG_X = ACTOR_X + ACTOR_R + SIDE_GAP + hexHalfWidth(ENG_R);
const SIDE_X1 = ENG_X + hexHalfWidth(ENG_R) + PAD;

// NEST_PAD, not PAD: the pod's caption pill and the sidecar's both hang
// CAPTION_H / 2 inside their own borders, so at PAD they ended 4 units apart
// and read as one stack of two names.
const SIDE_Y0 = V_EDGE + NEST_PAD;
const ACTOR_Y1 = SIDE_Y0 + PAD + ACTOR_R;
const ACTOR_Y2 = ACTOR_Y1 + ACTOR_R + NAME_GAP + NAME_H + 44 + ACTOR_R;
const SIDE_Y1 = ACTOR_Y2 + ACTOR_R + NAME_GAP + NAME_H + PAD;
const ENG_Y = (ACTOR_Y1 + ACTOR_Y2) / 2;

// ---- the app, and the stream that reaches it ---------------------------------
// The gap carries the stream and the four lines that name it, so it is set by
// the words rather than by the shapes.
const STREAM_GAP = 252;

const APP_X0 = SIDE_X1 + STREAM_GAP;
const CODE_X0 = APP_X0 + PAD;
const SDK_X = CODE_X0 + PAD + hexHalfWidth(SDK_R);
const CODE_X1 = SDK_X + hexHalfWidth(SDK_R) + PAD;
const APP_X1 = CODE_X1 + PAD;

const SDK_Y = ENG_Y;
const CODE_Y0 = SDK_Y - SDK_R - PAD;
const CODE_Y1 = SDK_Y + SDK_R + PAD;
const APP_Y0 = CODE_Y0 - NEST_PAD;
const APP_Y1 = CODE_Y1 + PAD;

const POD_Y0 = V_EDGE;
const POD_Y1 = Math.max(SIDE_Y1, APP_Y1) + PAD;
const POD_X1 = APP_X1 + PAD;

const W = Math.ceil(POD_X1 + EDGE);
const H = Math.ceil(POD_Y1 + V_EDGE);

// Where the two runs out of the engine turn. Close to the ENGINE, not
// halfway: the horizontal segment either side of the turn is what carries
// "Process workflow events" and "Invoke activity code", and at the midpoint
// that segment was 140 units long for a name that measures 165, so both
// names were drawn in clear air to the right of the line they belong to.
const TEE_X = ENG_X - hexHalfWidth(ENG_R) - 44;

// How far a run's name starts clear of the actor the run reaches. Without
// it, "Process workflow events" began on the circle's rim.
const WORD_CLEAR = 20;

const WORD_DY = 12;

const word = (x, y, text, anchor = 'middle') => label({
  x, y, text, size: TEXT, weight: 500, color: C.caption, anchor, halo: true,
});

// The workflow actor is gold and the activity actor is blue, which is the
// pair `workflow-actor-scale-out` lower down the page spends a whole legend
// on. The first draft drew both gold and left the names to tell them apart -
// two kinds of actor wearing one colour, in the picture that introduces
// them.
const actor = (y, name, kind) => node({
  x: ACTOR_X,
  y,
  r: ACTOR_R,
  fill: kind.fill,
  stroke: kind.stroke,
  ink: C.body,
  label: name,
  // node() drops a name r + 14 below the centre by default, which for a
  // two-line name at this radius left its first line overlapping the
  // circle's own box. A name that STRADDLES its shape is read by the
  // rendered suite as a name that should be inside it, and it was reported
  // 24 units too wide. This is what clears the rim.
  labelDy: ACTOR_R + 24,
  size: TEXT,
});

export default {
  width: W,
  height: H,
  title: 'The Dapr Workflow architecture in Kubernetes mode',
  desc:
    'One app pod. Inside it on the left, a region named Sidecar holding the '
    + 'workflow actor and the activity actor, both internal and both drawn as '
    + 'circles, and the Dapr workflow engine. The engine processes workflow '
    + 'events on the workflow actor and invokes activity code on the activity '
    + 'actor. Inside the pod on the right, a region named Workflow App '
    + 'holding a region named Workflow code, which holds the Dapr Workflow '
    + 'SDK. A single gRPC stream joins the engine to the SDK: the app '
    + 'initiates the stream, the sidecar sends state and work items, and the '
    + 'app sends results and next steps back. Inbound and outbound Dapr API '
    + 'calls reach the sidecar from outside the pod.',

  build() {
    return [
      // ---- the boundaries, drawn first so everything sits on them ----------
      pod({
        x: POD_X,
        y: POD_Y0,
        w: POD_X1 - POD_X,
        h: POD_Y1 - POD_Y0,
        name: 'App pod',
        captionW: 76,
      }),
      region({
        x: SIDE_X0,
        y: SIDE_Y0,
        w: SIDE_X1 - SIDE_X0,
        h: SIDE_Y1 - SIDE_Y0,
        caption: 'Sidecar',
        captionW: 74,
        captionSize: TEXT,
      }),
      region({
        x: APP_X0,
        y: APP_Y0,
        w: APP_X1 - APP_X0,
        h: APP_Y1 - APP_Y0,
        caption: 'Workflow App',
        captionW: 114,
        captionSize: TEXT,
      }),
      region({
        x: CODE_X0,
        y: CODE_Y0,
        w: CODE_X1 - CODE_X0,
        h: CODE_Y1 - CODE_Y0,
        caption: 'Workflow code',
        captionW: 120,
        captionSize: TEXT,
      }),

      // ---- in and out of the sidecar, from outside the pod -----------------
      arrow({ from: [EDGE, ACTOR_Y1], to: [SIDE_X0 - 2, ACTOR_Y1] }),
      word(EDGE + API_RUN / 2, ACTOR_Y1 - WORD_DY, 'inbound Dapr API calls'),
      arrow({ from: [SIDE_X0, ACTOR_Y2], to: [EDGE + 2, ACTOR_Y2] }),
      word(EDGE + API_RUN / 2, ACTOR_Y2 - WORD_DY, 'outbound Dapr API calls'),

      // ---- the engine drives both actors -----------------------------------
      elbowArrow({
        points: [
          [ENG_X - hexHalfWidth(ENG_R), ENG_Y],
          [TEE_X, ENG_Y],
          [TEE_X, ACTOR_Y1],
          [ACTOR_X + ACTOR_R + 2, ACTOR_Y1],
        ],
      }),
      word(
        (ACTOR_X + ACTOR_R + WORD_CLEAR + TEE_X) / 2,
        ACTOR_Y1 - WORD_DY,
        'Process workflow events',
      ),
      elbowArrow({
        points: [
          [ENG_X - hexHalfWidth(ENG_R), ENG_Y],
          [TEE_X, ENG_Y],
          [TEE_X, ACTOR_Y2],
          [ACTOR_X + ACTOR_R + 2, ACTOR_Y2],
        ],
      }),
      word(
        (ACTOR_X + ACTOR_R + WORD_CLEAR + TEE_X) / 2,
        ACTOR_Y2 + WORD_DY + TEXT * 0.6,
        'Invoke activity code',
      ),

      // ---- and the one stream to the app -----------------------------------
      arrow({
        from: [ENG_X + hexHalfWidth(ENG_R), SDK_Y],
        to: [SDK_X - hexHalfWidth(SDK_R) - 2, SDK_Y],
      }),
      arrow({
        from: [SDK_X - hexHalfWidth(SDK_R), SDK_Y],
        to: [ENG_X + hexHalfWidth(ENG_R) + 2, SDK_Y],
      }),
      word((SIDE_X1 + APP_X0) / 2, SDK_Y - WORD_DY - TEXT * 0.4, 'gRPC stream'),
      word(
        (SIDE_X1 + APP_X0) / 2,
        SDK_Y + WORD_DY + TEXT * 1.4,
        '<< Initiate stream\nState/work items >>\n<< Results/next steps',
      ),

      // ---- the shapes ------------------------------------------------------
      actor(ACTOR_Y1, 'Workflow actor\n(internal)', APP[2]),
      actor(ACTOR_Y2, 'Activity actor\n(internal)', APP[4]),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: ENG_X, y: ENG_Y, r: ENG_R, mark: 'logo-blue', stroke: C.blue }),
          label({
            x: ENG_X, y: ENG_Y + ENG_R + NAME_GAP + TEXT * 0.4, text: 'Workflow\nengine', size: TEXT,
          }),
        ],
      }),
      hex({
        x: SDK_X,
        y: SDK_Y,
        r: SDK_R,
        label: 'Dapr\nWorkflow\nSDK',
        size: TEXT,
        ...APP[0],
      }),
    ];
  },
};
