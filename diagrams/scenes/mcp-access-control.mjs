// HOW TWO GATES IN THE SIDECAR GUARD AN MCP SERVER: the App-ID gate decides
// whether a caller may reach the server at all, and the OPA gate decides
// which tool it may reach.
//
// Replaces the `flowchart LR` on
// developing-ai/mcp/mcp-access-control.md, under "How OPA gates per-tool MCP
// traffic".
//
// THERE IS NO ARRANGEMENT TO MATCH. The positions in a rendered Mermaid
// block are its layout engine's output, not a decision. What the source
// gives is the graph, and two things in it ARE decisions somebody made and
// are kept: the declaration is `flowchart LR`, so the flow runs across; and
// the two gates are inside a `subgraph`, so they sit in a lane together.
//
// Fact-check, against the two numbered points directly below the block:
//   1. "accessControl rejects unauthenticated or disallowed App IDs BEFORE
//      any middleware runs" - which is why the App-ID gate comes first and
//      why its refusal leaves before the OPA gate is reached at all.
//   2. "OPA inspects the JSON-RPC body of the allowed request and applies
//      tool-level rules" - the second gate, on the allow path only.
// And from the paragraph above: "App-ID gating is coarse - it controls
// whether an agent may reach an MCP server at all, but every tool on that
// server is equally reachable", which is what the two gate names say.
// Nothing here disagrees with the prose.
//
// HOW THE SOURCE'S NODES MAP TO THIS SET:
//   - `AGENT(...)` and `SERVER(...)` are applications, so they are app
//     hexagons. Mermaid drew them as stadiums because that is the glyph it
//     has for "not a decision".
//   - `subgraph DAPR[Dapr sidecar ...]` is a lane. The sidecar is not drawn
//     as the Dapr hexagon here because it CONTAINS the two gates, and a
//     hexagon holds nothing.
//   - `ACL{...}` and `OPA{...}` are gates, and the source marks both
//     `:::decision` with an orange stroke, so the diamond is the author's
//     call and not Mermaid's default. They are gold diamonds.
//   - Each gate's name rides ABOVE its diamond. Mermaid will set two lines
//     inside a diamond; a diamond is widest only on its centre line, so a
//     second line overflows a shape that still passes every geometric
//     check. `workflow-stateful-client` does the same.
//   - THE TWO 403 RUNS ARE RED, and dashed as the source draws them. Red is
//     this set's blocked path - `api-scoping` spends it on a denied call -
//     and a refusal is exactly that.
//
// THE REQUEST IS AN HTTP CARD, not two lines of type on the arrow. The
// source labels that edge POST /method/mcp with a dapr-caller-app-id header,
// which is a request with a verb, a path and a header - exactly what
// httpCard() draws, and what the secrets, state and configuration overviews
// already draw a call to the Dapr API with. Set as a word on a line it was
// the one place in the scene where code was typeset as prose. The card
// carries the header NAME only, as the source does: the page names
// `analyst-agent` as the caller, but the gate is keyed by whatever App ID
// arrives, and a value would make the picture say more than the source.
//
// BOTH REFUSALS SHARE ONE LANE AND ONE ARRIVAL POINT - the hexagon's lower
// vertex. The shared stretch is DRAWN ONCE, by the OPA gate's run, and the
// App-ID gate's refusal stops on it in a T: see RET_GAP in diagrams/mcp.mjs
// for why one way home, and why two dashed lines laid along it came out
// looking solid. Each 403 is written on its own DESCENT, below the lane, so
// a word still belongs to one gate where the runs home coincide.

import { APP } from '../engine.mjs';
import { FLOW } from '../flow.mjs';
import {
  APP_R, ASK_DY, ASK_H, EDGE, GATE_H, GATE_W, NAME, RET_GAP, RET_TOUCH,
  TEXT, V_EDGE, ask as mcpAsk, refusal, sidecarLane, word,
} from '../mcp.mjs';
import {
  arrow, decision, decisionPoints, hex, hexHalfWidth, httpCard, httpCardH,
} from '../shapes.mjs';

// The measurements both MCP pictures agree on live in diagrams/mcp.mjs; what
// is left here is this scene's own arrangement.
//
// The card is sized from its longest line, the header name - eighteen
// characters of the page's code font at TEXT - plus the padding httpCard()
// keeps either side of it. Its DEPTH is not typed: a card shorter than its
// contents is refused rather than drawn overflowing, and httpCardH() is the
// number to size it from.
const REQUEST = 'dapr-caller-app-id';
const CARD_W = 210;
const CARD_H = Math.ceil(httpCardH({ size: TEXT, request: REQUEST }));

// Either side of the card, and after the lane. The card is a shape standing
// in the row rather than a word lying on the run, so it gets a shape's air.
const CARD_GAP = 44;
const GATE_GAP = 124;
const OUT_GAP = 150;

// ---- across ------------------------------------------------------------------
const AGENT_X = EDGE + hexHalfWidth(APP_R);
const CARD_X = AGENT_X + hexHalfWidth(APP_R) + CARD_GAP + CARD_W / 2;
const LANE_X0 = CARD_X + CARD_W / 2 + CARD_GAP;
const ACL_X = LANE_X0 + FLOW.PAD + GATE_W / 2;
const OPA_X = ACL_X + GATE_W + GATE_GAP;
const LANE_X1 = OPA_X + GATE_W / 2 + FLOW.PAD;
const SERVER_X = LANE_X1 + OUT_GAP + hexHalfWidth(APP_R);

