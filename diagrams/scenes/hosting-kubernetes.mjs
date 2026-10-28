// Dapr on Kubernetes: the control plane services, the sidecar injected beside
// an application pod, and the components it uses.
//
// Shown on overview.md ("Kubernetes"). The page at
// operations/hosting/kubernetes/kubernetes-overview.md shares this image and is
// OUTSIDE this conversion's scope, so it keeps the PNG.
//
// Fact-checked against that page's own table of Kubernetes services, which is
// the authority for what each one does. Two things the source image understates
// and this one corrects:
//
//   - the scheduler is described there as serving the Jobs API, the Workflow
//     API and actor reminders, not merely "schedule jobs and tasks".
//   - placement is "used for actors only", so its label says so.
//
// The table also records that placement is NOT deployed when the scheduler
// serves actor placement instead. That is a deployment option rather than a
// second architecture, and drawing both paths would make the diagram harder to
// read than the sentence that already says it, so it is left to the table.
//
// Where this departs from the source image, and why:
//   - the application hexagon was green, a colour this diagram set does not
//     have. One app takes APP[0].
//   - the component names are the ones these docs use everywhere else, as in
//     the other scenes: Publish & subscribe, Workflows, State management,
//     Configuration, Secrets.
//   - Kubernetes is the helm mark with its name beside it, matching how the
//     other scenes draw a mark that has no wordmark of its own.

import { APP, C, el } from '../engine.mjs';
import { OUTLINE, arrow, group, hex, hexHalfWidth, hexPoints, label, panel, pill } from '../shapes.mjs';
import { icon, markHex, plate } from '../icons.mjs';
import { serviceHex } from '../services.mjs';
import { appSidecar, sidecarAt } from '../app.mjs';
import { apiTile } from '../apis.mjs';

const W = 1200;
const H = 740;

// One size for every label and every description in the scene. A description
// set smaller than the name above it reads as a different class of thing.
const TEXT = 13;

// The cluster holds everything except the component column on the right.
const CLUSTER = { x: 16, y: 22, w: 940, h: 696 };
const EDGE = 24; // the least space between anything and a dashed border

// ---- the control plane, one pod each ----
const CONTROL_PLANE_COUNT = 5;
const POD_W = 140; // narrower than the pitch, so adjacent pods never touch
const POD_H = 168;
const POD_Y = CLUSTER.y + EDGE + POD_H / 2; // clear of the cluster's top edge
const POD_GAP = 24; // between adjacent pods, so their borders never touch
const POD_PITCH = POD_W + POD_GAP;
// The row of pods is CENTRED in the cluster, derived from the cluster's centre
// and the row's own width rather than from a margin typed on the left.
const POD_ROW_W = CONTROL_PLANE_COUNT * POD_W + (CONTROL_PLANE_COUNT - 1) * POD_GAP;
const POD_X0 = CLUSTER.x + (CLUSTER.w - POD_ROW_W) / 2 + POD_W / 2;
const CP_HEX_R = 34;
const CP_HEX_DY = -30; // the hexagon, and the mark centred in it
const CP_NAME_DY = 18; // the name, below the hexagon
const CP_ROLE_DY = 52;

// [service key, the reason the sidecar talks to it]. The name and the role
// come from the catalogue in ../services.mjs, and serviceHex() places them
// from the radius, so these five are the same drawing as the ones on the
// self-hosted and the VM diagrams, at this diagram's size.
const CONTROL_PLANE = [
  ['placement', 'Map actor\ninstances to pods,\nfor actors only'],
  ['injector', 'Inject the sidecar\ninto annotated\npods'],
  ['sentry', 'Manage mTLS,\nassign SPIFFE\nidentity'],
  ['operator', 'Manage components\nand service\nendpoints'],
  ['scheduler', 'Schedule jobs for\nthe Jobs and\nWorkflow APIs'],
];

const WHY_DX = 10; // the reason sits beside its arrow, never on it
const WHY_Y = 264; // between the pods and the bus

// ---- the application pod ----
// A square, with the application and its sidecar centred in it as one group.
// The group runs from the app hexagon's left edge to the sidecar's right, and
// from the app's top to the sidecar's bottom, so its centre is NOT the app's
// centre; the two offsets below carry that difference.
const APP_POD = 200;
const APP_R = 54;
const APP_SIZE = 16;
const POD_CX = 470;
const POD_CY = 440;
// The pair is centred in its pod: appSidecar() hangs the sidecar off the app's
// right side and below its name, so the group reaches further right and lower
// than the app hexagon alone, and the app is offset by half of each.
const PAIR = sidecarAt({ x: 0, y: 0, r: APP_R, size: APP_SIZE });
const APP_X = POD_CX - (PAIR.x + PAIR.r - hexHalfWidth(APP_R)) / 2;
const APP_Y = POD_CY - (PAIR.y + PAIR.r - APP_R) / 2;
const SIDE = sidecarAt({ x: APP_X, y: APP_Y, r: APP_R, size: APP_SIZE });

