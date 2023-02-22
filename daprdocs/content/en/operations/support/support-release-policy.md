---
type: docs
title: "Supported runtime and SDK releases"
linkTitle: "Supported releases"
weight: 2000
description: "Runtime and SDK release support and upgrade policies "
---

## Introduction
This topic details the supported versions of Dapr releases, the upgrade policies and how deprecations and breaking changes are communicated in all Dapr repositories (runtime, CLI, SDKs, etc) at versions 1.x and above.

Dapr releases use `MAJOR.MINOR.PATCH` versioning. For example, 1.0.0.

| Versioning | Description |
| ---------- | ----------- |
| `MAJOR`    | Updated when there’s a non-backward compatible change to the runtime, such as an API change. A `MAJOR` release can also occur then there is a considered a significant addition/change of functionality that needs to differentiate from the previous version. |
| `MINOR`    | Updated as part of the regular release cadence, including new features, bug, and security fixes. |
| `PATCH`    | Incremented for a critical issue (P0) and security hot fixes. |

A supported release means:

- A hoxfix patch is released if the release has a critical issue such as a mainline broken scenario or a security issue. Each of these are reviewed on a case by case basis.
- Issues are investigated for the supported releases. If a release is no longer supported, you need to upgrade to a newer release and determine if the issue is still relevant.

From the 1.8.0 release onwards three (3) versions of Dapr are supported; the current and previous two (2) versions. Typically these are `MINOR`release updates. This means that there is a rolling window that moves forward for supported releases and it is your operational responsibility to remain up to date with these supported versions. If you have an older version of Dapr you may have to do intermediate upgrades to get to a supported version.

There will be at least 6 weeks between major.minor version releases giving users a 12 week (3 month) rolling window for upgrading.

Patch support is for supported versions (current and previous).

## Supported versions

The table below shows the versions of Dapr releases that have been tested together and form a "packaged" release. Any other combinations of releases are not supported.

| Release date | Runtime     | CLI  | SDKs  | Dashboard  | Status |
|--------------------|:--------:|:--------|---------|---------|---------|
| February 20 2023 | 1.10.1</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0 | 0.11.0 | Supported (current) |
| February 14 2023 | 1.10.0</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0 | 0.11.0 | Supported|
| December 2nd 2022 | 1.9.5</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | Supported |
| November 17th 2022 | 1.9.4</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | Supported |
| November 4th 2022 | 1.9.3</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | Supported |
| November 1st 2022 | 1.9.2</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.1 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | Supported |
| October 26th 2022 | 1.9.1</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.1 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | Supported |
| October 13th 2022 | 1.9.0</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | Supported |
| October 26th 2022 | 1.8.6</br>  | 1.8.1 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | Supported |
| October 13th 2022 | 1.8.5</br>  | 1.8.1 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | Supported |
| August 10th 2022 | 1.8.4</br>  | 1.8.1 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | Supported |
| July 29th 2022 | 1.8.3</br>  | 1.8.0 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | Supported |
| July 21st 2022 | 1.8.2</br>  | 1.8.0 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | Supported |
| July 20th 2022 | 1.8.1</br>  | 1.8.0 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | Supported |
| July 7th 2022 | 1.8.0</br>   | 1.8.0 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | Supported |
| October 26th 2022 | 1.7.5</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1 | 0.10.0 | Supported |
| May 31st 2022 | 1.7.4</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1 | 0.10.0 | Supported |
| May 17th 2022 | 1.7.3</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1 | 0.10.0 | Supported |
| Apr 22th 2022 | 1.7.2</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0 | 0.10.0 | Supported |
| Apr 20th 2022 | 1.7.1</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0 | 0.10.0 | Supported |
| Apr 7th 2022 | 1.7.0</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0 | 0.10.0 | Supported |
| Apr 20th 2022 | 1.6.2</br>   | 1.6.0 | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0 | 0.9.0 | Unsupported |
| Mar 25th 2022 | 1.6.1</br>   | 1.6.0 | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0 | 0.9.0 | Unsupported |
| Jan 25th 2022 | 1.6.0</br>   | 1.6.0 | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0 | 0.9.0 | Unsupported |
| Mar 25th 2022 | 1.5.2</br>   | 1.6.0 | Java 1.3.0 </br>Go 1.3.0 </br>PHP 1.1.0 </br>Python 1.4.0 </br>.NET 1.5.0 </br>JS 1.0.2 | 0.9.0 | Unsupported |
| Dec 6th 2021  | 1.5.1</br>   | 1.5.1 | Java 1.3.0 </br>Go 1.3.0 </br>PHP 1.1.0 </br>Python 1.4.0 </br>.NET 1.5.0 </br>JS 1.0.2 | 0.9.0 | Unsupported |
| Nov 11th 2021 | 1.5.0</br>   | 1.5.0 | Java 1.3.0 </br>Go 1.3.0 </br>PHP 1.1.0 </br>Python 1.4.0 </br>.NET 1.5.0 </br>JS 1.0.2 | 0.9.0 | Unsupported |
| Dev 6th 2021  | 1.4.4</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported       |
| Oct 7th 2021  | 1.4.3</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported       |
| Sep 24th 2021 | 1.4.2</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported       |
| Sep 22nd 2021 | 1.4.1</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported       |
| Sep 15th 2021 | 1.4</br>   | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0 | 0.8.0 | Unsupported         |
| Sep 14th 2021 | 1.3.1</br> | 1.3.0 | Java 1.2.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.2.0 </br>.NET 1.3.0 | 0.7.0 | Unsupported         |
| Jul 26th 2021 | 1.3</br>   | 1.3.0 | Java 1.2.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.2.0 </br>.NET 1.3.0 | 0.7.0 | Unsupported         |

