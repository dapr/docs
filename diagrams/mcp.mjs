// WHAT THE TWO MCP PICTURES AGREE ABOUT.
//
// developing-ai/mcp/ carries two diagrams within a page of each other, and
// they are the same picture told twice: an agent on the left, the Dapr
// sidecar as a lane in the middle holding the gates a call has to pass, the
// MCP server on the right, and a refusal that turns round and goes home
// along its own lane underneath. `mcp-access-control` draws two gates;
// `mcp-service-invocation` draws the same two with the App IDs either side
// of them.
//
// What is shared is every MEASUREMENT and the three builders that draw a
// repeated thing. The ARRANGEMENT is not: one scene has four things in its
// lane and the other has two, and a flag deciding that would make this a
// scene with two modes rather than a set of measurements two scenes agree
// on. Same split as actors-placement.mjs, pubsub-raw.mjs and
// invocation-row.mjs.
//
// Both sources are Mermaid, and both mark their gates `:::decision` with an
// orange stroke - so the diamond is the author's call rather than Mermaid's
// default, and it is kept.

import { C } from './engine.mjs';
import { flowLane, note } from './flow.mjs';
import { elbowArrow, label } from './shapes.mjs';

export const EDGE = 29;
// The lane's caption pill reaches captionReach() above its own border, so the
// canvas needs more headroom than a scene whose topmost ink is a shape.
export const V_EDGE = 26;

// 13, the size render-width.mjs is calibrated against.
export const TEXT = 13;
// What an app hexagon sets its name in.
export const NAME = 15;

// 66, not the 54 these were drawn at: measured on the page, "MCP server" at
// NAME came 4 units short of the half an em of clear space a name inside a
// shape has to keep, and "MCP client" came 1 short. The lever is the SHAPE,
// not the type - NAME is the house size for a hexagon name and the number
// every other app in the set wears. workflow-overview took the same lever
// for the same reason.
export const APP_R = 66;

// A gate. Wider than the flow kit's default because both scenes' gate names
// are two words long, and the name rides above the diamond rather than
// inside it - a diamond is widest only on its centre line, so a second line
// overflows a shape that still passes every geometric check.
export const GATE_W = 112;
export const GATE_H = 64;

// How far a gate's name rides above it, and how deep a two-line name is.
export const ASK_DY = 18;
export const ASK_H = TEXT * 1.2 * 2;

// How far a word on a run rides above the run it names.
export const WORD_DY = 11;

// The refusal lane: how far below everything else the run home sits. There
// is ONE lane however many refusals a scene draws, and every refusal climbs
// back into the SAME point on the shape it returns to.
//
// The first draft stacked them - a second lane 40 below the first, and two
// arrival points either side of the shape's centre - on the reasoning that
// two lines sharing a path draw over each other. They do, and that is the
// point. Both refusals say the same thing and end in the same place, so
// drawn apart they read as two journeys to two destinations; drawn together
// they read as one way out, which is what a refusal is. Nothing is lost,
// because each refusal still leaves its OWN gate and carries its own word.
//
// THE SHARED RUN IS DRAWN ONCE, AND THE NEARER GATE FEEDS INTO IT. Drawing
// both refusals end to end and letting them lie on top of each other is not
// the same picture twice over: these runs are DASHED, each path sets its
// dashes out from its own start, and two dashed lines at different phases
// fill in each other's gaps. The shared stretch came out SOLID, which in
// this set means traffic that happens rather than traffic that is refused -
// the one thing the dash is there to say. So the gate furthest from home
// carries the whole run, and the nearer gate's refusal stops on it in a T.
export const RET_GAP = 44;

// How far short of the shape a refusal's head stops. Near enough to touch -
// a stroke is 1.5 wide and this is 2 - so the head plainly arrives at the
// App ID pill, or at the hexagon's lower point, rather than floating under
// it. The same number arrow() leaves by default between a head and a shape.
export const RET_TOUCH = 2;

/**
 * A gate's name, riding above its diamond. The run that arrives at the gate
 * passes under the name, so it is haloed.
 */
export const ask = ({ x, y, text }) => note({
  x, y: y - GATE_H / 2 - ASK_DY, text, halo: true,
});

/**
 * A word on a run: what the run carries, or which way out of a gate this one
 * is. Haloed, because in both scenes some run crosses some word.
 */
export const word = ({ x, y, text, anchor = 'middle' }) => label({
  x, y, text, size: TEXT, weight: 500, color: C.caption, anchor, halo: true,
});

/**
 * A refusal: the run a denied call goes home along. RED and DASHED, which is
 * this set's blocked path - `api-scoping` spends the same red on a denied
 * call - and dashed because both sources draw these edges dotted while every
 * edge on the allow path is solid.
 *
 * `heads: 'none'` is the feeder into a run that is already drawn: the nearer
 * gate's refusal, which stops on the shared run rather than reaching home
 * itself. It takes no chevron because it does not arrive anywhere - the head
 * at the end of the run it joins is the one that says where this goes.
 */
export const refusal = ({ points, heads = 'end' }) => elbowArrow({
  points, color: C.red, dash: true, heads,
});

// The lane both scenes put the sidecar's gates in. Named here so neither
// scene reaches for region() directly and forgets the caption size, which is
// the omission flowLane() exists to make impossible.
export const sidecarLane = ({
  x, y, w, h, caption, captionW,
}) => flowLane({
  x, y, w, h, caption, captionW,
});
