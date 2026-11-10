// WHAT AN AGENT IS: a loop around a model. The model reasons and plans, that
// becomes an action, the action runs as a tool call, and what the tool returns
// goes back to the model - until the model has an answer for the user.
//
// Replaces dapr-agents/concepts-agents.png on
// developing-ai/dapr-agents/dapr-agents-core-concepts.md, under "Agents".
//
// NOT THE SAME PICTURE AS `agents-overview`, though both draw a user, an
// agent and the outside world. That one is the framework's CAPABILITIES -
// planning, memory, tools, MCP, delegation - laid out as a set. This one is
// the LOOP those capabilities run inside. The page carries both, in different
// sections, and each says something the other does not.
//
// Fact-check, against the paragraph this sits under and the Tool Calling
// section further down the same page:
//
//   - "Agents are autonomous units powered by Large Language Models (LLMs),
//     designed to execute tasks, reason through problems, and collaborate
//     within workflows ... agents combine reasoning with tool integration,
//     memory, and collaboration features." Reasoning and tool integration are
//     what this draws; memory and collaboration have their own sections and
//     their own pictures, and crowding them in here would make the loop say
//     something it does not.
//   - planning is the framework's own word: "the underlying workflow is
//     created dynamically by the LLM's planning decisions" (this page), and
//     "fully autonomous agents capable of dynamic planning and execution".
//   - the return edge is what the Tool Calling section describes as step 4 -
//     the agent "executes the tool with the provided arguments, and sends the
//     results back as a tool message".
//
// WHERE THIS DEPARTS FROM THE SOURCE IMAGE, and why:
//
//   - THE RETURN EDGE IS NOT CALLED "OBSERVATION". The source uses the ReAct
//     vocabulary, and "observation" appears nowhere in developing-ai - not on
//     this page, not on any other. The thing that travels back has a name in
//     these docs and it is the tool result, so that is what the edge is
//     called. Same arrow, the docs' word.
//   - the source groups Reasoning and Planning with a hand-drawn curly brace
//     and a "+" sign. A brace is not in this set's vocabulary and a "+" between
//     two boxes reads as arithmetic. They are bracketed instead, which is what
//     the brace was for: one thing goes in from the model, one thing comes out
//     towards the action.
//   - the LLM is a TEAL step carrying the brain mark, which is what a model
//     call is on dapr-agents-patterns.md. The source draws it as a loose
//     orange glyph with no box. A reader who has seen the pattern pictures
//     already knows this shape; there is no reason for the same thing to be
//     drawn two ways two pages apart.
//
// Tools and the outside world are drawn exactly as `agents-overview` draws
// them - a blue card with the wrench mark, and a globe - because they are the
// same two things, and the two pictures sit three sections apart.

import { C } from '../engine.mjs';
import {
  arrow, box, elbowArrow, group, label, panel, region,
} from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { card } from '../cards.mjs';

const TEXT = 13; // the house body size, for every word on a run
const EDGE = 29;
const MARK = 42; // the user and the globe, at the weight agents-overview uses

// ---- across ------------------------------------------------------------------
const USER_X = EDGE + MARK / 2;

const LLM_X = 250;
const LLM_W = 104;

// The bracket around what the model does before it acts.
const PAIR_X = 452;
const PAIR_W = 196;
const CHIP_W = 164;
const CHIP_H = 34;
const CHIP_GAP = 12;
const PAIR_PAD = 15;
const PAIR_H = CHIP_H * 2 + CHIP_GAP + PAIR_PAD * 2;

const ACT_X = 632;
const ACT_W = 120;
const ACT_H = 46;

const TOOLS_X = ACT_X; // directly under the action it carries out
const TOOLS_W = 104;

const REG_X0 = LLM_X - LLM_W / 2 - 34;
const REG_X1 = ACT_X + ACT_W / 2 + 34;

const GLOBE_X = REG_X1 + 52 + MARK / 2;

const W = Math.ceil(GLOBE_X + MARK / 2 + EDGE);

// ---- down --------------------------------------------------------------------
const REG_TOP = 58;
// The answer runs back over the top of the model, inside the agent, and leaves
// through its left border on the way to the user - as the source draws it.
const RESP_Y = REG_TOP + 38;
const ROW_THINK = 168;
const ROW_ACT = 318;
const REG_BOT = ROW_ACT + TOOLS_W / 2 + 30;

// How far a word rides off the run it names.
const WORD_DY = 11;

const H = Math.ceil(Math.max(REG_BOT, ROW_ACT + MARK / 2 + 24) + EDGE);

