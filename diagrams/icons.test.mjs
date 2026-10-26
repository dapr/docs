import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serialize, C } from './engine.mjs';
import { icon, plate, listMarks, parseMark, IconError, ICONS_DIR } from './icons.mjs';

const OVERVIEW = ['nodejs', 'python', 'dotnet', 'go', 'java', 'cpp', 'php', 'rust', 'azure', 'aws', 'google-cloud', 'kubernetes'];

const FIX = mkdtempSync(join(tmpdir(), 'd3-icons-'));
const fixture = (name, svg) => {
  writeFileSync(join(FIX, `${name}.svg`), svg);
  return FIX;
};
const render = (name, svg, args = {}) => serialize(icon({ name, x: 100, y: 100, dir: fixture(name, svg), ...args }));

const SINGLE = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z"/></svg>';
const FULL = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#ff0000" d="M0 0h24v24H0z"/></svg>';
const ids = (s) => [...s.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1]);
const classes = (s) => [...s.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => !c.startsWith('d-'));

test('icon throws a named error when the mark file does not exist', () => {
  assert.throws(() => icon({ name: 'no-such-mark', x: 0, y: 0 }), (e) => {
    assert.ok(e instanceof IconError);
    assert.equal(e.name, 'IconError');
    assert.match(e.message, /no mark named "no-such-mark"/);
    return true;
  });
  // A name is a file stem, never a path.
  for (const bad of ['../engine', 'a/b', '', undefined, 'UPPER']) {
    assert.throws(() => icon({ name: bad, x: 0, y: 0 }), IconError, `name ${String(bad)}`);
  }
});

test('icon never emits the string "undefined" when label is omitted', () => {
  const variants = [{}, { label: undefined }, { label: undefined, labelDy: undefined }, { label: '' }, { label: '   ' }, { color: undefined }];
  for (const name of [...OVERVIEW, 'single', 'full']) {
    for (const v of variants) {
      const out = name === 'single' ? render(name, SINGLE, v) : name === 'full' ? render(name, FULL, v) : serialize(icon({ name, x: 40, y: 40, ...v }));
      assert.ok(!/undefined|NaN|null/.test(out), `${name} ${JSON.stringify(v)} leaked a bad value`);
      assert.ok(!out.includes('<text'), `${name} ${JSON.stringify(v)} drew a label it was not given`);
    }
  }
  // And a real label is drawn, below the box by default.
  const out = serialize(icon({ name: 'go', x: 40, y: 40, size: 30, label: 'Go' }));
  assert.match(out, /<text[^>]*>Go<\/text>/);
});

