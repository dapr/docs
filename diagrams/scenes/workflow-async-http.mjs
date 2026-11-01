// Async HTTP APIs: the asynchronous request-reply protocol a client follows
// when the work behind an endpoint is long-running.
//
// Replaces workflow-async-request-response.png on
// developing-applications/building-blocks/workflow/workflow-patterns.md,
// under the page's own five-step list, which this follows exactly:
//   1. a client sends a request to the start API
//   2. the start API writes a message to a backend queue
//   3. the start API returns HTTP 202 with an identifier to poll
//   4. the status API queries a database holding the operation's status
//   5. the client polls the status API until it completes or times out
//
// Fact-check: the page says 202 and says the client polls "repeatedly", so the
// status leg is a separate path from the client rather than a return on the
// start leg. The source image does the same.
//
// The arrangement follows the source: the start leg across the top, the worker
// on the right between the legs, the status leg across the bottom, and the
// client's poll dropping down its own column. Every leg begins and ends on a
// shape's edge - the first draft ran them at fixed heights while the client
// and worker sat at the vertical midpoint, so three arrows floated in space
// touching nothing.
//
// Where this departs from the source image, and why:
//   - the two stores are cylinder(), the house data-store shape, where the
//     source draws its own gold drums. Same meaning, the shape every other
//     scene here uses for a store.
//   - the APIs are box(), not hexagons. A hexagon in this set is an
//     application; the start and status APIs are endpoints ON the workflow,
//     not separate apps, and drawing them as apps would say otherwise.

import { C } from '../engine.mjs';
import { FLOW } from '../flow.mjs';
import { arrow, box, cylinder, elbowArrow, group, hex, hexHalfWidth, label } from '../shapes.mjs';

const MARGIN = 44;

const HEX_R = 52;
const HEX_HALF = hexHalfWidth(HEX_R);
const API_W = 150;
const STORE_W = 108;
const STORE_HALF_H = STORE_W / 1.2 / 2;   // cylinder() keeps STORE_RATIO

const CLIENT_X = MARGIN + HEX_R;
const API_X = CLIENT_X + 250;
const STORE_X = API_X + 240;
const WORKER_X = STORE_X + 230;

// The worker sits between the two legs, and the runs that reach it are the
// only thing setting this diagram's height. The first draft left 108 units of
// vertical run either side of the worker, which bought nothing: the legs only
// have to clear the hexagon and read as a turn. Half that does both, and the
// drawing is a third shorter.
const LEG = 48;        // the worker's edge to the leg's turn
const TOP_Y = MARGIN + HEX_R;              // the start leg
const MID_Y = TOP_Y + HEX_R + LEG;         // the worker, between the legs
const BOTTOM_Y = MID_Y + HEX_R + LEG;      // the status leg

// The two legs between the client and the start API share a gap, so they are
// offset either side of the box's centre line rather than drawn on it.
const LEG_SPLIT = 12;

const cap = (x, y, text) =>
  label({ x, y, text, size: 12, weight: 500, color: C.caption });

export default {
  width: WORKER_X + HEX_HALF + MARGIN,
  height: BOTTOM_Y + STORE_HALF_H + MARGIN,
  title: 'The async HTTP API workflow pattern',
  desc:
    'A client posts an order to a start API, which queues the work and '
    + 'returns 202 Accepted with a location to poll. A worker takes the job '
    + 'and updates a job database. The client polls a status API, which reads '
    + 'that database.',

  build() {
    const clientEdge = CLIENT_X + HEX_HALF;
    const apiLeft = API_X - API_W / 2;
    const apiRight = API_X + API_W / 2;
    const storeLeft = STORE_X - STORE_W / 2;
    const storeRight = STORE_X + STORE_W / 2;

    return [
      // Start leg, and the 202 coming back under it.
      arrow({ from: [clientEdge, TOP_Y - LEG_SPLIT], to: [apiLeft, TOP_Y - LEG_SPLIT] }),
      cap((clientEdge + apiLeft) / 2, TOP_Y - LEG_SPLIT - 14, 'POST /orders'),
      arrow({ from: [apiLeft, TOP_Y + LEG_SPLIT], to: [clientEdge, TOP_Y + LEG_SPLIT] }),
      cap((clientEdge + apiLeft) / 2, TOP_Y + LEG_SPLIT + 26, '202 Accepted'),

      arrow({ from: [apiRight, TOP_Y], to: [storeLeft, TOP_Y] }),
      cap((apiRight + storeLeft) / 2, TOP_Y - 14, 'New order'),

      // Queue out to the worker, which sits lower.
      elbowArrow({ points: [[storeRight, TOP_Y], [WORKER_X, TOP_Y], [WORKER_X, MID_Y - HEX_R]] }),
      cap((storeRight + WORKER_X) / 2, TOP_Y - 14, 'Start processing'),

      // Worker down to the database it updates.
      elbowArrow({ points: [[WORKER_X, MID_Y + HEX_R], [WORKER_X, BOTTOM_Y], [storeRight, BOTTOM_Y]] }),
      cap((storeRight + WORKER_X) / 2, BOTTOM_Y - 14, 'Update status'),

      // Status leg: the client polls, and the status API reads the database.
      elbowArrow({ points: [[CLIENT_X, TOP_Y + HEX_R], [CLIENT_X, BOTTOM_Y], [apiLeft, BOTTOM_Y]] }),
      cap((CLIENT_X + apiLeft) / 2 + 20, BOTTOM_Y - 14, 'GET /orders/{id}'),

      arrow({ from: [apiRight, BOTTOM_Y], to: [storeLeft, BOTTOM_Y] }),
      cap((apiRight + storeLeft) / 2, BOTTOM_Y - 14, 'GET status'),

      group([
        box({ x: API_X, y: TOP_Y, w: API_W, h: FLOW.H, label: 'Start API', ...FLOW.step }),
        box({ x: API_X, y: BOTTOM_Y, w: API_W, h: FLOW.H, label: 'Status API', ...FLOW.step }),
      ]),

      cylinder({ x: STORE_X, y: TOP_Y, w: STORE_W, label: 'Job\nqueue' }),
      cylinder({ x: STORE_X, y: BOTTOM_Y, w: STORE_W, label: 'Job\ndatabase' }),

      hex({ x: CLIENT_X, y: TOP_Y, r: HEX_R, label: 'Client', stroke: C.appInk, fill: C.green }),
      hex({ x: WORKER_X, y: MID_Y, r: HEX_R, label: 'Worker', stroke: C.appInk, fill: C.appSky }),
    ];
  },
};
