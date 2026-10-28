// The building block APIs, one card each, shown on both overview.md and
// concepts/building-blocks-concept.md from this one source.
//
// It replaces building_blocks.png, which drew twelve cards in a 6x2 grid. The
// page's own table lists FIFTEEN building blocks, so the image had fallen three
// behind it: Binary store, Search and Vector were missing. Drawing fifteen is
// what makes the diagram agree with the table directly beneath it, and it is
// why this is a 5x3 grid rather than the source's 6x2.
//
// Names, order and glyphs match the overview scene deliberately: both diagrams
// appear on overview.md, so "Service invocation" in one and "Service
// Invocation" in the other would read as two different products. The six alpha
// APIs are tagged and grouped at the end, as they are there.
//
// Middleware is NOT here. It is drawn in the overview scene to match the API
// set shown on the project homepage, but it is not a building block and has no
// row in this page's table, so including it would reintroduce the mismatch this
// scene exists to remove.
//
// Where this departs from the source image, and why:
//   - card descriptions are body ink, not the source's light blue. Sky text on
//     the light ground measures 2.56:1, well under the 4.5:1 text threshold,
//     and it would be worse in dark mode. The sky accent stays in the glyph and
//     the card outline, which is where it carries no reading load.

import { C } from '../engine.mjs';
import { slots, tile } from '../shapes.mjs';
import { icon } from '../icons.mjs';

const W = 1200;
const H = 672;

const COLS = 5;
const ROWS = 3;
const PX = 16; // side margin
const CARD_W = 217;
const CARD_H = 200; // the four-line card (Bindings) ends about 17px above the base
const GAP = 20;

const GRID_TOP = 16; // top of the first row
const GLYPH = 40;
const TITLE = 16;
const DESC = 13;

// [glyph, title, description, alpha]. The description lines are broken by hand:
// the card is 217 wide, which is about 26 characters at 13px, and where a line
// breaks is a layout decision rather than something to compute at render time.
const BLOCKS = [
  ['flowchart', 'Workflows', 'Automate and orchestrate\ntasks within your\napplication'],
  ['mail-copy', 'Publish & subscribe', 'Secure, scalable messaging\nbetween services'],
  ['arrow-step-in-right', 'Service invocation', 'Perform direct, secure\nservice-to-service\nmethod calls'],
  ['database', 'State management', 'Create long running,\nstateless and stateful\nservices'],
  ['people-team', 'Actors', 'Encapsulate code and data\nin reusable actor objects'],
  ['clock', 'Jobs', 'Scheduled tasks to run\nat specified intervals\nor times'],
  ['settings-cog-multiple', 'Configuration', 'Access application\nconfiguration and be\nnotified of updates'],
  ['key', 'Secrets', 'Securely access secrets\nfrom your application'],
  ['plug-disconnected', 'Bindings', 'Input and output bindings\nto external resources,\nincluding databases\nand queues'],
  ['lock-closed-key', 'Cryptography', 'Perform operations for\nencrypting and\ndecrypting data', 'alpha'],
  ['table-lock', 'Distributed lock', 'Mutually exclusive access\nto shared resources', 'alpha'],
  ['chat', 'Conversation', 'Converse between different\nlarge language models', 'alpha'],
  ['cloud-archive', 'Binary Store', 'Store, retrieve and delete\nbinary files using\npluggable components', 'alpha'],
  ['document-search', 'Search', 'Index, retrieve and query\nJSON documents in\nfull-text search engines', 'alpha'],
  ['data-scatter', 'Vector', 'Store vectors and run\nsimilarity queries against\nvector databases', 'alpha'],
];

export default {
  width: W,
  height: H,
  title: 'The Dapr building block APIs',
  desc:
    'Fifteen cards, five across and three down, one for each Dapr building block API. Workflows automate and orchestrate tasks within your application. Publish and subscribe provides secure, scalable messaging between services. Service invocation performs direct, secure, service to service method calls. State management creates long running, stateless and stateful services. Actors encapsulate code and data in reusable actor objects. Jobs schedules tasks to run at specified intervals or times. Configuration accesses application configuration and is notified of updates. Secrets securely accesses secrets from your application. Bindings provides input and output bindings to external resources, including databases and queues. Six more are in alpha: cryptography performs operations for encrypting and decrypting data, distributed lock gives mutually exclusive access to shared resources, conversation converses between different large language models, binary store stores, retrieves and deletes binary files, search indexes and queries JSON documents, and vector stores vectors and runs similarity queries.',

  build() {
    const colX = slots(PX, W - PX, COLS);

    return BLOCKS.map(([mark, name, desc, tag], i) => {
      const row = Math.floor(i / COLS);
      return tile({
        x: colX[i % COLS],
        y: GRID_TOP + row * (CARD_H + GAP) + CARD_H / 2,
        w: CARD_W,
        h: CARD_H,
        color: C.blue,
        icon: (cx, cy) => icon({ name: `fluent-${mark}`, x: cx, y: cy, size: GLYPH, color: C.blue }),
        label: name,
        labelSize: TITLE,
        desc,
        descSize: DESC,
        tag: tag ?? '',
      });
    });
  },
};
