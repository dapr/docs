---
type: docs
title: "Kubernetes ConfigMap"
linkTitle: "Kubernetes ConfigMap"
description: Detailed information on the Kubernetes ConfigMap configuration store component
---

## Component format

To set up a Kubernetes ConfigMap configuration store, create a component of type `configuration.kubernetes`. See [this guide]({{% ref "howto-manage-configuration.md#configure-a-dapr-configuration-store" %}}) on how to create and apply a configuration store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: configuration.kubernetes
  version: v1
  metadata:
  - name: configMapName
    value: "<CONFIGMAP_NAME>"
  # Optional: path to kubeconfig (only needed when running outside the cluster)
  #- name: kubeconfigPath
  #  value: "/path/to/kubeconfig"
  # Optional: informer resync period
  #- name: resyncPeriod
  #  value: "0"
```

## Spec metadata fields

| Field | Required | Details | Example |
|-------|:--------:|---------|---------|
| `configMapName` | Y | The name of the Kubernetes ConfigMap to use as the configuration source. Must be a valid [RFC 1123](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names) DNS label name. | `"my-app-config"` |
| `kubeconfigPath` | N | Path to a kubeconfig file. When running inside a Kubernetes cluster (the typical case), this is not needed. When running outside the cluster, it falls back to the `KUBECONFIG` environment variable, then to `~/.kube/config`. | `"/path/to/kubeconfig"` |
| `resyncPeriod` | N | How often the informer fully re-syncs the ConfigMap state from the API server as a consistency safety net, independent of watch events. Set to `"0"` (default) to disable periodic resync and rely solely on watch events. | `"10m"` |

## Set up a Kubernetes ConfigMap as Configuration Store

The Kubernetes ConfigMap configuration store requires no external infrastructure beyond the Kubernetes cluster itself.

### Prerequisites

- A running Kubernetes cluster
- The Dapr sidecar must have RBAC permissions to `get`, `list`, and `watch` ConfigMaps in the target namespace

### 1. Create the ConfigMap

Create a ConfigMap that holds your configuration data:

```bash
kubectl create configmap my-app-config \
  --from-literal=log.level=info \
  --from-literal=feature.enable-v2=true \
  --from-literal=database.pool-size=10
```

Or using a YAML manifest:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-app-config
  namespace: default
data:
  log.level: "info"
  feature.enable-v2: "true"
  database.pool-size: "10"
```

### 2. Configure RBAC

The Dapr sidecar's service account needs permission to access ConfigMaps. Create a Role and RoleBinding:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dapr-configmap-reader
  namespace: default
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dapr-configmap-reader-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: default
  namespace: default
roleRef:
  kind: Role
  name: dapr-configmap-reader
  apiGroup: rbac.authorization.k8s.io
```

{{% alert title="Note" color="primary" %}}
If you installed Dapr using the Helm chart with default settings, the Dapr sidecar service account may already have sufficient permissions. Verify your cluster's RBAC configuration.
{{% /alert %}}

### 3. Apply the component

Apply the Dapr component configuration:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myconfigstore
spec:
  type: configuration.kubernetes
  version: v1
  metadata:
  - name: configMapName
    value: "my-app-config"
```

## How it works

### Data model

Each key in the ConfigMap's `data` field becomes a configuration item. The ConfigMap's `resourceVersion` (assigned by Kubernetes) is used as the version for all items.

Keys in the `binaryData` field are also supported. Their values are returned as base64-encoded strings with `"encoding": "base64"` in the item metadata.

### Subscriptions

When you subscribe to configuration changes, the component uses a [Kubernetes SharedIndexInformer](https://pkg.go.dev/k8s.io/client-go/tools/cache#SharedIndexInformer) with a field selector scoped to the specific ConfigMap. This means:

- Only changes to the watched ConfigMap generate API traffic
- Changes are detected in near real-time via the Kubernetes watch API
- Only changed keys are included in update notifications

When a key is deleted from the ConfigMap, the notification includes `"deleted": "true"` in the item's metadata with an empty value.

### Namespace

The component watches ConfigMaps in the same namespace as the Dapr sidecar. The namespace is derived from the `NAMESPACE` environment variable, which is automatically set by the Dapr sidecar injector via the Kubernetes downward API. If the variable is not set, the component defaults to `"default"`.

Cross-namespace ConfigMap access is not supported. This is by design to maintain Kubernetes namespace security boundaries.

{{% alert title="Note" color="primary" %}}
ConfigMaps are not encrypted at rest by default in Kubernetes. Do not store sensitive values (passwords, API keys, tokens) in ConfigMaps. Use [Kubernetes Secrets]({{% ref "kubernetes-secret-store" %}}) or a dedicated secret store instead.
{{% /alert %}}

## Related links

- [Basic schema for a Dapr component]({{% ref component-schema %}})
- [Configuration building block]({{% ref configuration-api-overview %}})
- Read [How-To: Manage configuration from a store]({{% ref "howto-manage-configuration" %}}) for instructions on how to use a configuration store.
- [Kubernetes ConfigMap documentation](https://kubernetes.io/docs/concepts/configuration/configmap/)
