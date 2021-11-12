---
type: docs
title: "Configuration overview"
linkTitle: "Configuration overview"
weight: 1000
description: "Use Dapr to get and watch application configuration"
---

Consuming application configuration is a common task when writing applications and frequently configuration stores are used to manage this configuration data. A configuration item is often dynamic in nature and is tightly coupled to the needs of the application that consumes it. For example, common uses for application configuration include names of secrets that need to be retrieved, different identifiers, partition or consumer IDs, names of databased to connect to etc. These configuration items are typically stored as key-value items in a database.

Dapr provides a [State Management API]({{<ref "state-management-overview.md">}})) that is based on key-value stores. However, application configuration can be changed by either developers or operators at runtime and the developer needs to be notified of these changes in order to take the required action and load the new configuration. Also the configuration data may want to be read only. Dapr's Configuration API allows developers to consume configuration items that are returned as key/value pair and subscribe to changes whenever a configuration item changes.

*This API is currently in `Alpha state` and only available on gRPC. An HTTP1.1 supported version with this URL `/v1.0/configuration` will be available before the API becomes stable. *

## References

- [How-To: Manage application configuration]({{< ref howto-manage-configuration.md >}})

