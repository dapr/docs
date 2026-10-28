// The Dapr control plane in high availability across a cluster of physical or
// virtual machines, with the components the sidecars use.
//
// Replaces overview-vms-hosting.png on overview.md ("Clusters of physical or
// virtual machines").
//
// Fact-check, against this page's own prose and the name resolution reference:
//
//   - name resolution. The page says Dapr "uses multicast DNS by default, but
//     can also optionally support Hashicorp Consul", and nr-mdns.md says mDNS
//     "is configured automatically in self-hosted mode ... no configuration
//     needed". The source image draws Consul on all three machines with no
//     sign that it is a choice, which reads as the architecture rather than as
//     the option the page describes. The row says so here, so the diagram and
//     the sentence above it agree.
//   - the scheduler serves the Jobs API, the Workflow API and actor reminders,
//     as kubernetes-overview.md's table states, not merely "jobs and tasks".
//
// Where this departs from the source image, and why:
//   - App B was YELLOW. The palette has no yellow: it is too light on the
//     light ground. Two apps take APP[0] and APP[1], in order.
//   - the component names are the ones these docs use everywhere else, and the
//     component cards are the same size as the Kubernetes scene's, because
//     they are the same cards.
//   - each row is described ONCE, in a gutter beside it, rather than three
//     times across the machines plus a second set of labels between the
//     columns. The source says the same thing twice over; one description per
//     row carries both halves of it and leaves the row's join line somewhere
//     to run.

import { APP, C, el } from '../engine.mjs';
import { arrow, group, hex, hexHalfWidth, hexPoints, label, panel, region, roundedPath } from '../shapes.mjs';
import { MARK_IN_HEX, icon, markHex } from '../icons.mjs';
import { apiTile } from '../apis.mjs';
import { appSidecar, sidecarAt, sidecarDx } from '../app.mjs';
import { NAME_DY, SERVICE_R, serviceHex, serviceLabel } from '../services.mjs';

const W = 1216; // 16:9 for a slide; the content is unchanged
const H = 760;

const TEXT = 13; // one size for every label and description
const EDGE = 24; // the least space between anything and a dashed border

// ---- the gutter that describes each row once ----
const GUTTER_R = 210; // descriptions are right-aligned here

// ---- the machines ----
const VM_COUNT = 3;
const VM_W = 180;
const VM_GAP = 20;
const VM_X0 = GUTTER_R + EDGE;
const VM_Y = 30;
const VM_H = 640;
const vmCentre = (i) => VM_X0 + i * (VM_W + VM_GAP) + VM_W / 2;
const vmRight = VM_X0 + (VM_COUNT - 1) * (VM_W + VM_GAP) + VM_W;

// ---- the four stacked services, the same on every machine ----
const HEX_R = SERVICE_R;
const ROW_TOP = 282; // room for the sidecar's connector above the first row
const ROW_PITCH = 100;

// [mark, name, what the row is for]. The description carries both halves of
// what the source said twice: what the service does, and what the machines use
// each other for.
// Each row is one service across all three machines, described once in the
// gutter beside it. The three Dapr services name a key in ../services.mjs
// and are drawn by serviceHex at this diagram's radius; Consul is not a
// Dapr service, so it carries its own mark and name.
const ROWS = [
  { mark: 'consul', name: 'Consul', gutter: 'DNS name resolution,\nif you choose Consul\nover mDNS' },
  { key: 'placement', gutter: 'Create the mapping table\nof actor instances' },
  { key: 'scheduler', gutter: 'Schedule jobs at specified\nintervals, for the Jobs and\nWorkflow APIs and reminders' },
  { key: 'sentry', gutter: 'Assign SPIFFE identity\nand manage mTLS' },
];

// ---- the apps, on the first and last machine ----
const APP_Y = 130;
const APP_R = 40;
const APP_SIZE = 15;
// The SIDECAR is centred on the machine's service column, not the app-and-
// sidecar group on the machine. That is what lets the connector down to Consul
// be vertical and land on the hexagon's apex; centring the group instead puts
// the sidecar off the column and the arrow leans visibly over the short drop.
// appSidecar() hangs the sidecar off the app's right side, so the app is that
// far to the left of the column.
const appX = (i) => vmCentre(i) - sidecarDx(APP_R);
const sideOf = (i) => sidecarAt({ x: appX(i), y: APP_Y, r: APP_R, size: APP_SIZE });

const APPS = [
  { vm: 0, name: 'App A', app: APP[0] },
  { vm: 2, name: 'App B', app: APP[1] },
];

// ---- the components the sidecars use ----
// The same cards as the Kubernetes scene, at the same size: they are the same
// building blocks, so they must not be a different size here.
const COMP_BUS_X = 960;
const BUS_R = 14; // the radius the bus turns into its outer two arrows
const CARD_X = 1104;
const CARD = 112;
const CARD_TOP = 85;
const CARD_PITCH = 126;

// Named from the catalogue in ../apis.mjs, in this scene's own order: the
// mark and the name are the same here as on the overview, by construction.
const COMPONENTS = ['pubsub', 'workflows', 'state', 'configuration', 'secrets'];

// ---- the certificate store, which is not a building block ----
const CERT_Y = 688;

