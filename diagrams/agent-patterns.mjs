// WHAT THE AGENT-PATTERN PICTURES AGREE ABOUT.
//
// dapr-agents-patterns.md draws eight patterns one after another, and they are
// one family: a green In on the left, an orange Out on the right, and between
// them some arrangement of LLM calls, the code around them, and the things
// outside the process they reach for. Seven of the eight share every
// measurement here, and the eighth - the composite that opens the page -
// is the same eight pictures again at a smaller size.
//
// Phase 1 claimed the agent-pattern kit and the workflow-pattern kit are the
// SAME VOCABULARY - circles for start and end, rounded boxes for steps, a gold
// diamond for a gate, elbow arrows - and phase 2 built that vocabulary as
// flow.mjs. This module is where the claim is tested, and it holds: every
// shape below is a flow-kit shape. What is added is one distinction the
// workflow patterns never had to make.
//
// THE ONE ADDITION: WHICH STEPS ARE LLM CALLS. The source images carry it in
// the FILL - an LLM call is white, the code around it is blue - which says
// only that the two are different. The brain mark says which is which, so the
// mark carries the distinction here and both kinds of step keep the flow kit's
// teal. A reader who has seen one workflow diagram in these docs already knows
// what a teal box is; they would have to be told what a white one is.
//
// WHERE THE MARK SITS. Beside the name, as the source draws it, and the two
// together are ONE BLOCK centred in the box. The first draft pinned the mark
// to the box's right edge instead and centred the name in what was left,
// which needs no measurement - and looks like what it is: a box with its
// label pushed off centre and something stuck in the corner. Reviewed and
// changed. The cost is that centring a block needs the name's WIDTH, which
// the exporter has no font metrics to know, so NAME_W below is measured by
// hand on the rendered page like every other width in this set that matters.
// A name missing from it throws rather than guessing.
//
// THE RESOURCE LINKS ARE SOLID, AND CARRY A HEAD AT EACH END. The source dots
// them. In this set a dashed line says the thing it draws is NOT traffic - a
// leader from a callout to what it names, or in red a call that was refused -
// and Query/Results, Call/Response and Read/Write are traffic, in both
// directions. The two heads say the exchange goes both ways, which is what the
// dotting was there to suggest; the dash would say the opposite.
//
// THE ROUTES OUT OF A ROUTER ARE ALL DRAWN THE SAME. The source draws the
// first route solid and the other two dashed, which reads as though route one
// were the real one and the rest hypothetical. Nothing in the prose makes one
// route special: "classifying inputs and directing them to specialized
// follow-up tasks" is three equal destinations and the router picks one. The
// picture says that with a note, not by demoting two of the three.

import { C, el } from './engine.mjs';
import { FLOW } from './flow.mjs';
import { icon } from './icons.mjs';
import {
  box, decision, elbowArrow, node,
} from './shapes.mjs';

// The type every name in these pictures is set in: the flow kit's own size,
// because a step, a terminal and a gate sit on one line and a difference
// between them reads as a mistake.
export const PT = FLOW.SIZE;

// The least space between anything and the canvas edge, and the extra a
// picture needs at the top when something up there carries a caption pill.
export const EDGE = 29;
export const V_EDGE = 26;

// A step. WIDER and DEEPER than the flow kit's own box: these names run to
// two lines ("LLM Call / Generator") where a workflow activity's do not, and
// every box has to leave room for the mark on its right as well.
export const STEP_W = 176;
export const STEP_H = 52;

// A terminal, straight from the flow kit.
export const NODE_R = FLOW.NODE_R;

// Between steps across and down.
export const GAP_X = 70;
export const GAP_Y = 30;

// The mark, and the room it keeps beside the name.
export const MARK = 'fluent-brain-circuit';
export const WORKFLOW_MARK = 'fluent-flowchart';
export const MARK_SIZE = 24;
export const MARK_GAP = 10;

// HOW WIDE EACH NAME IS, measured on the rendered page at PT.
//
// The name and the mark are ONE BLOCK, centred in the box together - the mark
// reads as part of the name that way, which is how the source images set it,
// and a box whose contents are centred does not look like a box whose label
// has slipped. Centring a block needs the name's width, and the exporter has
// no font metrics, so every width in this set that matters is measured by
// hand on the page and written down. This is that list.
//
// A name not in it throws rather than defaulting: a missing width would not
// break anything a test can see, it would just hang the mark in the wrong
// place, and the first draft of this module avoided the whole question by
// pinning the mark to the box's right edge instead.
const NAME_W = Object.freeze({
  LLM: 26.6,
  'LLM 1': 35.4,
  'LLM 2': 38.6,
  'LLM 3': 38.6,
  Router: 41.8,
  Orchestrator: 79.8,
  Synthesizer: 74.8,
  Workflow: 60.4,
  // Two lines; the width is the wider of them.
  'LLM Call\nGenerator': 63.3,
  'LLM Call\nEvaluator': 59.5,
});

