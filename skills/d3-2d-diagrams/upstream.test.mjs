import { test } from 'node:test'
import assert from 'node:assert'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const PINNED_COMMIT = 'b63be76d4d7e1cae589159ad65647128b95d791b'
const upstream = readFileSync(join(dir, 'UPSTREAM.md'), 'utf8')

// Rows look like: | `path` | `sha256` | status |
function parseRows(markdown) {
  const rows = []
  const re = /^\|\s*`([^`]+)`\s*\|\s*`([0-9a-f]{64})`\s*\|\s*([A-Za-z-]+)\s*\|\s*$/gm
  let m
  while ((m = re.exec(markdown)) !== null) {
    rows.push({ path: m[1], sha256: m[2], status: m[3].toLowerCase() })
  }
  return rows
}

test('vendored skill files match the pinned upstream checksums', () => {
  const rows = parseRows(upstream)
  assert.ok(rows.length > 0, 'UPSTREAM.md has no checksum rows')
  const verbatim = rows.filter((r) => r.status === 'verbatim')
  assert.ok(verbatim.length > 0, 'no verbatim rows to check')
  for (const row of verbatim) {
    const actual = createHash('sha256').update(readFileSync(join(dir, row.path))).digest('hex')
    assert.strictEqual(actual, row.sha256, `${row.path} differs from the pinned upstream`)
  }
})

test(`UPSTREAM.md names the pinned commit ${PINNED_COMMIT}`, () => {
  assert.ok(upstream.includes(PINNED_COMMIT))
})
