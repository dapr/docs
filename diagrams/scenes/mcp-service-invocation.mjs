// HOW AN MCP CALL TRAVELS THROUGH DAPR SERVICE INVOCATION: the caller's App
// ID, the policies attached to the target's App ID, and the middleware on
// its inbound pipeline, all before the MCP server sees the request.
//
// Replaces the `flowchart LR` on
// developing-ai/mcp/mcp-service-invocation.md, under "How it works".
//
// THERE IS NO ARRANGEMENT TO MATCH - the positions in a rendered Mermaid
// block are its layout engine's output. What IS a decision and is kept: the
// declaration is `flowchart LR`, so the call runs across; and the four
// middle nodes are inside a `subgraph Dapr`, so they share a lane.
//
// Fact-check, against the paragraph the block sits under:
//   "The MCP client directs requests to its local sidecar and sets the
//    `dapr-app-id` header (or uses the full service-invocation URL). Dapr
//    resolves the target by App ID, applies the policies attached to the MCP
//    server's App ID, and forwards the request."
// - which is the order the picture draws: the caller's App ID, then the
// access policy, then the bearer middleware, then the target's App ID, then
// the server. And from the list below the block, "Apply HTTP middleware on
// the inbound pipeline, such as OAuth 2.0 bearer validation" is why the
// bearer gate is second rather than first.
//
// Both refusals go home to the CALLER'S App ID, not to the agent. That is
// the source's own wiring (`POLICY -. deny .-> CID` and
// `BEARER -. 401 .-> CID`) and it is right: the call was made through the
// sidecar, so what is refused is the invocation, and the agent learns of it
// as the response to the call it already made.
//
// THE TWO REFUSALS SHARE ONE LANE AND ONE ARRIVAL POINT, and the head stops
// RET_TOUCH short of the App ID pill's lower edge so it plainly arrives at
// the pill rather than floating under it. The shared stretch is DRAWN ONCE,
// by the bearer gate's run, and the policy gate's refusal stops on it in a
// T: see RET_GAP in diagrams/mcp.mjs for why one way home, and why two
// dashed lines laid along it came out looking solid. Each word rides on its
// OWN gate's descent, which is what keeps `deny` and `401` attached to the
// gate that issued them where the runs home coincide.
//
// HOW THE SOURCE'S NODES MAP TO THIS SET:
//   - `CLIENT(...)` and `SERVER(...)` are applications: app hexagons.
//   - `CID(...)` and `SID(...)` are App IDs - identities, not processes - so
//     they are pills. A hexagon would make an App ID look like a second app
//     standing beside the one that owns it.
//   - `POLICY{...}` and `BEARER{...}` are gates, marked `:::decision` in the
//     source, so the diamond is the author's call. Their names ride ABOVE
//     them; see diagrams/mcp.mjs.
//   - The deny and 401 edges are dotted in the source and red here, which is
//     this set's blocked path.
//
// Every measurement this shares with `mcp-access-control` comes from
// diagrams/mcp.mjs. The two pictures sit a page apart and are the same
// picture told twice.

import { APP } from '../engine.mjs';
import { FLOW } from '../flow.mjs';
import {
  APP_R, ASK_H, ASK_DY, EDGE, GATE_H, GATE_W, NAME, RET_GAP, RET_TOUCH,
  TEXT, V_EDGE, WORD_DY, ask as mcpAsk, refusal, sidecarLane, word,
} from '../mcp.mjs';
import {
  arrow, decision, decisionPoints, hex, hexHalfWidth, pill,
} from '../shapes.mjs';

// An App ID pill. Measured: "mcp-server App ID" is the longer of the two.
const ID_W = 158;
const ID_H = 34;

// A run LEAVING a pill starts clear of it. Starting exactly on the edge puts
// the path's first sample on the boundary, and the rendered check that no
// line crosses a pill reads that as a crossing.
const EDGE_CLEAR = 3;

// Between the things in the lane, and either side of it. The in-gap carries
// nothing but the call itself, so it is the shortest.
const IN_GAP = 120;
const LANE_GAP = 96;
const OUT_GAP = 120;

// ---- across ------------------------------------------------------------------
const CLIENT_X = EDGE + hexHalfWidth(APP_R);
const LANE_X0 = CLIENT_X + hexHalfWidth(APP_R) + IN_GAP;
const CID_X = LANE_X0 + FLOW.PAD + ID_W / 2;
const POLICY_X = CID_X + ID_W / 2 + LANE_GAP + GATE_W / 2;
const BEARER_X = POLICY_X + GATE_W + LANE_GAP;
const SID_X = BEARER_X + GATE_W / 2 + LANE_GAP + ID_W / 2;
const LANE_X1 = SID_X + ID_W / 2 + FLOW.PAD;
const SERVER_X = LANE_X1 + OUT_GAP + hexHalfWidth(APP_R);

