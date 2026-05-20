---
type: docs
title: "Workflow payload size"
linkTitle: "Payload size"
weight: 9500
description: "How Dapr handles workflow and activity payloads that approach the sidecar's max body size, and the metrics that surface proximity to the limit"
---

The dispatch between a Dapr sidecar and the workflow SDK is a single bidirectional gRPC stream (`GetWorkItems`). Each dispatch sends a full `WorkflowRequest` or `ActivityRequest` over that stream, which carries the workflow's `PastEvents`, `NewEvents`, and (for multi-app workflows) the `PropagatedHistory`. The maximum size of a single message on this stream is bounded by the sidecar's `--max-body-size` flag (and equivalent `dapr.io/max-body-size` annotation), which defaults to **4 MiB**.

## Graceful stall

The orchestrator pre-checks the size of each dispatch before it is written to the stream. The size budget is **95% of `--max-body-size`**; the remaining 5% is headroom that covers the engine's `WorkflowStarted` event injection and gRPC framing overhead.

When a dispatch would exceed the budget:

- The offending workflow is **stalled**. Its work item is not sent to the SDK and no `ResourceExhausted` is raised on the stream.
- The stream stays open. Other workflows continue to be dispatched normally.
- The stall is durable: re-loading or re-dispatching the workflow re-runs the same pre-check, so the workflow remains stalled until the operator takes action.

This is a per-workflow safety mechanism only, not a backpressure or quota feature. The intended response is for the operator to either:

1. **Raise `--max-body-size`** on the affected sidecar (and restart it). The next dispatch will pass the pre-check and the workflow resumes. Activity dispatches inherit the same headroom rule, so consider the activity input/output size as well.
2. **Force-purge the workflow** if the payload has grown unboundedly (for example, a workflow that has been appending to a large list for too long, or an unintended `ContinueAsNew` accumulating history). See [How-to: Manage workflows]({{% ref howto-manage-workflow.md %}}).
3. **Restructure the workflow** to avoid carrying large payloads across activities, for example by passing references (object store URLs, state-store keys) instead of inline data.

The same pre-check applies to activity dispatches; an oversized activity request stalls only that activity, not the parent workflow.

## Metrics

Because stalls are silent at the application layer, two histogram metrics expose how close payloads are to the threshold *before* a workflow trips it. Both metrics record a **ratio** (payload size / `--max-body-size`) rather than an absolute byte count. The ratio is portable across sidecars configured with different `--max-body-size` values, scales beyond the 4 GiB ceiling of a raw byte distribution, and makes proximity-to-stall queries trivial.

| Metric | Tags | Recorded on |
| --- | --- | --- |
| `runtime/workflow/payload/size_ratio` | `app_id`, `namespace`, `workflow_name` | Every workflow dispatch (`runWorkflow`) |
| `runtime/workflow/activity/payload/size_ratio` | `app_id`, `namespace`, `workflow_name`, `activity_name` | Every activity dispatch (including the one that trips the stall) |

Both histograms share buckets concentrated around the 0.95 stall threshold:

```
0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 1.0, 1.5, 2.0
```

Values at or above `1.0` correspond to dispatches that exceeded `--max-body-size` itself. Values in the `(0.95, 1.0]` range correspond to dispatches that tripped the safety threshold and were stalled.

Recording is skipped entirely when `--max-body-size` is not configured, because the ratio is undefined without a limit.

### Suggested alerts

A practical baseline using Prometheus:

```promql
# Any workflow whose 99th-percentile dispatch is within 5% of the stall threshold.
histogram_quantile(0.99,
  sum by (le, app_id, workflow_name) (
    rate(runtime_workflow_payload_size_ratio_bucket[5m])
  )
) > 0.9
```

```promql
# Any activity that has already stalled at least once in the last 5 minutes.
sum by (app_id, workflow_name, activity_name) (
  increase(runtime_workflow_activity_payload_size_ratio_bucket{le="+Inf"}[5m])
  -
  increase(runtime_workflow_activity_payload_size_ratio_bucket{le="0.95"}[5m])
) > 0
```

Both queries are independent of the actual `--max-body-size` setting, so they continue to work after you raise the limit.

## Related links

- [How-To: Handle larger body requests]({{% ref increase-request-size.md %}}) (raising `--max-body-size`)
- [Workflow features and concepts]({{% ref workflow-features-concepts.md %}})
- [How-To: Manage workflows]({{% ref howto-manage-workflow.md %}}) (force-purge)
- [Workflow architecture]({{% ref workflow-architecture.md %}})
