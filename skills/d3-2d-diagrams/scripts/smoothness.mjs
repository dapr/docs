// Measures how smoothly a diagram scene plays: records every animated element
// each frame for one loop, in real time, and reports frame rate, the longest
// frame gap, the largest visible move per frame, and the largest change in
// visible opacity per frame. Exits non-zero if a limit is exceeded.
//
//   node skills/d3-2d-diagrams/scripts/smoothness.mjs <scene> --seconds <loop length T>
//
// Opacity is measured on elements with no animated children of their own, by
// their effective opacity (their own times every ancestor's), so a container
// that resets while everything in it is invisible is not reported as a jump.
// Moves count only while the element is visible.
import { args, chromium, serveSite } from './lib.mjs';

const LIMITS = { fps: 55, maxGap: 20, maxMove: 12, maxOp: 0.35 };

const a = args();
const scene = a._[0], seconds = Number(a.seconds);
if (!scene || !seconds) {
  console.error('usage: smoothness.mjs <scene> --seconds <T>');
  process.exit(2);
}

const site = await serveSite('diagram-smoothness', 8192);
const browser = await chromium.launch({ channel: 'chrome' });
let result;
try {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addCookies([{ name: 'dapr_cookie_consent', value: 'rejected', url: site.url }]);
  const page = await ctx.newPage();
  await page.goto(site.url);
  const svg = page.locator(`svg[data-scene="${scene}"]`);
  await svg.scrollIntoViewIfNeeded();
  result = await svg.evaluate((s, ms) => new Promise((done) => {
    const all = [...s.querySelectorAll(':scope > g [opacity], :scope > g [transform], :scope > g g[stroke]')];
    // opacity is judged on the innermost animated elements; moves on any element
    const leaf = all.map((e) => !all.some((o) => o !== e && e.contains(o)));
    const eff = (e) => { let o = 1; for (let n = e; n && n !== s; n = n.parentNode) o *= +(n.getAttribute('opacity') ?? 1); return o; };
    const read = () => all.map((e) => [eff(e), e.getAttribute('transform') || '']);
    const num = (t) => (t.match(/-?[\d.]+/g) || []).map(Number);
    let prev = read(), t0 = performance.now(), last = t0, frames = 0, maxGap = 0, maxOp = 0, maxMove = 0, worst = null;
    (function f(now) {
      frames++; maxGap = Math.max(maxGap, now - last); last = now;
      const cur = read();
      cur.forEach((c, i) => {
        const d = leaf[i] ? Math.abs(c[0] - prev[i][0]) : 0;
        if (d > maxOp) { maxOp = d; worst = { atSecond: +((now - t0) / 1000).toFixed(2), element: all[i].tagName, from: +prev[i][0].toFixed(2), to: +c[0].toFixed(2) }; }
        const x = num(c[1]), y = num(prev[i][1]);
        if (c[0] > 0.05 && prev[i][0] > 0.05 && c[1].startsWith('translate(') && !c[1].includes('rotate') && x.length === y.length) {
          maxMove = Math.max(maxMove, Math.hypot(x[0] - y[0], (x[1] || 0) - (y[1] || 0)));
        }
      });
      prev = cur;
      if (now - t0 < ms) requestAnimationFrame(f);
      else done({ fps: +(frames / (ms / 1000)).toFixed(1), maxGap: +maxGap.toFixed(1), maxMove: +maxMove.toFixed(2), maxOp: +maxOp.toFixed(3), worst });
    })(t0);
  }), (seconds + 0.5) * 1000);
} finally {
  await browser.close();
  site.close();
}

console.log(JSON.stringify(result, null, 2));
const failed = [
  result.fps < LIMITS.fps && `fps ${result.fps} < ${LIMITS.fps}`,
  result.maxGap > LIMITS.maxGap && `frame gap ${result.maxGap}ms > ${LIMITS.maxGap}ms`,
  result.maxMove > LIMITS.maxMove && `move ${result.maxMove}px per frame > ${LIMITS.maxMove}px`,
  result.maxOp > LIMITS.maxOp && `opacity step ${result.maxOp} per frame > ${LIMITS.maxOp}`,
].filter(Boolean);
if (failed.length) { console.error('not smooth:', failed.join('; ')); process.exit(1); }
console.log('smooth');
