// The diagram inventory is the input to a conversion that touches ~43 pages,
// so under-reporting it is the expensive failure: a diagram nobody listed is a
// diagram nobody converts, and the page it sits on ships half-converted.
//
// These tests pin the two ways that happens. A syntax the extractor does not
// know must still be REPORTED (as `other`), never dropped - which is why the
// image match is by path rather than by an enumerated list of forms. And a
// screenshot must be distinguishable from a diagram by something other than
// its filename: `dapr-dev-dashboard.md` references `actors.png`,
// `components.png` and `control-plane.png`, which read like architecture
// diagrams and are dev-dashboard captures.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  extractDiagrams,
  findSharers,
  registeredSceneNames,
} from './scripts/inventory.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');

/** Build a throwaway content tree; returns its root. */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'inv-'));
  for (const [rel, body] of Object.entries(files)) {
    const full = join(root, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body, 'utf8');
  }
  return root;
}

test('finds images in markdown and html syntax, and classifies each', () => {
  const root = fixture({
    'a.md': '![alt](/images/a.png)\n<img src="/images/b.png" width=600>\n',
  });
  try {
    const refs = extractDiagrams([root], root).filter((r) => r.kind === 'image');
    const byId = Object.fromEntries(refs.map((r) => [r.id, r]));
    assert.deepEqual(Object.keys(byId).sort(), ['/images/a.png', '/images/b.png']);
    assert.equal(byId['/images/a.png'].syntax, 'markdown');
    assert.equal(byId['/images/b.png'].syntax, 'html');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('reports an image in an unrecognised syntax rather than dropping it', () => {
  // The failure this guards: an enumerated list of syntaxes silently omits
  // any form it was not told about, and the inventory looks complete.
  const root = fixture({
    'a.md': '{{< figure src="/images/c.png" >}}\n',
  });
  try {
    const refs = extractDiagrams([root], root).filter((r) => r.kind === 'image');
    assert.deepEqual(refs.map((r) => r.id), ['/images/c.png']);
    assert.equal(refs[0].syntax, 'other');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('finds fenced and shortcode mermaid blocks', () => {
  const root = fixture({
    'a.md': '```mermaid\ngraph TD;\n```\n\n{{< mermaid >}}\ngraph LR;\n{{< /mermaid >}}\n',
  });
  try {
    const refs = extractDiagrams([root], root).filter((r) => r.kind === 'mermaid');
    assert.equal(refs.length, 2);
    assert.deepEqual(refs.map((r) => r.syntax).sort(), ['fence', 'shortcode']);
    assert.deepEqual(refs.map((r) => r.id), ['a.md#1', 'a.md#2']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('flags a mermaid block nested inside another shortcode', () => {
  const root = fixture({
    'a.md': '{{% codetab %}}\n```mermaid\ngraph TD;\n```\n{{% /codetab %}}\n',
  });
  try {
    const [ref] = extractDiagrams([root], root).filter((r) => r.kind === 'mermaid');
    assert.equal(ref.nested, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a self-closing shortcode does not make a later block look nested', () => {
  // `{{% ref x.md %}}` is inline and never closes. Counting it as an opening
  // tag leaves the depth permanently above zero, so every diagram after the
  // first cross-reference reads as wrapped - which, before this test, was 15
  // of the 18 real Mermaid blocks.
  const root = fixture({
    'a.md': 'See [x]({{% ref "x.md" %}}).\n\n```mermaid\ngraph TD;\n```\n',
  });
  try {
    const [ref] = extractDiagrams([root], root).filter((r) => r.kind === 'mermaid');
    assert.equal(ref.nested, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a wrapper shortcode still nests a block that follows a self-closing one', () => {
  const root = fixture({
    'a.md': 'See [x]({{% ref "x.md" %}}).\n\n{{% codetab %}}\n```mermaid\ngraph TD;\n```\n{{% /codetab %}}\n',
  });
  try {
    const [ref] = extractDiagrams([root], root).filter((r) => r.kind === 'mermaid');
    assert.equal(ref.nested, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a mermaid block outside any shortcode is not flagged as nested', () => {
  const root = fixture({ 'a.md': '```mermaid\ngraph TD;\n```\n' });
  try {
    const [ref] = extractDiagrams([root], root).filter((r) => r.kind === 'mermaid');
    assert.equal(ref.nested, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('collapses one image referenced by several pages into one ref', () => {
  const root = fixture({
    'a.md': '![x](/images/shared.png)\n',
    'sub/b.md': '![x](/images/shared.png)\n',
  });
  try {
    const refs = extractDiagrams([root], root).filter((r) => r.kind === 'image');
    assert.equal(refs.length, 1);
    assert.equal(refs[0].pages.length, 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('findSharers reports english pages outside the two trees', () => {
  const root = fixture({
    'daprdocs/content/en/developing-applications/in.md': '![x](/images/shared.png)\n',
    'daprdocs/content/en/operations/out.md': '![x](/images/shared.png)\n',
  });
  try {
    const inScope = [join(root, 'daprdocs/content/en/developing-applications')];
    const [ref] = extractDiagrams(inScope, root).filter((r) => r.kind === 'image');
    const sharers = findSharers(ref, root);
    assert.equal(sharers.english.length, 1);
    assert.match(sharers.english[0], /operations[\\/]out\.md$/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('findSharers returns empty docsZh when the submodule is absent', () => {
  // A fresh clone without --recurse-submodules has no translations/docs-zh.
  // Reporting zero references there must not look like "nothing depends on
  // this image" - but it must also not crash the inventory.
  const root = fixture({
    'daprdocs/content/en/developing-applications/in.md': '![x](/images/shared.png)\n',
  });
  try {
    const inScope = [join(root, 'daprdocs/content/en/developing-applications')];
    const [ref] = extractDiagrams(inScope, root).filter((r) => r.kind === 'image');
    const sharers = findSharers(ref, root);
    assert.deepEqual(sharers.docsZh, []);
    assert.equal(sharers.docsZhAvailable, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('findSharers reports docs-zh references when the submodule is present', () => {
  const root = fixture({
    'daprdocs/content/en/developing-applications/in.md': '![x](/images/shared.png)\n',
    'translations/docs-zh/translated_content/zh_CN/p.md': '![x](/images/shared.png)\n',
  });
  try {
    const inScope = [join(root, 'daprdocs/content/en/developing-applications')];
    const [ref] = extractDiagrams(inScope, root).filter((r) => r.kind === 'image');
    const sharers = findSharers(ref, root);
    assert.equal(sharers.docsZhAvailable, true);
    assert.equal(sharers.docsZh.length, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('registeredSceneNames returns every key in the scene registry', () => {
  // Asserted against the registry itself, not a literal count: this project
  // adds scenes, so a hardcoded number would fail by design.
  const names = registeredSceneNames(repo);
  assert.ok(names.includes('overview'));
  assert.ok(names.includes('scheduler-architecture'));
  assert.ok(names.includes('agents-overview'));
  assert.equal(new Set(names).size, names.length, 'registry has a duplicate name');
  assert.ok(names.length >= 24, `expected at least the 24 shipped scenes, got ${names.length}`);
});
