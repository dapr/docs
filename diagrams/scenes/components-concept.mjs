// What a component is: the implementations a building block can be configured
// with. One column per block, the marks of some of its components beneath it.
//
// Replaces concepts-components.png on concepts/components-concept.md, under
// "The diagram below shows some examples of the components for each component
// type".
//
// ORDER. Two rows: the stable blocks in the source image's order, then the
// alpha ones on a row of their own beneath them. Fifteen columns on one line
// made every column too narrow to read; splitting on stable-against-alpha is
// the division the reader already cares about. The alpha tag comes from the
// catalogue in ../apis.mjs, so this page cannot disagree with the overview
// about which APIs are alpha, or about what any of them is called.
//
// Workflows and Jobs are not drawn. Neither takes a component: they are served
// by the Dapr runtime, so there is nothing swappable to show under them, and a
// column with nothing in it invites the reader to wonder what is missing.
//
// COMPONENTS. Each column lists the components the source image lists, mark
// for mark, capped at FOUR: a fifth is another example of the same point and
// makes the column taller than the block it hangs from. Only the three blocks
// the source does not have - Binary Store, Search and Vector, all added since
// it was drawn - are filled in from reference/components-reference/supported-*.
//
// Where this departs from the source image, and why:
//   - the app hexagon is APP[0], the solid Dapr green, as everywhere else -
//     which is the colour the source used too - and appSidecar() draws the
//     pair the way the hosting diagrams draw it, rather than the small docked
//     badge this scene used to carry.
//   - the names under each mark are gone, so the marks have to carry
//     themselves: each is sized by its DRAWN box rather than its viewBox
//     (fit: 'ink'), or a wordmark five units tall in a box thirty-three wide
//     would all but vanish beside a square glyph. The <desc> names every one.
//   - each mark sits on a plate. These are full-colour vendor marks, several
//     of them dark, and without a light backing they disappear on the dark
//     ground.
//   - the source's Workflow column is empty and its Jobs box holds the Dapr
//     mark. Neither has components to swap, so neither is drawn here.
//   - five marks the source has are not here, because no source we can use
//     publishes them: GCP Pub/Sub, GCP Secret Manager, OpenID Connect, OPA
//     and Sentinel. Their columns show the rest of the source's list.

import { APP, C, el } from '../engine.mjs';
import { arrow, group, hexHalfWidth, label, lineWidth, roundedPath } from '../shapes.mjs';
import { icon, plate } from '../icons.mjs';
import { apiTile } from '../apis.mjs';
import { appSidecar, sidecarAt, sidecarDx } from '../app.mjs';

const W = 900;
const H = 1140;

// ---- the app, and the bus its sidecar feeds ------------------------------
const APP_R = 49;
const APP_Y = 76;
const BUS_Y = 185;
// The alpha row hangs off the same bus, down a spine in the left margin: the
// blocks on it are APIs the application calls like any other.
const SPINE_X = 36;
const BUS_R = 14; // the radius every turn in the bus takes

// ---- the blocks ----------------------------------------------------------
// 88, not 96 * 0.9: at 86.4 the card's derived name falls to 10.8 and
// cards.mjs refuses it. 88 is the smallest card that still carries an 11px
// name, which is the floor for a label anywhere in this set.
const CARD = 88;
const EDGE = 72;
const CARD_Y = 266; // the stable row

// ---- the component marks under each block --------------------------------
const MARK = 32;
// 44 around a 32 mark: six units of backing each side, which is enough to
// keep a dark mark legible on the dark ground and six less than before,
// which is what lets the pitch come down.
const PLATE = 44;
const MARK_GAP = 30; // from the card's lower edge to the first mark's centre
// The two-line name sits BETWEEN the plates with five units clear of each:
// half a plate, the gap, the name, the gap, half the next plate.
const MARK_PITCH = 78;
const NAME_DY = PLATE / 2 + 17; // the name's centre, clear of its plate
// The marks are at 80% of what they were; 12 * 0.8 is 9.6, and MIN_LABEL is
// the floor, so the names sit on it.
const NAME_SIZE = 10;
const markTop = (cardY) => cardY + CARD / 2 + MARK_GAP;
const markBottom = (cardY, count) => markTop(cardY) + (count - 1) * MARK_PITCH + NAME_DY + NAME_SIZE * 1.2;