export default {
  width: W,
  height: H,
  title: 'What an agent is: a loop around a model',
  desc:
    'A user on the left sends a prompt into a dashed boundary labelled AI '
    + 'Agent. Inside it, a teal box named LLM carrying a brain mark leads to a '
    + 'bracketed pair of boxes named Reasoning and Planning, and on to a box '
    + 'named Action. The action runs down into a blue card named Tools, which '
    + 'exchanges with a globe named Outside world beyond the boundary. What '
    + 'the tool returns runs back along the bottom into the LLM, labelled Tool '
    + 'result, and the LLM sends a response back out to the user.',

  build() {
    const llmLeft = LLM_X - LLM_W / 2;
    const llmRight = LLM_X + LLM_W / 2;
    const llmBottom = ROW_THINK + LLM_W / 2;
    const llmTop = ROW_THINK - LLM_W / 2;
    const pairLeft = PAIR_X - PAIR_W / 2;
    const pairRight = PAIR_X + PAIR_W / 2;
    const toolsLeft = TOOLS_X - TOOLS_W / 2;
    const toolsRight = TOOLS_X + TOOLS_W / 2;
    const toolsTop = ROW_ACT - TOOLS_W / 2;

    return [
      // ---- the agent's boundary, drawn first so it sits behind the loop ----
      region({
        x: REG_X0,
        y: REG_TOP,
        w: REG_X1 - REG_X0,
        h: REG_BOT - REG_TOP,
        stroke: C.navy,
        caption: 'AI Agent',
        captionW: 96,
        captionX: REG_X0 + 96 / 2 + 24,
        captionH: 22,
        captionSize: TEXT,
      }),

      // ---- the user asks ---------------------------------------------------
      icon({ name: 'fluent-person', x: USER_X, y: ROW_THINK, size: MARK, color: C.navy }),
      label({ x: USER_X, y: ROW_THINK + MARK / 2 + 16, text: 'User', size: TEXT }),

      arrow({ from: [USER_X + MARK / 2 + 4, ROW_THINK], to: [llmLeft - 2, ROW_THINK] }),
      label({
        x: (USER_X + MARK / 2 + llmLeft) / 2,
        y: ROW_THINK - WORD_DY - TEXT * 0.4,
        text: 'Prompt',
        size: TEXT,
      }),

      // ---- and the model answers ------------------------------------------
      elbowArrow({
        points: [
          [LLM_X, llmTop],
          [LLM_X, RESP_Y],
          [USER_X, RESP_Y],
          [USER_X, ROW_THINK - MARK / 2 - 4],
        ],
      }),
      // Left of the agent's border, not across it: the word names the run on
      // its way OUT, and a word sitting on the boundary it crosses reads as a
      // label for the boundary.
      label({
        x: (USER_X + REG_X0) / 2,
        y: RESP_Y - WORD_DY - TEXT * 0.4,
        text: 'Response',
        size: TEXT,
      }),

      // ---- what the model does before it acts ------------------------------
      arrow({ from: [llmRight, ROW_THINK], to: [pairLeft - 2, ROW_THINK] }),
      arrow({ from: [pairRight, ROW_THINK], to: [ACT_X - ACT_W / 2 - 2, ROW_THINK] }),

      // ---- the action runs as a tool call ----------------------------------
      arrow({ from: [ACT_X, ROW_THINK + ACT_H / 2], to: [TOOLS_X, toolsTop - 2] }),

      // ---- which reaches out of the agent ----------------------------------
      elbowArrow({
        points: [[toolsRight + 2, ROW_ACT], [GLOBE_X - MARK / 2 - 4, ROW_ACT]],
        heads: 'both',
      }),

      // ---- and what it returns goes back to the model -----------------------
      elbowArrow({
        points: [
          [toolsLeft, ROW_ACT],
          [LLM_X, ROW_ACT],
          [LLM_X, llmBottom + 2],
        ],
      }),
      label({
        x: (LLM_X + toolsLeft) / 2,
        y: ROW_ACT - WORD_DY - TEXT * 0.4,
        text: 'Tool result',
        size: TEXT,
      }),

      // ---- the shapes, over the runs that reach them ------------------------
      card({
        x: LLM_X, y: ROW_THINK, w: LLM_W, h: LLM_W,
        mark: 'fluent-brain-circuit', name: 'LLM', color: C.teal,
      }),

      group([
        panel({
          x: pairLeft, y: ROW_THINK - PAIR_H / 2, w: PAIR_W, h: PAIR_H, stroke: C.caption,
        }),
        box({
          x: PAIR_X,
          y: ROW_THINK - (CHIP_H + CHIP_GAP) / 2,
          w: CHIP_W,
          h: CHIP_H,
          label: 'Reasoning',
          size: TEXT,
        }),
        box({
          x: PAIR_X,
          y: ROW_THINK + (CHIP_H + CHIP_GAP) / 2,
          w: CHIP_W,
          h: CHIP_H,
          label: 'Planning',
          size: TEXT,
        }),
      ]),

      box({
        x: ACT_X, y: ROW_THINK, w: ACT_W, h: ACT_H, label: 'Action', size: TEXT,
      }),

      card({
        x: TOOLS_X, y: ROW_ACT, w: TOOLS_W, h: TOOLS_W, mark: 'fluent-wrench', name: 'Tools',
      }),

      icon({ name: 'fluent-globe', x: GLOBE_X, y: ROW_ACT, size: MARK, color: C.navy }),
      label({ x: GLOBE_X, y: ROW_ACT + MARK / 2 + 16, text: 'Outside world', size: TEXT }),
    ];
  },
};
