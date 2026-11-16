// AGENTS ARE NOT WIRED TO EACH OTHER. Everything between them is Dapr, and
// that is the whole claim: nothing in this picture joins one agent to another.
//
// Replaces dapr-agents/home_concepts_principles_decoupled.png on
// developing-ai/dapr-agents/dapr-agents-why.md, under "Decoupled
// Infrastructure Design".
//
// Fact-check, against the two bullets it sits under:
//
//   - "Agent Simplicity: Agents focus purely on reasoning and task execution,
//     while Pub/Sub messaging, routing, and validation are managed externally
//     by modular infrastructure components." Hence an agent with nothing in it
//     and a band between the agents with everything in it.
//   - "Scalable and Adaptable Systems: By offloading non-agent-specific
//     responsibilities, Dapr Agents allows agents to scale independently."
//     Hence the three cross-cutting concerns drawn as peers of the APIs rather
//     than as a footnote: they are the non-agent-specific responsibilities.
//
// THREE APIs, NOT SIXTEEN, AND THE PAGE CHOSE WHICH THREE. The source draws
// the whole catalogue, and this cannot: 16 tiles need about a thousand units
// on their own, and with an agent each side the canvas reaches 1,400, where a
// tile's name renders at under 7 CSS px. That is the same arithmetic that
// ruled out a faithful agent-pattern composite, and it has the same answer -
// show what the sentence needs and let the catalogue live where it is already
// drawn (`overview` and `building-blocks`, both from this same apis.mjs list,
// so none of the three can drift from the others).
//
// Which three is NOT a judgement call made here. The section above this one
// says Dapr "provides API building blocks, such as Pub/Sub messaging, state
// management, service invocation, and more" - the page picks its own three
// examples and says there are more, so the picture draws those three and says
// the same thing underneath.
//
// Every tile comes from apis.mjs, which is the catalogue every other diagram
// in these docs draws from. The names and marks here cannot disagree with the
// overview's, because they are not written here at all.

import { APIS, CROSS_CUTTING, apiTile } from '../apis.mjs';
import { APP } from '../engine.mjs';
import { arrow, hexHalfWidth, label, region } from '../shapes.mjs';
import { appSidecar, pairExtent } from '../app.mjs';
import { C } from '../engine.mjs';

const TEXT = 13;
const EDGE = 29;

// ---- an agent and the sidecar it runs with -------------------------------
// app.mjs's pair, which is what every app with a sidecar in this set is drawn
// as - and the only form the shape-clearance check will accept two overlapping
// hexagons in. See the same note on `agents-message-driven`.
const AGENT_R = 42;
const EXT = pairExtent({ r: AGENT_R });
const HEX_HALF = hexHalfWidth(AGENT_R);

const agent = ({ x, y, name, app }) => appSidecar({
  x, y, r: AGENT_R, label: name, ...app,
});

// ---- what sits between them ----------------------------------------------
const SHOWN = ['pubsub', 'state', 'service-invocation'];
const MORE = APIS.length - SHOWN.length;

const TILE_W = 150;
const TILE_H = 116;
const TILE_GAP = 20;
const PITCH_X = TILE_W + TILE_GAP;
const PITCH_Y = TILE_H + TILE_GAP;

const PAD = 26;
const BAND_W = SHOWN.length * PITCH_X - TILE_GAP;
const NOTE_GAP = 22;

const AGENT_IN_X = EDGE - EXT.left;
const BAND_X = AGENT_IN_X + EXT.right + 40;
const BAND_W_FULL = BAND_W + PAD * 2;

const AGENT_X = BAND_X + BAND_W_FULL + 40 + HEX_HALF;

const W = Math.ceil(AGENT_X + EXT.right + EDGE);

// ---- down ----------------------------------------------------------------
const BAND_Y = EDGE + 27;
const ROW_0 = BAND_Y + PAD + TILE_H / 2;
const ROW_1 = ROW_0 + PITCH_Y;
const NOTE_Y = ROW_1 + TILE_H / 2 + NOTE_GAP;
const BAND_H = NOTE_Y + TEXT + PAD - BAND_Y;

const MID_Y = BAND_Y + BAND_H / 2;
// Far enough apart that the upper agent's sidecar, which hangs below its
// hexagon, stays clear of the lower agent's.
const BRANCH_DY = 96;

const H = Math.ceil(Math.max(BAND_Y + BAND_H, MID_Y + BRANCH_DY + EXT.bottom) + EDGE);

export default {
  width: W,
  height: H,
  title: 'Agents separated from the infrastructure between them',
  desc:
    'A green hexagon named Agent, carrying a Dapr sidecar badge, leads into a '
    + 'dashed band named Dapr. The band holds three Dapr building block APIs - '
    + 'publish and subscribe, state management and service invocation - above '
    + 'three filled tiles for observability, security and resiliency, with a '
    + 'line saying the rest of the building block APIs are not drawn. Two '
    + 'further agents, a blue one and a gold one, lead out of the band. '
    + 'Nothing joins any agent directly to another.',

  build() {
    const bandRight = BAND_X + BAND_W_FULL;
    const tileX = (i) => BAND_X + PAD + TILE_W / 2 + i * PITCH_X;

    return [
      // ---- the band, drawn first so it sits behind the runs ---------------
      region({
        x: BAND_X,
        y: BAND_Y,
        w: BAND_W_FULL,
        h: BAND_H,
        stroke: C.blue,
        caption: 'Dapr',
        captionW: 62,
        captionX: BAND_X + BAND_W_FULL / 2,
        captionH: 22,
        captionSize: TEXT,
      }),

      // ---- in, and out to the other two -----------------------------------
      arrow({ from: [AGENT_IN_X + HEX_HALF + 4, MID_Y], to: [BAND_X - 2, MID_Y] }),
      [-BRANCH_DY, BRANCH_DY].map((dy) => arrow({
        from: [bandRight, MID_Y + dy],
        to: [AGENT_X - HEX_HALF - 2, MID_Y + dy],
      })),

      // ---- what Dapr handles so the agents do not ------------------------
      SHOWN.map((key, i) => apiTile({
        key, wrap: true, x: tileX(i), y: ROW_0, w: TILE_W, h: TILE_H,
      })),
      CROSS_CUTTING.map((a, i) => apiTile({
        key: a.key,
        x: tileX(i),
        y: ROW_1,
        w: TILE_W,
        h: TILE_H,
        // Peers of the APIs above them, not a secondary note, so the same
        // size - which is what `overview` does with the same three.
        filled: true,
      })),
      label({
        x: BAND_X + BAND_W_FULL / 2,
        y: NOTE_Y,
        text: `and ${MORE} more building block APIs`,
        size: TEXT,
      }),

      // ---- the agents, which know about none of it ------------------------
      agent({ x: AGENT_IN_X, y: MID_Y, name: 'Agent', app: APP[0] }),
      agent({ x: AGENT_X, y: MID_Y - BRANCH_DY, name: 'Agent', app: APP[1] }),
      agent({ x: AGENT_X, y: MID_Y + BRANCH_DY, name: 'Agent', app: APP[2] }),
    ];
  },
};
