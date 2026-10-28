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
import { arrow, group, label, panel, pill, slots, tile } from '../shapes.mjs';
import { icon } from '../icons.mjs';

const W = 1040;
const H = 660;

const TEXT = 15; // one size for every card name and band name
const EDGE = 24; // the least space between anything and a dashed border

// icon() fits a mark's 24-unit viewBox by scaling it size/24, so two marks
// drawn at the same size carry the same ink weight and two drawn at different
// sizes do not. The scene therefore has exactly two: MARK for the three large
// standalone marks, and GLYPH for the ones inside a card or the band.
const MARK = 60;
const GLYPH = 30;

// ---- the user, the agent, and the bus between the agent and its capabilities
const USER_X = 85;

const AGENT_X = 330;
const AGENT_SIZE = 160;
const BUS_X = 520;

// ---- the capabilities, one column -----------------------------------------
const CARD_X = 710;
const CARD_W = 280;
const CARD_H = 72;
const CARD_TOP = 70;
const CARD_PITCH = 96;
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
const GLOBE_X = 945;

// ---- what the framework is built on ---------------------------------------
const BAND_X = 170; // starts right of the user: the user is not part of Dapr
const BAND_R = 870; // stops left of the outside world, which is not either
const BAND_Y = 530;
const BAND_H = 90;

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
        panel({ x: BAND_X, y: BAND_Y, w: BAND_R - BAND_X, h: BAND_H, stroke: C.navy }),
        pill({ x: (BAND_X + BAND_R) / 2, y: BAND_Y, w: 150, h: 28, text: 'Built on Dapr', size: TEXT }),
        slots(BAND_X + EDGE, BAND_R - EDGE, FOUNDATIONS.length).map((cx, i) => {
          const [mark, name] = FOUNDATIONS[i];
          return group([
            icon({ name: `fluent-${mark}`, x: cx, y: BAND_Y + 32, size: GLYPH, color: C.navy }),
            label({ x: cx, y: BAND_Y + 66, text: name, size: TEXT }),
          ]);
        }),
      ]),

      // ---- the user -------------------------------------------------------
      // The Fluent person glyph rather than the hand-drawn person() shape: its
      // ink scales with its size, as the robot's and the globe's do, so all
      // three carry the same weight. person() draws at the shared 2.2 outline,
      // which is visibly lighter beside a glyph this size.
      icon({ name: 'fluent-person', x: USER_X, y: AGENT_Y, size: MARK, color: C.navy }),
      label({ x: USER_X, y: AGENT_Y + MARK / 2 + 20, text: 'User', size: TEXT }),

      // ---- Dapr Agents ----------------------------------------------------
      tile({
        x: AGENT_X,
        y: AGENT_Y,
        w: AGENT_SIZE,
        h: AGENT_SIZE,
        color: C.blue,
        icon: (cx, cy) => icon({ name: 'fluent-bot', x: cx, y: cy, size: MARK, color: C.blue }),
        label: 'Dapr Agents',
        labelSize: 17,
        glyphSize: MARK,
        glyphGap: 16,
      }),

      // The user asks and the agent answers, so one line with a head at each
      // end rather than two lines side by side.
      ...(() => {
        const u = { x: USER_X, y: AGENT_Y, w: MARK, h: MARK };
        const a = { x: AGENT_X, y: AGENT_Y, w: AGENT_SIZE, h: AGENT_SIZE };
        return [arrow({ from: u, to: a }), arrow({ from: a, to: u })];
      })(),
      label({
        x: (USER_X + AGENT_X - AGENT_SIZE / 2) / 2 + 13,
        y: AGENT_Y - 24,
        text: 'Interaction',
        size: TEXT,
      }),

      // ---- the capabilities, off one bus ----------------------------------
      el('polyline', {
        points: `${BUS_X} ${cardY(0)} ${BUS_X} ${cardY(CAPABILITIES.length - 1)}`,
        fill: 'none',
        stroke: C.navy,
        'stroke-width': 2,
      }),
      arrow({
        from: { x: AGENT_X, y: AGENT_Y, w: AGENT_SIZE, h: AGENT_SIZE },
        to: [BUS_X, AGENT_Y],
      }),

      CAPABILITIES.map(([mark, name], i) => {
        const y = cardY(i);
        return group([
          arrow({ from: [BUS_X, y], to: { x: CARD_X, y, w: CARD_W, h: CARD_H } }),
          tile({
            x: CARD_X,
            y,
            w: CARD_W,
            h: CARD_H,
            color: C.blue,
            inline: true,
            inlinePad: 34,
            inlineGap: 30,
            icon: (cx, cy) => icon({ name: `fluent-${mark}`, x: cx, y: cy, size: GLYPH, color: C.blue }),
            label: name,
            labelSize: TEXT,
          }),
        ]);
      }),

      // ---- the outside world ----------------------------------------------
      arrow({
        from: { x: CARD_X, y: cardY(TOOLS_ROW), w: CARD_W, h: CARD_H },
        to: { x: GLOBE_X, y: cardY(TOOLS_ROW), w: MARK, h: MARK },
      }),
      icon({ name: 'fluent-globe', x: GLOBE_X, y: cardY(TOOLS_ROW), size: MARK, color: C.navy }),
      label({ x: GLOBE_X, y: cardY(TOOLS_ROW) + MARK / 2 + 20, text: 'Outside world', size: TEXT }),
    ];
  },
};
