// The conversation API: an app POSTs a prompt to its Dapr sidecar, and the
// sidecar talks to whichever LLM its component names.
//
// Replaces conversation-overview.png on
// developing-applications/building-blocks/conversation/
// conversation-overview.md, under "Dapr's conversation API reduces the
// complexity of securely and reliably interacting with Large Language Models".
//
// DISCREPANCIES, raised and not resolved silently. The page's prose names
// neither the URL nor the providers, so the check is against this repository's
// own reference pages:
//
//   1. THE API VERSION IS OUT OF DATE IN THE SOURCE. It shows
//      `/v1.0-alpha1/conversation/<llm-name>/converse`.
//      reference/api/conversation_api.md gives `v1.0-alpha2` throughout. The
//      drawing follows the reference.
//   2. THE PROVIDER LIST IS OUT OF DATE IN THE SOURCE. It shows six.
//      reference/components-reference/supported-conversation/ holds ten, of
//      which nine are real providers and `local-echo` is a test component. The
//      drawing shows the nine, on the maintainer's ruling of 2026-11-02.
//      Five of their marks were vendored for this: hugging-face, deepseek,
//      google-ai, ollama and openrouter.
//
// WHY THIS DIFFERS FROM `components-concept`, which is NOT drift. That scene
// shows four conversation components and captions itself "These are examples,
// not the full list"; this one shows all nine. Both are deliberate: the
// components page would grow too large to read if every block listed every
// component, and this page is specifically about the conversation API and can
// afford the room. Maintainer's ruling, 2026-11-02. Do not "reconcile" them.
//
// Where this departs from the source as a DRAWING, and why:
//   - the providers are PLATED, every one of them. Three of the nine marks are
//     full colour and six are single colour; a row that plates some and not
//     others reads as two kinds of thing, and a full-colour mark needs the
//     plate to survive the dark ground. Plated marks take plate ink; their
//     names sit below the plate and keep body ink.
//   - the URL picks out `conversation` the way `sidecar-model` picks out the
//     building block in every Dapr API call this set draws.
//   - the app is APP[0] and the sidecar is the Dapr hexagon named under it, as
//     every other how-to in this set draws them.

import { C, APP } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidth, label, richLabel } from '../shapes.mjs';
import { logoStrip, logoStripSize, markHex } from '../icons.mjs';
import { NAME_DY as HEX_NAME_DY } from '../services.mjs';

const EDGE = 29;
const V_EDGE = 14;

const TEXT = 13;
const NAME = 17;

const APP_R = 60;
const SIDE_R = 48;

// Nine providers in THREE columns, which is three rows. One column makes a
// canvas far taller than it is wide and two is still portrait-ish once a row
// carries a plated mark AND its name; three keeps the strip close to square
// and the whole frame landscape, which is the house shape.
const COLS = 3;
const MARK = 30;
const GAP_X = 130;
const PAD = 26;

// In the order the components reference lists them, and named as its own page
// titles name them - the page's words beat the picture's.
const LLMS = [
  { mark: 'anthropic', name: 'Anthropic' },
  { mark: 'aws-bedrock', name: 'AWS Bedrock' },
  { mark: 'deepseek', name: 'DeepSeek' },
  { mark: 'google-ai', name: 'GoogleAI' },
  { mark: 'hugging-face', name: 'Huggingface' },
  { mark: 'mistral-ai', name: 'Mistral' },
  { mark: 'ollama', name: 'Ollama' },
  { mark: 'openai', name: 'OpenAI' },
  { mark: 'openrouter', name: 'OpenRouter' },
];

// An item is as wide as its NAME, which is wider than its mark here: "AWS
// Bedrock" is the longest. Measured on the rendered page, because the exporter
// has no font metrics.
const ITEM_W = 92;

// The strip's own box, asked of the builder rather than worked out again
// here: a scene recomputing it is a second copy of the formula, and the two
// drifted by six units before logoStripSize() existed.
const STRIP = {
  marks: LLMS, caption: 'LLMs', cols: COLS, markSize: MARK, size: TEXT,
  gapX: GAP_X, pad: PAD, plated: true, itemW: ITEM_W,
};
const { w: STRIP_W, h: STRIP_H, reach: STRIP_REACH } = logoStripSize(STRIP);

// Measured on the rendered page - the exporter has no font metrics. The PATH
// only: the source writes the whole URL, host and all, and at 516 units that
// is wider than the pair it describes and runs under the LLMs region beside
// it. The reference writes the host as `<daprPort>` anyway, so it carries no
// fact the path does not.
const URL_W = 344;

