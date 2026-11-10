// WHAT ACTUALLY TRAVELS during a tool call: four messages between the app and
// the model, and what each one carries.
//
// Replaces dapr-agents/concepts_agents_toolcall_flow.png on
// developing-ai/dapr-agents/dapr-agents-core-concepts.md, under "Tool Calling".
//
// `agents-loop` on the same page draws this loop as a shape; this draws it as
// MESSAGES. That is the whole reason the page carries both, and the reason
// this one is mostly made of payloads rather than boxes: the numbered list
// under it describes a conversation, and a reader who wants to know what
// `tool_call_id` is for has to see one.
//
// FIVE STEPS, WHERE THE SOURCE IMAGE DRAWS FOUR. The prose beneath it is
// numbered 1 to 5:
//
//   1. the user submits a query specifying a task and the available tools
//   2. the LLM analyzes the query and selects the right tool for the task
//   3. the LLM provides a structured JSON output containing the tool's unique
//      ID, name, and arguments
//   4. the AI agent parses the JSON, executes the tool with the provided
//      arguments, and sends the results back as a tool message
//   5. the LLM summarizes the tool's execution results within the user's
//      context to deliver a comprehensive final response
//
// The source's badge 2 covers prose steps 2 AND 3 at once, because both happen
// in one model turn. Prose wins, so there are five badges here, and the
// difference between 2 and 3 is drawn rather than glossed: STEP 2 SITS BESIDE
// THE MODEL AND NOT ON A RUN, because choosing a tool is not a message - it is
// what happens before one. Step 3 is the message that choice becomes.
//
// EACH PARTY IS DRAWN ONCE PER TURN, as a card tall enough to span the two
// rows it takes part in. The source draws the model twice over as a loose
// glyph and connects everything with diagonals; a card spanning its own turn
// says the same thing and lets every run be a straight horizontal line. There
// is not one elbow in this picture, which is the point - a conversation that
// alternates is easiest to read when nothing else moves.
//
// The payloads are the source's own, down to call_12345 and the two tools, so
// a reader comparing the two sees the same conversation.

import { C } from '../engine.mjs';
import {
  arrow, codeCard, label, stepMark,
} from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { card } from '../cards.mjs';

const TEXT = 13; // every free word: the card titles and the user's name
const CODE = 12; // the payloads, which are set in the mono face
const EDGE = 29;
const MARK = 44; // the user glyph, at the weight the other agent pictures use

// ---- across ------------------------------------------------------------------
// Three columns: who is talking on the left, what they said in the middle, and
// the model on the right.
const LEFT_X = 84;
const PARTY_W = 92;

const MSG_X = 440;
const MSG_W = 460;
const MSG_L = MSG_X - MSG_W / 2;
const MSG_R = MSG_X + MSG_W / 2;

const RIGHT_X = 800;

const W = Math.ceil(RIGHT_X + PARTY_W / 2 + EDGE);

// A badge rides on the run it numbers, clear of the arrowhead at the far end -
// a head is drawn 26 units back from its tip, so the near half of the run is
// the only part of it a badge may sit on. See `HEAD_RUN` in shapes.mjs.
const BADGE_L = 152;
const BADGE_R = 725;

// ---- down --------------------------------------------------------------------
// One row per message.
const R1 = 92;
const R2 = 202;
const R3 = 318;
const R4 = 414;

const MSG_H = [58, 86, 72, 44];

// A party's card spans the rows it takes part in, so both of its runs are
// straight.
const LLM1_Y = (R1 + R2) / 2;
const LLM2_Y = (R3 + R4) / 2;
const AGENT_Y = (R2 + R3) / 2;
const TURN_H = 120;
const AGENT_H = 140;

const USER_NAME_DY = MARK / 2 + 16;

const H = Math.ceil(Math.max(R4 + MSG_H[3] / 2, R4 + USER_NAME_DY + 6) + EDGE);

