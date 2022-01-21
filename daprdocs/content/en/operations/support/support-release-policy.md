---
type: docs
title: "Supported releases"
linkTitle: "Supported releases"
weight: 2000
description: "Release support and upgrade policies "
---

## Introduction
This topic details the supported versions of Dapr releases, the upgrade policies and how deprecations and breaking changes are communicated.

Dapr releases use `MAJOR.MINOR.PATCH` versioning. For example 1.0.0

  * A `PATCH` version is incremented for bug and security hot fixes.
  * A `MINOR` version is updated as part of the regular release cadence, including new features, bug and security fixes.
  * A `MAJOR` version is updated when there’s a non-backward compatible change to the runtime, such as an API change.  A `MAJOR` release can also occur then there is a considered a significant addition/change of functionality that needs to differentiate from the previous version.

A supported release means;

- A hoxfix patch is released if the release has a critical issue such as a mainline broken scenario or a security issue. Each of these are reviewed on a case by case basis.
- Issues are investigated for the supported releases. If a release is no longer supported, you need to upgrade to a newer release and determine if the issue is still relevant.

From the 1.0.0 release onwards two (2) versions of Dapr are supported; the current and previous versions. Typically these are `MINOR`release updates. This means that there is a rolling window that moves forward for supported releases and it is your operational responsibility to remain up to date with these supported versions. If you have an older version of Dapr you may have to do intermediate upgrades to get to a supported version.

There will be at least 6 weeks between major.minor version releases giving users a 12 week (3 month) rolling window for upgrading.

Patch support is for supported versions (current and previous).

## Supported versions
The table below shows the versions of Dapr releases that have been tested together and form a "packaged" release. Any other combinations of releases are not supported.

| Release date | Runtime     | CLI  | SDKs  | Dashboard  | Status |
|--------------------|:--------:|:--------|---------|---------|---------|
| Feb 17th 2021 | 1.0.0</br> | 1.0.0 | Java 1.0.0 </br>Go 1.0.0 </br>PHP 1.0.0 </br>Python 1.0.0 </br>.NET 1.0.0 | 0.6.0 | Unsupported         |
| Mar 4th 2021  | 1.0.1</br> | 1.0.1 | Java 1.0.2 </br>Go 1.0.0 </br>PHP 1.0.0 </br>Python 1.0.0 </br>.NET 1.0.0 | 0.6.0 | Unsupported         |
| Apr 1st 2021 | 1.1.0</br>  | 1.1.0 | Java 1.0.2 </br>Go 1.1.0 </br>PHP 1.0.0 </br>Python 1.1.0 </br>.NET 1.1.0 | 0.6.0 | Unsupported         |
| Apr 6th 2021 | 1.1.1</br>  | 1.1.0 | Java 1.0.2 </br>Go 1.1.0 </br>PHP 1.0.0 </br>Python 1.1.0 </br>.NET 1.1.0 | 0.6.0 | Unsupported         |
| Apr 16th 2021 | 1.1.2</br> | 1.1.0 | Java 1.0.2 </br>Go 1.1.0 </br>PHP 1.0.0 </br>Python 1.1.0 </br>.NET 1.1.0 | 0.6.0 | Unsupported         |
| May 26th 2021 | 1.2.0</br> | 1.2.0 | Java 1.1.0 </br>Go 1.1.0 </br>PHP 1.1.0 </br>Python 1.1.0 </br>.NET 1.2.0 | 0.6.0 | Unsupported         |
| Jun 16th 2021 | 1.2.1</br> | 1.2.0 | Java 1.1.0 </br>Go 1.1.0 </br>PHP 1.1.0 </br>Python 1.1.0 </br>.NET 1.2.0 | 0.6.0 | Unsupported         |
| Jun 16th 2021 | 1.2.2</br> | 1.2.0 | Java 1.1.0 </br>Go 1.1.0 </br>PHP 1.1.0 </br>Python 1.1.0 </br>.NET 1.2.0 | 0.6.0 | Unsupported         |
| Jul 26th 2021 | 1.3</br>   | 1.3.0 | Java 1.2.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.2.0 </br>.NET 1.3.0 | 0.7.0 | Unsupported         |
| Sep 14th 2021 | 1.3.1</br> | 1.3.0 | Java 1.2.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.2.0 </br>.NET 1.3.0 | 0.7.0 | Unsupported         |
| Sep 15th 2021 | 1.4</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported         |
| Sep 22nd 2021 | 1.4.1</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported       |
| Sep 24th 2021 | 1.4.2</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported       |
| Oct 7th 2021  | 1.4.3</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported       |
| Dev 6th 2021  | 1.4.4</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported       |
| Nov 11th 2021 | 1.5.0</br>   | 1.5.0 | Java 1.3.0 </br>Go 1.3.0 </br>PHP 1.1.0 </br>Python 1.4.0 </br>.NET 1.5.0 </br>JS 1.0.2 | 0.9.0 | Supported |
| Dec 6th 2021  | 1.5.1</br>   | 1.5.1 | Java 1.3.0 </br>Go 1.3.0 </br>PHP 1.1.0 </br>Python 1.4.0 </br>.NET 1.5.0 </br>JS 1.0.2 | 0.9.0 | Supported |
| Jan 24th 2022 | 1.6.0</br>  | 1.6.0 | Java 1.4.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 1.1.0 | 0.9.0 | Supported (current)|
 
