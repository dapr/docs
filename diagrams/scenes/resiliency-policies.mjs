// Resiliency: every Dapr API call a policy can be applied to.
//
// Replaces resiliency_diagram.png on concepts/resiliency-concept.md, under
// "Dapr provides a capability for defining and applying fault tolerance
// resiliency policies to your application... These policies can be applied to
// any Dapr API calls when calling components with a resiliency spec".
//
// THE LAYOUT IS THE ARGUMENT, and it is the source's: five applications and
// their sidecars inside one boundary, every kind of Dapr call drawn once, and
// a callout on each saying which resiliency target covers it. The point of the
// picture is the SPREAD - that there is no call here a policy cannot be
// applied to - which is why nothing is left out.
//
// Fact-check, against operations/resiliency/targets.md:
//   - there are three targets, not seven: "Dapr supports three target types
//     that apply all Dapr building block APIs: apps, components, actors". Each
//     callout therefore names the API the reader knows AND the target key they
//     will actually type, in the page's code font.
//   - `apps` policies are "invoked when a failure occurs in communication
//     between sidecars", so Call method runs sidecar to sidecar.
//   - `outbound` is the sidecar calling a component: "persisting or retrieving
//     state, publishing a message on a PubSub component, invoking an output
//     binding" - Get state, Publish and the output binding here.
//   - `inbound` is the sidecar calling your app: "PubSub subscriptions when
//     delivering a message, input bindings" - Subscribe and Trigger here.
//   - `actors` policies apply per actor type.
//
// Where this departs from the source image, and why:
//   - the source's input-binding callout reads "Input Component Resiliency
//     Policy". The spec's word is `inbound`, and a reader who types "input"
//     into a resiliency spec gets nothing.
//   - every callout in the source ends "... Resiliency Policy", which makes
//     seven different kinds of policy out of three. The words that vary are
//     the target keys, so only those are given.
//   - the five apps take the palette in order rather than all being one
//     colour. Five apps that look alike make a reader check whether two of
//     them are the same app.
//   - the lines run on the axes and turn with elbows. The source's run at
//     every angle, which is why its subscribe arrows appear to pass through
//     the pub/sub topic rather than out of it.

import { C, APP } from '../engine.mjs';
import { arrow, callout, cylinder, group, hexHalfWidth, label, lockBox, pipe, region, roundedPath } from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';

const W = 1280;
const H = 740;

const TEXT = 14;
const SMALL = 13;
const KEY = 12;             // the spec's own keys, in the page's code font

// ---- the boundary -----------------------------------------------------------
const BOX = { x: 250, y: 160, w: 740, h: 470 };
const BOX_R = BOX.x + BOX.w;
const BOX_B = BOX.y + BOX.h;

// ---- the five apps ----------------------------------------------------------
// Every one is an app hexagon with its Dapr sidecar docked on it, as the
// source draws them. A call leaves and arrives at a SIDECAR, never at an app.
const APP_R = 42;
const APPS = {
  a: { x: 500, y: 250, name: 'App A', app: APP[0] },   // the one making the calls
  b: { x: 700, y: 490, name: 'App B', app: APP[1] },   // invoked by App A
  c: { x: 350, y: 490, name: 'App C', app: APP[2] },   // hosts the actors
  d: { x: 900, y: 232, name: 'App D', app: APP[3] },   // subscriber
  e: { x: 900, y: 400, name: 'App E', app: APP[4] },   // subscriber, and binds out
};
const side = (k) => sidecarAt({ x: APPS[k].x, y: APPS[k].y, r: APP_R });
const sideL = (k) => side(k).x - hexHalfWidth(side(k).r);
const sideR = (k) => side(k).x + hexHalfWidth(side(k).r);

// ---- what the sidecars talk to ----------------------------------------------
const LINE_Y = side('a').y;          // App A's calls all run at its sidecar's height
const BOTTOM_Y = side('b').y;        // App B's and App C's sidecars share a height

