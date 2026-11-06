# What is still an image, and why

Git records what the conversion moved. This records what it deliberately did
NOT move, which is the half that gets lost: without it, the next person reads
a remaining `<img>` as an oversight and either converts something that was
weighed and rejected, or leaves something that really was missed.

As of the close-out: **109 scenes** drawn across **54 pages**, with 60 files and
23 page assertions in the guard in `tests/images-still-resolve.spec.js`.

## Not a diagram

These stay as images because redrawing them would be a lie, not an improvement.

| What | Where |
| --- | --- |
| Dev-dashboard and vendor-UI captures | `local-development/dapr-dev-dashboard.md`, `integrations/Diagrid/*`, Grafana / New Relic / Dash0 / Datadog / Zipkin / Jaeger pages under `operations/observability/` |
| IDE captures | `local-development/ides/*` (VS Code, IntelliJ, dev containers) |
| Terminal and quickstart captures | `getting-started/quickstarts/*`, `install-dapr-cli.md`, `install-dapr-selfhost.md` |
| pprof output | `troubleshooting/profiling-debugging.md` (`alloc.png`, `heap.png`) |
| An application's own UI | `troubleshooting/common_issues.md` (`docker-desktop-setting.png`), `howto-state-query-api.md` (a MongoDB dataset) |
| Logos and wordmarks | `developing-ai/dapr-agents/_index.md` (`agents-blue.png`), the homepage tiles in `_index.md` |

A screenshot of running software is evidence that it looks like that. A drawing
of the same thing is a claim that it does, and the claim rots the first time
the UI changes.

## Mermaid left as mermaid

Three blocks remain, all under `developing-applications/building-blocks/workflow/`:

| Block | Why |
| --- | --- |
| `workflow-fast-path.md` (2 sequence diagrams) | five participants, seventeen messages that loop back on each other |
| `workflow-stateful-client.md` (1 sequence diagram) | notes interleaved with messages to mark time passing |
| `workflow-history-signing.md` (1 gantt) | a gantt is a chart, not a diagram; nothing in this set draws one |

**This set has no lifeline.** Two participants whose messages strictly
alternate can be drawn without one - parties as columns, every message a
straight horizontal run, order read top to bottom - which is what
`agents-tool-call-flow` and `actor-event-stream` do. The three above need a
real lifeline, and growing one for three drawings is not worth the vocabulary.
Check the SHAPE of a mermaid block before promising to convert it.

## Already drawn, but the page does not point at it yet

The cheapest four in the whole list. Each of these pages still carries an
image whose subject is ALREADY a scene, drawn on a sibling page - so
converting them is a shortcode, not a drawing, the way `components-concept`
was reused on `dapr-agents-why.md`. They sit in `PAGES_STILL_SHOWING` because
they came from the PREVIOUS conversion's guard, not this one's task list.

| Page still showing an image | The scene that already draws it | Drawn today on |
| --- | --- | --- |
| `operations/resiliency/health-checks/app-health.md` | `app-health` | `concepts/resiliency-concept.md` |
| `operations/resiliency/health-checks/sidecar-health.md` | `sidecar-health` | `concepts/resiliency-concept.md` |
| `operations/observability/tracing/tracing-overview.md` | `observability-tracing` | `concepts/observability-concept.md` |
| `operations/hosting/kubernetes/kubernetes-overview.md` | `hosting-kubernetes` | `overview.md` |

Check each image against its scene before swapping - a scene drawn for a
concept page makes the claims THAT page's prose makes, and an operations page
may need something the concept page did not say. `sidecar-health.md` also
carries `healthz-outbound.png`, which nothing draws, so that page needs both
halves before it can move (a page in both guard lists fails the check).

## Diagrams that were never in the plan's scope

**These are real architecture diagrams in this set's own vocabulary - app
hexagons, Dapr sidecars, pods, notes - and they are not converted.** They are
not screenshots and not out of scope on their merits; the conversion's task
list simply did not include their pages. None of them appears in
`IN_SCOPE_IMAGES`, so nothing currently guards them.

| Page | Images |
| --- | --- |
| `operations/resiliency/targets.md` | `resiliency_inbound`, `resiliency_outbound`, `resiliency_pubsub`, `resiliency_svc_invocation` |
| `operations/hosting/kubernetes/kubernetes-dapr-shared.md` | `dapr-shared/daemonset`, `dapr-shared/deployment`, `dapr-shared/sidecar` |
| `operations/components/middleware.md` | `middleware`, `app-middleware` |
| `operations/security/api-token.md`, `operations/security/app-api-token.md` | `tokens-auth` (one file, two pages) |
| `operations/components/pluggable-components-registration.md` | `components-pluggable-register-grpc` |
| `operations/components/setup-pubsub/pubsub-namespaces.md` | `pubsub-multiple-namespaces` |
| `operations/hosting/self-hosted/self-hosted-overview.md` | `overview-standalone-docker` |
| `operations/resiliency/health-checks/sidecar-health.md` | `healthz-outbound` (its other image is covered by the section above) |

Fourteen files, nine pages. Several would be cheap - `resiliency_*` is four
variations on one row of hexagons, and `tokens-auth` is two shapes and two
arrows.

This is a scope question, not a defect. Whoever picks it up should decide
whether these pages belong to this conversion before drawing anything.