## Upgrade paths
After the 1.0 release of the runtime there may be situations where it is necessary to explicitly upgrade through an additional release to reach the desired target. For example an upgrade from v1.0 to v1.2 may need go pass through v1.1

The table below shows the tested upgrade paths for the Dapr runtime. Any other combinations of upgrades have not been tested.

General guidance on upgrading can be found for [self hosted mode]({{<ref self-hosted-upgrade>}}) and [Kubernetes]({{<ref kubernetes-upgrade>}}) deployments. It is best to review the target version release notes for specific guidance.

|  Current Runtime version | Must upgrade through  | Target Runtime version   |
|--------------------------|-----------------------|------------------------- |
| 1.0.0 or 1.0.1           |                   N/A |                    1.1.2 |
|                          |                 1.1.2 |                    1.2.2 |
|                          |                 1.2.2 |                    1.3.1 |
|                          |                 1.3.1 |                    1.4.4 |
|                          |                 1.4.4 |                    1.5.1 |
| 1.1.0 to 1.1.2           |                   N/A |                    1.2.2 |
|                          |                 1.2.2 |                    1.3.1 |
|                          |                 1.3.1 |                    1.4.4 |
|                          |                 1.4.4 |                    1.5.1 |
| 1.2.0 to 1.2.2           |                   N/A |                    1.3.1 |
|                          |                 1.3.1 |                    1.4.4 |
|                          |                 1.4.4 |                    1.5.1 |
| 1.3.0                    |                   N/A |                    1.3.1 |
|                          |                 1.3.1 |                    1.4.4 |
|                          |                 1.4.4 |                    1.5.1 |
| 1.3.1                    |                   N/A |                    1.4.4 |
|                          |                 1.4.4 |                    1.5.0 |
| 1.4.0 to 1.4.2           |                   N/A |                    1.4.4 |
|                          |                 1.4.4 |                    1.5.1 |

## Feature and deprecations
There is a process for announcing feature deprecations.  Deprecations are applied two (2) releases after the release in which they were announced. For example Feature X is announced to be deprecated in the 1.0.0 release notes and will then be removed in 1.2.0.

Deprecations appear in release notes under a section named “Deprecations”, which indicates:
- The point in the future the now-deprecated feature will no longer be supported. For example release x.y.z.  This is at least two (2) releases prior.
- Document any steps the user must take to modify their code, operations, etc if applicable in the release notes.

After announcing a future breaking change, the change will happen in 2 releases or 6 months, whichever is greater. Deprecated features should respond with warning but do nothing otherwise.

### Announced deprecations
| Feature               |   Deprecation announcement   | Removal       |
|-----------------------|-----------------------|------------------------- |
| GET /v1.0/shutdown API (Users should use [POST API]({{< ref kubernetes-job.md >}}) instead)             |                 1.2.0 |                    1.4.0 |

## Upgrade on Hosting platforms
Dapr can support multiple hosting platforms for production. With the 1.0 release the two supported platforms are Kubernetes and physical machines. For Kubernetes upgrades see [Production guidelines on Kubernetes]({{< ref kubernetes-production.md >}})

### Supported Kubernetes versions

Dapr follows [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy).

## Related links
* Read the [Versioning policy]({{< ref support-versioning.md >}})
