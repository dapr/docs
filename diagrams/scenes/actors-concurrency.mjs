// TURN-BASED ACCESS ON A TIMELINE: six requests against two actors, and who
// holds which actor's lock when.
//
// Replaces /images/actors_background_concurrency.png on
// developing-applications/building-blocks/actors/actors-features-concepts.md,
// under "The diagram below shows an example of a timeline for the execution
// of these methods and callbacks on behalf of two actors (ActorId1 and
// ActorId2) that belong to this actor type".
//
// Fact-check, against the paragraph above it, which is what the picture has
// to prove:
//   - "The Dapr actor runtime enforces turn-based concurrency by acquiring a
//     per-actor lock at the beginning of a turn and releasing the lock at the
//     end of the turn." Each column's run of events begins at Lock acquired
//     and ends at Lock released, and the band drawn behind it is exactly the
//     span the lock is held.
//   - "turn-based concurrency is enforced on a per-actor basis and not across
//     actors. Actor methods and timer/reminder callbacks can execute
//     simultaneously on behalf of different actors." The three ActorId1
//     columns never overlap each other, the three ActorId2 columns never
//     overlap each other, and the two actors' bands sit side by side at the
//     same times. That is the whole claim, and it is the one thing a reader
//     should be able to check by eye.
//   - "turn-based concurrency is respected even across different methods,
//     timers, and callbacks" - which is why each actor's three columns are a
//     method, a second method, and a timer or reminder.
//
// Where this departs from the source as a DRAWING, and why:
//   - the two actors are told apart by COLOUR, as the source tells them
//     apart, but with app tokens rather than cyan and orange: the bands and
//     the dots take the two fills this set already uses for two of a kind,
//     and the words stay body ink so they read in both themes. The source
//     sets every label in the actor's own colour, which puts pale cyan text
//     on white.
//   - the events sit on a TIME GRID. The source places them by eye, so two
//     events that happen at the same moment in different columns are a few
//     pixels apart and two that do not are level; here a row is a moment, and
//     a reader comparing columns is reading something true.
//   - the time arrow is on the left with its name beside it, as the source
//     has it.

import { APP, C, el } from '../engine.mjs';
import {
  arrow, captionReach, group, label, lineWidth,
} from '../shapes.mjs';

const EDGE = 29;
const V_EDGE = 14;

// 13, the size render-width.mjs is calibrated against.
const TEXT = 13;

// ---- the time grid ----------------------------------------------------------
// One row is one moment. Every event in the picture is placed on it, which is
// what lets a reader compare two columns at a glance.
const TICK = 34;
const TICKS = 18;

// A turn is six events: the lock is taken, the method is entered, a task is
// created, the method returns, the task finishes, the lock is released. The
// wording differs between a method and a callback, and between a turn that
// waited for the lock and one that did not, so each column names its own.
const turn = (start, lines) => lines.map((text, i) => ({ at: start + i, text }));

const METHOD_TURN = (name) => [
  'Lock acquired', `Entered ${name}`, 'Created Task', `Exited ${name}`,
  'Task completed', 'Lock released',
];
const CALLBACK_TURN = [
  'Lock acquired', 'Entered callback', 'Created Task', 'Task completed',
  'Exited callback', 'Lock released',
];

// The first turn on each actor's lock takes it without waiting, so its own
// arrival IS the start of the turn and the band covers it.
const FIRST_TURN = (name) => [
  'Request arrived, lock\nacquired without wait',
  `Entered ${name}`, 'Created Task', `Exited ${name}`,
  'Task completed', 'Lock released',
];

const WAITING = 'Request arrived,\nwaiting for lock\nasynchronously';

// THE SIX COLUMNS. `wait` is when the request turned up; `start` is when it
// got the lock. The two actors run the same shape of schedule at the same
// times, which is the point: three turns queued on each lock, and the two
// locks independent of each other.
const COLUMNS = [
  {
    head: 'ActorId1\nMethod1', actor: 0, start: 0,
    events: turn(0, FIRST_TURN('Method1')),
  },
  {
    head: 'ActorId1\nMethod2', actor: 0, wait: 1, start: 6,
    events: turn(6, METHOD_TURN('Method2')),
  },
  {
    head: 'ActorId1\nTimer', actor: 0, wait: 3, start: 12,
    events: turn(12, CALLBACK_TURN),
  },
  {
    head: 'ActorId2\nMethod1\n(client request ‘xyz789’)', actor: 1, start: 0,
    events: turn(0, FIRST_TURN('Method1')),
  },
  {
    head: 'ActorId2\nMethod1\n(client request ‘abc123’)', actor: 1, wait: 1, start: 6,
    events: turn(6, METHOD_TURN('Method1')),
  },
  {
    head: 'ActorId2\nReminder', actor: 1, wait: 3, start: 12,
    events: turn(12, CALLBACK_TURN),
  },
];

// ---- the geometry -----------------------------------------------------------
// The column pitch is what the longest event label needs beside its own line,
// measured on the rendered page, plus the band and the air between columns.
const LABEL_W = 148;
const BAND_W = 20;
const DOT_R = 5;
const LABEL_DX = BAND_W / 2 + 10;
const COL_PITCH = LABEL_DX + LABEL_W + 26;

