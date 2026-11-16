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
// THE ARRANGEMENT is the self-hosted one with a third row. One row across the
// middle holds the certs and both app and sidecar pairs, with the operator
// beside the secret they may fill; Sentry is centred over the apps; and the
// injector, which this story has and the other does not, takes the row under
// them, where the other scene puts its operator. So the column between the two
// apps carries everything that passes between an app and a control plane
// service: the requests up it, the trust anchors up it from below.
//
// The canvas is TALLER than the self-hosted one for one reason: three rows of
// pods instead of one row of bare shapes. A pod is its contents plus a name on
// its border plus the air around both, so each row costs about 60 units more
// than the same row undrawn.
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
//     names nothing and points at nothing; the secret is drawn with Kubernetes'
//     own Secret mark, and the page says which mode this is.
//   - the lines run on the axes with rounded elbows, like the rest of the set.

import { C, APP } from '../engine.mjs';
import { arrow, captionReach, elbowArrow, hexHalfWidth, label, pod, secureLock } from '../shapes.mjs';
import { icon } from '../icons.mjs';
import { appSidecar, appSidecarCentre, pairExtent, sidecarAt } from '../app.mjs';
import { serviceHex } from '../services.mjs';

const W = 1050;
const H = 648;

const TEXT = 13;
const SMALL = 12;

// ---- the middle row ---------------------------------------------------------
const ROW_Y = 362; // the PAIRS' centre, which is not the app hexagons' line
const APP_R = 48;
const APP_SIZE = 16;
const SERVICE_R = 32;
const A_CX = 530;
const B_CX = 870;
const MID = (A_CX + B_CX) / 2;

// App B is mirrored so its sidecar faces inward; without that the mTLS line
// would have to cross App B to reach it.
const A = appSidecarCentre({ x: A_CX, y: ROW_Y, r: APP_R, size: APP_SIZE });
const B = appSidecarCentre({ x: B_CX, y: ROW_Y, r: APP_R, size: APP_SIZE, mirror: true });
const SIDE_A = sidecarAt({ x: A.x, y: A.y, r: APP_R, size: APP_SIZE });
const SIDE_B = sidecarAt({ x: B.x, y: B.y, r: APP_R, size: APP_SIZE, mirror: true });
const SIDE_HALF = hexHalfWidth(SIDE_A.r);

// A Fluent glyph draws 16 units across in a 20-unit-tall ink box; the
// Kubernetes Secret mark is all but square, 18.035 by 17.5. `fit: 'ink'` fits
// the drawn box, so neither mark is `size` in both directions and a line
// meeting one edge-on has to stop at the edge it actually has.
const fluentHalfW = (size) => +(size * 0.4).toFixed(2);

// The certs sit on the app HEXAGONS' line, with the operator beside them: the
// one thing a person does here is put their own certs in that secret, so they
// stand next to it rather than anywhere near the apps.
const OPERATOR = { x: 130, y: A.y, size: 46 };
const STORE = { x: 265, y: A.y, size: 48 };
const STORE_HALF_W = STORE.size / 2;
const STORE_HALF_H = +((STORE.size * 17.5) / 18.035 / 2).toFixed(2);
// icon() hangs a name this far under the mark's centre. The injector's read
// ends on the underside of that name, so the scene needs its lower edge.
const STORE_LABEL_DY = STORE.size / 2 + 14;
const STORE_LABEL_BOTTOM = +(STORE.y + STORE_LABEL_DY + TEXT * 0.6).toFixed(2);

// ---- the pods ---------------------------------------------------------------
// Each app pod holds its pair with the house clearance. The service pods are
// the ones `hosting-kubernetes` draws, at the same width.
// EVERY pod is padded from the caption pill, not from the border. The pill is
// centred ON the top edge, so half of it hangs into the box, directly over
// whatever stands at the top of the contents - here the app hexagon's own top
// node. Shrinking a pod takes this clearance first and nothing else moves, so
// it is derived rather than chosen: the first version of this scene cut the
// app pods to 156 and put both hexagons through their own names.
const POD_CLEAR = 9;
const POD_PAD = captionReach() + POD_CLEAR;
const PAIR = pairExtent({ r: APP_R, size: APP_SIZE });
const APP_POD = { w: 152, h: +(PAIR.bottom - PAIR.top + POD_PAD * 2).toFixed(2) };
const SERVICE_POD_W = 148;
const POD_X = MID - SERVICE_POD_W / 2;

