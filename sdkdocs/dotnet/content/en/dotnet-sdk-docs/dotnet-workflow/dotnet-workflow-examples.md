---
type: docs
title: ".NET Workflow Examples"
linkTitle: "Workflow examples on GitHub"
weight: 3000
description: Explore Dapr Workflow code examples on GitHub
---

## Workflow tutorials in the Dapr Quickstarts repository

The Dapr Quickstarts repository on GitHub includes many workflow tutorials that showcase the various workflow patterns and how to use the workflow management operations. You can find these tutorials in the [quickstarts/tutorials/workflow/csharp](https://github.com/dapr/quickstarts/tree/master/tutorials/workflow/csharp) folder.

## Workflow examples in the .NET SDK repository

The Dapr .NET SDK repository on GitHub contains several examples demonstrating how to use Dapr Workflows with .NET. You can find these examples in the [examples/Workflow](https://github.com/dapr/dotnet-sdk/tree/master/examples/Workflow) folder.

For large payloads, see [Workflow data references (alpha)]({{% ref dotnet-workflow-data-references.md %}}) for
automatic offloading, explicit references, a streaming example, and a benchmark comparison. The binary store and
this SDK integration are alpha. Cross-app call inputs are inline by default; explicitly allowing references requires
compatible, payload-aware destinations with access to the same referenced objects. The
[JavaScript SDK]({{% ref js-workflow-data-references.md %}}) also supports the version-1 envelope from
`@dapr/dapr` 3.19.0-rc.4 with compatible serialization and no payload-stage reversal.
Do not assume other language SDKs support data references.

## Next steps

- [Try the Dapr University Workflow track](https://www.diagrid.io/dapr-university#dapr-workflow)
