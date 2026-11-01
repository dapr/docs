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
//
// The developing-applications / developing-ai conversion (2026-10-31) extends
// that decision rather than replacing it. Three pages this file pins are in
// that scope, and each is the only English page rendering its image, so the
// page-level assertion cannot survive the conversion. The trade is explicit:
//
//   IN_SCOPE_IMAGES    grows, never shrinks  - the file must survive
//   PAGES_STILL_SHOWING shrinks as pages convert - the page need not
//   CONVERTED_PAGES    grows - records which page gave up which assertion
//
// An image loses its page-level guard only by gaining a file-level one. The
// tests in "the guard stays honest as pages convert" enforce exactly that, so
// the trade cannot be made by half.

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

  // Added by the developing-applications / developing-ai conversion. Each of
  // these had its page-level guard retired when its page converted, so this
  // list is now their only protection.
  'scheduler/scheduler-architecture.png',
  'workflow-overview/workflows-chaining.png',
  'workflow-overview/workflows-fanin-fanout.png',
  'workflow-overview/workflow-async-request-response.png',
  'workflow-overview/workflow-monitor-pattern.png',
  'workflow-overview/workflow-human-interaction-pattern.png',
  'workflow-overview/workflows-compensation.png',
  'workflow-overview/workflow-multi-app-complex.png',
  'workflow-overview/workflow-multi-app-callactivity.png',
  'workflow-overview/workflow-multi-app-child-workflow.png',
];

// IN_SCOPE_IMAGES as the previous conversion froze it. It may GROW - the
// developing-applications / developing-ai conversion adds every image whose
// page it converts - but an entry that disappears is an image that silently
// stopped being guarded, which is what the baseline test catches.
const FROZEN_IMAGE_BASELINE = [...IN_SCOPE_IMAGES];

// Pages still asserted to render an image: the file existing on disk is
// necessary but not sufficient, because a page could also stop referencing it.
//
// This list SHRINKS as pages convert. Three of its entries
// (pluggable-components-overview, dapr-agents-introduction, jobs-overview) are
// in the scope of the current conversion, and each is the only English page
// rendering its image, so each will move to CONVERTED_PAGES below.
const PAGES_STILL_SHOWING = [
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
    image: 'security-mTLS-dapr-system-services.png',
    page: '/operations/resiliency/health-checks/sidecar-health/',
  },
];

// Pages the current conversion has converted to `{{< diagram >}}`. Moving an
// entry here from PAGES_STILL_SHOWING is the ONE edit that retires a page
// assertion, and the tests below then require its image to be in
// IN_SCOPE_IMAGES - which is the whole point: the page stops vouching for the
// file, so the file list has to.
const CONVERTED_PAGES = [
  {
    image: 'scheduler/scheduler-architecture.png',
    page: '/developing-applications/building-blocks/jobs/jobs-overview/',
    scene: 'scheduler-architecture',
  },
  // workflow-patterns.md, converted whole: six images, six scenes.
  ...[
    ['workflow-overview/workflows-chaining.png', 'workflow-task-chaining'],
    ['workflow-overview/workflows-fanin-fanout.png', 'workflow-fan-out-fan-in'],
    ['workflow-overview/workflow-async-request-response.png', 'workflow-async-http'],
    ['workflow-overview/workflow-monitor-pattern.png', 'workflow-monitor'],
    ['workflow-overview/workflow-human-interaction-pattern.png', 'workflow-external-system'],
    ['workflow-overview/workflows-compensation.png', 'workflow-compensation'],
  ].map(([image, scene]) => ({
    image,
    page: '/developing-applications/building-blocks/workflow/workflow-patterns/',
    scene,
  })),
  // workflow-multi-app.md: three images and the page's one Mermaid flowchart.
  ...[
    ['workflow-overview/workflow-multi-app-complex.png', 'workflow-multi-app-complex'],
    ['workflow-overview/workflow-multi-app-callactivity.png', 'workflow-multi-app-activity'],
    ['workflow-overview/workflow-multi-app-child-workflow.png', 'workflow-multi-app-child-workflow'],
  ].map(([image, scene]) => ({
    image,
    page: '/developing-applications/building-blocks/workflow/workflow-multi-app/',
    scene,
  })),
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

  for (const { image, page } of PAGES_STILL_SHOWING) {
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

// The bookkeeping that lets a page leave PAGES_STILL_SHOWING without the image
// it used to show losing its guard.
//
// Three of the pages this file pins are inside the scope of the
// developing-applications / developing-ai conversion, and each is the ONLY
// English page rendering its image. When such a page converts, the page-level
// assertion must go - and at that moment IN_SCOPE_IMAGES becomes the image's
// only remaining protection. So the list does not merely never shrink: it has
// to GROW by exactly the image whose page entry was removed. These tests are
// what make that trade explicit rather than remembered.
test.describe('the guard stays honest as pages convert', () => {
  test('every page still asserted to show an image names a guarded file', () => {
    const unguarded = PAGES_STILL_SHOWING
      .filter(({ image }) => !IN_SCOPE_IMAGES.includes(image))
      .map(({ image, page }) => `${page} -> ${image}`);
    expect(
      unguarded,
      'a page is asserted to render an image that no file-existence check covers',
    ).toEqual([]);
  });

  test('a converted page is no longer asserted to render its image', () => {
    const stillPinned = PAGES_STILL_SHOWING
      .filter(({ page }) => CONVERTED_PAGES.some((c) => c.page === page))
      .map(({ page }) => page);
    expect(
      stillPinned,
      'a converted page is in both lists; remove it from PAGES_STILL_SHOWING',
    ).toEqual([]);
  });

  test('every image a converted page used to show is still guarded as a file', () => {
    const dropped = CONVERTED_PAGES
      .filter(({ image }) => !IN_SCOPE_IMAGES.includes(image))
      .map(({ image, page }) => `${image} (was shown by ${page})`);
    expect(
      dropped,
      'converting a page removed the only guard on its image; add it to IN_SCOPE_IMAGES',
    ).toEqual([]);
  });

  test('the guarded file list has not shrunk below the previous conversion baseline', () => {
    const lost = FROZEN_IMAGE_BASELINE.filter((img) => !IN_SCOPE_IMAGES.includes(img));
    expect(
      lost,
      'IN_SCOPE_IMAGES may grow, never shrink: translations/docs-zh still references these',
    ).toEqual([]);
  });
});