const BUS_Y = 316;
const DROP_X = POD_CX - APP_POD / 2 - 22; // left of the pod, clear of the app hexagon

// ---- the kubelet probe ----
// Below the drop line's lowest point, so the probe arrow crosses nothing.
const KUBELET_X = 190;
const KUBELET_Y = SIDE.y; // on the sidecar's line, so the two share one
const KUBELET_LINE_X = KUBELET_X + 90; // clear of the word "Kubelet"

// ---- where it runs ----
const HOST_W = 876;
const HOST = { x: CLUSTER.x + (CLUSTER.w - HOST_W) / 2, y: 596, w: HOST_W, h: 94 };
const CLOUD_Y = HOST.y + 62;
// `span` is how wide the item VISIBLY draws: a mark alone, or a mark plus its
// gap plus its name. Equal spacing means equal GAPS between those spans, which
// is not what equal centres give you when the items differ in width - that is
// what left a hole beside the narrowest one. A plate's padding is NOT part of
// the span: it is invisible in light mode, and counting it widened the gaps
// around the two backed marks. The label widths were measured on
// the rendered page at TEXT size; the exporter has no font metrics of its own.
const CLOUD_ICON = 30;
const CLOUD_NAME_GAP = 10;
const CLOUDS = [
  { name: 'azure', size: CLOUD_ICON, text: 'Azure', span: 80 },
  { name: 'aws', w: 50, h: 30, backed: true, span: 50 },
  { name: 'google-cloud', w: 140, h: 22, backed: true, span: 140 },
  { name: 'alibaba-cloud', size: CLOUD_ICON, text: 'Alibaba Cloud', span: 130 },
  { name: 'kubernetes', size: CLOUD_ICON, text: 'Kubernetes', span: 114 },
];
const CLOUD_GAP =
  (HOST.w - 2 * EDGE - CLOUDS.reduce((a, m) => a + m.span, 0)) / (CLOUDS.length - 1);
const CLOUD_LEFT = CLOUDS.reduce(
  (acc, m) => [...acc, acc[acc.length - 1] + m.span + CLOUD_GAP],
  [HOST.x + EDGE],
).slice(0, CLOUDS.length);

// ---- the components it uses ----
const CARD_X = 1104;
const CARD = 112;
const CARD_TOP = 118;
const CARD_PITCH = 126;
const COMP_BUS_X = 988;

// Named from the catalogue in ../apis.mjs, in this scene's own order: the
// mark and the name are the same here as on the overview, by construction.
const COMPONENTS = ['pubsub', 'workflows', 'state', 'configuration', 'secrets'];

