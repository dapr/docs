// WHAT THE rag_ingest ORCHESTRATOR DOES: six activities that discover, batch,
// process and publish a version of an index, and the four systems outside it
// that the work actually lands in.
//
// Replaces the `flowchart TD` on developing-ai/rag/_index.md.
//
// Fact-check, against the prose around the block: the orchestrator is a Dapr
// Workflow, which is why its six steps are drawn with the flow kit and sit
// in a lane named for it; the activity names, the batch loop, the two edges
// out of update_status and every edge label are the source's own words.
//
// THE ORCHESTRATOR RUNS ACROSS, AND THE SOURCE SAYS `flowchart TD`.
// The declaration governs how LANES stack, and this diagram has one lane.
// Six activities stacked with four external systems hanging off the third
// gives a canvas taller than it is wide - about 610 by 650 - which fails the
// 16:9 floor and renders a 13-unit label well under the house size in a docs
// column. Across, the chain is one band and the systems it writes to sit
// beneath it, which is also the relation they have: the activities are the
// process, the stores are what it touches.
//
// HOW THE SOURCE'S NODES MAP TO THIS SET:
//   - The six `[...]` nodes inside the subgraph are workflow activities, so
//     they are flow-kit steps. This is a Dapr Workflow; the kit is the
//     vocabulary the workflow pages already use.
//   - `[( )]` is Mermaid's cylinder, and a cylinder here is a data store:
//     the document source, the embedder and the vector index.
//   - `Parser[Parser + splitter]` and `Reader[Query-time reader]` are plain
//     boxes in the source and are not workflow activities, so they are drawn
//     in the blue this set gives a component outside the thing described,
//     rather than in the activity's teal.
//   - `update_status` has two labelled edges out of it and is a BOX in the
//     source, not a `{}`. It stays a box: it is an activity that happens to
//     be followed by a branch, not a gate that asks a question.
//
// THE ROW BENEATH IS SET OUT FROM process_document, NOT FROM THE LANE.
// The parser is the one thing on that row the activity reaches DIRECTLY -
// everything else it touches is a store - so the parser sits squarely under
// process_document and the run between them is a straight drop with no
// elbow in it. The vector index is fixed too: it sits between the two steps
// that touch it. With both ends pinned, the gap between neighbours on the
// row is what is left over, shared out equally, and SYS_GAP is that number
// rather than one typed in. The first draft spaced the row from the left
// edge instead, which put the parser 44 units off its own activity and bent
// a run that had no reason to bend.
//
// THE FOUR SYSTEMS SIT IN ONE ROW, and process_document reaches the three
// stores from a single bar beneath the lane. The first draft gave each run
// its own path from whichever side of the box was nearest, which put a
// diagonal on the page and drew the write run straight through two activity
// boxes on its way out. One bar, one drop per system, and the run into the
// index arrives at its left edge rather than fighting the two that come down
// from above.
//
// THE LAST TWO STEPS SHARE AN ARRIVAL POINT on top of the index, as the two
// refusals do on the MCP pictures: validate_version and activate_version
// both act on the one index, so two heads landing a hand apart on its top
// edge drew a distinction that is not there. Each run still leaves its own
// step and carries its own word.

import { C } from '../engine.mjs';
import { FLOW, flowLane, note } from '../flow.mjs';
import {
  arrow, box, cylinder, elbowArrow,
} from '../shapes.mjs';

const EDGE = 29;
// The lane's caption pill reaches captionReach() above its own border.
const V_EDGE = 26;

const TEXT = 13;

const STEP_W = 170;
// Two lines deep, because process_document carries the longest name.
const STEP_H = 70;
const STEP_GAP = 44;

// A store. cylinder() takes a width and derives its height from it.
const STORE_W = 206;
const STORE_H = STORE_W / 1.2;
// A component that is neither a store nor an activity.
const PART_W = 190;
const PART_H = 66;

// How far a word on a run rides above the run it names.
const WORD_DY = 11;

// How far above a shape a word rides when the run it names ENDS there. An
// arrowhead is seven units of chevron drawn back from its tip, and a word
// set at WORD_DY sits straight on top of it - which is what the reviewer
// caught on the three runs into this row. The word clears the head rather
// than the shape.
const HEAD_DY = 24;

const STEPS = [
  'discover_and_manifest',
  'get_manifest_batch',
  'process_document x N\n(bounded batch)',
  'update_status',
  'validate_version',
  'activate_version',
];

