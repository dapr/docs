// How Sentry issues certificates on Kubernetes.
//
// Replaces security-mTLS-sentry-kubernetes.png on
// concepts/security-concept.md ("mTLS in Kubernetes mode") and on
// concepts/dapr-services/sentry.md ("Kubernetes mode").
//
// This scene and `sentry-selfhosted` tell the same story with two things
// different: WHERE the certs live, and WHO hands the sidecar its trust
// anchors. Everything here that the other scene does not have follows from
// those two - the secret, the injector, and the pods around each of them.
//
// They were drawn on one skeleton, at identical coordinates, until the
// self-hosted scene was rearranged to follow its own source image: the certs
// in the apps' row, Sentry centred over the apps, the operator centred under
// them. This one keeps the older arrangement - the certs and the operator down
// the left, Sentry beside them, the apps and their sidecars to the right -
// because the middle of the picture is spoken for here. Two pods, an injector
// and a third pod around it need the room that scene gives to the column
// between its apps.
//
// Fact-check, against operations/security/mtls.md and the concepts page:
//   - "In Kubernetes, the certs are persisted to a secret that resides in the
//     namespace of the Dapr system pods, accessible only to them."
//   - "The communication between the Dapr sidecar and Sentry is authenticated
//     using the trust chain certificate, which is injected into each Dapr
//     instance by the Dapr Sidecar Injector system service." That is the
//     injector's job in this picture, and it is the thing self-hosted mode has
//     no service for - there the operator sets the anchors by hand, which is
//     why the run to the sidecars starts somewhere else in that scene.
//   - "Dapr also supports strong identities when deployed on Kubernetes,
//     relying on a pod's Service Account token sent as part of the certificate
//     signing request (CSR) to Sentry" - the request carries more here than in
//     self-hosted mode, and the label says so.
//
// Where this departs from the source image, and why:
//   - Service A and Service B are App A and App B, in the first two app
//     colours. The source draws the second app yellow, which is the THIRD
//     colour in the house order.
//   - the source puts a Kubernetes logo in the empty bottom-right corner. It
//     names nothing and points at nothing; the secret already carries the
//     helm, and the page says which mode this is.
//   - the lines run on the axes with rounded elbows, like the rest of the set.

import { C, APP } from '../engine.mjs';
import { arrow, elbowArrow, hexHalfWidth, label, pod, secureLock } from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { appSidecar, appSidecarCentre, sidecarAt } from '../app.mjs';
import { serviceHex } from '../services.mjs';

const W = 1010;
const H = 535;

const TEXT = 13;
const SMALL = 12;

// ---- the skeleton, shared with sentry-selfhosted ----------------------------
const TOP_Y = 76;
const STORE = { x: 96, y: TOP_Y, size: 48 };
const OPERATOR = { x: 96, y: 300, size: 46 };

const ROW_Y = 322;
const APP_R = 48;
const APP_SIZE = 16;
const A_CX = 410;
const B_CX = 700;
const MID = (A_CX + B_CX) / 2;
const CSR_BUS = 212;
const TRUST_BUS = 432;
const SERVICE_R = 32;
const SENTRY_X = 390;

const A = appSidecarCentre({ x: A_CX, y: ROW_Y, r: APP_R, size: APP_SIZE });
const B = appSidecarCentre({ x: B_CX, y: ROW_Y, r: APP_R, size: APP_SIZE, mirror: true });
const SIDE_A = sidecarAt({ x: A.x, y: A.y, r: APP_R, size: APP_SIZE });
const SIDE_B = sidecarAt({ x: B.x, y: B.y, r: APP_R, size: APP_SIZE, mirror: true });
const SIDE_HALF = hexHalfWidth(SIDE_A.r);

const CSR_Y = SIDE_A.y - 18;
const A_OUT = +(SIDE_A.x + SIDE_HALF).toFixed(2);
const B_OUT = +(SIDE_B.x - SIDE_HALF).toFixed(2);
const SIDE_BOTTOM = +(SIDE_A.y + SIDE_A.r + 2).toFixed(2);

// A certificate request leaves the sidecar at its upper OUTER corner and runs
// sideways before it turns up. Straight up from that corner would lie along
// the vertical edge below it, which reads as the line sliding off the shape
// rather than leaving it; the corner itself is a node, and a horizontal line
// out of it clears both edges that meet there. The run is long enough that the
// riser stands clear of the pod `sentry-kubernetes` draws around the pair.
const CSR_OUT = 44;
const CSR_A = +(A_OUT + CSR_OUT).toFixed(2);
const CSR_B = +(B_OUT - CSR_OUT).toFixed(2);

