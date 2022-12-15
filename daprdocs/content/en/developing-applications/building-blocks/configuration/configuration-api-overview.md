---
type: docs
title: "Configuration overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the configuration API building block"
---

{{% alert title="Preview" color="primary" %}}
  This API is currently in `Alpha` state.
{{% /alert %}}

Consuming application configuration is a common task when writing applications. Frequently, configuration stores are used to manage this configuration data. A configuration item is often dynamic in nature and tightly coupled to the needs of the application that consumes it. 

For example, application configuration can include:
- Names of secrets
- Different identifiers
- Partition or consumer IDs
- Names of databases to connect to, etc 

Usually, configuration items are stored as key/value items in a state store or database. Developers or operators can change application configuration at runtime. Once changes are made, the developer will be notified to take the required action and load the new configuration. 

Configuration data is read-only from the application API perspective, with updates to the configuration store made through operator tooling. With Dapr's configuration API, you can:
- Consume configuration items that are returned as read-only key/value pairs
- Subscribe to changes whenever a configuration item changes

<img src="/images/configuration-api-overview.png" width=900>

{{% alert title="Note" color="primary" %}}
 The Configuration API should not be confused with the [Dapr sidecar and control plane configuration]({{< ref "configuration-overview" >}}), which is used to set policies and settings on Dapr sidecar instances or the installed Dapr control plane.
{{% /alert %}}

## Try out configuration

### Quickstart

Want to put the Dapr configuration API to the test? Walk through the following quickstart and tutorials to see the configuration API in action:

| Quickstart | Description |
| ---------- | ----------- |
| [Configuration quickstart]({{< ref configuration-quickstart.md >}}) | Get configuration items or subscribe to configuration changes using the configuration API. |

### Start using the configuration API directly in your app

Want to skip the quickstarts? Not a problem. You can try out the configuration building block directly in your application to read and manage configuration data. After [Dapr is installed]({{< ref "getting-started/_index.md" >}}), you can begin using the configuration API starting with [the configuration how-to guide]({{< ref howto-manage-configuration.md >}}).


## Next steps
Follow these guides on:
- [How-To: Read application configuration from a configuration store]({{< ref howto-manage-configuration.md >}})

