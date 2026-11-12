// A client-level operation crossing applications: app-a terminates a workflow
// instance that app-b owns, and app-b's access policy decides whether it may.
//
// Replaces the Mermaid flowchart under "How it works" on
// developing-applications/building-blocks/workflow/workflow-multi-app.md. The
// Mermaid is converted rather than kept because it draws a MECHANISM - two
// applications, their sidecars, a policy decision with two outcomes - which is
// what the rest of this set draws, and it was the only thing on the page
// rendering in a different hand. The sequence diagrams elsewhere in these docs
// stay as Mermaid; this is a flowchart.
//
// Fact-check, against the paragraphs around it:
//   - "`app-a` hosts no workflow code at all." So app-a holds the caller's own
//     code and a sidecar, and nothing else.
//   - "it stamps `app-a` as the caller, and `app-b`'s sidecar checks that
//     identity against its own access policy before the operation reaches the
//     instance." So the policy sits between app-b's sidecar and the instance,
//     which is the order the Mermaid has.
//   - "Because the caller's identity is what the policy is evaluated against,
//     mTLS must be enabled." The link between the sidecars carries that, as it
//     does in the Mermaid.
//   - "Only `app-b` ever runs the workflow." The instance is inside app-b.
//
// Where this departs from the Mermaid, and why:
//   - each sidecar is markHex(), the Dapr hexagon every other diagram in this
//     set uses for one. The Mermaid drew a plain box labelled "Dapr sidecar",
//     which is what Mermaid can draw rather than a decision about the shape.
//   - the denied outcome is the red one. Mermaid gave both outcomes the same
//     fill; the house palette has a colour for a refusal and this is one.

import { C } from '../engine.mjs';
import { FLOW, flowLane, note } from '../flow.mjs';
import { arrow, box, decision, decisionPoints, elbowArrow, group } from '../shapes.mjs';
import { markHex } from '../icons.mjs';

const MARGIN = 40;
const HEX_R = 40;

const BOX_W = 214;
const GATE_W = 226;
const GATE_H = 104;

// app-a on the left, app-b on the right, as the flowchart's `LR` has them.
const A_X = MARGIN + FLOW.PAD + BOX_W / 2;
const B_X = A_X + BOX_W / 2 + 150 + GATE_W / 2;

// app-a: the caller's code, then its sidecar.
const CODE_Y = MARGIN + 58;
const A_HEX_Y = CODE_Y + 58 + HEX_R;

// app-b: its sidecar, the policy, then the two outcomes.
const B_HEX_Y = A_HEX_Y;
const GATE_Y = B_HEX_Y + HEX_R + 76 + GATE_H / 2;
const OUT_Y = GATE_Y + GATE_H / 2 + 58 + FLOW.H / 2;

const DENIED_X = B_X + GATE_W / 2 + 56 + BOX_W / 2;

// Every note here is haloed. This drawing is a column of shapes joined by
// lines, so most of its notes sit on or beside one, and a halo is what the
// rendered suite accepts as ground - it paints a copy of the text in the page
// colour underneath, so the line passes behind the words. Cheaper than bending
// the layout around the type, and it is the remedy the set already has.
const cap = (x, y, text, anchor = 'middle') => note({ x, y, text, anchor, halo: true });

// Each sidecar names itself under its hexagon. The drop is the same either
// side, so the two read as the same kind of thing.
const SIDECAR_CAP_DY = HEX_R + 18;

const A_LEFT = MARGIN;
const A_W = BOX_W + FLOW.PAD * 2;
const B_LEFT = B_X - GATE_W / 2 - FLOW.PAD;
const B_W = DENIED_X + BOX_W / 2 + FLOW.PAD - B_LEFT;

const LANE_TOP = CODE_Y - FLOW.H / 2 - FLOW.PAD;
// app-a's last piece of content is the words "Dapr sidecar", not the hexagon
// above them, so the lane is padded from the words. Padded from the hexagon it
// left the type about four units off the dashed border - inside the pad, and
// close enough to read as the label of the LANE rather than of the sidecar.
// Half the type size stands in for half the cap height, which the exporter has
// no font metrics to measure and which is smaller than that either way.
const A_BOTTOM = A_HEX_Y + SIDECAR_CAP_DY + FLOW.NOTE_SIZE / 2 + FLOW.PAD;
const B_BOTTOM = OUT_Y + FLOW.H / 2 + FLOW.PAD;

