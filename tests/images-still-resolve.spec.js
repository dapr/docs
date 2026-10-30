// No-regression guard for the PNG diagrams this conversion does NOT remove.
//
// Converting a page to `{{< diagram >}}` leaves its PNG on disk on purpose
// (design decision: "The PNG files must stay on disk"). Three readers still
// depend on those files:
//
//   - `translations/docs-zh`, a submodule pinned to v1.15_content that we do
//     not control, references 22 of the 24 in-scope images as `/images/...`;
//   - seven English pages outside this scope share an image with a page that
//     is being converted;
//   - third parties may hotlink `docs.dapr.io/images/...`, unaudited.
//
// So this file is a guard, not a driver: it passes from the first commit and
// only ever fails if someone "tidies up" an image that is still load-bearing.
// It is the counterweight to the conversion, and it is why
// `daprdocs/static/images` is listed as never-modified in the plan's Global
// Constraints.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const IMAGES_REL = 'daprdocs/static/images';
const IMAGES_DIR = path.join(REPO_ROOT, ...IMAGES_REL.split('/'));

// The 24 images in scope for the conversion, from the design document's
// "Which pages and which images" table. Every one of these is referenced by
// `translations/docs-zh` or hotlinkable or both, so every one must survive the
// conversion of the English page that used to show it.
//
// This list is the docs-zh guard. The submodule is not initialised in a plain
// checkout (and its pages therefore do not exist to visit), but the invariant
// that protects it does not need the submodule: the files must be on disk.
const IN_SCOPE_IMAGES = [
  'overview.png',
  'building_blocks.png',
  'overview-sidecar-model.png',
  'overview-standalone.png',
  'overview-kubernetes.png',
  'overview-vms-hosting.png',
  'dapr-agents/concepts-agents-overview.png',
  'concepts-building-blocks.png',
  'concepts-components.png',
  'overview-sidecar-apis.png',
  'scheduler/scheduler-architecture.png',
  'service-mesh.png',
  'observability-tracing.png',
  'observability-sidecar.png',
  'resiliency_diagram.png',
  'observability-app-health.webp',
  'sidecar-health.png',
  'security-end-to-end-communication.png',
  'security-mTLS-sentry-selfhosted.png',
  'security-mTLS-sentry-kubernetes.png',
  'security-mTLS-dapr-system-services.png',
  'security-dapr-API-scoping.png',
  'security-overview-capabilities-example.png',
  'security-threat-model.png',
];

// The seven images an out-of-scope English page shares with an in-scope one,
// each with the page that keeps needing it after the in-scope page converts.
// These are visited for real: the file existing on disk is necessary but not
// sufficient, because the page could also stop referencing it.
const SHARED_WITH_PAGES_OUTSIDE_SCOPE = [
  {
    image: 'concepts-building-blocks.png',
    page: '/developing-applications/develop-components/pluggable-components/pluggable-components-overview/',
  },
  {
    image: 'dapr-agents/concepts-agents-overview.png',
    page: '/developing-ai/dapr-agents/dapr-agents-introduction/',
  },
  {
    image: 'observability-app-health.webp',
    page: '/operations/resiliency/health-checks/app-health/',
  },
  {
    image: 'observability-tracing.png',
    page: '/operations/observability/tracing/tracing-overview/',
  },
  {
    image: 'overview-kubernetes.png',
    page: '/operations/hosting/kubernetes/kubernetes-overview/',
  },
  {
    image: 'scheduler/scheduler-architecture.png',
    page: '/developing-applications/building-blocks/jobs/jobs-overview/',
  },
  {
    image: 'security-mTLS-dapr-system-services.png',
    page: '/operations/resiliency/health-checks/sidecar-health/',
  },
];

const git = (...args) =>
  execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();

/**
 * The commit this branch was cut from, so "unchanged" means "unchanged by this
 * work" rather than "unchanged ever". On a pull request GitHub supplies the
 * target branch; locally the release branch is the base. A guard that cannot
 * find its base fails loudly rather than skipping: silently passing is the one
 * outcome that would defeat the point of it.
 */
function mergeBase() {
  const candidates = [
    process.env.IMAGES_BASE_REF,
    process.env.GITHUB_BASE_REF && `origin/${process.env.GITHUB_BASE_REF}`,
    process.env.GITHUB_BASE_REF,
    'origin/v1.19',
    'v1.19',
  ].filter(Boolean);

  for (const ref of candidates) {
    try {
      return git('merge-base', ref, 'HEAD');
    } catch {
      // Not a ref in this clone; try the next candidate.
    }
  }
  throw new Error(
    `None of these resolved as a base ref: ${candidates.join(', ')}. ` +
      'Set IMAGES_BASE_REF to the branch this work was cut from.',
  );
}

test.describe('images outside this scope keep resolving', () => {
  test('every in-scope diagram image still exists under daprdocs/static/images', () => {
    const missing = IN_SCOPE_IMAGES.filter(
      (rel) => !fs.existsSync(path.join(IMAGES_DIR, ...rel.split('/'))),
    );
    expect(
      missing,
      `${IMAGES_REL} is missing images that translations/docs-zh still references`,
    ).toEqual([]);
  });

  for (const { image, page } of SHARED_WITH_PAGES_OUTSIDE_SCOPE) {
    test(`pages outside this scope still reference an existing image file: ${image}`, async ({
      page: pw,
    }) => {
      const onDisk = path.join(IMAGES_DIR, ...image.split('/'));
      expect(fs.existsSync(onDisk), `${IMAGES_REL}/${image} is gone`).toBe(true);

      const response = await pw.goto(page);
      expect(response.status(), `${page} did not render`).toBe(200);

      // The page must still show the image, not merely be able to.
      const img = pw.locator(`img[src="/images/${image}"]`);
      await expect(img, `${page} no longer references /images/${image}`).toHaveCount(1);

      // And the server must actually serve it: a file on disk that Hugo does
      // not mount is still a broken image for the reader.
      const served = await pw.request.get(`/images/${image}`);
      expect(served.status(), `/images/${image} did not serve`).toBe(200);
    });
  }

  test('daprdocs/static/images is unchanged relative to the merge base', () => {
    const changed = git('diff', '--name-only', `${mergeBase()}..HEAD`, '--', IMAGES_REL);
    expect(
      changed === '' ? [] : changed.split('\n'),
      `${IMAGES_REL} must not be modified by this work`,
    ).toEqual([]);

    // Committed history is only half of it; an uncommitted deletion would pass
    // the check above while breaking every page that shows the file.
    const dirty = git('status', '--porcelain', '--', IMAGES_REL);
    expect(
      dirty === '' ? [] : dirty.split('\n'),
      `${IMAGES_REL} has uncommitted changes`,
    ).toEqual([]);
  });
});