// [api key, the marks of its components]. The lists are the source image's,
// except for the last three blocks, which the source predates.
const STABLE = [
  ['state', [['aws-dynamodb', 'AWS\nDynamoDB'], ['azure-cosmos-db', 'Azure\nCosmos DB'], ['firebase', 'GCP Firebase'], ['redis-color', 'Redis']]],
  ['pubsub', [['aws-sqs', 'AWS SQS'], ['azure-service-bus', 'Azure\nService Bus'], ['redis-color', 'Redis'], ['rabbitmq', 'RabbitMQ']]],
  ['bindings', [['aws-s3', 'AWS S3'], ['azure-storage', 'Azure Storage'], ['gcp-cloud-storage', 'GCP\nCloud Storage'], ['kafka', 'Kafka']]],
  ['secrets', [['aws-secrets-manager', 'AWS Secrets\nManager'], ['azure-key-vault', 'Azure\nKey Vault'], ['kubernetes-color', 'Kubernetes\nSecrets'], ['vault', 'HashiCorp\nVault']]],
  ['actors', [['aws-dynamodb', 'AWS\nDynamoDB'], ['azure-cosmos-db', 'Azure\nCosmos DB'], ['redis-color', 'Redis'], ['postgresql', 'Postgres']]],
  ['configuration', [['redis-color', 'Redis'], ['azure-app-configuration', 'Azure App\nConfiguration'], ['postgresql', 'Postgres']]],
  ['middleware', [['oauth', 'OAuth2'], ['openid', 'OpenID\nConnect'], ['opa', 'OPA'], ['webassembly', 'Wasm']]],
];

const ALPHA = [
  ['distributed-lock', [['redis-color', 'Redis']]],
  ['cryptography', [['azure-key-vault', 'Azure\nKey Vault'], ['kubernetes-color', 'Kubernetes\nSecrets'], ['fluent-key-multiple', 'JSON Web\nKey Sets'], ['fluent-document-multiple', 'Local files']]],
  ['conversation', [['anthropic', 'Anthropic'], ['aws-bedrock', 'AWS Bedrock'], ['mistral-ai', 'Mistral'], ['openai', 'OpenAI']]],
  ['binary-store', [['aws-s3', 'AWS S3'], ['azure-storage', 'Azure\nBlob Storage'], ['gcp-cloud-storage', 'GCP\nCloud Storage']]],
  ['search', [['meilisearch', 'Meilisearch']]],
  ['vector', [['meilisearch', 'Meilisearch']]],
];

// The two generic glyphs stand for things with no vendor behind them, so they
// are tinted rather than plated like a brand mark.
const GENERIC = new Set(['fluent-key-multiple', 'fluent-document-multiple']);

// One set of column centres, shared by both rows, so the two rows are a grid
// rather than two separate drawings. The alpha row uses the first six.
//
// Laid out by PITCH from a left edge rather than with slots(), which spreads
// centres across the whole canvas and so leaves half a pitch of margin at each
// end - 95 units here, which is not air anyone chose.
const PITCH = CARD + 30;
const GRID_L = EDGE + CARD / 2; // the first column's centre
const colX = Array.from({ length: STABLE.length }, (_, i) => GRID_L + i * PITCH);
// The SIDECAR is what calls the components, so it is what sits over the middle
// of the row and what the line down to the bus leaves from. appSidecar() hangs
// the sidecar off the app's right side, so the app is that far to the left.
const APP_SIZE = 15;
const ROW_X = (colX[0] + colX[STABLE.length - 1]) / 2;
const APP_X = ROW_X - sidecarDx(APP_R);
const SIDE = sidecarAt({ x: APP_X, y: APP_Y, r: APP_R, size: APP_SIZE });
const stableDeep = Math.max(...STABLE.map(([, m]) => m.length));
const ALPHA_CARD_Y = markBottom(CARD_Y, stableDeep) + 56 + CARD / 2;
const ALPHA_BUS_Y = ALPHA_CARD_Y - CARD / 2 - 44;