export default {
  width: B_LEFT + B_W + MARGIN,
  height: B_BOTTOM + MARGIN,
  title: 'One application terminating a workflow another application owns',
  desc:
    'Code in app-a asks its Dapr sidecar to terminate the instance order-1, '
    + 'naming app-b as the owning application. The sidecar passes the request '
    + 'to app-b\'s sidecar, carrying the caller identity over mTLS. App-b\'s '
    + 'sidecar checks its WorkflowAccessPolicy: whether app-a may terminate an '
    + 'OrderWF. If allowed, the operation reaches the order-1 instance, which '
    + 'only app-b runs. If denied, the caller gets PermissionDenied.',

  build() {
    const gate = decisionPoints({ x: B_X, y: GATE_Y, w: GATE_W, h: GATE_H });

    return [
      flowLane({ x: A_LEFT, y: LANE_TOP, w: A_W, h: A_BOTTOM - LANE_TOP, caption: 'app-a', captionW: 62 }),
      flowLane({ x: B_LEFT, y: LANE_TOP, w: B_W, h: B_BOTTOM - LANE_TOP, caption: 'app-b', captionW: 62 }),

      // Down app-a, across to app-b, down to the policy.
      arrow({ from: [A_X, CODE_Y + FLOW.H / 2], to: [A_X, A_HEX_Y - HEX_R] }),
      arrow({ from: [A_X + HEX_R * 0.9, A_HEX_Y], to: [B_X - HEX_R * 0.9, B_HEX_Y] }),
      cap((A_X + B_X) / 2, A_HEX_Y - 18, 'caller identity over mTLS'),
      arrow({ from: [B_X, B_HEX_Y + HEX_R], to: gate.top }),
      // The question the policy answers. It rides ABOVE the diamond rather
      // than inside it: a diamond is widest only on its centre line, so a
      // second line of label overflows a shape that still passes every
      // geometric check. The skill says so and the source Mermaid, which has
      // no such constraint, set all three lines inside.
      cap(B_X, gate.top[1] - 16, 'may app-a terminate OrderWF?'),

      // Allowed goes straight on; denied leaves the gate sideways, as a
      // decision's two ways out should.
      arrow({ from: gate.bottom, to: [B_X, OUT_Y - FLOW.H / 2] }),
      cap(B_X + 12, (gate.bottom[1] + OUT_Y - FLOW.H / 2) / 2 + 5, 'allowed', 'start'),
      elbowArrow({ points: [gate.right, [DENIED_X, GATE_Y], [DENIED_X, OUT_Y - FLOW.H / 2]] }),
      cap((gate.right[0] + DENIED_X) / 2, GATE_Y - 14, 'denied'),

      box({
        x: A_X, y: CODE_Y, w: BOX_W, h: FLOW.H,
        label: 'Your code: terminate order-1\nnaming app-b',
        stroke: C.appInk, fill: C.bg, size: FLOW.SIZE,
      }),

      decision({
        x: B_X, y: GATE_Y, w: GATE_W, h: GATE_H,
        label: 'WorkflowAccessPolicy', size: FLOW.SIZE, ...FLOW.wait,
      }),

      box({ x: B_X, y: OUT_Y, w: BOX_W, h: FLOW.H, label: 'order-1, an OrderWF instance', ...FLOW.step }),
      box({
        x: DENIED_X, y: OUT_Y, w: BOX_W, h: FLOW.H,
        label: 'PermissionDenied', stroke: C.appInk, fill: C.orange, ink: C.appInk, size: FLOW.SIZE,
      }),

      group([
        markHex({ x: A_X, y: A_HEX_Y, r: HEX_R, mark: 'logo-blue' }),
        markHex({ x: B_X, y: B_HEX_Y, r: HEX_R, mark: 'logo-blue' }),
      ]),
      cap(A_X, A_HEX_Y + SIDECAR_CAP_DY, 'Dapr sidecar'),
      cap(B_X, B_HEX_Y + SIDECAR_CAP_DY, 'Dapr sidecar'),
    ];
  },
};
