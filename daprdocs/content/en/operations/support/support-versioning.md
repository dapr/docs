---
type: docs
title: "Versioning policy"
linkTitle: "Versioning "
weight: 200
description: "Dapr's versioning policies"
---

## Introduction
Dapr is designed for future changes in the runtime, APIs and components with versioning schemes. This topic describes the versioning schemes and strategies for APIs, manifests such as components and repos and how deprecations and breaking changes are communicated. 

## Versioning
Versioning is the process of assigning either unique version names or unique version numbers to unique states of computer software. 
- Versioning provides compatibility, explicit change control and handling changes, in particular breaking changes
- Dapr strives to be backwards compatible. If a breaking change is needed it’ll be announced in advance
- Deprecated features are done over multiple releases with both new and deprecated features working side-by-side

Versioning refers to the following Dapr repos: dapr, CLI, each stable language SDKs, dashboard, components-contrib, quickstarts, helm-charts and documentation.

Dapr has the following versioning schemes 
- Dapr `HTTP API` versioned with `MAJOR.MINOR` 
- Dapr `GRPC API` with `MAJOR`
- Releases (GitHub repositories including dapr, CLI, SDKs and Helm Chart) with `MAJOR.MINOR.PATCH`
- Dapr `Manifests` with `MAJOR.MINOR` (Components in component-config GitHub repositories, Subscriptions, Configurations)
- Documentation and Quickstarts repositories are versioned with the Dapr runtime repository versioning

## Dapr API 
The Dapr HTTP API is versioned according to these [REST API guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#71-url-structure).According to the guidelines above, 
- A `MAJOR` version of the API is incremented when a deprecation is expected of the older version. Any such deprecation will be communicated and an upgrade path made available.
- A `MINOR` versions *may* be incremented for any other changes. For example a change to the JSON schema of the message sent to the API.
The definition of a breaking change to the API can be viewed [here](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#123-definition-of-a-breaking-change).
- Experimental APIs include an “alpha” suffix to denote for their alpha status. For example v1.0alpha, v2.0alpha, etc.

Note that the Dapr APIs and the binaries releases (runtime, CLI, SDKs) are independent.

## Dapr runtime 
Dapr releases use major.minor.patch. For example 1.0.0. Read [supported releases]({{< ref state_api.md >}}) for more on the versioning of releases. 

## Helm Charts
Helm charts are versioned with the Dapr runtime.

## Language SDKs, CLI and Dashboard
The Dapr language SDKs, CLI and Dashboard are versioned independently from the Dapr runtime and can be released at different schedules. See this [table]({{< ref state_api.md >}}) to show the compatibility between versions of the SDKs, CLI, Dashboard and runtime. Each new release on the runtime lists the corresponding supported SDKs, CLI and Dashboard. 

SDKs, CLIs and Dashboard are versioning follows a major.minor.patch format. A major version will be incremented when there’s a non-backwards compatible change in an SDK (for example, changing a parameter on a client method. A minor version is updated for new features and bug fixes and the patch version is incremented in case of bug or security hot fixes.

## Components
Components are implemented in a separate GitHub repository and follow a separate versioning from the Dapr runtime. Components-contrib follows major.minor.patch format. A major version will be incremented when there’s a non-backwards compatible change in a component interface (for example, changing an existing method in the State Store interface). A minor version is updated for new features (implementations of new components) and the patch version is incremented in case of bug / security hot fixes.  The components-contrib repo release is a flat version across all components inside.  That is, a version for the components-contrib repo release is made up of all the schemas for the components inside it. A new version of Dapr does not mean there is a new release of components-contrib if there are no component changes.  Certain components will be recommended for production usage based on the following status: alpha, beta and GA (stable). These statuses are not related to versioning. The version for components adheres to major versions (vX), as patches and non-breaking changes are added to the latest major version.
Upon the release of 1.0, a table will show all the components along with their respective versions and their status.


## Related links
* List of [state store components]({{< ref supported-state-stores.md >}})
* Read the [state management API reference]({{< ref state_api.md >}})
* Read the [actors API reference]({{< ref actors_api.md >}})
