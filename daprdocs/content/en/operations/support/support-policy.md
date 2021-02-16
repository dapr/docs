---
type: docs
title: "Supported releases"
linkTitle: "Supported releases"
weight: 100
description: "Release support and upgrade policies "
---

## Introduction
This topic details the supported versions of Dapr releases. 

Dapr releases use `MAJOR.MINOR.PATCH` versioning. For example 1.0.0

  * A `PATCH` version is incremented for bug and security hot fixes.
  * A `MINOR` version is updated as part of the regular release cadence, including new features, bug and security fixes. 
  * A `MAJOR` version is updated when there’s a non-backward compatible change to the runtime, such as an API change or a schema update to any of the Dapr manifests: components, subscriptions, configurations. A `MAJOR` release can also occur then there is a considered a significant addition/change of functionality that needs to differentiate from the previous version.

A supported release means;

- A hoxfix patch is released if the current release has a critical issue such as a mainline broken scenario or a security issue. Each of these are reviewed on a case by case basis.
- Issues are investigated for the supported releases. If a release is no longer supported, you will need to upgrade to a newer release and determine if the issue is still relevant.   

From the 1.0.0 release onwards two (2) versions of Dapr are supported, the current and previous versions. Typically these are `MINOR`release updates. This means that there is a rolling window that moves forward for supported releases and it is your operational responsibility to remain up to date with these supported versions. If you have an older version of Dapr you may have to do several intermediate upgrades to get to a supported version. 

## Supported versions
The table below show the versions of Dapr releases that have been tested together and form a "packaged" release. Any other combinations of releases are not supported. 

| Release date | Runtime     | CLI  | SDKs  | Dashboard  | Status |
|--------------------|:--------:|:--------|---------|---------|---------|
| Feb 17th 2021 | 1.0.0 | 1.0.0 | Java 1.0.0 </br>Go 1.0.0 </br>PHP 1.0.0 </br>Python 1.0.0 </br>.NET 1.0.0 | 1.0.0 | Supported |

## Upgrade paths
The table below shows the tested upgrade paths for the Dapr runtime. For example you are able to upgrade from 1.0-rc4 to the 1.0 release. Any other combinations of upgrades have not been tested. 

|  Current Runtime version | Must upgrade through  | Target Runtime version   |
|---------|------|------- |
| 1.0-rc4 |  N/A |  1.0.0 |

## Related links
* List of [state store components]({{< ref supported-state-stores.md >}})
* Read the [state management API reference]({{< ref state_api.md >}})
* Read the [actors API reference]({{< ref actors_api.md >}})