// ---- the orchestrator band ---------------------------------------------------
const LANE_X0 = EDGE;
const stepX = (i) => LANE_X0 + FLOW.PAD + STEP_W / 2 + i * (STEP_W + STEP_GAP);
const LANE_X1 = stepX(STEPS.length - 1) + STEP_W / 2 + FLOW.PAD;

const LANE_Y0 = V_EDGE;
// The batch loop runs back ABOVE the row it returns to, inside the lane and
// below the lane's own caption pill.
const LOOP_Y = LANE_Y0 + FLOW.PAD;
const ROW_FLOW = LOOP_Y + 26 + STEP_H / 2;
const LANE_Y1 = ROW_FLOW + STEP_H / 2 + FLOW.PAD;

// ---- what the work lands in --------------------------------------------------
// The bar process_document fans out along, and the bar the last two steps use
// to reach the index. They are different heights so neither is drawn over the
// other where the two cross.
const FAN_Y = LANE_Y1 + 36;
const EF_Y = LANE_Y1 + 78;
const ROW_SYS = LANE_Y1 + 150 + STORE_H / 2;

// The parser sits under the activity that reaches it, and the index between
// the two steps that touch it. Everything else on the row is spaced from
// those two.
const PARSER_X = stepX(2);
const INDEX_X = (stepX(4) + stepX(5)) / 2;
const SYS_GAP = (INDEX_X - STORE_W / 2 - (PARSER_X + PART_W / 2) - STORE_W) / 2;
const EMBEDDER_X = PARSER_X + PART_W / 2 + SYS_GAP + STORE_W / 2;
const SOURCE_X = PARSER_X - PART_W / 2 - SYS_GAP - STORE_W / 2;

// The write run comes down between the embedder and the index and turns into
// the index's LEFT edge, leaving its top for the two runs above it.
const WRITE_X = (EMBEDDER_X + STORE_W / 2 + INDEX_X - STORE_W / 2) / 2;

// Where the word `write` sits on that descent: BELOW the bar the last two
// steps use, not beside the turn above it. Beside the turn it lay across
// validate_version's own run and sat a few units under `count + verify`,
// which is two different runs claiming one word. Below the bar the descent
// is the only line anywhere near it.
const WRITE_WORD_Y = EF_Y + 30;

const READER_X = PARSER_X;
const ROW_READER = ROW_SYS + STORE_H / 2 + 56 + PART_H / 2;

const W = Math.ceil(Math.max(LANE_X1, INDEX_X + STORE_W / 2) + EDGE);
const H = Math.ceil(ROW_READER + PART_H / 2 + V_EDGE);

const step = (i) => box({
  x: stepX(i), y: ROW_FLOW, w: STEP_W, h: STEP_H, label: STEPS[i], ...FLOW.step,
});

const word = (x, y, text, anchor = 'middle') => note({
  x, y, text, anchor, halo: true,
});

// One of process_document's runs to a STORE: down to the shared bar, along
// it, and down into the store it names. The parser is not one of these - it
// sits under the activity and takes a straight drop.
const fanTo = (x, topY) => elbowArrow({
  points: [
    [stepX(2), ROW_FLOW + STEP_H / 2],
    [stepX(2), FAN_Y],
    [x, FAN_Y],
    [x, topY - 2],
  ],
});

