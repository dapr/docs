// WHAT HISTORY SIGNING BUILDS: a workflow's history events, the chain of
// signatures that covers them in batches, and the certificate each signature
// was made with.
//
// Replaces the first `flowchart LR` on
// developing-applications/building-blocks/workflow/workflow-history-signing.md,
// under "Overview". The page's `gantt`, under "Certificate rotation", stays
// Mermaid: a timeline with sections and milestones is a notation this set
// does not have and should not grow one for. Maintainer's ruling of
// 2026-11-01.
//
// Fact-check, against the five numbered steps the block sits under:
//   - "Computes a SHA-256 digest over the batch of events" - the batches are
//     the source's own [0,2), [2,4), [4,6), and the drawing keeps them.
//   - "Chains the new digest to the previous signature's digest" - the runs
//     between signatures, which carry the source's own words, prev digest.
//   - "Persists the signature and the signing certificate alongside the
//     history" - the certificate table, and the cert index on each run into
//     it.
//   - Two certificates for three signatures, with Sig 0 and Sig 1 sharing
//     cert index 0, is the source's own arrangement and is what the
//     "Certificate rotation" section below describes: a new SVID at each
//     boot, so a signature made before a restart and one made after it point
//     at different rows.
// Nothing here disagrees with the prose.
//
// TWO DELIBERATE DEPARTURES FROM THE SOURCE:
//
//   1. THE THREE SUBGRAPHS ARE STACKED, not laid left to right. The source
//      is `flowchart LR`, so Mermaid puts History, Signatures and Certs
//      side by side and runs the dotted links horizontally between them. The
//      relation each dotted link carries is "this is covered by that" and
//      "this was signed with that" - a layering, not a sequence - and the
//      two sequences that ARE sequences (events along their history,
//      signatures along their chain) both run left to right inside their own
//      band. Stacking is what lets both read the way they are: along the
//      band for the sequence, down the page for the layering. The positions
//      in a rendered Mermaid block are its layout engine's output, not a
//      decision, so there is no arrangement here to be unfaithful to.
//
//   2. THE EVENTS ARE JOINED BY A PLAIN LINE, not an arrow. The source uses
//      `---` between them and `-->` everywhere else, and the difference is
//      the point: history events sit in order, they do not flow into one
//      another. The drawing keeps that distinction by keeping the source's
//      own two kinds of line.

import { FLOW, flowLane, note } from '../flow.mjs';
import { arrow, box, CAPTION_INSET, elbowArrow } from '../shapes.mjs';

const EDGE = 29;
// A caption pill is centred ON the top border, so it hangs captionReach()
// above the band. 14 left its top edge 7.5 units from the viewBox, inside the
// 10-unit margin the rendered suite enforces.
const V_EDGE = 26;

const EV_W = 118;
const EV_H = 44;
const EV_GAP = 22;

const SIG_W = 190;
const SIG_H = 56;

const CERT_W = 210;
const CERT_H = 52;

// Between one band and the next. The dotted runs cross this gap and carry a
// word on the way, so it is wider than the gap inside a band.
const BAND_GAP = 50;

const EVENTS = 6;
const EV_PITCH = EV_W + EV_GAP;

// Measured pill widths. The exporter has no font metrics, so each is the
// text's own width plus captionPad() at both ends and a little over.
const CAP_HISTORY = 152;
const CAP_SIGNATURES = 148;
const CAP_CERTS = 158;

// The bands' contents start clear of the caption pill, not at the band's own
// padding. This is not decoration: the six dotted runs from the events drop
// THROUGH the signature band's top border, and at the default inset the
// first of them went straight through the 'Signature Chain' pill. Starting
// the row after the widest pill is what moves every one of them clear, and it
// does it for all three bands at once rather than nudging one caption into a
// gap 5 units wider than itself.
const LEFT_INSET = CAPTION_INSET + Math.max(CAP_HISTORY, CAP_SIGNATURES, CAP_CERTS) + 24;

// ---- the three bands, across --------------------------------------------------
const LANE_X0 = EDGE;
const evX = (i) => LANE_X0 + LEFT_INSET + EV_W / 2 + i * EV_PITCH;
const LANE_X1 = evX(EVENTS - 1) + EV_W / 2 + FLOW.PAD;

// A signature covers a PAIR of events and sits under the middle of that pair,
// which is the whole claim the dotted runs make.
const sigX = (i) => (evX(i * 2) + evX(i * 2 + 1)) / 2;
// Sig 0 and Sig 1 were both made with cert 0, so it sits between them; cert 1
// sits under the signature that is its only user.
const CERT_0_X = (sigX(0) + sigX(1)) / 2;
const CERT_1_X = sigX(2);

// ---- the three bands, down ----------------------------------------------------
const BAND_1_Y0 = V_EDGE;
const ROW_EV = BAND_1_Y0 + FLOW.PAD + EV_H / 2;
const BAND_1_Y1 = ROW_EV + EV_H / 2 + FLOW.PAD;

const BAND_2_Y0 = BAND_1_Y1 + BAND_GAP;
const ROW_SIG = BAND_2_Y0 + FLOW.PAD + SIG_H / 2;
const BAND_2_Y1 = ROW_SIG + SIG_H / 2 + FLOW.PAD;

const BAND_3_Y0 = BAND_2_Y1 + BAND_GAP;
const ROW_CERT = BAND_3_Y0 + FLOW.PAD + CERT_H / 2;
const BAND_3_Y1 = ROW_CERT + CERT_H / 2 + FLOW.PAD;

// Where a run that has to move sideways between two bands makes its turn:
// halfway down the gap, so every such run turns on the same line.
const TURN_Y = (BAND_2_Y1 + BAND_3_Y0) / 2;

