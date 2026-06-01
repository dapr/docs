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

- A hotfix patch is released if the release has a critical issue such as a mainline broken scenario or a security issue. Each of these are reviewed on a case by case basis.
- Issues are investigated for the supported releases. If a release is no longer supported, you need to upgrade to a newer release and determine if the issue is still relevant.

From the 1.8.0 release onwards three (3) versions of Dapr are supported; the current and previous two (2) versions. Typically these are `MINOR`release updates. This means that there is a rolling window that moves forward for supported releases and it is your operational responsibility to remain up to date with these supported versions. If you have an older version of Dapr you may have to do intermediate upgrades to get to a supported version.

There will be at least 13 weeks (3 months) between major.minor version releases giving users at least a 9 month rolling window for upgrading from a non-supported version. For more details on the release process read [release cycle and cadence](https://github.com/dapr/community/blob/master/release-process.md)

Patch support is for supported versions (current and previous).

## Build variations

The Dapr's sidecar image is published to both [GitHub Container Registry](https://github.com/dapr/dapr/pkgs/container/daprd) and [Docker Registry](https://hub.docker.com/r/daprio/daprd/tags). The default image contains all components. From version 1.11, Dapr also offers a variation of the sidecar image, containing only stable components.

* Default sidecar images: `daprio/daprd:<version>` or `ghcr.io/dapr/daprd:<version>` (for example `ghcr.io/dapr/daprd:1.11.1`)
* Sidecar images for stable components: `daprio/daprd:<version>-stablecomponents` or `ghcr.io/dapr/daprd:<version>-stablecomponents` (for example `ghcr.io/dapr/daprd:1.11.1-stablecomponents`)

On Kubernetes, the sidecar image can be overwritten for the application Deployment resource with the `dapr.io/sidecar-image` annotation. See more about [Dapr's arguments and annotations]({{% ref "arguments-annotations-overview.md" %}}). The default 'daprio/daprd:latest' image is used if not specified.

Learn more about [Dapr components' certification lifecycle]({{% ref "certification-lifecycle.md" %}}).

## SDK compatibility
The SDKs and runtime are committed to non-breaking changes other than those required for security issues.  All breaking changes are announced if required in the release notes. 

**SDK and runtime forward compatibility**  
Newer Dapr SDKs support the latest version of Dapr runtime and two previous versions (N-2). 

**SDK and runtime backward compatibility**  
For a new Dapr runtime, the current SDK version and two previous versions (N-2) are supported. 

## Upgrade paths

After the 1.0 release of the runtime there may be situations where it is necessary to explicitly upgrade through an additional release to reach the desired target. For example, an upgrade from v1.0 to v1.2 may need to pass through v1.1.

{{% alert title="Note" color="primary" %}}
Dapr only has a seamless guarantee when upgrading patch versions in a single minor version, or upgrading from one minor version to the next. For example, upgrading from `v1.6.0` to `v1.6.4` or `v1.6.4` to `v1.7.0` is guaranteed tested. Upgrading more than one minor version at a time is untested and treated as best effort.
{{% /alert %}}

The table below shows the tested upgrade paths for the Dapr runtime. Any other combinations of upgrades have not been tested.

General guidance on upgrading can be found for [self hosted mode]({{% ref self-hosted-upgrade %}}) and [Kubernetes]({{% ref kubernetes-upgrade %}}) deployments. It is best to review the target version release notes for specific guidance.

## Upgrade on Hosting platforms

Dapr can support multiple hosting platforms for production. With the 1.0 release the two supported platforms are Kubernetes and physical machines. For Kubernetes upgrades see [Production guidelines on Kubernetes]({{% ref kubernetes-production.md %}})

### Supported versions of dependencies

Below is a list of software that the latest version of Dapr (v{{% dapr-latest-version long="true" %}}) has been tested against.

| Dependency            |   Supported Version                                                                                                              |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Kubernetes                                                |  Dapr support for Kubernetes is aligned with [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy/) |
| [Open Telemetry collector (OTEL)](https://github.com/open-telemetry/opentelemetry-collector/releases)|                                                                                                                              v0.101.0|
| [Prometheus](https://prometheus.io/download/)             |                                                                                                                              v2.28 |

## Related links

- Read the [Versioning Policy]({{% ref support-versioning.md %}})
- Read the [Breaking Changes and Deprecation Policy]({{% ref breaking-changes-and-deprecations.md %}})