export default {
  width: W,
  height: H,
  title: 'The Dapr control plane across a cluster of machines',
  desc:
    'Three dashed regions stand for three machines, VM1, VM2 and VM3. Each runs the same four services in a column, and arrows join each service across all three machines, which is what makes the control plane highly available. Described once beside their row, the four are Consul for DNS name resolution if you choose it over multicast DNS, the Dapr placement service which creates the mapping table of actor instances, the Dapr scheduler which schedules jobs at specified intervals for the Jobs and Workflow APIs and for actor reminders, and Dapr sentry which assigns SPIFFE identity and manages mTLS. An application with a Dapr sidecar runs on the first machine and another on the third, and the two sidecars call each other. On the right, the sidecars use components for publish and subscribe, workflows, state management, configuration and secrets, and below those is the certificate store shared by all the machines.',

  build() {
    return [
      // ---- the machines ---------------------------------------------------
      Array.from({ length: VM_COUNT }, (_, i) => {
        const left = VM_X0 + i * (VM_W + VM_GAP);
        return group([
          region({ x: left, y: VM_Y, w: VM_W, h: VM_H, stroke: C.navy, caption: `VM${i + 1}`, captionW: 68, captionX: left + 54, captionH: 28, captionSize: TEXT }),
        ]);
      }),

      // ---- the four services, joined across every machine ------------------
      ROWS.map((row, i0) => {
        const y = ROW_TOP + i0 * ROW_PITCH;
        return group([
          label({ x: GUTTER_R, y, text: row.gutter, size: TEXT, anchor: 'end', color: C.blue }),
          // Between each adjacent pair, one line with a head at each end: the
          // machines keep each other in step, so neither direction is the
          // subordinate one.
          Array.from({ length: VM_COUNT - 1 }, (_, i) => {
            const a = { x: vmCentre(i), y, r: HEX_R, hex: true };
            const b = { x: vmCentre(i + 1), y, r: HEX_R, hex: true };
            return group([arrow({ from: a, to: b }), arrow({ from: b, to: a })]);
          }),
          Array.from({ length: VM_COUNT }, (_, i) => {
            const cx = vmCentre(i);
            // Consul takes the same name offset as the Dapr services, from
            // the same ratio, so all four names in a column line up.
            return row.key
              ? serviceHex({ key: row.key, x: cx, y, r: HEX_R })
              : group([
                markHex({ x: cx, y, r: HEX_R, mark: row.mark, size: HEX_R * MARK_IN_HEX, stroke: C.navy, color: C.navy }),
                label({ x: cx, y: y + HEX_R * NAME_DY, text: row.name, size: serviceLabel(HEX_R) }),
              ]);
          }),
        ]);
      }),

      // ---- the applications ------------------------------------------------
      APPS.map(({ vm, name, app }) => {
        const side = sideOf(vm);
        return group([
          appSidecar({ x: appX(vm), y: APP_Y, r: APP_R, label: name, size: APP_SIZE, stroke: app.stroke, fill: app.fill }),
          // Down onto the first service in this machine's column. Both ends
          // are shapes, so the arrow stops at each edge rather than at a
          // coordinate that happens to be near one.
          arrow({ from: side, to: { x: vmCentre(vm), y: ROW_TOP, r: HEX_R, hex: true } }),
        ]);
      }),

      // The two sidecars call each other, which is the whole point of running
      // them on separate machines, so that line carries a head at each end.
      ...(() => {
        const a = sideOf(0);
        const b = sideOf(VM_COUNT - 1);
        return [arrow({ from: a, to: b }), arrow({ from: b, to: a })];
      })(),

      // ---- the components the sidecars use ---------------------------------
      roundedPath({
        points: [
          [COMP_BUS_X + BUS_R, CARD_TOP],
          [COMP_BUS_X, CARD_TOP],
          [COMP_BUS_X, CARD_TOP + 4 * CARD_PITCH],
          [COMP_BUS_X + BUS_R, CARD_TOP + 4 * CARD_PITCH],
        ],
        r: BUS_R,
      }),
      arrow({
        from: sideOf(VM_COUNT - 1),
        to: [COMP_BUS_X, sideOf(VM_COUNT - 1).y],
      }),
      label({ x: COMP_BUS_X - 6, y: sideOf(VM_COUNT - 1).y - 20, text: 'Use components', size: TEXT, anchor: 'end' }),

      COMPONENTS.map((key, i) => {
        const y = CARD_TOP + i * CARD_PITCH;
        return group([
          arrow({
            from: [i === 0 || i === COMPONENTS.length - 1 ? COMP_BUS_X + BUS_R : COMP_BUS_X, y],
            to: { x: CARD_X, y, w: CARD, h: CARD },
          }),
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

      // ---- the certificate store -------------------------------------------
      // Not a building block, and not on any one machine: it is shared, so it
      // sits outside them, under the components, with no card around it.
      icon({ name: 'fluent-certificate', x: CARD_X, y: CERT_Y, size: 30, color: C.navy }),
      label({ x: CARD_X, y: CERT_Y + 32, text: 'Cert store for\nall machines', size: TEXT }),
    ];
  },
};
