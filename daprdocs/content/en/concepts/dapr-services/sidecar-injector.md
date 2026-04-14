---
type: docs
title: "Dapr Sidecar Injector control plane service overview"
linkTitle: "Sidecar injector"
description: "Overview of the Dapr sidecar injector process"
---

When running Dapr in [Kubernetes mode]({{% ref kubernetes %}}), a pod is created running the Dapr Sidecar Injector service, which looks for pods initialized with the [Dapr annotations]({{% ref arguments-annotations-overview %}}), and then creates another container in that pod for the [daprd service]({{% ref sidecar %}})

## Running the sidecar injector

The sidecar injector service is deployed as part of `dapr init -k`, or via the Dapr Helm charts. For more information on running Dapr on Kubernetes, visit the [Kubernetes hosting page]({{% ref kubernetes %}}).

## Authorized service accounts

The sidecar injector's admission webhook only processes requests from authorized Kubernetes service accounts. This controls which controllers and service accounts are allowed to trigger sidecar injection when creating or updating pods.

By default, the injector authorizes a set of well-known Kubernetes controllers (such as `replicaset-controller`, `deployment-controller`, `statefulset-controller`, and others), as well as users in the `system:masters` group. You can authorize additional service accounts by configuring the `dapr_sidecar_injector.allowedServiceAccounts` Helm value.

If a pod creation request comes from a service account that is not authorized, the injector skips sidecar injection for that pod silently.

### Configuration

Service accounts are specified in `namespace:name` format. Multiple entries can be comma-separated. Glob patterns are supported using Go's [`path.Match`](https://pkg.go.dev/path#Match) syntax:

| Pattern | Description | Example |
|---------|-------------|---------|
| `*` | Matches any sequence of characters | `my-ns:*` matches all service accounts in `my-ns` |
| `?` | Matches any single character | `staging-?:*` matches `staging-1`, `staging-a`, etc. |
| `[...]` | Matches a character class | `proj-*:sa-[abc]*` matches service accounts starting with `sa-a`, `sa-b`, or `sa-c` |

### Examples

Configure via [Helm](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md#dapr-sidecar-injector-options):

```bash
helm install dapr dapr/dapr --namespace dapr-system \
  --set dapr_sidecar_injector.allowedServiceAccounts="my-namespace:my-service-account,team-*:deploy-*"
```

Or in a Helm values file:

```yaml
dapr_sidecar_injector:
  allowedServiceAccounts: "my-namespace:my-service-account,team-*:deploy-*"
```

Pattern examples:

| Pattern | Matches |
|---------|---------|
| `my-ns:my-sa` | Exact match: service account `my-sa` in namespace `my-ns` |
| `my-ns:*` | All service accounts in namespace `my-ns` |
| `team-*:deploy-*` | Service accounts starting with `deploy-` in namespaces starting with `team-` |
| `*:*` | All service accounts in all namespaces |

{{% alert title="Note" color="primary" %}}
The `dapr_sidecar_injector.allowedServiceAccountsPrefixNames` Helm value is deprecated as of v1.18. Migrate your entries to `dapr_sidecar_injector.allowedServiceAccounts` using glob patterns instead (for example, `my-ns:my-prefix*` replaces the previous prefix-matching behavior). The deprecated value still functions but logs a deprecation warning.
{{% /alert %}}

