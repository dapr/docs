// Screenshots a diagram scene at exact moments, optionally next to the source
// video's frames (or source image) at the same moments, to compare layout,
// colors and timing. Works for any svg[data-scene] on the homepage, at its own
// canvas size.
//
//   node skills/d3-2d-diagrams/scripts/scene-frames.mjs <scene> --times 1.5,3,4.5 \
//     [--video path/to/source.mp4 --offset 0.4] [--out dir]
//
// --offset is how much later the scene runs than the video (an opening hold).
// Writes new-<t>.png per time, and with --video old-<t>.png and compare.png
// (source on top, scene below). Requires hugo and ffmpeg (for --video) on PATH.
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { args, chromium, serveSite } from './lib.mjs';

const a = args();
const scene = a._[0];
if (!scene || !a.times) {
  console.error('usage: scene-frames.mjs <scene> --times 1,2,3 [--video file --offset s] [--out dir]');
  process.exit(2);
}
const times = String(a.times).split(',');
const out = resolve(a.out || `tests/.site-frames/${scene}`); // tests/.site-* is gitignored
mkdirSync(out, { recursive: true });

const site = await serveSite('diagram-frames', 8191);
let vw = 600, vh = 480; // the scene's canvas, read from its viewBox below
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addCookies([{ name: 'dapr_cookie_consent', value: 'rejected', url: site.url }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // A paused fake clock: time moves only with runFor, never while screenshots
  // are taken. (After a plain install() the fake clock keeps running in real
  // time, so every screenshot would shift the following ones.)
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto(site.url);
  const svg = page.locator(`svg[data-scene="${scene}"]`);
  if (!(await svg.count())) throw new Error(`no diagram with data-scene="${scene}" on the homepage`);
  [vw, vh] = await svg.evaluate((s) => [s.viewBox.baseVal.width, s.viewBox.baseVal.height]);
  // diagrams only run while on screen; the scene clock starts when it scrolls in
  await svg.scrollIntoViewIfNeeded();
  await page.clock.runFor(50);
  let now = 0;
  for (const ts of times) {
    const t = Number(ts);
    await page.clock.runFor(Math.max(1, Math.round((t - now) * 1000)));
    now = t;
    await svg.screenshot({ path: `${out}/new-${ts}.png` });
  }
  if (errors.length) console.error('page errors:', errors);
} finally {
  await browser.close();
  site.close();
}

if (a.video) {
  const video = resolve(a.video), offset = Number(a.offset || 0);
  const probe = (entry) => spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0',
    '-show_entries', `stream=${entry}`, '-of', 'csv=p=0', video], { encoding: 'utf8' }).stdout.trim();
  const count = Number(probe('nb_read_frames'));
  const [num, den] = probe('r_frame_rate').split('/').map(Number);
  const fps = num / (den || 1);
  const inputs = [], tiles = [];
  times.forEach((ts, k) => {
    const f = Math.max(0, Math.min(count - 1, Math.round((Number(ts) - offset) * fps)));
    // letterbox a source whose shape differs from the canvas, the way the diagram fits it
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-vf',
      `select='eq(n\\,${f})',scale=${vw}:-1,pad=${vw}:${vh}:0:(${vh}-ih)/2:color=fdfdfd`, '-vsync', '0', '-frames:v', '1', `${out}/old-${ts}.png`]);
    inputs.push('-i', `${out}/old-${ts}.png`, '-i', `${out}/new-${ts}.png`);
    tiles.push(`[${2 * k}]scale=${vw}:${vh}[o${k}];[${2 * k + 1}]scale=${vw}:${vh}[n${k}];[o${k}][n${k}]vstack,scale=${times.length > 1 ? 240 : 1200}:-1,` +
      `drawtext=text='t=${ts}':x=4:y=4:fontsize=14:fontcolor=red[q${k}]`);
  });
  // rows of up to six pairs, each row padded to the full width
  const rows = [];
  for (let r = 0; r * 6 < times.length; r++) {
    const ids = times.slice(r * 6, r * 6 + 6).map((_, i) => `[q${r * 6 + i}]`).join('');
    const n = Math.min(6, times.length - r * 6);
    tiles.push(`${ids}${n > 1 ? `hstack=${n}` : 'null'},pad=${times.length > 1 ? 1440 : 1200}:ih:0:0:color=white[r${r}]`);
    rows.push(`[r${r}]`);
  }
  const graph = `${tiles.join(';')};${rows.join('')}${rows.length > 1 ? `vstack=${rows.length}` : 'null'}`;
  const res = spawnSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', graph, `${out}/compare.png`], { encoding: 'utf8' });
  if (res.status !== 0) console.error(res.stderr);
}
console.log(`frames in ${out}`);
