// Diagrid: where it sits between an AI agent and what the agent uses.
//
// Replaces integrations/diagrid/catalyst-diagram.png on
// integrations/Diagrid/diagrid-platform.md.
//
// Fact-check, against the page this diagram sits on and the Diagrid canon
// (diagridio/docs scripts/website-sync/canon.md):
//
//   - the product is "Diagrid". The source image says "Diagrid Catalyst", a
//     retired name.
//   - the source's subtitle was "Agent Durability and Tamper-proof
//     Attestation". The canon forbids "tamper-proof": signed history is
//     tamper-evident. The band now names the three things the canon leads
//     with, in its order: durable, verifiable, secure.
//   - the frameworks are the four the page names, "CrewAI, LangGraph, OpenAI
//     Agents, and Pydantic AI". The source showed nine unlabelled logos, several
//     of which the page does not mention; the page's words beat the picture's.
//   - the agent CALLS Diagrid; the canon says Diagrid never runs application or
//     agent code. The agent therefore sits in its own region, outside Diagrid.
//
// Where this departs from the source image, and why:
//   - the green filled Diagrid box is a dashed navy region with a caption, the
//     same shape `agents-overview` uses for "Built on Dapr". A solid green is
//     the colour of an app in this set.
//   - LLMs, tools and MCP servers, and infrastructure and databases are
//     external systems, so each is a blue mark with its name under it rather
//     than a box: the house drawing for the edge of the picture.
//   - "Built on Dapr" is in the caption. The canon has Diagrid lead and say it
//     is built on Dapr.

import { C } from '../engine.mjs';
import { arrow, group, label, region, slots } from '../shapes.mjs';
import { brand, icon } from '../icons.mjs';

const W = 940;
const H = 425;

const TEXT = 13; // every name and band label
const CAPTION = 13;
const MARK = 42; // the standalone marks: the user and the three external systems
const GLYPH = 26; // the marks inside the Diagrid band
const EDGE = 17; // the least space between anything and a dashed border
const NAME_DY = MARK / 2 + 16; // a standalone mark's name, under it
const DESC_DY = NAME_DY + 17; // the blue line under that name

// ---- the two regions, stacked on one centre line ---------------------------
// Both captions sit at the default left inset, not centred: the agent's call
// to Diagrid runs down the shared centre line and would cross a centred pill.
const REG_X = 190;
const REG_W = 560;
const CX = REG_X + REG_W / 2;

const AGENT_Y = 24;
const AGENT_H = 86;
const DIAGRID_Y = AGENT_Y + AGENT_H + 60;
const DIAGRID_H = 104;
const CAPTION_H = 22;

// Contents centre between the caption pill's lower edge and the region's floor.
const centreUnderPill = (y, h) => (y + CAPTION_H / 2 + y + h) / 2;
const AGENT_CY = centreUnderPill(AGENT_Y, AGENT_H);
const DIAGRID_CY = centreUnderPill(DIAGRID_Y, DIAGRID_H);

// ---- the frameworks, each a mark and its name on one plate -----------------
// `text` is the name's measured width at TEXT, from preview-scene.mjs.
const PLATE_H = 40;
const PLATE_PAD = 12;
const FW_MARK = 22;
const FW_GAP = 8;
const FRAMEWORKS = [
  { name: 'crewai', inside: 'CrewAI', text: 45 },
  { name: 'langgraph', inside: 'LangGraph', text: 70 },
  { name: 'openai', inside: 'OpenAI Agents', text: 95 },
  { name: 'pydantic', inside: 'Pydantic AI', text: 72 },
];
const plateW = (f) => PLATE_PAD * 2 + FW_MARK + FW_GAP + f.text;

// Equal GAPS, not equal centres: the plates differ in width.
const ROW_W = REG_W - EDGE * 2;
const FW_SPAN = FRAMEWORKS.reduce((a, f) => a + plateW(f), 0);
const FW_GAP_X = (ROW_W - FW_SPAN) / (FRAMEWORKS.length - 1);
const plateX = FRAMEWORKS.map((f, i) => {
  const left = REG_X + EDGE + FRAMEWORKS.slice(0, i).reduce((a, g) => a + plateW(g) + FW_GAP_X, 0);
  return left + plateW(f) / 2;
});

// ---- what Diagrid gives the agent, in the canon's order --------------------
const PILLARS = [
  ['arrow-clockwise', 'Durable execution'],
  ['document-checkmark', 'Verifiable execution'],
  ['shield-lock', 'Identity and access'],
];

