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
| --- | --- | --- | --- | --- |
| **Pluggable components** | Allows creating self-hosted gRPC-based components written in any language that supports gRPC. The following component APIs are supported: State stores, Pub/sub, Bindings | N/A | [Pluggable components concept]({{<ref "components-concept#pluggable-components" >}})| v1.9  |
| **Multi-App Run for Kubernetes** | Configure multiple Dapr applications from a single configuration file and run from a single command on Kubernetes | `dapr run -k -f` | [Multi-App Run]({{< ref multi-app-dapr-run.md >}}) | v1.12 |
| **Workflows** | Author workflows as code to automate and orchestrate tasks within your application, like messaging, state management, and failure handling | N/A | [Workflows concept]({{< ref "components-concept#workflows" >}})| v1.10  |
| **Cryptography** | Encrypt or decrypt data without having to manage secrets keys  | N/A | [Cryptography concept]({{< ref "components-concept#cryptography" >}})| v1.11  |
| **Actor State TTL** | Allow actors to save records to state stores with Time To Live (TTL) set to automatically clean up old data. In its current implementation, actor state with TTL may not be reflected correctly by clients, read [Actor State Transactions]({{< ref actors_api.md >}}) for more information. | `ActorStateTTL` | [Actor State Transactions]({{< ref actors_api.md >}}) | v1.11  |
| **Component Hot Reloading** | Allows for Dapr-loaded components to be "hot reloaded". A component spec is reloaded when it is created/updated/deleted in Kubernetes or on file when running in self-hosted mode. Ignores changes to actor state stores and workflow backends. | `HotReload`| [Hot Reloading]({{< ref components-concept.md >}}) | v1.13  |
| **Subscription Hot Reloading** | Allows for declarative subscriptions to be "hot reloaded". A subscription is reloaded either when it is created/updated/deleted in Kubernetes, or on file in self-hosted mode. In-flight messages are unaffected when reloading. | `HotReload`| [Hot Reloading]({{< ref "subscription-methods.md#declarative-subscriptions" >}}) | v1.14  |
| **Scheduler Actor Reminders** | Whilst the [Scheduler service]({{< ref "concepts/dapr-services/scheduler.md" >}}) is deployed by default, Scheduler actor reminders (actor reminders stored in the Scheduler control plane service as opposed to the Placement control plane service actor reminder system) are enabled through a preview feature and needs a feature flag. | `SchedulerReminders`| [Scheduler actor reminders]({{< ref "jobs-overview.md#actor-reminders" >}}) | v1.14  |
