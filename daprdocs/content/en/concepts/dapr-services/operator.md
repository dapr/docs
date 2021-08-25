---
type: docs
title: "Dapr operator service overview"
linkTitle: "Operator"
description: "Overview of the Dapr operator process"
---

When running Dapr in [Kubernetes mode]({{< ref kubernetes >}}), a pod running the Dapr operator service manages [Dapr component]({{< ref components >}}) updates and provides Kubernetes services endpoints for Dapr.

## Running the operator service

The operator service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{< ref kubernetes >}}).