export const nameWidth = (name) => {
  const w = NAME_W[name];
  if (w === undefined) {
    throw new Error(
      `agent-patterns: no measured width for "${name}". Draw it, read its box `
      + 'off preview-scene.mjs, and add it to NAME_W - the mark beside it '
      + 'cannot be placed without one.',
    );
  }
  return w;
};

// THE TWO PICTURES THAT SHOW WHAT A CALL REACHES FOR - the augmented LLM and
// the durable agent - are the same picture, one with a workflow loop in the
// middle of it and one without. These are the measurements they hold in
// common, so the row of outside things lands at the same width and the same
// depth on both and the pair reads as one idea twice.
//
// An outside box carries one short word, so it is narrower than a step.
export const RES_W = 150;
export const RES_PITCH = RES_W + GAP_X;
// Down from whatever the runs leave to the height they turn at, and down
// again from there into the row.
export const RAIL_DROP = 48;
export const RES_DROP = 48;
// Where those runs leave the shape above them, either side of its centre.
export const LEG_DX = 50;

// How far a word on a run rides above it, and how far above a shape a word
// rides when the run it names ENDS there - clear of the arrowhead rather than
// clear of the shape. See the rendered check of the same name.
export const WORD_DY = 11;
export const HEAD_DY = 24;

/**
 * A step whose name and mark are one block, centred in the box together: the
 * name first, then MARK_GAP, then the mark.
 */
const marked = ({
  x, y, name, mark, w = STEP_W, h = STEP_H, size = PT,
}) => {
  const nameW = nameWidth(name);
  // The block runs nameW + MARK_GAP + MARK_SIZE across and is centred on x,
  // so the name sits in its first stretch and the mark in its last.
  const shift = (MARK_GAP + MARK_SIZE) / 2;
  return el('g', {}, [
    box({
      x, y, w, h, label: name, size, labelDx: -shift, ...FLOW.step,
    }),
    icon({
      name: mark,
      x: x + (nameW + MARK_GAP) / 2,
      y,
      size: MARK_SIZE,
      color: C.teal,
    }),
  ]);
};

/**
 * A step that is an LLM call: the flow kit's step, with the brain mark badged
 * on its right and the name centred in the room that leaves.
 */
export const llm = (opts) => marked({ ...opts, mark: MARK });

/**
 * A step that is a workflow driving the calls around it, which is what the
 * durable agent has in the middle of it and what nothing else here has. Same
 * badge, a different mark: a reader tells one from the other by what the mark
 * is, which is the whole argument for marking them at all.
 */
export const workflowStep = (opts) => marked({ ...opts, mark: WORKFLOW_MARK });

/**
 * A step that is NOT an LLM call - code you wrote, running between the model's
 * answers. Same shape and same colour as an LLM call, without the mark, which
 * is the whole of the difference.
 */
export const step = ({
  x, y, name, w = STEP_W, h = STEP_H, size = PT,
}) => box({
  x, y, w, h, label: name, size, ...FLOW.step,
});

/**
 * Something the process reaches for that is not part of it: a retrieval
 * index, a tool, a memory store, the world outside the loop. Blue, which is
 * what this set gives a component outside the thing being described.
 */
export const outside = ({
  x, y, name, w = STEP_W, h = STEP_H, size = PT,
}) => box({
  x, y, w, h, label: name, size, stroke: C.blue, fill: C.blueFill,
});

/** A gate. Gold, like every gate in the set, and the source's own shape. */
export const gate = ({
  x, y, w, h, name, size = PT,
}) => decision({
  x, y, w, h, label: name, size, ...FLOW.wait,
});

/** Where the flow comes in, and where it leaves. */
export const inNode = ({ x, y, name = 'In' }) => node({
  x, y, r: NODE_R, label: name, ...FLOW.start,
});
export const outNode = ({ x, y, name = 'Out' }) => node({
  x, y, r: NODE_R, label: name, ...FLOW.end,
});

/**
 * An exchange with something outside the process: a head at each end, because
 * it goes both ways. Solid - see the module header for why the source's
 * dotting is not kept.
 */
export const exchange = ({ points, heads = 'both' }) => elbowArrow({ points, heads });
