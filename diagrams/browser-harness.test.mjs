import test from 'node:test';
import assert from 'node:assert/strict';
import { FACES, fontCss, harnessHtml } from './browser-harness.mjs';

test('fontCss declares every face in FACES', () => {
  assert.equal(FACES.length, 9);
  assert.equal(fontCss.match(/@font-face/g).length, FACES.length);
  for (const [family, weight, file] of FACES) {
    assert.ok(
      fontCss.includes(`font-family:"${family}";font-weight:${weight};font-display:block;src:url("/fonts/${file}")`),
      `${family} ${weight} should be served from /fonts/${file}`,
    );
  }
});

test('harnessHtml sets the three font variables and the body face', () => {
  const html = harnessHtml('');
  for (const name of ['--font-head', '--font-body', '--font-mono']) {
    assert.ok(html.includes(`${name}:`), `${name} should be set`);
  }
  assert.ok(html.includes('body{margin:0;font-family:var(--font-body)}'));
  assert.ok(html.includes('.fig svg{display:block;width:100%;height:auto}'));
});

test('harnessHtml puts the given body inside the document', () => {
  const html = harnessHtml('<p id="x">');
  assert.match(html, /<body><p id="x"><\/body>/);
});