// The payloads. NO COLUMN ALIGNMENT INSIDE A LINE: indentCode() turns a run
// of LEADING spaces into non-breaking ones, which is what keeps a nested key
// indented, but a run in the MIDDLE of a line is still collapsed to one space
// by the renderer. Padding `name:` out to line up with `content:` therefore
// does nothing but look wrong in the source.
const MESSAGES = [
  {
    y: R1,
    h: MSG_H[0],
    title: 'Chat completion payload',
    code: 'user: What is the weather in Virginia?\ntools: jump, get_weather',
  },
  {
    y: R2,
    h: MSG_H[1],
    title: 'Assistant message',
    code: 'tool_calls:\n  id: call_12345\n  name: get_weather\n  args: {"location": "virginia"}',
  },
  {
    y: R3,
    h: MSG_H[2],
    title: 'Tool message',
    code: 'tool_call_id: call_12345\nname: get_weather\ncontent: {"virginia": "80F"}',
  },
  {
    y: R4,
    h: MSG_H[3],
    title: 'Assistant message',
    code: 'The weather in virginia is 80 F.',
  },
];

export default {
  width: W,
  height: H,
  title: 'What travels during a tool call',
  desc:
    'Four messages pass between the app on the left and the model on the '
    + 'right, each drawn as a payload in the middle. First the user sends a '
    + 'chat completion payload carrying the question and the available tools. '
    + 'The model, marked as step two, chooses a tool, and returns an assistant '
    + 'message holding a tool call with an id, a name and arguments. The AI '
    + 'agent runs the tool and sends back a tool message carrying the same id '
    + 'and the result. The model then returns a final assistant message, which '
    + 'reaches the user.',

  build() {
    const partyR = LEFT_X + PARTY_W / 2;
    const llmL = RIGHT_X - PARTY_W / 2;

    return [
      // ---- the messages, and the runs that carry them ----------------------
      MESSAGES.map(({ y, h, title, code }) => codeCard({
        x: MSG_X, y, w: MSG_W, h, title, code, size: CODE, titleSize: TEXT,
      })),

      // 1. the user asks, naming the tools the model may use
      arrow({ from: [LEFT_X + MARK / 2 + 4, R1], to: [MSG_L - 2, R1] }),
      arrow({ from: [MSG_R, R1], to: [llmL - 2, R1] }),

      // 3. and the model answers with a tool call
      arrow({ from: [llmL, R2], to: [MSG_R + 2, R2] }),
      arrow({ from: [MSG_L, R2], to: [partyR + 2, R2] }),

      // 4. the agent runs it and reports back
      arrow({ from: [partyR, R3], to: [MSG_L - 2, R3] }),
      arrow({ from: [MSG_R, R3], to: [llmL - 2, R3] }),

      // 5. and the model writes the answer the user reads
      arrow({ from: [llmL, R4], to: [MSG_R + 2, R4] }),
      arrow({ from: [MSG_L, R4], to: [LEFT_X + MARK / 2 + 4, R4] }),

      // ---- who is talking --------------------------------------------------
      icon({ name: 'fluent-person', x: LEFT_X, y: R1, size: MARK, color: C.navy }),
      label({ x: LEFT_X, y: R1 + USER_NAME_DY, text: 'User', size: TEXT }),

      card({
        x: LEFT_X, y: AGENT_Y, w: PARTY_W, h: AGENT_H, mark: 'fluent-bot', name: 'AI Agent',
      }),

      icon({ name: 'fluent-person', x: LEFT_X, y: R4, size: MARK, color: C.navy }),
      label({ x: LEFT_X, y: R4 + USER_NAME_DY, text: 'User', size: TEXT }),

      card({
        x: RIGHT_X, y: LLM1_Y, w: PARTY_W, h: TURN_H, mark: 'fluent-brain-circuit', name: 'LLM', color: C.teal,
      }),
      card({
        x: RIGHT_X, y: LLM2_Y, w: PARTY_W, h: TURN_H, mark: 'fluent-brain-circuit', name: 'LLM', color: C.teal,
      }),

      // ---- the five steps the prose numbers --------------------------------
      stepMark({ x: BADGE_L, y: R1, step: 1 }),
      // Beside the model, on no run at all: choosing a tool is not a message.
      stepMark({ x: BADGE_R, y: LLM1_Y, step: 2 }),
      stepMark({ x: BADGE_R, y: R2, step: 3 }),
      stepMark({ x: BADGE_L, y: R3, step: 4 }),
      stepMark({ x: BADGE_R, y: R4, step: 5 }),
    ];
  },
};