// Above the line it marks, not on it: at the sidecars' own height the shield
// sits ON the mTLS arrow, and between the two risers there is no room beside
// it for its name either. Both go above, stacked.
const LOCK = { x: MID, y: +(SIDE_A.y - 48).toFixed(2), size: 38 };

// ---- the pods ---------------------------------------------------------------
// The app pods hold the pair with the house clearance; the service pods are
// the ones `hosting-kubernetes` draws, at the same proportions.
const APP_POD = { w: 152, h: 180 };
const SERVICE_POD = { w: 148, h: 140 };
// Sentry's pod is the tall one: it has to hold the role line under the name.
// It hangs 52 above the hex and 120 below, and no higher - a caption pill
// sits ON the top edge, so the pod's own top is 13 lower than it looks.
const SENTRY_POD = { x: SENTRY_X - SERVICE_POD.w / 2, y: TOP_Y - 52, w: SERVICE_POD.w, h: 172 };

// Pod B's caption sits at ITS right end: at the left end it would be where the
// certificate request leaves the sidecar below it.
const POD_B_CAPTION = B_CX + APP_POD.w / 2 - 20 - 35;

// ---- what this scene has that the self-hosted one does not ------------------
// The injector, in the app pods' own band and off to their right: a third pod
// on the same line reads as a third pod. Both of its lines drop out of the
// bottom edge - the anchors a short step onto the trust bus, the read of the
// root cert past it and round the outside.
const INJECTOR_POD = { x: 820, y: ROW_Y - APP_POD.h / 2, w: SERVICE_POD.w, h: APP_POD.h };
const INJECTOR_CX = INJECTOR_POD.x + INJECTOR_POD.w / 2;
const INJECTOR_BOTTOM = +(INJECTOR_POD.y + INJECTOR_POD.h + 2).toFixed(2);
const READ_COL = 40; // and back to the secret down the outside
const READ_ROW = 505;