// Sentry's pod is the taller of the two: it carries the role line under the
// name. A caption pill sits ON the top edge, so its own top is 13 lower than
// it looks, which is what sets the margin above it.
const SENTRY_POD = { x: POD_X, y: 28, w: SERVICE_POD_W, h: 158 };
const SENTRY_Y = SENTRY_POD.y + POD_PAD + SERVICE_R;
const SENTRY_BOTTOM = SENTRY_POD.y + SENTRY_POD.h;

// Pod B's caption sits at ITS right end: at the left end it would be where the
// certificate request leaves the sidecar below it.
const POD_B_CAPTION = B_CX + APP_POD.w / 2 - 20 - 35;

// ---- the certificate requests -----------------------------------------------
// Each request leaves its sidecar at the upper node facing the middle and runs
// sideways before it turns up: straight up from that node would lie along the
// vertical edge below it, and the sidecar's top node is under the app hexagon.
// The two risers meet between the apps and go up as one arrow into the bottom
// of Sentry's pod.
const CSR_Y = SIDE_A.y - 18;
const A_OUT = +(SIDE_A.x + SIDE_HALF).toFixed(2);
const B_OUT = +(SIDE_B.x - SIDE_HALF).toFixed(2);
const SIDE_BOTTOM = +(SIDE_A.y + SIDE_A.r + 2).toFixed(2);

const CSR_IN = 60; // how far either side of the trunk the risers stand
const CSR_A = MID - CSR_IN;
const CSR_B = MID + CSR_IN;
const CSR_BUS = 252; // where they meet: clear of both app pods and the lock

// Above the arrow it marks and below the merge, in the gap between the two
// risers - the only column at this height carrying nothing else.
const LOCK = { x: MID, y: 340, size: 38 };

// ---- the injector, a row below the apps -------------------------------------
// Its pod is only as tall as the hexagon and the name: it has no role line, so
// giving it Sentry's height would be drawing a box around air.
const TRUST_BUS = 474; // the fork that feeds both sidecars, below their pods
const INJECTOR_POD = { x: POD_X, y: 502, w: SERVICE_POD_W, h: 120 };
const INJECTOR_Y = INJECTOR_POD.y + POD_PAD + SERVICE_R;
// The anchors leave the pod's top edge to the RIGHT of centre: the caption
// pill sits on that edge over the middle of it.
const INJECTOR_FEED = MID + 30;