export default {
  width: W,
  height: H,
  title: 'Dapr on Kubernetes',
  desc:
    'A dashed region stands for the Kubernetes cluster. Along its top are the five Dapr control plane services, each in its own pod: placement, which maps actor instances to pods and is used for actors only; the sidecar injector, which injects the Dapr sidecar into annotated pods; sentry, the certificate authority, which manages mTLS and assigns SPIFFE identity; the operator, which manages components and Kubernetes service endpoints; and the scheduler, which schedules jobs for the Jobs and Workflow APIs. Each reaches down to an application pod in the middle, where the Dapr sidecar runs beside the application. The kubelet probes that pod, using readiness and liveness probes on the healthz API to decide Dapr health state. Below, a dashed strip headed "Host on any cloud or edge infrastructure" carries Azure, AWS, Google Cloud, Alibaba Cloud and Kubernetes. On the right, the sidecar uses components for publish and subscribe, workflows, state management, configuration and secrets.',

  build() {
    const podX = CONTROL_PLANE.map((_, i) => POD_X0 + i * POD_PITCH);

    return [
      panel({ x: CLUSTER.x, y: CLUSTER.y, w: CLUSTER.w, h: CLUSTER.h, stroke: C.navy }),

      // ---- control plane --------------------------------------------------
      CONTROL_PLANE.map(([key, why], i) => {
        const x = podX[i];
        return group([
          panel({ x: x - POD_W / 2, y: POD_Y - POD_H / 2, w: POD_W, h: POD_H, stroke: C.blue, r: 8 }),
          pill({ x: x - POD_W / 2 + 36, y: POD_Y - POD_H / 2, w: 56, h: 26, text: 'Pod', color: C.navy, size: TEXT }),
          serviceHex({ key, x, y: POD_Y + CP_HEX_DY, r: CP_HEX_R, role: true, wrap: true }),
          // Up to the service, because it is the sidecar that calls it. The
          // reason rides BESIDE the arrow: a vertical arrow through centred
          // text cuts the text in half.
          arrow({ from: [x, BUS_Y], to: [x, POD_Y + POD_H / 2 + 6] }),
          label({ x: x + WHY_DX, y: WHY_Y, text: why, size: TEXT, anchor: 'start' }),
        ]);
      }),

      // The line the control plane arrows stand on. It sits ABOVE the
      // application pod and drops into it once, down the pod's left side and in
      // at the sidecar's own height, so no arrow cuts across the pod and
      // nothing runs down through the application hexagon.
      el('polyline', {
        points: `${podX[0]} ${BUS_Y} ${podX[CONTROL_PLANE.length - 1]} ${BUS_Y}`,
        fill: 'none',
        stroke: C.navy,
        'stroke-width': 2,
      }),
      el('polyline', {
        points: `${DROP_X} ${BUS_Y} ${DROP_X} ${SIDE.y}`,
        fill: 'none',
        stroke: C.navy,
        'stroke-width': 2,
      }),


      // ---- the application pod -------------------------------------------
      panel({ x: POD_CX - APP_POD / 2, y: POD_CY - APP_POD / 2, w: APP_POD, h: APP_POD, stroke: C.blue, r: 8 }),
      pill({ x: POD_CX - APP_POD / 2 + 36, y: POD_CY - APP_POD / 2, w: 56, h: 26, text: 'Pod', color: C.navy, size: TEXT }),
      appSidecar({ x: APP_X, y: APP_Y, r: APP_R, label: 'App', size: APP_SIZE, stroke: APP[0].stroke, fill: APP[0].fill }),

      // ---- the kubelet and the sidecar share one line --------------------
      // The probe goes one way and the health answer the other, so the single
      // line between them carries a head at each end. It is the same line the
      // control plane drops onto, which is why the kubelet sits at the
      // sidecar's own height.
      icon({ name: 'kubernetes', x: KUBELET_X, y: KUBELET_Y, size: 26, color: C.kubernetes }),
      label({ x: KUBELET_X + 20, y: KUBELET_Y, text: 'Kubelet', size: TEXT + 1, anchor: 'start' }),
      arrow({ from: [KUBELET_LINE_X, KUBELET_Y], to: SIDE }),
      arrow({ from: SIDE, to: [KUBELET_LINE_X, KUBELET_Y] }),
      label({
        x: KUBELET_X - 30,
        y: KUBELET_Y + 44,
        text: 'Readiness and liveness\nprobes on the healthz API\ndecide Dapr health state',
        size: TEXT,
        anchor: 'start',
      }),

      // ---- where it runs --------------------------------------------------
      panel({ x: HOST.x, y: HOST.y, w: HOST.w, h: HOST.h, stroke: C.navy }),
      pill({ x: HOST.x + HOST.w / 2, y: HOST.y, w: 400, h: 36, text: 'Host on any cloud or edge infrastructure', color: C.navy }),
      CLOUDS.map((m, i) => {
        const left = CLOUD_LEFT[i];
        const markW = m.size ?? m.w;
        return group([
          // The dark-on-light wordmarks get the backing that is transparent in
          // light mode and a light plate in dark; the rest need none.
          m.backed ? plate({ x: left + m.span / 2, y: CLOUD_Y, w: m.span + 20, h: 46, fill: C.markPlate }) : null,
          icon({
            name: m.name,
            x: m.text ? left + markW / 2 : left + m.span / 2,
            y: CLOUD_Y,
            ...(m.size ? { size: m.size } : { w: m.w, h: m.h }),
            color: m.name === 'kubernetes' ? C.kubernetes : C.navy,
          }),
          m.text
            ? label({ x: left + markW + CLOUD_NAME_GAP, y: CLOUD_Y, text: m.text, size: TEXT, anchor: 'start' })
            : null,
        ]);
      }),

      // ---- the components it uses ----------------------------------------
      el('polyline', {
        points: `${COMP_BUS_X} ${CARD_TOP} ${COMP_BUS_X} ${CARD_TOP + 4 * CARD_PITCH}`,
        fill: 'none',
        stroke: C.navy,
        'stroke-width': 2,
      }),
      arrow({ from: SIDE, to: [COMP_BUS_X, SIDE.y] }),
      label({ x: (SIDE.x + COMP_BUS_X) / 2 + 60, y: SIDE.y - 20, text: 'Use components', size: TEXT }),

      COMPONENTS.map((key, i) => {
        const y = CARD_TOP + i * CARD_PITCH;
        return group([
          arrow({ from: [COMP_BUS_X, y], to: { x: CARD_X, y, w: CARD, h: CARD } }),
          apiTile({
            key,
            wrap: true,
            x: CARD_X,
            y,
            w: CARD,
            h: CARD,
          }),
        ]);
      }),
    ];
  },
};