export default {
  width: W,
  height: H,
  title: 'Sentry issuing workload certificates on Kubernetes',
  desc:
    'Top left, a Kubernetes secret holding the certs, with an operator figure below it and an arrow running up from the operator into the secret, marked optional, because the operator may bring existing root and issuer certs. From the secret a line with a head at each end runs right to Sentry, the Dapr certificate authority, in a pod of its own, labelled "Read the existing root and issuer certs, or create a self-signed root". Below and to the right, App A and App B each run beside a Dapr sidecar in a pod of their own, and the two sidecars are joined by a line with a head at each end carrying a shield and padlock marked mTLS. From each sidecar a line rises to a shared run labelled "Request a workload certificate, with the pod service account token" and on into the Sentry pod. On the right the injector sits in its own pod: a run leaves its side, passes under the apps and reaches up into both sidecars, labelled "Inject the trust anchors", and another runs from it along the bottom of the picture and up the far left back to the secret, labelled "Read the root cert".',

  build() {
    return [
      // ---- the certs, and who may put them there ---------------------------
      icon({ name: 'kubernetes-color', x: STORE.x, y: STORE.y, size: STORE.size, fit: 'ink' }),
      // Above the mark: its other three sides each carry a line.
      label({ x: STORE.x, y: STORE.y - STORE.size / 2 - 18, text: 'Kubernetes Secret', size: TEXT }),

      // The Fluent person glyph rather than the hand-drawn person() shape, as
      // `agents-overview` draws its user: the glyph's ink scales with its size,
      // so it carries the weight of the marks around it. person() draws at the
      // shared 2.2 outline, which is visibly lighter beside a mark this size.
      icon({
        name: 'fluent-person', x: OPERATOR.x, y: OPERATOR.y, size: OPERATOR.size,
        color: C.navy, fit: 'ink', label: 'Operator', labelSize: TEXT,
      }),
      arrow({
        from: [OPERATOR.x, OPERATOR.y - OPERATOR.size / 2],
        to: [STORE.x, STORE.y + STORE.size / 2 + 2],
      }),
      // Against the arrow it describes, just above the operator who would do
      // it: bringing your own certs is what is optional, not the operator.
      label({
        x: 168, y: 238, size: SMALL,
        text: '(optional)\nBring your own root\nand issuer certs',
      }),

      // ---- Sentry, on the same line as the certs it signs with -------------
      pod({ ...SENTRY_POD, name: 'Pod', captionW: 56, size: TEXT }),
      serviceHex({ key: 'sentry', x: SENTRY_X, y: TOP_Y, r: SERVICE_R, role: true, wrap: true }),
      arrow({ from: [STORE.x + STORE.size / 2 + 2, TOP_Y], to: [SENTRY_POD.x - 2, TOP_Y] }),
      arrow({ from: [SENTRY_POD.x - 2, TOP_Y], to: [STORE.x + STORE.size / 2 + 2, TOP_Y] }),
      label({
        x: (STORE.x + STORE.size / 2 + SENTRY_POD.x) / 2, y: 124, size: TEXT,
        text: 'Read the existing root and\nissuer certs, or create\na self-signed root',
      }),

      // ---- the two apps, each in its own pod -------------------------------
      pod({
        x: A_CX - APP_POD.w / 2, y: ROW_Y - APP_POD.h / 2, ...APP_POD,
        name: 'Pod A', captionW: 70, size: TEXT,
      }),
      pod({
        x: B_CX - APP_POD.w / 2, y: ROW_Y - APP_POD.h / 2, ...APP_POD,
        name: 'Pod B', captionW: 70, captionX: POD_B_CAPTION, size: TEXT,
      }),
      appSidecar({ x: A.x, y: A.y, r: APP_R, size: APP_SIZE, label: 'App A', ...APP[0] }),
      appSidecar({ x: B.x, y: B.y, r: APP_R, size: APP_SIZE, label: 'App B', mirror: true, ...APP[1] }),
      arrow({ from: SIDE_A, to: SIDE_B }),
      arrow({ from: SIDE_B, to: SIDE_A }),
      secureLock({ x: LOCK.x, y: LOCK.y, size: LOCK.size }),
      label({ x: LOCK.x, y: LOCK.y + LOCK.size / 2 + 14, text: 'mTLS', size: TEXT }),

      // ---- what each sidecar asks Sentry for -------------------------------
      elbowArrow({
        points: [[A_OUT, CSR_Y], [CSR_A, CSR_Y], [CSR_A, CSR_BUS], [CSR_B, CSR_BUS]],
        heads: 'none',
      }),
      elbowArrow({
        points: [[B_OUT, CSR_Y], [CSR_B, CSR_Y], [CSR_B, TOP_Y], [SENTRY_POD.x + SENTRY_POD.w + 2, TOP_Y]],
      }),
      // Above the run it names rather than inside the loop: the loop's inside
      // is split in two by App A's own riser, and neither half is as wide as
      // the words.
      label({
        x: 560, y: 45, size: TEXT,
        text: 'Request a workload\ncertificate, with the pod\nservice account token',
      }),

      // ---- the injector, and what it hands the sidecars --------------------
      pod({ ...INJECTOR_POD, name: 'Pod', captionW: 56, size: TEXT }),
      serviceHex({ key: 'injector', x: INJECTOR_CX, y: INJECTOR_POD.y + INJECTOR_POD.h / 2 - 3.5, r: SERVICE_R }),
      elbowArrow({
        points: [
          [INJECTOR_CX - 30, INJECTOR_BOTTOM], [INJECTOR_CX - 30, TRUST_BUS],
          [SIDE_B.x, TRUST_BUS], [SIDE_B.x, SIDE_BOTTOM],
        ],
      }),
      elbowArrow({ points: [[SIDE_B.x, TRUST_BUS], [SIDE_A.x, TRUST_BUS], [SIDE_A.x, SIDE_BOTTOM]] }),
      label({
        x: (SIDE_A.x + INJECTOR_CX - 30) / 2, y: 464, size: TEXT,
        text: 'Inject the trust anchors\n(the root cert)',
      }),

      // Out of the bottom, along under the picture and up the outside: at the
      // secret's own height the way back is through both app pods.
      elbowArrow({
        points: [
          [INJECTOR_CX + 30, INJECTOR_BOTTOM], [INJECTOR_CX + 30, READ_ROW],
          [READ_COL, READ_ROW], [READ_COL, STORE.y], [STORE.x - STORE.size / 2 - 2, STORE.y],
        ],
      }),
      label({
        x: (READ_COL + INJECTOR_CX) / 2, y: READ_ROW - 18,
        text: 'Read the root cert', size: TEXT,
      }),
    ];
  },
};
