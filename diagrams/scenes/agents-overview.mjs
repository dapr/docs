// Dapr Agents: what a user gets from the framework, and what it is built on.
//
// Replaces dapr-agents/concepts-agents-overview.png on overview.md, under
// "Dapr Agents".
//
// Fact-check, against the paragraph this diagram sits above and the
// Dapr Agents concept pages:
//
//   - the page says the framework "provides agent-centric capabilities such as
//     tool calling, memory management, MCP support and agent orchestration,
//     while leveraging Dapr for durability, observability, and security".
//     Every card here is one of those, or has its own section in
//     dapr-agents-core-concepts.md: Tool Calling, MCP Support, Memory, and
//     Agents as Tools, which is where "a parent agent delegates sub-tasks to
//     specialized child agents" comes from.
//   - planning is the framework's own word for what the LLM does: the
//     DurableAgent's "underlying workflow is created dynamically by the LLM's
//     planning decisions", and the introduction describes "fully autonomous
//     agents capable of dynamic planning and execution".
//
// Where this departs from the source image, and why:
//   - the source's ENVIRONMENT box, and the "Observation" edge to it, are not
//     Dapr Agents terminology. "Environment" appears in these docs only as an
//     environment variable or a Kubernetes environment; the box is generic
//     agent-loop vocabulary that the framework does not claim. MCP support
//     takes its place, which the sentence under the image names and which has
//     its own section in the concepts page.
//   - the five capabilities are a COLUMN off one bus rather than five lobes on
//     diagonal arrows. The radial version spends the middle of the canvas on
//     white space and gives every arrow a different angle; a bus keeps the
//     horizontal runs short and makes the five read as one set.
//   - the user's arrow carries a head at each end. The source draws the user
//     talking to the agent and nothing coming back, but the tool-call flow in
//     the concepts page ends with the agent delivering "a comprehensive final
//     response", so the conversation runs both ways.
//   - the band along the bottom is new. It is the half of the paragraph the
//     source image leaves out, and it is the half that makes this Dapr Agents
//     rather than any other agent framework.

import { C, el } from '../engine.mjs';
import { arrow, group, label, region, roundedPath, slots } from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { card } from '../cards.mjs';

const W = 914;
const H = 457;

const TEXT = 10.5; // one size for every card name and band name
const EDGE = 17; // the least space between anything and a dashed border

// icon() fits a mark's 24-unit viewBox by scaling it size/24, so two marks
// drawn at the same size carry the same ink weight and two drawn at different
// sizes do not. The scene sets MARK for the three large standalone marks and
// GLYPH for the ones in the band; the marks inside CARDS are not set here at
// all - card() derives those from the card, so they cannot drift from the
// blocks on the other diagrams.
const MARK = 42;
const GLYPH = 21;

// ---- the user, the agent, and the bus between the agent and its capabilities
const USER_X = 177;

const AGENT_X = 348;
const AGENT_SIZE = 112;
const BUS_X = 482;
const BUS_R = 10; // the radius the bus turns into its outer two arrows

// ---- the capabilities, one column -----------------------------------------
const CARD_X = 583;
const CARD_W = 133;
// 55, not 76 * 0.7: an inline card derives its name from its height, and at
// 53 that falls under MIN_LABEL and cards.mjs refuses it.
const CARD_H = 55;
const CARD_TOP = 50;
const CARD_PITCH = 67;
const cardY = (i) => CARD_TOP + i * CARD_PITCH;

// Tools is deliberately the middle row: it is the one capability that reaches
// out of the diagram, so its row carries the agent's arrow in and the outside
// world's arrow out, and all three sit on one straight line.
const CAPABILITIES = [
  ['text-bullet-list-square', 'Planning'],
  ['brain-circuit', 'Memory'],
  ['wrench', 'Tools'],
  ['plug-connected', 'MCP support'],
  ['people-team', 'Delegate tasks'],
];
const TOOLS_ROW = 2;

// The agent sits level with the middle card, so the arrow into the bus is
// horizontal and the bus is the same length above it as below.
const AGENT_Y = cardY(TOOLS_ROW);

// ---- the outside world ----------------------------------------------------
// In its own column, clear of the cards, so its name has room underneath.
const GLOBE_X = 716;

// ---- what the framework is built on ---------------------------------------
const BAND_X = 237; // starts right of the user: the user is not part of Dapr
const BAND_R = 670; // stops left of the outside world, which is not either
const BAND_Y = 372;
const BAND_H = 70;

const FOUNDATIONS = [
  ['arrow-clockwise', 'Durable execution'],
  ['heart-pulse', 'Observability'],
  ['shield-lock', 'Security'],
];