export default {
  width: W,
  height: H,
  title: 'Sentry issuing workload certificates on Kubernetes',
  desc:
    'On the left of the middle row, an operator figure stands beside a Kubernetes Secret holding the certs, with an arrow from the operator into the secret marked optional, because the operator may bring existing root and issuer certs. A line with a head at each end leaves the secret\'s top, runs up and along to Sentry, the Dapr certificate authority, which stands in a pod of its own above the middle of the picture, and is labelled "Read the existing root and issuer certs, or create a self-signed root". To the right of the secret and on the same line, App A and App B each run beside a Dapr sidecar in a pod of their own, and the two sidecars are joined by a line with a head at each end carrying a shield and padlock marked mTLS. A line leaves each sidecar on the side facing the other and rises between the two app pods, where the pair merge into one arrow into the bottom of Sentry\'s pod, labelled "Request a workload certificate, with the pod service account token". A row below the apps, the injector stands in a pod of its own between them. One run leaves its top and forks into both sidecars, labelled "Inject the trust anchors (the root cert)"; another leaves its side, passes under the apps and reaches the secret, labelled "Read the root cert".',

  build() {
    return [
      // ---- the certs, and who may put them there ---------------------------
      // The Fluent person glyph, not a drawn shape, as `agents-overview` draws
      // its user: the glyph's ink scales with its size, so it carries the
      // weight of the marks around it. A builder that draws its own outline
      // holds the shared 2.2, which is lighter beside a mark this size.
      icon({
        name: 'fluent-person', x: OPERATOR.x, y: OPERATOR.y, size: OPERATOR.size,
        color: C.navy, fit: 'ink', label: 'Operator', labelSize: TEXT,
      }),
      // Kubernetes' own Secret mark, not the helm: the helm says "Kubernetes",
      // and what is drawn here is one kind of object in it.
      icon({
        name: 'kubernetes-secret', x: STORE.x, y: STORE.y, size: STORE.size,
        fit: 'ink', label: 'Kubernetes Secret', labelSize: TEXT,
      }),
      arrow({
        from: [OPERATOR.x + fluentHalfW(OPERATOR.size) + 2, OPERATOR.y],
        to: [STORE.x - STORE_HALF_W - 2, STORE.y],
      }),
      // Above the arrow it describes and above both marks, which leave it no
      // room beside them: bringing your own certs is what is optional, not the
      // operator.
      label({
        x: 195, y: 286, size: SMALL,
        text: '(optional)\nBring your own root\nand issuer certs',
      }),

      // ---- Sentry, over the apps it serves ---------------------------------
      // Both ways, because Sentry does one or the other: it reads what is
      // already there, or it writes a root of its own.
      elbowArrow({
        points: [
          [STORE.x, STORE.y - STORE_HALF_H - 2],
          [STORE.x, SENTRY_Y],
          [SENTRY_POD.x - 2, SENTRY_Y],
        ],
        heads: 'both',
      }),
      label({
        x: 430, y: 121, size: TEXT,
        text: 'Read the existing root and\nissuer certs, or create\na self-signed root',
      }),
      pod({ ...SENTRY_POD, name: 'Pod', captionW: 56, size: TEXT }),
      // The name goes under the hexagon as everywhere else: the merged request
      // stops at the POD's edge, which is well below it.
      serviceHex({ key: 'sentry', x: MID, y: SENTRY_Y, r: SERVICE_R, role: true, wrap: true }),

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
      elbowArrow({ points: [[A_OUT, SIDE_A.y], [B_OUT, SIDE_B.y]], heads: 'both' }),
      secureLock({ x: LOCK.x, y: LOCK.y, size: LOCK.size }),
      label({ x: LOCK.x, y: LOCK.y + 34, text: 'mTLS', size: TEXT }),

      // ---- what each sidecar asks Sentry for -------------------------------
      // Two feeders into one junction and one trunk out of it: the feeders
      // carry no head, because the traffic arrives where the trunk ends.
      elbowArrow({
        points: [[A_OUT, CSR_Y], [CSR_A, CSR_Y], [CSR_A, CSR_BUS], [MID, CSR_BUS]],
        heads: 'none',
      }),
      elbowArrow({
        points: [[B_OUT, CSR_Y], [CSR_B, CSR_Y], [CSR_B, CSR_BUS], [MID, CSR_BUS]],
        heads: 'none',
      }),
      elbowArrow({ points: [[MID, CSR_BUS], [MID, SENTRY_BOTTOM + 2]] }),
      // To the right of the trunk, in the band between Sentry's pod and the
      // app pods: the trunk is the only thing in that column.
      label({
        x: 820, y: 219, size: TEXT,
        text: 'Request a workload\ncertificate, with the pod\nservice account token',
      }),

      // ---- the injector, and what it hands the sidecars --------------------
      pod({ ...INJECTOR_POD, name: 'Pod', captionW: 56, size: TEXT }),
      serviceHex({ key: 'injector', x: MID, y: INJECTOR_Y, r: SERVICE_R }),
      elbowArrow({
        points: [
          [INJECTOR_FEED, INJECTOR_POD.y - 2], [INJECTOR_FEED, TRUST_BUS],
          [SIDE_A.x, TRUST_BUS], [SIDE_A.x, SIDE_BOTTOM],
        ],
      }),
      elbowArrow({ points: [[INJECTOR_FEED, TRUST_BUS], [SIDE_B.x, TRUST_BUS], [SIDE_B.x, SIDE_BOTTOM]] }),
      // Under the fork's RIGHT branch, on the far side of the pod from the run
      // to the secret. Left of the pod it sat over that run instead and read
      // as its label; there is nothing on this side but the branch above it.
      label({
        x: 865, y: 508, size: TEXT,
        text: 'Inject the trust anchors\n(the root cert)',
      }),

      // Sideways out of the pod, back under the apps and up the secret's own
      // column into the underside of its name.
      elbowArrow({
        points: [
          [INJECTOR_POD.x - 2, INJECTOR_Y],
          [STORE.x, INJECTOR_Y],
          [STORE.x, STORE_LABEL_BOTTOM + 4],
        ],
      }),
      label({
        x: 430, y: 574, size: TEXT,
        text: 'Read the root cert',
      }),
    ];
  },
};
