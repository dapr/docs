---
type: docs
title: "Workflow versioning in the JavaScript SDK"
linkTitle: "Workflow versioning"
weight: 1300
description: Evolve workflow code with replay-safe named patches
---

Workflow code must reproduce the task sequence recorded in history when replaying an existing instance.
Changing activity order, adding durable tasks, or changing branches without a migration strategy can cause
nondeterministic replay failures.

With `@dapr/dapr` **3.19.0 or later**, use `ctx.isPatched(patchName)` for named code changes.
Patch evaluation is validated by the Dapr runtime; the examples in this documentation use runtime **1.19 or later**.
See [Workflow versioning]({{% ref workflow-versioning.md %}}) for the runtime-level concepts.

## Introduce a patch

Suppose an existing workflow calls `chargePayment` directly, and a new deployment must validate the order first:

```javascript
function* orderWorkflow(ctx, order) {
  if (ctx.isPatched("validate-order-before-charge")) {
    yield ctx.callActivity("validateOrder", order);
  }
  return yield ctx.callActivity("chargePayment", order);
}
```

When an unrecorded patch is first encountered during replay, `isPatched` returns `false` so the old execution
path remains intact. Outside replay, or when the patch is already recorded, it returns `true`. The SDK
records evaluated patches for runtime version validation.

Names are case-sensitive and must not be empty or whitespace. Use a distinct name for each logical change;
never reuse a name for an unrelated change or compute it from nondeterministic values.

## Keep old execution paths available

Keep the original branch and patch check until every instance that needs that history has finished and is
no longer eligible for replay or rerun. Do not reorder patch checks or remove them merely because a new
deployment has started. Account for retained histories, suspended instances, child workflows, and
administrative reruns when planning retirement.

For a larger contract change, register a new workflow name and send new instances to it while keeping the
old implementation available for existing instances. Patching does not convert persisted serialized data
or turn an incompatible payload schema into a compatible one.

## Next steps

- [Workflow serialization]({{% ref js-workflow-serialization.md %}})
- [Migrate to explicit data references]({{% ref js-workflow-data-references.md %}}#adopt-references-in-existing-applications)