export default {
  width: W,
  height: H,
  title: 'Building blocks and some of the components that implement them',
  desc:
    'An application with a Dapr sidecar at the top feeds a horizontal line, and from that line an arrow drops to each of fifteen building blocks. The stable blocks come first: state management, publish and subscribe, bindings, secrets, actors, configuration, workflows, jobs and middleware. The alpha blocks follow on the right: distributed lock, cryptography, conversation, binary store, search and vector. Under each block are the marks of some of the components it can be configured with. State management shows AWS DynamoDB, Azure Cosmos DB, Google Firebase and Redis. Publish and subscribe shows AWS SQS, Azure Service Bus, Redis and RabbitMQ. Bindings shows AWS S3, Azure Storage, Google Cloud Storage and Apache Kafka. Secrets shows AWS Secrets Manager, Azure Key Vault, Kubernetes secrets and HashiCorp Vault. Actors shows AWS DynamoDB, Azure Cosmos DB, Redis and PostgreSQL. Configuration shows Redis, Azure App Configuration and PostgreSQL. Workflows has no components of its own: it is served by the Dapr runtime. Jobs shows the Dapr mark for the same reason. Middleware shows OAuth2, OpenID Connect, Open Policy Agent and WebAssembly. Distributed lock shows Redis. Cryptography shows Azure Key Vault, Kubernetes secrets, JSON Web Key Sets and local files. Conversation shows Anthropic, AWS Bedrock, Mistral and OpenAI. Binary store shows AWS S3, Azure Storage and Google Cloud Storage. Search and vector each show Meilisearch. These are examples, not the full list.',

  build() {
    return [
      // ---- the application that calls them ------------------------------
      appSidecar({ x: APP_X, y: APP_Y, r: APP_R, label: 'App', size: APP_SIZE, ...APP[0] }),

      // One bus per row rather than a line per block: the drops are all the
      // same length and the middle of the canvas stays open. The alpha row
      // hangs off the same bus, down a spine in the left margin.
      el('polyline', {
        // Starts ON the sidecar's lower point, so the line reads as leaving the
// sidecar rather than floating below it.
        points: `${SIDE.x} ${SIDE.y + SIDE.r} ${SIDE.x} ${BUS_Y}`,
        fill: 'none',
        stroke: C.navy,
        'stroke-width': lineWidth(),
      }),
      // One run: along the stable row, down the spine, along the alpha row.
      // Drawn as a single path so both turns are rounded and the two rows are
      // visibly the same line rather than two that happen to meet.
      roundedPath({
        points: [
          // Each row's far end turns DOWN into its last block, so the run ends
          // in a curve rather than square against the arrow that drops there.
          [colX[STABLE.length - 1], BUS_Y + BUS_R],
          [colX[STABLE.length - 1], BUS_Y],
          [SPINE_X, BUS_Y],
          [SPINE_X, ALPHA_BUS_Y],
          [colX[ALPHA.length - 1], ALPHA_BUS_Y],
          [colX[ALPHA.length - 1], ALPHA_BUS_Y + BUS_R],
        ],
        r: BUS_R,
      }),

      [[STABLE, CARD_Y], [ALPHA, ALPHA_CARD_Y]].map(([blocks, cardY]) =>
        blocks.map(([key, marks], i) => {
          const x = colX[i];
          const busY = cardY === CARD_Y ? BUS_Y : ALPHA_BUS_Y;
          return group([
            arrow({
              from: [x, i === blocks.length - 1 ? busY + BUS_R : busY],
              to: { x, y: cardY, w: CARD, h: CARD },
            }),
            // Every block on a row here is tagged or none is, so dropping the
            // glyph on the tagged ones cannot misalign a row.
            apiTile({ key, wrap: true, x, y: cardY, w: CARD, h: CARD, tagPush: 8 }),
            marks.map(([mark, name], j) => {
              const y = markTop(cardY) + j * MARK_PITCH;
              const generic = GENERIC.has(mark);
              return group([
                generic ? null : plate({ x, y, w: PLATE, h: PLATE }),
                icon({
                  name: mark,
                  x,
                  y,
                  size: MARK,
                  fit: 'ink',
                  // A plated mark takes PLATE ink, not body ink. icon()
                  // ignores colour on a full-colour mark, but a single-colour
                  // one - Anthropic and OpenAI are both black wordless symbols
                  // - would otherwise be tinted with the body colour, which is
                  // light in the dark theme and so invisible on a light plate.
                  color: generic ? C.navy : C.plateInk,
                }),
                // The name sits BELOW the plate, so it is ordinary body ink
                // rather than plate ink even for the plated marks.
                label({ x, y: y + NAME_DY, text: name, size: NAME_SIZE }),
              ]);
            }),
          ]);
        }),
      ),

      // The prose above the diagram says "some examples"; so does the diagram.
      label({
        x: W / 2,
        y: H - 26,
        text: 'Some of the components for each building block API. See the component reference for the full list.',
        size: 13,
      }),
    ];
  },
};
