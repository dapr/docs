// Dapr on Kubernetes, with the person who deploys and manages it.
//
// Replaces security-mTLS-dapr-system-services.png on
// concepts/security-concept.md ("mTLS to system services in Kubernetes").
//
// It IS `hosting-kubernetes`, drawn from that scene's own parts rather than
// from a copy of them, with one thing added: the operator standing over the
// cluster. That is the only difference between the two source images as well -
// security-mTLS-dapr-system-services.png is overview-kubernetes.png with the
// operator on top - so the two scenes stay one picture here, and a change to
// the cluster reaches both.
//
// Where this departs from the source image, and why:
//   - the operator stands over the MIDDLE of the control plane row. The source
//     puts the figure above the Operator pod, which is the Dapr Operator
//     SERVICE - a different thing with the same name - and a person captioned
//     "Operator" directly over it reads as that service's label. Deploying
//     Dapr is not something done to one service, so the arrow comes down on
//     the cluster's own border, over the row as a whole.
//   - the name and the line under it sit BESIDE the figure, as the source has
//     them, rather than under it as the rest of the set labels a mark: above
//     a region this wide, a centred stack would push the canvas taller for a
//     caption that is already clear of everything.
//
// NOTE, for whoever picks this up next: the section this sits in says the
// diagram "shows secure communication between the Dapr sidecar and the Dapr
// Sentry (Certificate Authority), Placement (actor placement), and the
// Kubernetes Operator system services". This picture, like the PNG it
// replaces, shows all FIVE services and does not mark any of the runs as
// secured. The words and the picture disagree in the source; drawing the
// three secured runs instead is a different diagram, and a decision for a
// maintainer rather than for whoever converts the image.

import { C, el } from '../engine.mjs';
import { arrow, label } from '../shapes.mjs';
import { icon } from '../icons.mjs';
import hostingKubernetes, { CLUSTER_SIZE, CLUSTER_TOP, POD_ROW_CX, clusterParts } from './hosting-kubernetes.mjs';

const TEXT = 13;

// The band above the cluster that the operator stands in, and the width that
// keeps the whole thing inside the 16:9 floor once it is that much taller.
// `hosting-kubernetes` is already only just inside it, so the room for the
// figure is paid for across as well as down.
const BAND = 70;
const W = 1320;
const H = CLUSTER_SIZE.h + BAND;

// The cluster, centred in the wider canvas and dropped by the band.
const DX = +((W - CLUSTER_SIZE.w) / 2).toFixed(2);
const DY = BAND;

const OPERATOR = { x: POD_ROW_CX + DX, y: 36, size: 40 };
// A Fluent glyph draws 16 units across in a 20-unit-tall ink box, so `fit:
// 'ink'` at `size` puts `size` on the page vertically and four fifths of it
// horizontally.
const INK_HALF_W = +(OPERATOR.size * 0.4).toFixed(2);
const NAME_X = +(OPERATOR.x + INK_HALF_W + 12).toFixed(2);
const LH = TEXT * 1.2; // the two lines straddle the figure's own centre

export default {
  width: W,
  height: H,
  title: 'The operator deploying and managing Dapr on Kubernetes',
  desc:
    `An operator figure stands above the cluster, named Operator and described as deploying and managing Dapr, with an arrow running down from it onto the cluster's border. ${hostingKubernetes.desc}`,

  build() {
    return [
      icon({
        name: 'fluent-person', x: OPERATOR.x, y: OPERATOR.y, size: OPERATOR.size,
        color: C.navy, fit: 'ink',
      }),
      label({
        x: NAME_X, y: OPERATOR.y - LH / 2, text: 'Operator', size: TEXT, anchor: 'start',
      }),
      label({
        x: NAME_X, y: OPERATOR.y + LH / 2, text: 'Deploys and manages Dapr',
        size: TEXT, color: C.blue, anchor: 'start',
      }),
      // Onto the cluster's border, not into a pod: what is deployed and
      // managed is Dapr, not one of the five services inside it.
      arrow({
        from: [OPERATOR.x, OPERATOR.y + OPERATOR.size / 2 + 2],
        to: [OPERATOR.x, CLUSTER_TOP + DY - 2],
      }),

      el('g', { transform: `translate(${DX} ${DY})` }, clusterParts()),
    ];
  },
};
