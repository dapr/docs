---
type: docs
title: "Versioning policy"
linkTitle: "Versioning "
weight: 1000
description: "Dapr's versioning policies"
---

## Introduction
Dapr is designed for future changes in the runtime, APIs and components with versioning schemes. This topic describes the versioning schemes and strategies for APIs, manifests such as components and Github repositories.

## Versioning
Versioning is the process of assigning either unique version names or unique version numbers to unique states of computer software.
- Versioning provides compatibility, explicit change control and handling changes, in particular breaking changes.
- Dapr strives to be backwards compatible. If a breaking change is needed it’ll be [announced in advance]({{< ref "support-release-policy#feature-and-deprecations" >}}).
- Deprecated features are done over multiple releases with both new and deprecated features working side-by-side.


Versioning refers to the following Dapr repos: dapr, CLI, stable language SDKs, dashboard, components-contrib, quickstarts, helm-charts and documentation.

Dapr has the following versioning schemes:
- Dapr `HTTP API` versioned with `MAJOR.MINOR`
- Dapr `GRPC API` with `MAJOR`
- Releases (GitHub repositories including dapr, CLI, SDKs and Helm Chart) with `MAJOR.MINOR.PATCH`
- Documentation and Quickstarts repositories are versioned with the Dapr runtime repository versioning.
- Dapr `Components` with `MAJOR` in components-contrib GitHub repositories.
- Dapr `Manifests` with `MAJOR.MINOR`. These include subscriptions and configurations.

Note that the Dapr APIs,  binaries releases (runtime, CLI, SDKs) and components are all independent from one another.

## Dapr HTTP API
The Dapr HTTP API is versioned according to these [REST API guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#71-url-structure).

Based to the these guidelines;
- A `MAJOR` version of the API is incremented when a deprecation is expected of the older version. Any such deprecation will be communicated and an upgrade path made available.
- A `MINOR` versions *may* be incremented for any other changes. For example a change to the JSON schema of the message sent to the API.
The definition of a breaking change to the API can be viewed [here](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#123-definition-of-a-breaking-change).
- Experimental APIs include an “alpha” suffix to denote for their alpha status. For example v1.0alpha, v2.0alpha, etc.

## Dapr runtime
Dapr releases use `MAJOR.MINOR.PATCH` versioning. For example 1.0.0. Read [Supported releases]({{< ref support-release-policy.md >}}) for more on the versioning of releases.

## Helm Charts
Helm charts in the [helm-charts repo](https://github.com/dapr/helm-charts) are versioned with the Dapr runtime. The Helm charts are used in the [Kubernetes deployment]({{< ref "kubernetes-deploy#install-with-helm-advanced" >}})

## Language SDKs, CLI and dashboard
The Dapr language SDKs, CLI and dashboard are versioned independently from the Dapr runtime and can be released at different schedules. See this [table]({{< ref "support-release-policy#supported-versions" >}}) to show the compatibility between versions of the SDKs, CLI, dashboard and runtime. Each new release on the runtime lists the corresponding supported SDKs, CLI and Dashboard.

SDKs, CLIs and Dashboard are versioning follows a `MAJOR.MINOR.PATCH` format. A major version is incremented when there’s a non-backwards compatible change in an SDK (for example, changing a parameter on a client method. A minor version is updated for new features and bug fixes and the patch version is incremented in case of bug or security hot fixes.

Samples and examples in SDKs version with that repo.

## Components
Components are implemented in the components-contrib repository and follow a `MAJOR` versioning scheme. The version for components adheres to major versions (vX), as patches and non-breaking changes are added to the latest major version. The version is incremented when there’s a non-backwards compatible change in a component interface, for example, changing an existing method in the State Store interface.

The [components-contrib](https://github.com/dapr/components-contrib/) repo release is a flat version across all components inside.  That is, a version for the components-contrib repo release is made up of all the schemas for the components inside it. A new version of Dapr does not mean there is a new release of components-contrib if there are no component changes.

Note: Components have a production usage lifecycle status: Alpha, Beta and Stable. These statuses are not related to their versioning. The tables of supported components shows both their versions and their status.
* List of [state store components]({{< ref supported-state-stores.md >}})
* List of [pub/sub components]({{< ref supported-pubsub.md >}})
* List of [secret store components]({{< ref supported-secret-stores.md >}})
* List of [binding components]({{< ref supported-bindings.md >}})

For more information on component versioning  read [Version 2 and beyond of a component](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md#version-2-and-beyond-of-a-component)

### Component schemas

Versioning for component YAMLs comes in two forms:
- Versioning for the component manifest. The `apiVersion`
- Version for the component implementation. The `.spec.version`

A component manifest includes the schema for an implementation in the `.spec.metadata` field, with the `.type` field denoting the implementation

See the comments in the example below:
```yaml
apiVersion: dapr.io/v1alpha1 # <-- This is the version of the component manifest
kind: Component
metadata:
  name: pubsub
spec:
  version: v1 # <-- This is the version of the pubsub.redis schema implementation
  type: pubsub.redis
  metadata:
  - name: redisHost
    value: redis-master:6379
  - name: redisPassword
    value: general-kenobi
```

### Component manifest version
The Component YAML manifest is versioned with `dapr.io/v1alpha1`.

### Component implementation version
The version for a component implementation is determined by the `.spec.version` field as can be seen in the example above. The `.spec.version` field is mandatory in a schema instance and the component fails to load if this is not present. For the release of Dapr 1.0.0 all components are marked as `v1`.The component implementation version is incremented only for non-backward compatible changes.

### Component deprecations
Deprecations of components will be announced two (2) releases ahead. Deprecation of a component, results in major version update of the component version. After 2 releases, the component is unregistered from the Dapr runtime, and trying to load it will throw a fatal exception.

## Quickstarts and Samples
Quickstarts in the [Quickstarts repo](https://github.com/dapr/quickstarts) are versioned with the runtime, where a table of corresponding versions is on the front page of the samples repo.  Users should only use Quickstarts corresponding to the version of the runtime being run.

Samples in the [Samples repo](https://github.com/dapr/samples) are each versioned on a case by case basis depending on the sample maintainer. Samples that become very out of date with the runtime releases (many versions behind) or have not been maintained for more than 1 year will be removed.

## Related links
* Read the [Supported releases]({{< ref support-release-policy.md >}})