export default {
  width: W,
  height: H,
  title: 'The rag_ingest orchestrator and the systems it writes to',
  desc:
    'A lane named rag_ingest orchestrator, a Dapr Workflow, holding six '
    + 'activities across: discover_and_manifest, get_manifest_batch, '
    + 'process_document for N documents in a bounded batch, update_status, '
    + 'validate_version and activate_version. update_status either loops back '
    + 'to get_manifest_batch for more batches, or goes on to validate_version '
    + 'when done. Beneath the lane, process_document downloads from the '
    + 'document source, parses and chunks through a parser and splitter '
    + 'directly below it, embeds through the embedder, and writes to the '
    + 'vector index. validate_version counts and verifies against that index '
    + 'and activate_version flips its active pointer, both arriving at the '
    + 'same point on its top edge, and a query-time reader below resolves the '
    + 'active version and searches it.',

  build() {
    const stepRight = (i) => stepX(i) + STEP_W / 2;
    const stepLeft = (i) => stepX(i) - STEP_W / 2;
    const stepBottom = ROW_FLOW + STEP_H / 2;
    const sysTop = ROW_SYS - STORE_H / 2;
    const partTop = ROW_SYS - PART_H / 2;
    // Both of the last two runs end here.
    const indexIn = [INDEX_X, sysTop - 2];

    return [
      flowLane({
        x: LANE_X0,
        y: LANE_Y0,
        w: LANE_X1 - LANE_X0,
        h: LANE_Y1 - LANE_Y0,
        caption: 'rag_ingest orchestrator (Dapr Workflow)',
        captionW: 276,
      }),

      // ---- along the chain --------------------------------------------------
      [0, 1, 2, 3, 4].map((i) => arrow({
        from: [stepRight(i), ROW_FLOW],
        to: [stepLeft(i + 1) - 2, ROW_FLOW],
      })),
      word((stepRight(3) + stepLeft(4)) / 2, ROW_FLOW - WORD_DY, 'done'),
      word((stepRight(4) + stepLeft(5)) / 2, ROW_FLOW - WORD_DY, 'valid'),

      // ---- and back round for the next batch --------------------------------
      elbowArrow({
        points: [
          [stepX(3), ROW_FLOW - STEP_H / 2],
          [stepX(3), LOOP_Y],
          [stepX(1), LOOP_Y],
          [stepX(1), ROW_FLOW - STEP_H / 2 - 2],
        ],
      }),
      word((stepX(1) + stepX(3)) / 2, LOOP_Y - WORD_DY + 2, 'more batches'),

      // ---- what process_document touches ------------------------------------
      fanTo(SOURCE_X, sysTop),
      word(SOURCE_X, sysTop - HEAD_DY, 'download'),
      // Straight down: the parser stands under the activity that reaches it.
      arrow({ from: [PARSER_X, stepBottom], to: [PARSER_X, partTop - 2] }),
      word(PARSER_X, partTop - HEAD_DY, 'parse + chunk'),
      fanTo(EMBEDDER_X, sysTop),
      word(EMBEDDER_X, sysTop - HEAD_DY, 'embed'),
      elbowArrow({
        points: [
          [stepX(2), stepBottom],
          [stepX(2), FAN_Y],
          [WRITE_X, FAN_Y],
          [WRITE_X, ROW_SYS],
          [INDEX_X - STORE_W / 2 - 2, ROW_SYS],
        ],
      }),
      word(WRITE_X + 8, WRITE_WORD_Y, 'write', 'start'),

      // ---- and what the last two steps do to the index ----------------------
      elbowArrow({
        points: [
          [stepX(4), stepBottom],
          [stepX(4), EF_Y],
          [indexIn[0], EF_Y],
          indexIn,
        ],
      }),
      word(stepX(4) + 8, EF_Y - WORD_DY, 'count + verify', 'start'),
      elbowArrow({
        points: [
          [stepX(5), stepBottom],
          [stepX(5), EF_Y],
          [indexIn[0], EF_Y],
          indexIn,
        ],
      }),
      word(stepX(5) - 8, EF_Y - WORD_DY - TEXT * 1.2, 'flip active\npointer', 'end'),

      // ---- and the reader that resolves it ----------------------------------
      elbowArrow({
        points: [
          [READER_X + PART_W / 2, ROW_READER],
          [INDEX_X, ROW_READER],
          [INDEX_X, ROW_SYS + STORE_H / 2 + 2],
        ],
      }),
      word(
        (READER_X + PART_W / 2 + INDEX_X) / 2,
        ROW_READER - WORD_DY,
        'resolve active version, then search',
      ),

      // ---- the shapes, over the lines that reach them -----------------------
      STEPS.map((_, i) => step(i)),
      cylinder({
        x: SOURCE_X, y: ROW_SYS, w: STORE_W, label: 'Document source\nS3 / Azure Blob', size: TEXT,
      }),
      box({
        x: PARSER_X,
        y: ROW_SYS,
        w: PART_W,
        h: PART_H,
        label: 'Parser + splitter',
        stroke: C.blue,
        fill: C.blueFill,
        size: TEXT,
      }),
      cylinder({
        x: EMBEDDER_X, y: ROW_SYS, w: STORE_W, label: 'Embedder\nOpenAI / Azure OpenAI', size: TEXT,
      }),
      cylinder({
        x: INDEX_X,
        y: ROW_SYS,
        w: STORE_W,
        label: 'Vector index\npgvector / Pinecone\n/ Azure AI Search',
        size: TEXT,
      }),
      box({
        x: READER_X,
        y: ROW_READER,
        w: PART_W,
        h: PART_H,
        label: 'Query-time reader',
        stroke: C.blue,
        fill: C.blueFill,
        size: TEXT,
      }),
    ];
  },
};