// Width alone: cylinder() takes the house ratio from there.
const STORE = { x: 340, y: LINE_Y, w: 112 };
const STORE_H = STORE.w / 1.2;
const PIPE = { x1: 660, x2: 760, ry: 20, rx: 8 };
const SECRET = { x: 940, y: BOTTOM_Y, size: 44 };
const BINDING = { x: 1080, y: side('e').y, size: 46 };
const TRIGGER = { x: APPS.a.x, y: 96, size: 46 };

const SUB_BUS_X = 800;               // the subscribe bus, close to the apps it serves
const CALL_BUS_X = side('a').x;      // App A's calls drop straight down this line
const BUS_R = 14;

// ---- the notes ---------------------------------------------------------------
// A callout names the API a reader knows, then the target key they will type.
const NOTE_W = 214;
const NOTE_H = 54;

export default {
  width: W,
  height: H,
  title: 'The Dapr API calls a resiliency policy can be applied to',
  desc:
    'A dashed boundary named Your solution holds five applications, each an app hexagon with a Dapr sidecar docked on it. App A sits in the middle: its sidecar gets state from a state store on the left, publishes to a message broker on the right, calls a method on App B below it, and calls an actor on App C. An input binding triggers App A from above. From the broker, two subscribe lines run to App D and App E, and App E invokes an output binding to a system outside the boundary. App B retrieves a secret from a secret store. Seven white callout cards, each with a dashed leader to the call it names, give the resiliency target for every one: state management, publish and subscribe, service invocation, actors, secret management and the two bindings, with the target keys apps, actors, and components outbound or inbound.',

  build() {
    const a = side('a');
    const noteAt = (x, y, text, to) => callout({ x, y, w: NOTE_W, h: NOTE_H, text, size: SMALL, to });

    return [
      // ---- the boundary --------------------------------------------------
      region({
        ...BOX, stroke: C.caption, r: 16,
        caption: 'Your solution', captionW: 150, captionH: 26, captionSize: TEXT,
      }),

      // ---- what triggers App A, from outside ------------------------------
      group([
        label({
          x: TRIGGER.x - TRIGGER.size / 2 - 12, y: TRIGGER.y,
          text: 'External\nsystem', size: SMALL, anchor: 'end',
        }),
        // A flash: the source draws a lightning bolt here, and the
        // step-in-right arrow this started as is the set's service invocation
        // mark - two different things cannot share one glyph.
        // Light blue, the colour of the edge of the picture: this mark and
        // the plug at the far end are both systems outside the boundary.
        icon({ name: 'fluent-flash', x: TRIGGER.x, y: TRIGGER.y, size: TRIGGER.size, color: C.blue, fit: 'ink' }),
        arrow({ from: [TRIGGER.x, TRIGGER.y + 30], to: [TRIGGER.x, APPS.a.y - APP_R - 2] }),
        label({ x: TRIGGER.x + 14, y: 184, text: 'Trigger', size: TEXT, anchor: 'start', halo: true }),
      ]),

      // ---- App A's own calls, all at its sidecar's height -----------------
      cylinder({ x: STORE.x, y: STORE.y, w: STORE.w, label: 'State store', size: SMALL }),
      arrow({ from: [sideL('a'), LINE_Y], to: [STORE.x + STORE.w / 2 + 2, LINE_Y] }),
      label({ x: (sideL('a') + STORE.x + STORE.w / 2) / 2, y: LINE_Y + 24, text: 'Get state', size: TEXT }),

      pipe({ x1: PIPE.x1, x2: PIPE.x2, y: LINE_Y, ry: PIPE.ry, rx: PIPE.rx, label: 'Pub/sub', size: SMALL }),
      arrow({ from: [sideR('a'), LINE_Y], to: [PIPE.x1 - PIPE.rx - 2, LINE_Y] }),
      label({ x: (sideR('a') + PIPE.x1 - PIPE.rx) / 2, y: LINE_Y - 22, text: 'Publish', size: TEXT }),

      // ---- out of the broker to the two subscribers -----------------------
      // One bus, close to the column it serves, so neither run crosses an app.
      arrow({ from: [PIPE.x2 + PIPE.rx, LINE_Y], to: [SUB_BUS_X, LINE_Y], head: false }),
      ['d', 'e'].map((k) => group([
        roundedPath({ points: [[SUB_BUS_X, LINE_Y], [SUB_BUS_X, side(k).y], [sideL(k) - 40, side(k).y]], r: BUS_R }),
        arrow({ from: [sideL(k) - 40, side(k).y], to: [sideL(k) - 2, side(k).y] }),
      ])),
      // One label for two runs that carry the same thing.
      label({ x: sideL('d') - 14, y: side('d').y + 22, text: 'Subscribe', size: TEXT, anchor: 'end' }),

      // ---- down to App B and App C ----------------------------------------
      ['c', 'b'].map((k) => {
        const toLeft = APPS[k].x < APPS.a.x;
        const end = toLeft ? sideR(k) + 2 : sideL(k) - 2;
        return group([
          roundedPath({
            points: [[CALL_BUS_X, LINE_Y], [CALL_BUS_X, BOTTOM_Y], [end + (toLeft ? -40 : 40), BOTTOM_Y]],
            r: BUS_R,
          }),
          arrow({ from: [end + (toLeft ? -40 : 40), BOTTOM_Y], to: [end, BOTTOM_Y] }),
        ]);
      }),
      label({ x: (CALL_BUS_X + sideR('c')) / 2, y: BOTTOM_Y - 22, text: 'Call actor', size: TEXT }),
      label({ x: (CALL_BUS_X + sideL('b')) / 2, y: BOTTOM_Y - 22, text: 'Call method', size: TEXT }),

      // ---- App B's secret --------------------------------------------------
      lockBox({ x: SECRET.x, y: SECRET.y, size: SECRET.size, label: 'Secret store' }),
      arrow({ from: [sideR('b'), BOTTOM_Y], to: [SECRET.x - SECRET.size / 2 - 2, BOTTOM_Y] }),
      label({
        x: (sideR('b') + SECRET.x - SECRET.size / 2) / 2, y: BOTTOM_Y - 22,
        text: 'Retrieve secret', size: TEXT,
      }),

      // ---- App E's output binding, which leaves the boundary --------------
      group([
        label({ x: BINDING.x, y: BINDING.y - 52, text: 'External\nsystem', size: SMALL }),
        icon({ name: 'fluent-plug-connected', x: BINDING.x, y: BINDING.y, size: BINDING.size, color: C.blue, fit: 'ink' }),
        arrow({ from: [sideR('e'), BINDING.y], to: [BINDING.x - 28, BINDING.y] }),
      ]),

      // ---- the apps themselves, drawn over the lines that reach them ------
      Object.entries(APPS).map(([, s]) => appSidecar({
        x: s.x, y: s.y, r: APP_R, label: s.name, ...s.app,
      })),

      // ---- and what covers each call ---------------------------------------
      noteAt(140, 190, 'State management\ncomponents: outbound', [STORE.x - 20, LINE_Y - STORE_H / 2]),
      noteAt(740, 100, 'Input binding\ncomponents: inbound', [TRIGGER.x + 6, 176]),
      noteAt(1000, 110, 'Publish and subscribe\ncomponents: outbound, inbound', [(PIPE.x1 + PIPE.x2) / 2 + 20, LINE_Y - PIPE.ry - 4]),
      noteAt(560, 690, 'Service invocation\napps', [(CALL_BUS_X + sideL('b')) / 2, BOTTOM_Y + 8]),
      noteAt(240, 690, 'Actor calls\nactors', [(CALL_BUS_X + sideR('c')) / 2 + 10, BOTTOM_Y + 10]),
      noteAt(880, 690, 'Secret management\ncomponents: outbound', [(sideR('b') + SECRET.x) / 2, BOTTOM_Y + 10]),
      noteAt(1150, 600, 'Output binding\ncomponents: outbound', [(sideR('e') + BINDING.x) / 2 + 10, BINDING.y + 8]),
    ];
  },
};
