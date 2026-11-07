import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serialize, C } from './engine.mjs';
import { icon, plate, markHex, DAPR_MARK, listMarks, parseMark, IconError, ICONS_DIR } from './icons.mjs';

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
// Classes that came from the vendored file. The two wrappers icon() adds are removed by their exact
// markup (not by a name shape), so a source class called d-* stays visible to the prefix tests.
const classes = (s) =>
  [...s.replaceAll('<g class="d-icon-group">', '').replaceAll('<g class="d-icon" data-mark=', '<g data-mark=').matchAll(/\sclass="([^"]*)"/g)]
    .flatMap((m) => m[1].split(/\s+/))
    .filter(Boolean);

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
    // The inline-image exception is for <image> only, and for image payloads only.
    hrefDataOnUse: '<svg viewBox="0 0 1 1"><use href="data:image/png;base64,AAAA"/></svg>',
    hrefDataSvg: '<svg viewBox="0 0 1 1"><image href="data:image/svg+xml;base64,AAAA"/></svg>',
    hrefDataHtml: '<svg viewBox="0 0 1 1"><image href="data:text/html;base64,AAAA"/></svg>',
    attrDataOnImage: '<svg viewBox="0 0 1 1"><image href="#a" fill="data:image/png;base64,AAAA"/></svg>',
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
    assert.doesNotThrow(() => serialize(icon({ name, x: 0, y: 0 })), name);
  }
});

test('a fragment href with surrounding whitespace is prefixed, not passed through dangling', () => {
  const out = render('wshref', '<svg viewBox="0 0 10 10"><defs><path id="p" d="M0 0h5v5z"/></defs><use href=" #p "/></svg>');
  assert.match(out, /<use href="#ic-wshref-100-100-p"\/>/);
  assert.ok(ids(out).includes('ic-wshref-100-100-p'));
  // And whitespace cannot smuggle an external target past the screen.
  assert.throws(() => render('wshref2', '<svg viewBox="0 0 10 10"><use href=" https://evil.example/a.svg#p"/></svg>'), IconError);
});