// ---- down --------------------------------------------------------------------
const LANE_Y0 = V_EDGE;
const ROW_Y = LANE_Y0 + FLOW.PAD + ASK_H + ASK_DY + GATE_H / 2;
const LANE_Y1 = ROW_Y + GATE_H / 2 + FLOW.PAD;

// The one lane both refusals go home along, below everything the row holds -
// and the card is the deepest thing in it.
const CARD_BOTTOM = ROW_Y + CARD_H / 2;
const RET_Y = Math.max(LANE_Y1, ROW_Y + APP_R, CARD_BOTTOM) + RET_GAP;

// Each 403 rides on its own gate's descent, in the air between the lane's
// lower border and the run home. Written on the bus instead, the two words
// would sit at one height on one line - the single ambiguity a shared lane
// would otherwise introduce.
const WORD_Y = (LANE_Y1 + RET_Y) / 2;
const WORD_DX = 10;

const W = Math.ceil(SERVER_X + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(RET_Y + V_EDGE);

const ask = (x, text) => mcpAsk({ x, y: ROW_Y, text });

export default {
  width: W,
  height: H,
  title: 'How App-ID gating and OPA middleware guard an MCP server',
  desc:
    'On the left, an app hexagon named Agent / MCP client. It sends an HTTP '
    + 'card reading POST /method/mcp with a dapr-caller-app-id header into a '
    + 'lane named Dapr sidecar, MCP server side, which holds two gold gates: '
    + 'the accessControl App-ID gate and, after it, the OPA middleware '
    + 'tool-level gate. An allow from the first reaches the second, and an '
    + 'allow from the second reaches the app hexagon named MCP server on the '
    + 'right. Either gate can refuse instead, and each refusal returns a 403 '
    + 'to the lower point of the agent hexagon along a red dashed run beneath '
    + 'the flow. The App-ID gate runs before any middleware, so a disallowed '
    + 'caller never reaches the OPA gate at all.',

  build() {
    const acl = decisionPoints({ x: ACL_X, y: ROW_Y, w: GATE_W, h: GATE_H });
    const opa = decisionPoints({ x: OPA_X, y: ROW_Y, w: GATE_W, h: GATE_H });
    // Home, for both of them: the hexagon's lower vertex, which on a
    // pointy-top hexagon is at r straight below its centre.
    const HOME = [AGENT_X, ROW_Y + APP_R + RET_TOUCH];
    return [
      // ---- the lane the two gates share ------------------------------------
      sidecarLane({
        x: LANE_X0,
        y: LANE_Y0,
        w: LANE_X1 - LANE_X0,
        h: LANE_Y1 - LANE_Y0,
        caption: 'Dapr sidecar - MCP server side',
        captionW: 224,
      }),

      // ---- in, through, and out --------------------------------------------
      arrow({
        from: [AGENT_X + hexHalfWidth(APP_R), ROW_Y],
        to: [CARD_X - CARD_W / 2 - 2, ROW_Y],
      }),
      arrow({
        from: [CARD_X + CARD_W / 2 + 2, ROW_Y],
        to: [acl.left[0] - 2, ROW_Y],
      }),
      ask(ACL_X, 'accessControl\nApp-ID gate'),

      arrow({ from: acl.right, to: [opa.left[0] - 2, ROW_Y] }),
      word({ x: (acl.right[0] + opa.left[0]) / 2, y: ROW_Y - 11, text: 'allow' }),
      ask(OPA_X, 'OPA middleware\ntool-level gate'),

      arrow({
        from: opa.right,
        to: [SERVER_X - hexHalfWidth(APP_R) - 2, ROW_Y],
      }),
      word({
        x: (opa.right[0] + SERVER_X - hexHalfWidth(APP_R)) / 2,
        y: ROW_Y - 11,
        text: 'allow',
      }),

      // ---- and the two refusals, one lane, one way home ---------------------
      // The OPA gate is the further from home, so its refusal carries the
      // whole run and the App-ID gate's stops on it. See RET_GAP.
      refusal({ points: [opa.bottom, [OPA_X, RET_Y], [HOME[0], RET_Y], HOME] }),
      word({
        x: OPA_X + WORD_DX, y: WORD_Y, text: '403', anchor: 'start',
      }),
      refusal({ points: [acl.bottom, [ACL_X, RET_Y]], heads: 'none' }),
      word({
        x: ACL_X + WORD_DX, y: WORD_Y, text: '403', anchor: 'start',
      }),

      // ---- the shapes, over the lines that reach them -----------------------
      hex({
        x: AGENT_X, y: ROW_Y, r: APP_R, label: 'Agent /\nMCP client', size: NAME, ...APP[0],
      }),
      httpCard({
        x: CARD_X,
        y: ROW_Y,
        w: CARD_W,
        h: CARD_H,
        method: 'POST',
        url: '/method/mcp',
        request: REQUEST,
        size: TEXT,
      }),
      decision({ x: ACL_X, y: ROW_Y, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      decision({ x: OPA_X, y: ROW_Y, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      hex({
        x: SERVER_X, y: ROW_Y, r: APP_R, label: 'MCP server', size: NAME, ...APP[1],
      }),
    ];
  },
};