export default {
  width: W,
  height: H,
  title: 'Dapr Agents and what it is built on',
  desc:
    'A user on the left talks to Dapr Agents, drawn as a square with a robot mark, and Dapr Agents answers. From it, one line runs to a column of five capabilities: planning, memory, tools, MCP support, and delegating tasks to other agents. Tools reaches on to the outside world, drawn as a globe on the right. Along the bottom, a dashed band labelled "Built on Dapr" holds the three things the framework gets from Dapr: durable execution, observability and security.',

  build() {
    return [
      // ---- what Dapr Agents is built on ----------------------------------
      // Drawn first so the band sits behind everything, as a ground does.
      group([
        region({
          x: BAND_X, y: BAND_Y, w: BAND_R - BAND_X, h: BAND_H, stroke: C.navy,
          caption: 'Built on Dapr', captionW: 150, captionX: (BAND_X + BAND_R) / 2, captionH: 20, captionSize: TEXT,
        }),
        slots(BAND_X + EDGE, BAND_R - EDGE, FOUNDATIONS.length).map((cx, i) => {
          const [mark, name] = FOUNDATIONS[i];
          return group([
            icon({ name: `fluent-${mark}`, x: cx, y: BAND_Y + 28, size: GLYPH, color: C.navy }),
            label({ x: cx, y: BAND_Y + 50, text: name, size: TEXT }),
          ]);
        }),
      ]),

      // ---- the user -------------------------------------------------------
      // The Fluent person glyph, not a drawn shape: its ink scales with its
      // size, as the robot's and the globe's do, so all three carry the same
      // weight. A builder that draws its own outline holds the shared 2.2
      // whatever its size, which is visibly lighter beside a glyph this big.
      icon({ name: 'fluent-person', x: USER_X, y: AGENT_Y, size: MARK, color: C.navy }),
      label({ x: USER_X, y: AGENT_Y + MARK / 2 + 14, text: 'User', size: TEXT }),

      // ---- Dapr Agents ----------------------------------------------------
      card({ x: AGENT_X, y: AGENT_Y, w: AGENT_SIZE, h: AGENT_SIZE, mark: 'fluent-bot', name: 'Dapr Agents' }),

      // The user asks and the agent answers, so one line with a head at each
      // end rather than two lines side by side.
      ...(() => {
        const u = { x: USER_X, y: AGENT_Y, w: MARK, h: MARK };
        const a = { x: AGENT_X, y: AGENT_Y, w: AGENT_SIZE, h: AGENT_SIZE };
        return [arrow({ from: u, to: a }), arrow({ from: a, to: u })];
      })(),
      label({
        x: (USER_X + AGENT_X - AGENT_SIZE / 2) / 2 + 9,
        y: AGENT_Y - 17,
        text: 'Interaction',
        size: TEXT,
      }),

      // ---- the capabilities, off one bus ----------------------------------
      roundedPath({
        points: [
          [BUS_X + BUS_R, cardY(0)],
          [BUS_X, cardY(0)],
          [BUS_X, cardY(CAPABILITIES.length - 1)],
          [BUS_X + BUS_R, cardY(CAPABILITIES.length - 1)],
        ],
        r: BUS_R,
      }),
      arrow({
        from: { x: AGENT_X, y: AGENT_Y, w: AGENT_SIZE, h: AGENT_SIZE },
        to: [BUS_X, AGENT_Y],
      }),

      CAPABILITIES.map(([mark, name], i) => {
        const y = cardY(i);
        return group([
          arrow({
            from: [i === 0 || i === CAPABILITIES.length - 1 ? BUS_X + BUS_R : BUS_X, y],
            to: { x: CARD_X, y, w: CARD_W, h: CARD_H },
          }),
          card({
            x: CARD_X,
            y,
            w: CARD_W,
            h: CARD_H,
            mark: `fluent-${mark}`,
            name,
            inline: true,
            inlinePad: 24,
            inlineGap: 21,
          }),
        ]);
      }),

      // ---- the outside world ----------------------------------------------
      arrow({
        from: { x: CARD_X, y: cardY(TOOLS_ROW), w: CARD_W, h: CARD_H },
        to: { x: GLOBE_X, y: cardY(TOOLS_ROW), w: MARK, h: MARK },
      }),
      icon({ name: 'fluent-globe', x: GLOBE_X, y: cardY(TOOLS_ROW), size: MARK, color: C.navy }),
      label({ x: GLOBE_X, y: cardY(TOOLS_ROW) + MARK / 2 + 14, text: 'Outside world', size: TEXT }),
    ];
  },
};
