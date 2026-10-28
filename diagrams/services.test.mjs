import test from 'node:test';
import assert from 'node:assert/strict';
import { NAME_DY, ROLE_DY, SERVICES, SERVICE_LABEL, SERVICE_R, service, serviceHex, serviceLabel } from './services.mjs';

const find = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { for (const k of node) find(k, pred, out); return out; }
  if (pred(node)) out.push(node);
  for (const k of node.children ?? []) find(k, pred, out);
  return out;
};
const texts = (n) => find(n, (x) => x.tag === 'text').map((t) => find(t, (x) => x.content).map((x) => x.content).join(''));

test('the catalogue is the five Dapr control plane services', () => {
  assert.deepEqual(SERVICES.map((s) => s.key), ['placement', 'scheduler', 'sentry', 'operator', 'injector']);
  for (const s of SERVICES) {
    assert.match(s.key, /^[a-z]+$/);
    assert.ok(!s.role.includes('\n'), `${s.key}: role is the one-line form`);
    assert.equal(s.wrap.replace(/\n/g, ' '), s.role, s.key);
  }
});

test('service() refuses a name that is not one of them', () => {
  assert.equal(service('sentry').name, 'Sentry');
  assert.throws(() => service('consul'), /not a Dapr control plane service/);
  assert.throws(() => service('Sentry'), /not a Dapr control plane service/);
});

test('serviceHex() is a Dapr hexagon with the service name under it', () => {
  const node = serviceHex({ key: 'placement', x: 100, y: 100 });
  assert.equal(find(node, (n) => n.attrs?.['data-mark'])[0].attrs['data-mark'], 'logo-blue');
  assert.deepEqual(texts(node), ['Placement']);
});

test('the role is drawn only when asked for, wrapped on request', () => {
  assert.deepEqual(texts(serviceHex({ key: 'sentry', x: 0, y: 0, role: true })), ['Sentry', 'Certificate authority']);
  const wrapped = serviceHex({ key: 'sentry', x: 0, y: 0, role: true, wrap: true });
  assert.ok(find(wrapped, (n) => n.tag === 'tspan').length >= 2);
});

test('everything scales from the radius, so a smaller one is the same drawing', () => {
  const at = (r) => {
    const n = serviceHex({ key: 'scheduler', x: 0, y: 0, r, role: true });
    const [name, role] = find(n, (x) => x.tag === 'text');
    const poly = find(n, (x) => x.tag === 'polygon')[0];
    return { name: +name.attrs.y, role: +role.attrs.y, points: poly.attrs.points };
  };
  // Scaled UP: halving this component takes its name under the legibility
  // floor, and a hexagon that small is refused rather than drawn.
  const big = at(SERVICE_R * 2);
  const ref = at(SERVICE_R);
  // A clean 2:1 on the baselines themselves, which only holds because the TYPE
  // scales as well. A component that kept its type fixed would not - there the
  // test has to compare how far an offset moved instead.
  assert.equal(+(big.name / ref.name).toFixed(3), 2);
  assert.equal(+(big.role / ref.role).toFixed(3), 2);
  assert.notEqual(big.points, ref.points);
});

test('the name scales with the hexagon: the pair is one component', () => {
  const sizeOf = (r) => +find(serviceHex({ key: 'sentry', x: 0, y: 0, r }), (x) => x.tag === 'text')[0].attrs['font-size'];
  assert.equal(sizeOf(SERVICE_R), 13);
  assert.equal(sizeOf(SERVICE_R * 1.5), +(SERVICE_R * 1.5 * SERVICE_LABEL).toFixed(2));
  // A neighbour that is not a Dapr service takes the same size from the same
  // radius, or the names in a column come out at two sizes.
  assert.equal(serviceLabel(SERVICE_R), 13);
});

test('a hexagon too small to carry a legible name is refused', () => {
  assert.throws(() => serviceHex({ key: 'sentry', x: 0, y: 0, r: 20 }), /below the 10px floor/);
});

test('serviceHex takes an explicit name size, and still holds the floor', () => {
  // For a hexagon sized to match a neighbour rather than to its own role.
  const node = serviceHex({ key: 'scheduler', x: 0, y: 0, r: 60, size: 17 });
  const name = find(node, (x) => x.tag === 'text' && find(x, (c) => c.content === 'Scheduler').length)[0];
  assert.equal(name.attrs['font-size'], 17, 'the given size, not the one derived from r');
  assert.throws(() => serviceHex({ key: 'scheduler', x: 0, y: 0, r: 60, size: 9 }), /floor/);
});