// ---- down --------------------------------------------------------------------
const LANE_Y0 = V_EDGE;
const ROW_Y = LANE_Y0 + FLOW.PAD + ASK_H + ASK_DY + GATE_H / 2;
const LANE_Y1 = ROW_Y + GATE_H / 2 + FLOW.PAD;

const RET_Y = Math.max(LANE_Y1, ROW_Y + APP_R) + RET_GAP;

// Each refusal's word rides on its own gate's descent, in the air between
// the lane's lower border and the run home.
const WORD_Y = (LANE_Y1 + RET_Y) / 2;
const WORD_DX = 10;

const W = Math.ceil(SERVER_X + hexHalfWidth(APP_R) + EDGE);
const H = Math.ceil(RET_Y + V_EDGE);

const ask = (x, text) => mcpAsk({ x, y: ROW_Y, text });

export default {
  width: W,
  height: H,
  title: 'How an MCP call travels through Dapr service invocation',
  desc:
    'On the left, an app hexagon named Agent / MCP client. Its call enters a '
    + 'lane named Dapr, which holds, in order, a pill for the mcp-client App '
    + 'ID, a gold gate for the access policy, a gold gate for the bearer '
    + 'middleware, and a pill for the mcp-server App ID. An allow from the '
    + 'policy reaches the bearer gate; a valid JWT reaches the target App ID, '
    + 'which forwards to the app hexagon named MCP server on the right. '
    + 'Either gate can refuse instead: a deny from the policy and a 401 from '
    + 'the bearer middleware each return along a red dashed run beneath the '
    + 'flow to the lower edge of the caller’s App ID pill.',

  build() {
    const policy = decisionPoints({ x: POLICY_X, y: ROW_Y, w: GATE_W, h: GATE_H });
    const bearer = decisionPoints({ x: BEARER_X, y: ROW_Y, w: GATE_W, h: GATE_H });
    // Home, for both of them: the caller's App ID pill, touched on its lower
    // edge rather than stopped short of.
    const HOME = [CID_X, ROW_Y + ID_H / 2 + RET_TOUCH];
    return [
      sidecarLane({
        x: LANE_X0,
        y: LANE_Y0,
        w: LANE_X1 - LANE_X0,
        h: LANE_Y1 - LANE_Y0,
        caption: 'Dapr',
        captionW: 64,
      }),

      // ---- in, through, and out --------------------------------------------
      arrow({
        from: [CLIENT_X + hexHalfWidth(APP_R), ROW_Y],
        to: [CID_X - ID_W / 2 - 2, ROW_Y],
      }),
      arrow({
        from: [CID_X + ID_W / 2 + EDGE_CLEAR, ROW_Y],
        to: [policy.left[0] - 2, ROW_Y],
      }),
      ask(POLICY_X, 'Access policy'),

      arrow({ from: policy.right, to: [bearer.left[0] - 2, ROW_Y] }),
      word({
        x: (policy.right[0] + bearer.left[0]) / 2,
        y: ROW_Y - WORD_DY,
        text: 'allow',
      }),
      ask(BEARER_X, 'Bearer middleware'),

      arrow({ from: bearer.right, to: [SID_X - ID_W / 2 - 2, ROW_Y] }),
      word({
        x: (bearer.right[0] + SID_X - ID_W / 2) / 2,
        y: ROW_Y - WORD_DY,
        text: 'valid JWT',
      }),
      arrow({
        from: [SID_X + ID_W / 2 + EDGE_CLEAR, ROW_Y],
        to: [SERVER_X - hexHalfWidth(APP_R) - 2, ROW_Y],
      }),

      // ---- and the two refusals, one lane, one way home ---------------------
      // The bearer gate is the further from home, so its refusal carries the
      // whole run and the policy gate's stops on it. See RET_GAP.
      refusal({ points: [bearer.bottom, [BEARER_X, RET_Y], [HOME[0], RET_Y], HOME] }),
      word({
        x: BEARER_X + WORD_DX, y: WORD_Y, text: '401', anchor: 'start',
      }),
      refusal({ points: [policy.bottom, [POLICY_X, RET_Y]], heads: 'none' }),
      word({
        x: POLICY_X + WORD_DX, y: WORD_Y, text: 'deny', anchor: 'start',
      }),

      // ---- the shapes, over the lines that reach them -----------------------
      hex({
        x: CLIENT_X, y: ROW_Y, r: APP_R, label: 'Agent /\nMCP client', size: NAME, ...APP[0],
      }),
      pill({
        x: CID_X, y: ROW_Y, w: ID_W, h: ID_H, text: 'mcp-client App ID', size: TEXT,
      }),
      decision({ x: POLICY_X, y: ROW_Y, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      decision({ x: BEARER_X, y: ROW_Y, w: GATE_W, h: GATE_H, ...FLOW.wait }),
      pill({
        x: SID_X, y: ROW_Y, w: ID_W, h: ID_H, text: 'mcp-server App ID', size: TEXT,
      }),
      hex({
        x: SERVER_X, y: ROW_Y, r: APP_R, label: 'MCP server', size: NAME, ...APP[1],
      }),
    ];
  },
};
