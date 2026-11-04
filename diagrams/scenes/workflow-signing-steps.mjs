// WHAT DAPR DOES TO SIGN A BATCH OF NEW HISTORY EVENTS: four steps, in order.
//
// Replaces the SECOND of the two `flowchart LR` blocks on
// developing-applications/building-blocks/workflow/workflow-history-signing.md,
// under "Signing new events". The page's `gantt` stays Mermaid: a timeline
// with sections and milestones is a notation this set does not have and
// should not grow one for. Maintainer's ruling of 2026-11-01.
//
// Fact-check, against the numbered list the block sits above, which is the
// same four steps written out:
//   1. "Each new HistoryEvent is marshaled using protobuf's deterministic
//      mode" - box one, in the source's own words.
//   2-4. "A SHA-256 hash is computed over the batch of marshaled events ...
//      The SHA-256 digest of the previous HistorySignature protobuf message
//      is computed" - box two, which is the source's own folding of the
//      events digest and the chain linkage into one step.
//   5. "The input is signed using the sidecar's SPIFFE X.509 private key" -
//      box three.
//   7. "The signature, any new certificate entry, and the history events are
//      all persisted to the state store in a single transactional write" -
//      box four.
// Step 6, certificate resolution, is in the prose and NOT in the source's
// flowchart. It is not added here: the drawing is the source's four steps,
// and a fifth box that the page's own picture does not have would be this
// scene disagreeing with the one above it.
//
// It is a STRIP - about eight times as wide as it is tall - because four
// steps in a row is what the source draws and what the process is. The 16:9
// rule is a floor, not a band: a diagram wider than the frame just leaves
// bands above and below it. The line breaks inside each box are the source's
// own, which is why three of them are three lines deep and one is two.

import { FLOW } from '../flow.mjs';
import { arrow, box } from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

// Three lines of FLOW.SIZE with a pad either side. Every box is this deep,
// including the one whose name is two lines: a step shorter than the step
// beside it reads as a different kind of thing.
const BOX_W = 158;
const BOX_H = 78;

const STEPS = [
  'Marshal events\n(deterministic\nprotobuf)',
  'Compute digests\n& chain to\nprevious signature',
  'Sign with\nSVID private key',
  'Persist signature\n+ certificate\n+ history events',
];

const GAP = FLOW.GAP_X;
const PITCH = BOX_W + GAP;
const stepX = (i) => EDGE + BOX_W / 2 + i * PITCH;

const Y = V_EDGE + BOX_H / 2;
const W = Math.ceil(stepX(STEPS.length - 1) + BOX_W / 2 + EDGE);
const H = Math.ceil(Y + BOX_H / 2 + V_EDGE);

export default {
  width: W,
  height: H,
  title: 'The four steps Dapr takes to sign a batch of new workflow history events',
  desc:
    'Four teal boxes in a row, joined left to right by arrows: Marshal '
    + 'events, deterministic protobuf; Compute digests and chain to previous '
    + 'signature; Sign with SVID private key; Persist signature plus '
    + 'certificate plus history events.',

  build() {
    return [
      STEPS.slice(0, -1).map((_, i) => arrow({
        from: [stepX(i) + BOX_W / 2, Y],
        to: [stepX(i + 1) - BOX_W / 2 - 2, Y],
      })),
      STEPS.map((label, i) => box({
        x: stepX(i), y: Y, w: BOX_W, h: BOX_H, label, ...FLOW.step,
      })),
    ];
  },
};