const W = Math.ceil(LANE_X1 + EDGE);
const H = Math.ceil(BAND_3_Y1 + V_EDGE);

const SIGS = [
  'Sig 0\nEvents [0,2)',
  'Sig 1\nEvents [2,4)',
  'Sig 2\nEvents [4,6)',
];

export default {
  width: W,
  height: H,
  title: 'How workflow history events, their signature chain and the signing certificates relate',
  desc:
    'Three dashed bands, stacked. The top band, Workflow History, holds six '
    + 'boxes in a row, Event 0 to Event 5, joined by a plain line because they '
    + 'sit in order rather than flowing into one another. The middle band, '
    + 'Signature Chain, holds three boxes: Sig 0 covering events 0 to 2, Sig 1 '
    + 'covering events 2 to 4, and Sig 2 covering events 4 to 6, each joined '
    + 'to the next by an arrow carrying the words prev digest. A dotted line '
    + 'runs down from each pair of events to the signature that covers it. The '
    + 'bottom band, Certificate Table, holds Cert 0, the SVID from boot 1, and '
    + 'Cert 1, the SVID from boot 2; dotted lines run down from Sig 0 and Sig '
    + '1 to Cert 0, both marked cert index 0, and from Sig 2 to Cert 1, marked '
    + 'cert index 1.',

  build() {
    const evBottom = ROW_EV + EV_H / 2;
    const sigTop = ROW_SIG - SIG_H / 2;
    const sigBottom = ROW_SIG + SIG_H / 2;
    const certTop = ROW_CERT - CERT_H / 2;

    return [
      // ---- the bands ---------------------------------------------------------
      flowLane({
        x: LANE_X0,
        y: BAND_1_Y0,
        w: LANE_X1 - LANE_X0,
        h: BAND_1_Y1 - BAND_1_Y0,
        caption: 'Workflow History',
        captionW: CAP_HISTORY,
      }),
      flowLane({
        x: LANE_X0,
        y: BAND_2_Y0,
        w: LANE_X1 - LANE_X0,
        h: BAND_2_Y1 - BAND_2_Y0,
        caption: 'Signature Chain',
        captionW: CAP_SIGNATURES,
      }),
      flowLane({
        x: LANE_X0,
        y: BAND_3_Y0,
        w: LANE_X1 - LANE_X0,
        h: BAND_3_Y1 - BAND_3_Y0,
        caption: 'Certificate Table',
        captionW: CAP_CERTS,
      }),

      // ---- events sit in order: a plain line, no heads -----------------------
      Array.from({ length: EVENTS - 1 }, (_, i) => arrow({
        from: [evX(i) + EV_W / 2, ROW_EV],
        to: [evX(i + 1) - EV_W / 2, ROW_EV],
        head: false,
      })),

      // ---- each pair of events is covered by one signature -------------------
      Array.from({ length: EVENTS }, (_, i) => arrow({
        from: [evX(i), evBottom],
        to: [evX(i), sigTop - 2],
        dash: true,
      })),

      // ---- and each signature chains to the next -----------------------------
      SIGS.slice(0, -1).map((_, i) => [
        arrow({
          from: [sigX(i) + SIG_W / 2, ROW_SIG],
          to: [sigX(i + 1) - SIG_W / 2 - 2, ROW_SIG],
        }),
        note({
          x: (sigX(i) + sigX(i + 1)) / 2,
          y: ROW_SIG - SIG_H / 2 - 8,
          text: 'prev digest',
          halo: true,
        }),
      ]),

      // ---- each signature names the certificate it was made with -------------
      elbowArrow({
        points: [
          [sigX(0), sigBottom],
          [sigX(0), TURN_Y],
          [CERT_0_X - CERT_W / 4, TURN_Y],
          [CERT_0_X - CERT_W / 4, certTop - 2],
        ],
        dash: true,
      }),
      elbowArrow({
        points: [
          [sigX(1), sigBottom],
          [sigX(1), TURN_Y],
          [CERT_0_X + CERT_W / 4, TURN_Y],
          [CERT_0_X + CERT_W / 4, certTop - 2],
        ],
        dash: true,
      }),
      arrow({
        from: [sigX(2), sigBottom],
        to: [sigX(2), certTop - 2],
        dash: true,
      }),
      note({
        x: (sigX(0) + CERT_0_X - CERT_W / 4) / 2,
        y: TURN_Y - 8,
        text: 'cert index 0',
        halo: true,
      }),
      note({
        x: (sigX(1) + CERT_0_X + CERT_W / 4) / 2,
        y: TURN_Y - 8,
        text: 'cert index 0',
        halo: true,
      }),
      note({
        x: sigX(2) + 10,
        y: TURN_Y - 8,
        text: 'cert index 1',
        anchor: 'start',
        halo: true,
      }),

      // ---- the shapes, over the lines that reach them ------------------------
      Array.from({ length: EVENTS }, (_, i) => box({
        x: evX(i), y: ROW_EV, w: EV_W, h: EV_H, label: `Event ${i}`, ...FLOW.step,
      })),
      SIGS.map((name, i) => box({
        x: sigX(i), y: ROW_SIG, w: SIG_W, h: SIG_H, label: name, ...FLOW.step,
      })),
      box({
        x: CERT_0_X,
        y: ROW_CERT,
        w: CERT_W,
        h: CERT_H,
        label: 'Cert 0\nSVID from Boot 1',
        ...FLOW.step,
      }),
      box({
        x: CERT_1_X,
        y: ROW_CERT,
        w: CERT_W,
        h: CERT_H,
        label: 'Cert 1\nSVID from Boot 2',
        ...FLOW.step,
      }),
    ];
  },
};
