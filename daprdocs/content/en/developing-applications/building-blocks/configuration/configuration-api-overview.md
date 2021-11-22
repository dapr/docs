---
type: docs
title: "Configuration overview"
linkTitle: "Overview"
weight: 1000
description: "Overview of the configuration API building block"
---

## Introduction

Consuming application configuration is a common task when writing applications and frequently configuration stores are used to manage this configuration data. A configuration item is often dynamic in nature and is tightly coupled to the needs of the application that consumes it. For example, common uses for application configuration include names of secrets, different identifiers, partition or consumer IDs, names of databases to connect to etc. These configuration items are typically stored as key/value items in a state store or database. Application configuration can be changed by either developers or operators at runtime and the developer needs to be notified of these changes in order to take the required action and load the new configuration. Also configuration data is typically read only from the application API perspective, with updates to the configuration store made through operator tooling. Dapr's configuration API allows developers to consume configuration items that are returned as read only key/value pairs and subscribe to changes whenever a configuration item changes.

<img src="/images/configuration-api-overview.png" width=900>

It is worth noting that this configuration API should not be confused with the [Dapr sidecar and control plane configuration]({{<ref "configuration-overview">}}) which is used to set policies and settings on instances of Dapr sidecars or the installed Dapr control plane.

## Features

*This API is currently in `Alpha` state and only available on gRPC. An HTTP1.1 supported version with this URL syntax `/v1.0/configuration` will be available before the API is certified into `Stable` state.*

## Next steps
Follow these guides on:
- [How-To: Read application configuration from a configuration store]({{< ref howto-manage-configuration.md >}})

