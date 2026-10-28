// The Dapr API catalogue: one definition per API, shared by every scene.
//
// A "Dapr API block" is the same thing everywhere it appears - a rounded
// square, a Fluent mark, and the API's name, in blue, with `alpha` in the
// corner where that applies. Before this module each scene re-declared the
// mark and the name it used, and they had already drifted: the overview drew
// sixteen tiles while the building-blocks page listed fifteen. A scene now
// NAMES an API and gets the agreed drawing, so the same API cannot be called
// two things or drawn with two different glyphs on two pages.
//
// The set and its order are the website's, and the alpha tags are from
// operations/support/alpha-beta-apis.md. Adding an API is a change here, once.
//
// Two forms of the name are kept, not one. `name` is the one-line form, for a
// wide tile or a row; `wrap` is the agreed break for a narrow tile. Keeping
// the break here rather than in each scene is the point: a line break chosen
// per call is a line break that differs per page, and the test asserts the two
// forms are the same words.

import { card } from './cards.mjs';

// The card itself - the placement, and the mark and name sizes derived from
// it - lives in ./cards.mjs, because a Dapr API block and a Dapr Agents
// capability are the same drawing with different content. This module is the
// content: which APIs there are, what each is called, and which mark stands
// for it.
//
// These are re-exported so a scene that reasons about block sizes has one
// place to read them from.
export { CARD_W as TILE_W, CARD_GLYPH as TILE_GLYPH, STACKED_LABEL as TILE_LABEL, INLINE_LABEL } from './cards.mjs';

const entry = (key, mark, name, wrap = name, tag = '') => ({ key, mark, name, wrap, tag });

export const APIS = [
  entry('workflows', 'flowchart', 'Workflows'),
  entry('pubsub', 'mail-copy', 'Publish & subscribe', 'Publish &\nsubscribe'),
  entry('service-invocation', 'arrow-step-in-right', 'Service invocation', 'Service\ninvocation'),
  entry('state', 'database', 'State management', 'State\nmanagement'),
  entry('actors', 'people-team', 'Actors'),
  entry('jobs', 'clock', 'Jobs'),
  entry('configuration', 'settings-cog-multiple', 'Configuration'),
  entry('secrets', 'key', 'Secrets'),
  entry('bindings', 'plug-disconnected', 'Bindings'),
  entry('middleware', 'arrow-move', 'Middleware'),
  entry('cryptography', 'lock-closed-key', 'Cryptography', 'Cryptography', 'alpha'),
  entry('distributed-lock', 'table-lock', 'Distributed lock', 'Distributed\nlock', 'alpha'),
  entry('conversation', 'chat', 'Conversation', 'Conversation', 'alpha'),
  entry('binary-store', 'cloud-archive', 'Binary Store', 'Binary Store', 'alpha'),
  entry('search', 'document-search', 'Search', 'Search', 'alpha'),
  entry('vector', 'data-scatter', 'Vector', 'Vector', 'alpha'),
];

// Not APIs you call: the three concerns every API gets. They are drawn as
// blocks because they are peers of the APIs on the overview, not a footnote.
export const CROSS_CUTTING = [
  entry('observability', 'heart-pulse', 'Observability'),
  entry('security', 'shield-lock', 'Security'),
  entry('resiliency', 'arrow-clockwise', 'Resiliency'),
];

const BY_KEY = new Map([...APIS, ...CROSS_CUTTING].map((a) => [a.key, a]));

// Refuses rather than guesses: a typo that fell through would draw a tile with
// no mark and the word "undefined" on it, which a layout test cannot see.
export function api(key) {
  const found = BY_KEY.get(key);
  if (!found) {
    throw new Error(`api(): "${key}" is not in the API catalogue. Known: ${[...BY_KEY.keys()].join(', ')}`);
  }
  return found;
}

// The block itself: the catalogue's mark, name and tag, drawn as a card.
export function apiTile({ key, wrap = false, ...rest }) {
  const a = api(key);
  return card({ mark: `fluent-${a.mark}`, name: wrap ? a.wrap : a.name, tag: a.tag, ...rest });
}