// The head block: three lines for the two columns that name a client
// request, two for the rest. label() CENTRES a block on the y it is given,
// so a head is placed from its own line count and the first line of all six
// lands on one baseline; centred in a block of three, the two-line heads sat
// lower than their neighbours and the row read as ragged.
const HEAD_LINES = 3;
const HEAD_LEAD = TEXT * 1.2;
const HEAD_H = Math.round(HEAD_LEAD * HEAD_LINES + 18);
const headY = (top, text) =>
  top + TEXT / 2 + ((String(text).split('\n').length - 1) * HEAD_LEAD) / 2;

// Wide enough for the arrow and for "Time" over it. Beside the arrow the
// word reached into the first column's band.
const AXIS_W = 52;

const COL_0_X = Math.round(EDGE + AXIS_W + BAND_W / 2);
const colX = (i) => COL_0_X + i * COL_PITCH;

const HEAD_Y = Math.round(V_EDGE + captionReach());
const TICK_0_Y = HEAD_Y + HEAD_H + 16;
const tickY = (t) => TICK_0_Y + t * TICK;

// The line each column's events hang on runs the whole height, because a
// request that has not got the lock yet is still waiting on that line.
const LINE_TOP = TICK_0_Y - 14;
const LINE_BOTTOM = tickY(TICKS) - 10;

// The LAST column's own longest label, not the widest in the picture: the
// canvas is as wide as the drawing reaches, and sizing it off LABEL_W left
// forty-five units of margin on the right against twenty-nine on the left.
const LAST_LABEL_W = 118;
const W = Math.ceil(colX(COLUMNS.length - 1) + LABEL_DX + LAST_LABEL_W + EDGE);
const H = Math.ceil(LINE_BOTTOM + V_EDGE);

const AXIS_X = Math.round(EDGE + 16);

export default {
  width: W,
  height: H,
  title: 'A timeline of six requests against two actors, showing each actor’s lock held by one turn at a time',
  desc:
    'Time runs down the page, marked by an arrow on the left. Six vertical '
    + 'lines stand side by side, headed ActorId1 Method1, ActorId1 Method2, '
    + 'ActorId1 Timer, ActorId2 Method1 for client request xyz789, ActorId2 '
    + 'Method1 for client request abc123, and ActorId2 Reminder. On each line '
    + 'a run of six dots is drawn over a tinted band: Lock acquired, Entered '
    + 'the method or callback, Created Task, the method exited and the task '
    + 'completed, and Lock released. The first column of each actor takes the '
    + 'lock on arrival; the other two show the request arriving early and '
    + 'waiting for the lock asynchronously. The three ActorId1 bands never '
    + 'overlap one another and neither do the three ActorId2 bands, but the '
    + 'two actors’ bands run at the same times - a lock is per actor, not '
    + 'across actors.',

  build() {
    return [
      // ---- time, down the left --------------------------------------------
      arrow({ from: [AXIS_X, tickY(0)], to: [AXIS_X, tickY(TICKS - 1)] }),
      label({ x: AXIS_X, y: tickY(0) - 22, text: 'Time', size: TEXT }),

      // ---- the six columns -------------------------------------------------
      COLUMNS.map((col) => {
        const x = colX(COLUMNS.indexOf(col));
        const fill = APP[col.actor === 0 ? 3 : 2];
        const last = col.events[col.events.length - 1];
        const bandTop = tickY(col.start) - TICK * 0.4;
        const bandBottom = tickY(last.at) + TICK * 0.4;
        return group({
          class: 'd-named-mark',
          children: [
            // The head, over the line it names.
            label({ x, y: headY(HEAD_Y + 10, col.head), text: col.head, size: TEXT }),
            // The line the whole request lives on.
            el('line', {
              x1: x, y1: LINE_TOP, x2: x, y2: LINE_BOTTOM,
              stroke: C.caption, 'stroke-width': lineWidth(),
            }),
            // THE BAND IS THE LOCK, and it is drawn before the dots so they
            // sit on it: from the moment the turn takes the lock to the
            // moment it gives it back.
            el('rect', {
              x: x - BAND_W / 2,
              y: bandTop,
              width: BAND_W,
              height: bandBottom - bandTop,
              rx: 4,
              fill: fill.fill,
              opacity: 0.45,
            }),
            // The request turning up before it can be served, where that is
            // a different moment from the start of its turn.
            col.wait === undefined
              ? null
              : group([
                // HOLLOW, because this request is not holding the lock yet:
                // the solid dots are the turn, and the band under them is
                // the lock. A solid dot out here said the opposite.
                el('circle', {
                  cx: x, cy: tickY(col.wait), r: DOT_R,
                  fill: C.bg, stroke: C.body, 'stroke-width': lineWidth(),
                }),
                label({
                  x: x + LABEL_DX, y: tickY(col.wait), text: WAITING,
                  size: TEXT, anchor: 'start', weight: 400,
                }),
              ]),
            // And the turn itself.
            col.events.map((ev) => group([
              el('circle', { cx: x, cy: tickY(ev.at), r: DOT_R, fill: fill.stroke }),
              label({
                x: x + LABEL_DX, y: tickY(ev.at), text: ev.text,
                size: TEXT, anchor: 'start', weight: 400,
              }),
            ])),
          ],
        });
      }),
    ];
  },
};