// The screen and the rewrite must read the same normalised value. Each row is a spelling the
// screen accepts; the emitted markup must be fully prefixed (never a dangling "#p").
const SPELLINGS = [
  ['upper-case HREF', '<use HREF="#p"/>', '<use href="#PFXp"/>'],
  ['mixed-case Href', '<use Href="#p"/>', '<use href="#PFXp"/>'],
  ['upper-case xlink:HREF', '<use xlink:HREF="#p"/>', '<use href="#PFXp"/>'],
  ['leading space inside url quotes', '<path fill="url(\' #p\')" d="M0 0"/>', '<path fill="url(#PFXp)" d="M0 0"/>'],
  ['trailing space inside url()', '<path fill="url(#p )" d="M0 0"/>', '<path fill="url(#PFXp)" d="M0 0"/>'],
  ['spaces both sides, double quotes', '<path fill=\'url( " #p " )\' d="M0 0"/>', '<path fill="url(#PFXp)" d="M0 0"/>'],
  ['upper-case URL()', '<path fill="URL(#p)" d="M0 0"/>', '<path fill="url(#PFXp)" d="M0 0"/>'],
  ['url() in a style attribute', '<path style="fill:url( #p )" d="M0 0"/>', '<path style="fill:url(#PFXp)" d="M0 0"/>'],
  ['upper-case ID on the target', '<use href="#q"/>', '<use href="#PFXq"/>', '<path ID="q" d="M0 0"/>'],
  ['upper-case CLASS', '<path CLASS="a b" d="M0 0"/>', '<path class="PFXa PFXb" d="M0 0"/>'],
];
SPELLINGS.forEach(([what, body, want, extra = ''], n) => {
  const mark = `sp${n}`;
  const pfx = `ic-${mark}-100-100-`;
  const expected = want.replaceAll('PFX', pfx);
  test(`screen and rewrite agree: ${what}`, () => {
    const out = render(mark, `<svg viewBox="0 0 10 10"><defs><path id="p" d="M0 0h5v5z"/>${extra}</defs>${body}</svg>`);
    assert.ok(out.includes(expected), `expected ${expected} in ${out}`);
    // Nothing unprefixed may remain: every id and every reference carries the prefix.
    for (const i of ids(out)) assert.ok(i.startsWith(pfx), `unprefixed id ${i}`);
    for (const m of out.matchAll(/url\(#([^)]*)\)/g)) assert.ok(m[1].startsWith(pfx), `dangling url(#${m[1]})`);
    for (const m of out.matchAll(/href="#([^"]*)"/g)) assert.ok(m[1].startsWith(pfx), `dangling href #${m[1]}`);
    assert.ok(!/ (HREF|ID|CLASS|Href)=/.test(out), 'case-variant attribute name survived');
  });
});

test('external targets are still refused in every spelling the normaliser accepts', () => {
  [].concat(['<use HREF="https://evil.example/a.svg#p"/>', '<use HREF=" //evil.example/a.svg#p"/>', '<path fill="url( \' https://evil.example/x\' )" d="M0 0"/>', '<path fill="URL(http://evil.example/x)" d="M0 0"/>', '<path STYLE="fill:url(https://evil.example/x)" d="M0 0"/>']).forEach((body, i) => {
    assert.throws(() => render(`sp-bad${i}`, `<svg viewBox="0 0 10 10">${body}</svg>`), IconError, body);
  });
  // Two spellings of one attribute are ambiguous and refused.
  assert.throws(() => render('sp-dup', '<svg viewBox="0 0 10 10"><use href="#a" HREF="#b"/></svg>'), /twice/);
  assert.throws(() => render('sp-dup2', '<svg viewBox="0 0 10 10"><use href="#a" xlink:href="#b"/></svg>'), /both href and xlink:href/);
});

test('only allowlisted elements pass the screen (handler, animateColor, a, text, switch, ...)', () => {
  for (const tag of ['handler', 'animateColor', 'a', 'text', 'switch', 'mask', 'filter', 'feImage', 'animate', 'set', 'script', 'foreignObject', 'listener']) {
    assert.throws(() => render(`el-${tag.toLowerCase()}`, `<svg viewBox="0 0 1 1"><${tag}/></svg>`), (e) => e instanceof IconError && /not an allowed element/.test(e.message), tag);
  }
  // Case matters: SVG element names are case-sensitive.
  assert.throws(() => render('el-case', '<svg viewBox="0 0 1 1"><LINEARGRADIENT/></svg>'), IconError);
  for (const tag of ['path', 'g', 'rect', 'polygon', 'circle', 'defs']) {
    assert.doesNotThrow(() => render(`ok-${tag}`, `<svg viewBox="0 0 1 1"><${tag}/></svg>`), tag);
  }
});

test("an editor's own leftovers pass the screen and are dropped, but nothing hides inside one", () => {
  // Inkscape writes <sodipodi:namedview> under <svg> - page colour, zoom,
  // guides. kubernetes-secret.svg carries one. A foreign namespace draws
  // nothing and clean() drops every namespaced tag, so the file is taken as
  // published rather than edited or swapped for a worse copy of the mark.
  const out = render('ns-ok', '<svg viewBox="0 0 1 1"><sodipodi:namedview pagecolor="#fff"/><inkscape:perspective/><path d="M0,0"/></svg>');
  assert.ok(!out.includes('namedview'), 'editor state reached the output');
  assert.ok(!out.includes('perspective'), 'editor state reached the output');
  assert.ok(out.includes('<path'), 'the drawing survived');
  // Being in a foreign namespace is not cover: children are still walked.
  assert.throws(
    () => render('ns-evil', '<svg viewBox="0 0 1 1"><sodipodi:namedview><script/></sodipodi:namedview></svg>'),
    (e) => e instanceof IconError && /not an allowed element/.test(e.message),
  );
  assert.throws(() => render('ns-bad', '<svg viewBox="0 0 1 1"><evil:thing/></svg>'), IconError);
});

test('<image> is allowed, but only carrying an inline image payload', () => {
  // Some projects publish their logo as a raster inside an svg wrapper. That
  // payload cannot run or fetch anything, so it is the one data URI allowed -
  // and only on <image>, and only for an image type. The rejection cases above
  // pin every way of widening that further.
  const png = 'data:image/png;base64,iVBORw0KGgo=';
  assert.doesNotThrow(() =>
    render('raster', `<svg viewBox="0 0 2 2"><image width="2" height="2" href="${png}"/></svg>`));
  assert.match(
    render('raster2', `<svg viewBox="0 0 2 2"><image width="2" height="2" xlink:href="${png}"/></svg>`),
    /href="data:image\/png;base64,/,
    'xlink:href is rewritten to href and the payload survives',
  );
  // A raster carries its own colour, so it must never be treated as tintable.
  const out = render('raster3', `<svg viewBox="0 0 2 2"><image width="2" height="2" href="${png}"/></svg>`, { color: C.red });
  assert.ok(!out.includes('var(--d-red)'), 'a raster mark must not be tinted');
});

test('a source class named d-* is prefixed like any other and cannot hide from the prefix check', () => {
  const out = render('dclass', '<svg viewBox="0 0 1 1"><style>.d-icon{fill:red}</style><path class="d-icon d-x" d="M0 0"/></svg>');
  assert.deepEqual(classes(out), ['ic-dclass-100-100-d-icon', 'ic-dclass-100-100-d-x']);
  assert.match(out, /\.ic-dclass-100-100-d-icon\{/);
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
  assert.match(single, /<g class="d-icon" data-mark="single" transform="[^"]+" fill="var\(--d-red\)"/);
  const dflt = render('single', SINGLE);
  assert.match(dflt, /fill="var\(--d-body\)"/, 'defaults to body ink');

  const full = render('full', FULL, { color: C.red });
  assert.ok(full.includes('fill="#ff0000"'), 'own colour kept');
  assert.ok(!full.includes('var(--d-red)'), 'color argument ignored');
  assert.ok(!/<g class="d-icon"[^>]* fill=/.test(full));

  // Real marks: Simple Icons marks carry no colour, Commons logos carry their own.
  const tinted = (n) => serialize(icon({ name: n, x: 0, y: 0, color: C.navy })).includes('fill="var(--d-blue)"');
  for (const n of ['cpp', 'rust', 'kubernetes']) assert.ok(tinted(n), `${n} should be single-colour`);
  // go and php moved from Simple Icons to the full-colour Commons files dapr.io
  // vendors, so they now keep their own blue and purple.
  for (const n of ['nodejs', 'python', 'dotnet', 'go', 'java', 'php', 'azure', 'aws', 'google-cloud']) {
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
  // size alone is a square box. rust is still a 24x24 Simple Icons glyph; go is
  // not, since it became the wide full-colour Commons wordmark.
  const sq = serialize(icon({ name: 'rust', x: 0, y: 0, size: 24 }));
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

// --------------------------------------------------- review fix pass: ids, colour, scope

test('a mark carrying the same id twice emits distinct ids', () => {
  // Sketch exports do this: logo-blue.svg has three <rect id="Rectangle-4">.
  // Prefixing alone keeps the collision, which is invalid HTML once inlined.
  const out = render(
    'sketchy',
    '<svg viewBox="0 0 24 24"><rect id="Rectangle-4" width="1" height="1"/><rect id="Rectangle-4" width="2" height="2"/><rect id="Rectangle-4" width="3" height="3"/></svg>',
  );
  const ids = [...out.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, 3);
  assert.equal(new Set(ids).size, 3, `ids collided: ${ids.join(', ')}`);
});

test('a reference to a duplicated id still resolves to the first occurrence', () => {
  const out = render(
    'sketchy2',
    '<svg viewBox="0 0 24 24"><rect id="dup" width="1" height="1"/><rect id="dup" width="2" height="2"/><use href="#dup"/></svg>',
  );
  const first = out.match(/id="([^"]+)"/)[1];
  assert.match(out, new RegExp(`href="#${first}"`));
});

test('a single-colour mark sets color as well as fill so currentColor resolves', () => {
  // Fluent glyphs paint fill="currentColor", which beats the fill on the wrapper.
  // Without `color` the glyph silently renders in the page's text colour.
  const out = render(
    'fluent-ish',
    '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M0 0h24v24H0z"/></svg>',
    { color: C.blue },
  );
  assert.ok(out.includes(`color="${C.blue}"`), `no color= on the wrapper: ${out}`);
  assert.ok(out.includes(`fill="${C.blue}"`), `no fill= on the wrapper: ${out}`);
});

test('scope defaults to the current scene so two diagrams on one page cannot collide', async () => {
  const { setIconScope } = await import('./icons.mjs');
  const mark = '<svg viewBox="0 0 24 24"><rect id="r" width="1" height="1"/></svg>';
  setIconScope('scene-one');
  const one = render('scoped', mark);
  setIconScope('scene-two');
  const two = render('scoped', mark);
  setIconScope('');
  assert.match(one, /id="ic-scene-one-scoped-/);
  assert.match(two, /id="ic-scene-two-scoped-/);
  assert.notEqual(one, two);
});

const walk = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { for (const k of node) walk(k, pred, out); return out; }
  if (pred(node)) out.push(node);
  for (const k of node.children ?? []) walk(k, pred, out);
  return out;
};

test('markHex() centres a mark in a hexagon and sizes the Dapr wordmark from r', () => {
  const dapr = markHex({ x: 0, y: 0, r: 30, mark: 'logo-blue' });
  const poly = walk(dapr, (n) => n.tag === 'polygon')[0];
  assert.equal(poly.attrs.fill, C.plate, 'the wordmark paints its own navy, so the hexagon is its plate');
  assert.equal(poly.attrs.stroke, C.blue);
  // One ratio, so the logo is the same weight inside every Dapr hexagon.
  const mark = walk(dapr, (n) => n.attrs?.['data-mark'])[0];
  assert.equal(mark.attrs['data-mark'], 'logo-blue');
  assert.equal(DAPR_MARK, 4 / 3);

  // A tinted mark needs no plate and its size is the scene's to choose.
  const other = markHex({ x: 0, y: 0, r: 30, mark: 'redis', size: 26, stroke: C.navy, color: C.navy });
  assert.equal(walk(other, (n) => n.tag === 'polygon')[0].attrs.fill, C.bg);
  assert.throws(() => markHex({ x: 0, y: 0, r: 30, mark: 'redis' }), /needs a size/);
});
