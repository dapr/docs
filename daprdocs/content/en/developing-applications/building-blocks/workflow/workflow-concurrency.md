---
type: docs
title: Workflow Execution Concurrency
linkTitle: Workflow Execution Concurrency
weight: 9000
description: "Configure concurrency for Dapr Workflows to rate limit workflow and activity executions."
---

You can configure the maximum concurrent workflows and activities that can be executed at any one time with the following configuration.
These limits are imposed on a _per_ sidecar basis, meaning that if you have 10 replicas of your workflow app, the effective limit is 10 times the configured value.

Setting these limits can help prevent resource exhaustion on your Dapr sidecar and application, or to drain down a backlog of workflows if there had been a spike in activity causing resource contention.
These limits do not distinguish between different workflow or activity definitions, so they apply to all workflows and activities running in the sidecar.

See the [Dapr Configuration documentation]({{% ref configuration-overview.md %}}) for more information on how to apply configuration to your Dapr applications.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  workflow:
    maxConcurrentWorkflowInvocations: 100 # Default is infinite
    maxConcurrentActivityInvocations: 1000 # Default is infinite
```

## Related links

- [Try out Dapr Workflows using the quickstart]({{% ref workflow-quickstart.md %}})
- [Workflow overview]({{% ref workflow-overview.md %}})
- [Workflow API reference]({{% ref workflow_api.md %}})
- Try out the following examples:
   - [Python](https://github.com/dapr/python-sdk/tree/master/examples/demo_workflow)
   - [JavaScript](https://github.com/dapr/js-sdk/tree/main/examples/workflow)
   - [.NET](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow)
   - [Java](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/workflows)
   - [Go](https://github.com/dapr/go-sdk/tree/main/examples/workflow/README.md)
