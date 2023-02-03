---
type: docs
title: "Preview features"
linkTitle: "Preview features"
weight: 4000
description: "List of current preview features"
---
Preview features in Dapr are considered experimental when they are first released.

Runtime preview features require explicit opt-in in order to be used. The runtime opt-in is specified in a preview setting feature in Dapr's application configuration. See [How-To: Enable preview features]({{<ref preview-features>}}) for more information.

For CLI there is no explicit opt-in, just the version that this was first made available.

## Current preview features

| Feature | Description | Setting | Documentation | Version introduced |
| ---------- |-------------|---------|---------------|-----------------|
| **App Middleware** | Allow middleware components to be executed when making service-to-service calls | N/A | [App Middleware]({{< ref "middleware.md#app-middleware" >}}) | v1.9 |
| **App health checks** | Allows configuring app health checks | `AppHealthCheck` | [App health checks]({{< ref "app-health.md" >}}) | v1.9 |
| **Pluggable components** | Allows creating self-hosted gRPC-based components written in any language that supports gRPC. The following component APIs are supported: State stores, Pub/sub, Bindings | N/A | [Pluggable components concept]({{< ref "components-concept#pluggable-components" >}})| v1.9  |
| **Workflows** | Author workflows as code to automate and orchestrate tasks within your application, like messaging, state management, and failure handling | N/A | [Workflows concept]({{< ref "components-concept#workflows" >}})| v1.10  |