// ---- the user and the external systems -------------------------------------
const USER_X = 95;
const LLM_X = 850;
const BOTTOM_Y = DIAGRID_Y + DIAGRID_H + 60 + MARK / 2;
const TOOLS_X = CX - 125;
const DATA_X = CX + 125;

const agentBox = { x: CX, y: AGENT_Y + AGENT_H / 2, w: REG_W, h: AGENT_H };
const diagridBox = { x: CX, y: DIAGRID_Y + DIAGRID_H / 2, w: REG_W, h: DIAGRID_H };
const markBox = (x, y) => ({ x, y, w: MARK, h: MARK });

// Both directions on one line: draw the arrow once each way.
const twoWay = (a, b) => [arrow({ from: a, to: b }), arrow({ from: b, to: a })];

function external({ mark, x, y, name, desc }) {
  return group([
    icon({ name: `fluent-${mark}`, x, y, size: MARK, color: C.blue }),
    label({ x, y: y + NAME_DY, text: name, size: TEXT }),
    desc ? label({ x, y: y + DESC_DY, text: desc, size: TEXT, color: C.blue }) : null,
  ]);
}

export default {
  width: W,
  height: H,
  title: 'Diagrid between an AI agent and what it uses',
  desc:
    'A user on the left talks to an AI agent, drawn as a dashed region holding the agent frameworks CrewAI, LangGraph, OpenAI Agents and Pydantic AI. The agent calls Diagrid, drawn below it as a dashed region labelled "Diagrid, built on Dapr", which provides durable execution, verifiable execution, and identity and access. The agent runs outside Diagrid and calls it over its APIs. Diagrid connects the agent to LLMs from model providers on the right, and to tools and MCP servers, and infrastructure and databases, below.',

  build() {
    return [
      // ---- the agent and its frameworks ----------------------------------
      region({
        x: REG_X, y: AGENT_Y, w: REG_W, h: AGENT_H,
        caption: 'AI agent, on any framework', captionW: 196, captionH: CAPTION_H, captionSize: CAPTION,
      }),
      FRAMEWORKS.map((f, i) => {
        const w = plateW(f);
        const left = -w / 2 + PLATE_PAD;
        return brand({
          name: f.name, x: plateX[i], y: AGENT_CY, w: FW_MARK, h: FW_MARK,
          plate: w, plateH: PLATE_H, dx: left + FW_MARK / 2,
          inside: f.inside, insideDx: left + FW_MARK + FW_GAP, insideSize: TEXT,
        });
      }),

      // ---- the user -------------------------------------------------------
      icon({ name: 'fluent-person', x: USER_X, y: agentBox.y, size: MARK, color: C.navy }),
      label({ x: USER_X, y: agentBox.y + NAME_DY, text: 'User', size: TEXT }),
      twoWay(markBox(USER_X, agentBox.y), agentBox),

      // ---- Diagrid --------------------------------------------------------
      region({
        x: REG_X, y: DIAGRID_Y, w: REG_W, h: DIAGRID_H, stroke: C.navy,
        caption: 'Diagrid, built on Dapr', captionW: 156, captionH: CAPTION_H, captionSize: CAPTION,
      }),
      slots(REG_X + EDGE, REG_X + REG_W - EDGE, PILLARS.length).map((x, i) => {
        const [mark, name] = PILLARS[i];
        return group([
          icon({ name: `fluent-${mark}`, x, y: DIAGRID_CY - 12, size: GLYPH, color: C.navy }),
          label({ x, y: DIAGRID_CY + 22, text: name, size: TEXT }),
        ]);
      }),
      twoWay(agentBox, diagridBox),

      // ---- what Diagrid connects the agent to -----------------------------
      external({ mark: 'sparkle', x: LLM_X, y: diagridBox.y, name: 'LLMs', desc: 'Model providers' }),
      twoWay(diagridBox, markBox(LLM_X, diagridBox.y)),

      external({ mark: 'wrench', x: TOOLS_X, y: BOTTOM_Y, name: 'Tools and MCP servers' }),
      twoWay([TOOLS_X, DIAGRID_Y + DIAGRID_H], markBox(TOOLS_X, BOTTOM_Y)),

      external({ mark: 'database', x: DATA_X, y: BOTTOM_Y, name: 'Infrastructure and databases' }),
      twoWay([DATA_X, DIAGRID_Y + DIAGRID_H], markBox(DATA_X, BOTTOM_Y)),
    ];
  },
};
