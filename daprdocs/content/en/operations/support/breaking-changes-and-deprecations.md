---
type: docs
title: "Breaking changes and deprecations"
linkTitle: "Breaking changes and deprecations"
weight: 2500
description: "Handling of breaking changes and deprecations"
---

## Breaking changes 

Breaking changes are defined as a change to any of the following that cause compilation errors or undesirable runtime behavior to an existing 3rd party consumer application or script after upgrading to the next stable minor version of a Dapr artifact (SDK, CLI, runtime, etc):

- Code behavior
- Schema
- Default configuration value
- Command line argument
- Published metric
- Kubernetes resource template
- Publicly accessible API
- Publicly visible SDK interface, method, class, or attribute

Breaking changes can be applied right away to the following cases:

- Projects that have not reached version 1.0.0 yet
- Preview feature
- Alpha API
- Preview or Alpha interface, class, method or attribute in SDK
- Dapr Component in Alpha or Beta
- Interfaces for `github.com/dapr/components-contrib`
- URLs in Docs and Blog
- An **exceptional** case where it is **required** to fix a critical bug or security vulnerability.

### Process for applying breaking changes

There is a process for applying breaking changes:

1. A deprecation notice must be posted as part of a release. 
1. The breaking changes are applied two (2) releases after the release in which the deprecation was announced. 
   - For example, feature X is announced to be deprecated in the 1.0.0 release notes and will then be removed in 1.2.0.

## Deprecations

Deprecations can apply to:

1. APIs, including alpha APIs
1. Preview features
1. Components
1. CLI
1. Features that could result in security vulnerabilities

Deprecations appear in release notes under a section named “Deprecations”, which indicates:

- The point in the future the now-deprecated feature will no longer be supported. For example release x.y.z.  This is at least two (2) releases prior.
- Document any steps the user must take to modify their code, operations, etc if applicable in the release notes.

After announcing a future breaking change, the change will happen in 2 releases or 6 months, whichever is greater. Deprecated features should respond with warning but do nothing otherwise.


## Announced deprecations

| Feature               |   Deprecation announcement   | Removal       |
|-----------------------|-----------------------|------------------------- |
| GET /v1.0/shutdown API (Users should use [POST API]({{< ref kubernetes-job.md >}}) instead) | 1.2.0 | 1.4.0 |
| Java domain builder classes deprecated (Users should use [setters](https://github.com/dapr/java-sdk/issues/587) instead) | Java SDK 1.3.0 | Java SDK 1.5.0 |
| Service invocation will no longer provide a default content type header of `application/json` when no content-type is specified. You must explicitly [set a content-type header]({{< ref "service_invocation_api.md#request-contents" >}}) for service invocation if your invoked apps rely on this header. | 1.7.0 | 1.9.0 |
| gRPC service invocation using `invoke` method is deprecated. Use proxy mode service invocation instead. See [How-To: Invoke services using gRPC ]({{< ref howto-invoke-services-grpc.md >}}) to use the proxy mode.| 1.9.0 | 1.10.0 |
| The CLI flag `--app-ssl` (in both the Dapr CLI and daprd) has been deprecated in favor of using `--app-protocol` with values `https` or `grpcs`. [daprd:6158](https://github.com/dapr/dapr/issues/6158) [cli:1267](https://github.com/dapr/cli/issues/1267)| 1.11.0 | 1.13.0 |
| Hazelcast PubSub Component | 1.9.0 | 1.11.0 |
| Twitter Binding Component | 1.10.0 | 1.11.0 |
| NATS Streaming PubSub Component | 1.11.0 | 1.13.0 |

## Related links

- Read the [Versioning Policy]({{< ref support-versioning.md >}})
- Read the [Supported Releases]({{< ref support-release-policy.md >}})