## Upgrade paths

After the 1.0 release of the runtime there may be situations where it is necessary to explicitly upgrade through an additional release to reach the desired target. For example, an upgrade from v1.0 to v1.2 may need to pass through v1.1.

{{% alert title="Note" color="primary" %}}
Dapr only has a seamless guarantee when upgrading patch versions in a single minor version, or upgrading from one minor version to the next. For example, upgrading from `v1.6.0` to `v1.6.4` or `v1.6.4` to `v1.7.0` is guaranteed tested. Upgrading more than one minor version at a time is untested and treated as best effort.
{{% /alert %}}

The table below shows the tested upgrade paths for the Dapr runtime. Any other combinations of upgrades have not been tested.

General guidance on upgrading can be found for [self hosted mode]({{< ref self-hosted-upgrade >}}) and [Kubernetes]({{< ref kubernetes-upgrade >}}) deployments. It is best to review the target version release notes for specific guidance.

|  Current Runtime version | Must upgrade through  | Target Runtime version   |
|--------------------------|-----------------------|------------------------- |
| 1.5.0 to 1.5.2           |                   N/A |                    1.6.0 |
|                          |                 1.6.0 |                    1.6.2 |
|                          |                 1.6.2 |                    1.7.5 |
|                          |                 1.7.5 |                    1.8.6 |
|                          |                 1.8.6 |                    1.9.5 |
| 1.6.0 to 1.6.2           |                   N/A |                    1.7.5 |
|                          |                 1.7.5 |                    1.8.6 |
|                          |                 1.8.6 |                    1.9.5 |
| 1.7.0 to 1.7.5           |                   N/A |                    1.8.6 |
|                          |                 1.8.6 |                    1.9.5 |
| 1.8.0 to 1.8.6           |                   N/A |                    1.9.5 |
| 1.9.0                    |                   N/A |                    1.9.5 |
| 1.10.0                   |                   N/A |                   1.10.1 |

## Breaking changes and deprecations

### Breaking changes 

Breaking changes are defined as a change to any of the following that cause compilation errors or undesirable runtime behavior to an existing 3rd party consumer application or script after upgrading to the next stable minor version of a Dapr artifact (SDK, CLI, runtime, etc):

- Code behavior
- Schema
- Default configuration value
- Command line argument
- Published metric
- Kubernetes CRD template
- Publicly accessible API
- Publicly visible SDK interface, method, class, or attribute

Breaking changes can be applied right away to the following cases:

- Projects versioned at 0.x.y
- Preview feature
- Alpha API
- Preview or Alpha interface, class, method or attribute in SDK
- Dapr Component in Alpha or Beta
- Components-Contrib interface
- URLs in Docs and Blog
- An **exceptional** case where it is **required** to fix a critical bug or security vulnerability.

#### Process for applying breaking changes

There is a process for applying breaking changes:

1. A deprecation notice must be posted as part of a release. 
1. The breaking changes are applied two (2) releases after the release in which the deprecation was announced. 
   - For example, feature X is announced to be deprecated in the 1.0.0 release notes and will then be removed in 1.2.0.

### Depreciations

Deprecations appear in release notes under a section named “Deprecations”, which indicates:

- The point in the future the now-deprecated feature will no longer be supported. For example release x.y.z.  This is at least two (2) releases prior.
- Document any steps the user must take to modify their code, operations, etc if applicable in the release notes.

After announcing a future breaking change, the change will happen in 2 releases or 6 months, whichever is greater. Deprecated features should respond with warning but do nothing otherwise.


### Announced deprecations

| Feature               |   Deprecation announcement   | Removal       |
|-----------------------|-----------------------|------------------------- |
| GET /v1.0/shutdown API (Users should use [POST API]({{< ref kubernetes-job.md >}}) instead)             |                 1.2.0 |                    1.4.0 |
| Java domain builder classes deprecated (Users should use [setters](https://github.com/dapr/java-sdk/issues/587) instead) | Java SDK 1.3.0 | Java SDK 1.5.0 |
| Service invocation will no longer provide a default content type header of `application/json` when no content-type is specified. You must explicitly [set a content-type header]({{< ref "service_invocation_api.md#request-contents" >}}) for service invocation if your invoked apps rely on this header. |                 1.7.0 |                    1.9.0 |

## Upgrade on Hosting platforms

Dapr can support multiple hosting platforms for production. With the 1.0 release the two supported platforms are Kubernetes and physical machines. For Kubernetes upgrades see [Production guidelines on Kubernetes]({{< ref kubernetes-production.md >}})

### Supported versions of dependencies 

Below is a list of software that the latest version of Dapr (v{{% dapr-latest-version long="true" %}}) has been tested against. 

| Dependency            |   Supported Version                                                                                                              |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Kubernetes                                                |  Dapr support for Kubernetes is aligned with [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy/) |
| [Open Telemetry collector (OTEL)](https://github.com/open-telemetry/opentelemetry-collector/releases)|                                                                                                                              v0.4.0|
| [Prometheus](https://prometheus.io/download/)             |                                                                                                                              v2.28 |

## Related links

- Read the [Versioning policy]({{< ref support-versioning.md >}})