test('icon prefixes every id and class in the inlined file', () => {
  const out = serialize(icon({ name: 'google-cloud', x: 10, y: 20, w: 100, h: 20 }));
  const cls = classes(out);
  assert.ok(cls.length > 5, 'google-cloud has classed paths');
  assert.ok(cls.every((c) => c.startsWith('ic-google-cloud-10-20-')), `unprefixed class in ${cls}`);
  // The <style> block uses the same prefixed names, and no bare selector survives.
  const style = out.match(/<style>([\s\S]*?)<\/style>/)[1];
  const sel = [...style.matchAll(/(^|\})([^{}]+)\{/g)].map((m) => m[2]);
  assert.ok(sel.length >= 5);
  assert.ok(sel.every((s) => /^\.ic-google-cloud-10-20-/.test(s)), `bare selector in ${sel}`);
  assert.ok(!/\.cls-\d/.test(style.replace(/\.ic-google-cloud-10-20-cls-\d/g, '')));

  // ids and the references to them move together.
  const k = serialize(icon({ name: 'azure', x: 0, y: 0 }));
  const kids = ids(k);
  assert.equal(kids.length, 3);
  assert.ok(kids.every((i) => i.startsWith('ic-azure-0-0-')));
  for (const [, ref] of k.matchAll(/url\(#([^)]+)\)/g)) assert.ok(kids.includes(ref), `dangling ${ref}`);

  // xlink:href / href to a local id is rewritten with it, and the xlink namespace goes away.
  const withHref = render('hrefmark', '<svg viewBox="0 0 10 10" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path id="p" d="M0 0h5v5z"/></defs><use xlink:href="#p"/></svg>');
  assert.match(withHref, /<use href="#ic-hrefmark-100-100-p"\/>/);
  assert.ok(!withHref.includes('xlink'));
});

test('twelve overview marks inline into one page without a duplicate id or shared class', () => {
  const parts = OVERVIEW.map((name, i) => serialize(icon({ name, x: 40 + i * 60, y: 40, size: 40 })));
  const all = parts.join('');
  const found = ids(all);
  assert.equal(new Set(found).size, found.length, 'duplicate ids');
  const cls = classes(all);
  assert.ok(cls.length > 0 && cls.every((c) => c.startsWith('ic-')));
  // A class name used by two different marks (st0 / cls-1 style) must not be shared.
  const owners = new Map();
  parts.forEach((p, i) => classes(p).forEach((c) => owners.set(c, new Set([...(owners.get(c) ?? []), i]))));
  for (const [c, set] of owners) assert.equal(set.size, 1, `class ${c} shared by marks`);
  // Same mark, two positions: still distinct. Same mark and spot in two diagrams: scope separates them.
  const a = serialize(icon({ name: 'nodejs', x: 1, y: 1 }));
  const b = serialize(icon({ name: 'nodejs', x: 2, y: 1 }));
  const c = serialize(icon({ name: 'nodejs', x: 1, y: 1, scope: 'other' }));
  assert.ok(!ids(a).some((i) => ids(b).includes(i)));
  assert.ok(!ids(a).some((i) => ids(c).includes(i)));
});

test('icon rejects a mark containing <script>, an event handler, or an external href', () => {
  const bad = {
    script: '<svg viewBox="0 0 1 1"><script>alert(1)</script><path d="M0 0"/></svg>',
    scriptCdata: '<svg viewBox="0 0 1 1"><script><![CDATA[alert(1)]]></script></svg>',
    onload: '<svg viewBox="0 0 1 1" onload="alert(1)"><path d="M0 0"/></svg>',
    onclick: '<svg viewBox="0 0 1 1"><path onclick="x()" d="M0 0"/></svg>',
    onmouseover: '<svg viewBox="0 0 1 1"><g><path OnMouseOver="x()" d="M0 0"/></g></svg>',
    xlinkHttp: '<svg viewBox="0 0 1 1" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="https://evil.example/a.svg#x"/></svg>',
    hrefHttp: '<svg viewBox="0 0 1 1"><image href="http://evil.example/p.png"/></svg>',
    hrefRelative: '<svg viewBox="0 0 1 1"><use href="other.svg#x"/></svg>',
    hrefJs: '<svg viewBox="0 0 1 1"><a href="javascript:alert(1)"><path d="M0 0"/></a></svg>',
    hrefData: '<svg viewBox="0 0 1 1"><image href="data:image/png;base64,AAAA"/></svg>',
    foreignObject: '<svg viewBox="0 0 1 1"><foreignObject><div>x</div></foreignObject></svg>',
    cssUrl: '<svg viewBox="0 0 1 1"><style>.a{fill:url(https://evil.example/x)}</style><path class="a" d="M0 0"/></svg>',
    attrUrl: '<svg viewBox="0 0 1 1"><path fill="url(http://evil.example/x)" d="M0 0"/></svg>',
    cssImport: '<svg viewBox="0 0 1 1"><style>@import "http://evil.example/x.css";</style></svg>',
    animate: '<svg viewBox="0 0 1 1"><a><animate attributeName="href" values="javascript:alert(1)"/></a></svg>',
    entity: '<!DOCTYPE svg [<!ENTITY x "y">]><svg viewBox="0 0 1 1"><path d="M0 0"/></svg>',
  };
  for (const [k, svg] of Object.entries(bad)) {
    assert.throws(() => render(`bad-${k.toLowerCase()}`, svg), (e) => e instanceof IconError && /rejected|ENTITY|DOCTYPE|at-rule|unsupported/.test(e.message), k);
  }
  // Same-document references are fine.
  assert.doesNotThrow(() => render('okref', '<svg viewBox="0 0 1 1"><defs><path id="p" d="M0 0"/></defs><use href="#p"/></svg>'));
  // Every vendored file passes the same check.
  for (const name of listMarks()) {
    if (name.startsWith('logo')) continue;
    assert.doesNotThrow(() => serialize(icon({ name, x: 0, y: 0 })), name);
  }
});

test('a <style> block that would restyle the page is refused', () => {
  const svg = (css) => `<svg viewBox="0 0 1 1"><style>${css}</style><path class="a" d="M0 0"/></svg>`;
  assert.throws(() => render('leak1', svg('path{fill:red}')), /would affect the page/);
  assert.throws(() => render('leak2', svg('.a, svg{fill:red}')), /would affect the page/);
  assert.throws(() => render('leak3', svg('@media print{.a{fill:red}}')), /at-rules/);
  assert.doesNotThrow(() => render('leak4', svg('.a{fill:red}.b{opacity:.5}')));
});

test('a single-color mark is filled with the color argument; a full-color mark is left untouched', () => {
  const single = render('single', SINGLE, { color: C.red });
  assert.match(single, /<g class="d-icon" data-mark="single" transform="[^"]+" fill="var\(--d-red\)">/);
  const dflt = render('single', SINGLE);
  assert.match(dflt, /fill="var\(--d-body\)"/, 'defaults to body ink');

  const full = render('full', FULL, { color: C.red });
  assert.ok(full.includes('fill="#ff0000"'), 'own colour kept');
  assert.ok(!full.includes('var(--d-red)'), 'color argument ignored');
  assert.ok(!/<g class="d-icon"[^>]* fill=/.test(full));

  // Real marks: Simple Icons marks carry no colour, Commons logos carry their own.
  const tinted = (n) => serialize(icon({ name: n, x: 0, y: 0, color: C.navy })).includes('fill="var(--d-blue)"');
  for (const n of ['go', 'cpp', 'php', 'rust']) assert.ok(tinted(n), `${n} should be single-colour`);
  for (const n of ['nodejs', 'python', 'dotnet', 'java', 'azure', 'aws', 'google-cloud', 'kubernetes']) {
    assert.ok(!tinted(n), `${n} should be full-colour`);
  }
  // Root-level paint (dotnet: fill="none" on <svg>) is carried to the wrapper so the mark renders as authored.
  assert.match(serialize(icon({ name: 'dotnet', x: 0, y: 0 })), /<g class="d-icon"[^>]* fill="none"/);
});

test('every file in daprdocs/assets/icons has a row in README.md', () => {
  const readme = readFileSync(join(ICONS_DIR, 'README.md'), 'utf8');
  const rows = readme.split('\n').filter((l) => l.startsWith('|'));
  const marks = listMarks();
  assert.ok(marks.length >= 12);
  for (const m of marks) {
    assert.ok(rows.some((r) => r.includes(`\`${m}.svg\``)), `README has no row for ${m}.svg`);
  }
  for (const n of OVERVIEW) assert.ok(marks.includes(n), `missing mark ${n}`);
  // Each row states a licence and a source URL; Java's status is stated plainly.
  for (const m of marks) {
    const row = rows.find((r) => r.includes(`\`${m}.svg\``));
    assert.match(row, /https?:\/\//, `${m} row has no source URL`);
  }
  const java = rows.find((r) => r.includes('`java.svg`'));
  assert.match(java, /not freely licensed/i);
  assert.match(java, /maintainer decision/i);
});

test('listMarks is sorted and lists only svg stems', () => {
  const m = listMarks();
  assert.deepEqual(m, [...m].sort());
  assert.ok(m.every((x) => !x.includes('.')));
});

test('wide marks keep their aspect ratio when given w and h', () => {
  // Fixture: 200x50 mark into a 100x100 box scales by 0.5 and is centred vertically.
  const wide = render('wide', '<svg viewBox="0 0 200 50"><path d="M0 0h200v50z"/></svg>', { x: 100, y: 100, w: 100, h: 100 });
  assert.match(wide, /transform="translate\(50 87\.5\) scale\(0\.5\)"/);
  // Tall mark into a wide box is limited by height.
  const tall = render('tall', '<svg viewBox="0 0 50 200"><path d="M0 0h50v200z"/></svg>', { x: 100, y: 100, w: 100, h: 100 });
  assert.match(tall, /transform="translate\(87\.5 50\) scale\(0\.5\)"/);
  // Non-zero viewBox origin is compensated.
  const off = render('off', '<svg viewBox="10 20 100 100"><path d="M10 20h100v100z"/></svg>', { x: 50, y: 50, size: 50 });
  assert.match(off, /transform="translate\(20 15\) scale\(0\.5\)"/);
  // Real wide logo: google-cloud is 181x28; in 100x40 the drawn width is exactly 100 and ratio unchanged.
  const gc = serialize(icon({ name: 'google-cloud', x: 0, y: 0, w: 100, h: 40 }));
  const s = Number(gc.match(/scale\(([\d.]+)\)/)[1]);
  assert.ok(Math.abs(181 * s - 100) < 0.01);
  assert.ok(Math.abs(28 * s - 15.47) < 0.01);
  // size alone is a square box.
  const sq = serialize(icon({ name: 'go', x: 0, y: 0, size: 24 }));
  assert.match(sq, /scale\(1\)/);
});

test('a missing viewBox is derived from width and height', () => {
  const out = render('nobox', '<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h200v100z"/></svg>', { x: 50, y: 50, size: 50 });
  assert.match(out, /transform="translate\(25 37\.5\) scale\(0\.25\)"/);
  assert.throws(() => render('nosize', '<svg><path d="M0 0"/></svg>'), /no viewBox and no usable width\/height/);
  // Real file: python has width/height (pt) and no viewBox.
  assert.ok(!/viewBox/i.test(readFileSync(join(ICONS_DIR, 'python.svg'), 'utf8').match(/<svg[^>]*>/)[0]));
  // Its width is 388.8pt = 518.4 user units, so a 518.4-wide box draws it at scale 1 (not 1.33).
  assert.match(serialize(icon({ name: 'python', x: 0, y: 0, w: 518.4, h: 153.3333 })), /scale\(1\)/);
  assert.match(render('pt', '<svg width="30pt" height="30pt"><path d="M0 0h40v40z"/></svg>', { size: 80 }), /scale\(2\)/);
  assert.throws(() => render('pct', '<svg width="100%" height="100%"><path d="M0 0"/></svg>'), /no viewBox/);
});

test('inlined output carries no prolog, doctype, comment, metadata, title or xmlns', () => {
  for (const n of OVERVIEW) {
    const out = serialize(icon({ name: n, x: 0, y: 0 }));
    assert.ok(!/<\?xml|<!DOCTYPE|<!--|<metadata|<title|<desc|xmlns|xlink|inkscape|sodipodi/.test(out), n);
  }
});

test('icon output is deterministic: byte-identical whatever ran in between', () => {
  const args = { name: 'aws', x: 12.3456789, y: 7, w: 80, h: 48, label: 'AWS' };
  const first = serialize(icon(args));
  for (const n of OVERVIEW) serialize(icon({ name: n, x: 1, y: 2 }));
  assert.equal(serialize(icon(args)), first);
  assert.equal(serialize(icon({ ...args })), first);
  const src = readFileSync(fileURLToPath(new URL('./icons.mjs', import.meta.url)), 'utf8');
  assert.ok(!/Date\.now|new Date|Math\.random|performance\.now/.test(src));
});

test('plate is a centred rect in the neutral plate colour', () => {
  const p = plate({ x: 100, y: 50, w: 80, h: 40 });
  assert.equal(p.tag, 'rect');
  assert.deepEqual([p.attrs.x, p.attrs.y, p.attrs.width, p.attrs.height], [60, 30, 80, 40]);
  assert.equal(p.attrs.fill, C.plate);
  assert.equal(C.plate, 'var(--d-diagram-plate)');
});

test('parseMark is exported for tooling and reports the mark name in errors', () => {
  assert.throws(() => parseMark('<svg viewBox="0 0 1 1"><script/></svg>', { name: 'evil', prefix: 'p-' }), /mark "evil" rejected/);
});
