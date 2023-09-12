---
type: docs
title: "Upgrade Dapr on a Kubernetes cluster"
linkTitle: "Upgrade Dapr"
weight: 30000
description: "Follow these steps to upgrade Dapr on Kubernetes and ensure a smooth upgrade."
---

You can upgrade the Dapr control plane on a Kubernetes cluster using either the Dapr CLI or Helm.

{{% alert title="Note" color="primary" %}}
Refer to the [Dapr version policy]({{< ref "support-release-policy.md#upgrade-paths" >}}) for guidance on Dapr's upgrade path.
{{% /alert %}}

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}
## Upgrade using the Dapr CLI

You can upgrade Dapr using the [Dapr CLI]({{< ref install-dapr-cli.md >}}).

### Prerequisites

- [Install the Dapr CLI]({{< ref install-dapr-cli.md >}})
- An existing [Kubernetes cluster running with Dapr]({{< ref cluster >}})

### Upgrade existing cluster to {{% dapr-latest-version long="true" %}}

```bash
dapr upgrade -k --runtime-version={{% dapr-latest-version long="true" %}}
```

[You can provide all the available Helm chart configurations using the Dapr CLI.](https://github.com/dapr/cli#supplying-helm-values)

### Troubleshoot upgrading via the CLI

There is a known issue running upgrades on clusters that may have previously had a version prior to 1.0.0-rc.2 installed on a cluster.

While this issue is uncommon, a few upgrade path edge cases may leave an incompatible `CustomResourceDefinition` installed on your cluster. If this is your scenario, you may see an error message like the following:

```
❌  Failed to upgrade Dapr: Warning: kubectl apply should be used on resource created by either kubectl create --save-config or kubectl apply
The CustomResourceDefinition "configurations.dapr.io" is invalid: spec.preserveUnknownFields: Invalid value: true: must be false in order to use defaults in the schema

```

#### Solution

1. Run the following command to upgrade the `CustomResourceDefinition` to a compatible version:

    ```sh
    kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/5a15b3e0f093d2d0938b12f144c7047474a290fe/charts/dapr/crds/configuration.yaml
    ```

1. Proceed with the `dapr upgrade --runtime-version {{% dapr-latest-version long="true" %}} -k` command.

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}
## Upgrade using Helm

You can upgrade Dapr using a Helm v3 chart.

❗**Important:** The latest Dapr Helm chart no longer supports Helm v2. [Migrate from Helm v2 to Helm v3](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).

### Prerequisites

- [Install Helm v3](https://github.com/helm/helm/releases)
- An existing [Kubernetes cluster running with Dapr]({{< ref cluster >}})

### Upgrade existing cluster to {{% dapr-latest-version long="true" %}}

As of version 1.0.0 onwards, existing certificate values will automatically be reused when upgrading Dapr using Helm.

> **Note** Helm does not handle upgrading resources, so you need to perform that manually. Resources are backward-compatible and should only be installed forward.

1. Upgrade Dapr to version {{% dapr-latest-version long="true" %}}:

   ```bash
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/components.yaml
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/configuration.yaml
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/subscription.yaml
   kubectl apply -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/resiliency.yaml
   kubectl apply -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/httpendpoints.yaml
   ```

   ```bash
   helm repo update
   ```

   ```bash
   helm upgrade dapr dapr/dapr --version {{% dapr-latest-version long="true" %}} --namespace dapr-system --wait
   ```
   > If you're using a values file, remember to add the `--values` option when running the upgrade command.*

1. Ensure all pods are running:

   ```bash
   kubectl get pods -n dapr-system -w

   NAME                                     READY   STATUS    RESTARTS   AGE
   dapr-dashboard-69f5c5c867-mqhg4          1/1     Running   0          42s
   dapr-operator-5cdd6b7f9c-9sl7g           1/1     Running   0          41s
   dapr-placement-server-0                  1/1     Running   0          41s
   dapr-sentry-84565c747b-7bh8h             1/1     Running   0          35s
   dapr-sidecar-injector-68f868668f-6xnbt   1/1     Running   0          41s
   ```

1. Restart your application deployments to update the Dapr runtime:

   ```bash
   kubectl rollout restart deploy/<DEPLOYMENT-NAME>
   ```

{{% /codetab %}}

{{< /tabs >}}


## Upgrade existing Dapr deployment to enable high availability mode

[Enable high availability mode in an existing Dapr deployment with a few additional steps.]({{< ref "kubernetes-production.md#enabling-high-availability-in-an-existing-dapr-deployment" >}})

## Related links

- [Dapr on Kubernetes]({{< ref kubernetes-overview.md >}})
- [More on upgrading Dapr with Helm]({{< ref "kubernetes-production.md#upgrade-dapr-with-helm" >}})
- [Dapr production guidelines]({{< ref kubernetes-production.md >}})