// THE CALL SITS UNDER THE ROW, not along it. Written along the app-to-sidecar
// line it is 516 units of URL between two shapes that have nothing else to say
// to each other, and the arrow has to grow to carry it: a run five times
// longer than its job, across a hole the reader crosses for no reason. Under
// the row the arrow is as short as the two shapes allow, and the call is still
// beside the pair it belongs to. Maintainer's call, 2026-11-02.

// The caption pill straddles the region's TOP edge, so the strip draws
// `reach` higher than its own box. Centring on the box alone put the pill one
// unit from the canvas edge.
const ROW_Y = Math.round(V_EDGE + STRIP_REACH + STRIP_H / 2);

const APP_AT = { x: EDGE + hexHalfWidth(APP_R), y: ROW_Y, r: APP_R, hex: true };
// The gap now carries only the line, so it is as short as two shapes that
// talk to each other can sit without touching.
const SIDE = {
  x: Math.round(APP_AT.x + hexHalfWidth(APP_R) + 86 + hexHalfWidth(SIDE_R)),
  y: ROW_Y,
  r: SIDE_R,
  hex: true,
};
const STRIP_X = SIDE.x + hexHalfWidth(SIDE_R) + 96 + STRIP_W / 2;

const W = Math.ceil(STRIP_X + STRIP_W / 2 + EDGE);
const H = Math.ceil(ROW_Y + STRIP_H / 2 + V_EDGE);

const NAME_Y = ROW_Y + SIDE_R * HEX_NAME_DY;
// The call is still a little wider than the pair it describes, so its LEFT
// edge lines up with the app's rather than its centre with the pair's: that
// keeps it under the pair, square to the drawing, and clear of the region to
// its right. Centred on the canvas it ran straight through that region.
const CALL_MID = EDGE + URL_W / 2;
// The call clears the sidecar's NAME, not the sidecar. At 3.4 the method sat
// half a unit under "Dapr sidecar" - the name is set at 17 and reaches about
// twelve below its own baseline, while the method reaches eight above its
// own, so the two boxes met although neither baseline looked close. Measured
// against the boxes, which is the only way this is ever right.
const CALL_Y = NAME_Y + TEXT * 5.2;

export default {
  width: W,
  height: H,
  title: 'An app calling a large language model through the Dapr conversation API',
  desc:
    'On the left, a green hexagon named App. An arrow runs from it to a hexagon carrying the Dapr logo, named Dapr sidecar, and the arrow is labelled POST over the path /v1.0-alpha2/conversation/<llm-name>/converse. A second arrow runs from the sidecar into a dashed area captioned LLMs, which holds the marks and names of the nine supported providers in two columns: Anthropic, AWS Bedrock, DeepSeek, GoogleAI, Huggingface, Mistral, Ollama, OpenAI and OpenRouter.',

  build() {
    return [
      // ---- the app POSTs a prompt to its sidecar --------------------------
      arrow({ from: APP_AT, to: SIDE }),
      arrow({ from: SIDE, to: APP_AT }),
      // The URL is emitted BEFORE the method, though it is drawn under it.
      // The theme check samples the first text in a scene that is not on a
      // plate or a solid fill, and a method is C.blue - a brand colour, the
      // same value in both themes by design - so leading with it makes the
      // check read a scene that re-themes perfectly as one that does not.
      // Nothing moves: the two do not overlap.
      richLabel({
        x: CALL_MID, y: CALL_Y, size: TEXT, anchor: 'middle', mono: true,
        parts: [
          { text: '/v1.0-alpha2/' },
          { text: 'conversation', color: C.orange, weight: 700 },
          { text: '/<llm-name>/converse' },
        ],
      }),
      label({
        x: CALL_MID, y: CALL_Y - TEXT * 1.9,
        text: 'POST', size: TEXT, weight: 700, color: C.blue,
      }),

      // ---- and the sidecar talks to whichever LLM its component names -----
      arrow({ from: SIDE, to: [STRIP_X - STRIP_W / 2 - 2, ROW_Y] }),

      hex({ x: APP_AT.x, y: APP_AT.y, r: APP_R, label: 'App', size: NAME, ...APP[0] }),
      group({
        class: 'd-named-mark',
        children: [
          markHex({ x: SIDE.x, y: SIDE.y, r: SIDE_R, mark: 'logo-blue', stroke: C.blue }),
          label({ x: SIDE.x, y: NAME_Y, text: 'Dapr sidecar', size: NAME }),
        ],
      }),
      logoStrip({ x: STRIP_X, y: ROW_Y, ...STRIP }),
    ];
  },
};
