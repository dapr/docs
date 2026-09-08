---
type: docs
title: "Upgrade Dapr on a Kubernetes cluster"
linkTitle: "Upgrade Dapr"
weight: 30000
description: "Follow these steps to upgrade Dapr on Kubernetes and ensure a smooth upgrade."
---

You can upgrade the Dapr control plane on a Kubernetes cluster using either the Dapr CLI or Helm.

{{% alert title="Note" color="primary" %}}
Refer to the [Dapr version policy]({{% ref "support-release-policy.md#upgrade-paths" %}}) for guidance on Dapr's upgrade path.
{{% /alert %}}

{{< tabpane text=true >}}
 <!-- Dapr CLI -->
{{% tab "Dapr CLI" %}}
## Upgrade using the Dapr CLI

You can upgrade Dapr using the [Dapr CLI]({{% ref install-dapr-cli.md %}}).

### Prerequisites

- [Install the Dapr CLI]({{% ref install-dapr-cli.md %}})
- An existing [Kubernetes cluster running with Dapr]({{% ref cluster %}})

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
    kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/release-{{% dapr-latest-version short="true" %}}/charts/dapr/crds/configuration.yaml
    ```

1. Proceed with the `dapr upgrade --runtime-version {{% dapr-latest-version long="true" %}} -k` command.

{{% /tab %}}

 <!-- Helm -->
{{% tab "Helm" %}}
## Upgrade using Helm

You can upgrade Dapr using a Helm v3 chart.

❗**Important:** The latest Dapr Helm chart no longer supports Helm v2. [Migrate from Helm v2 to Helm v3](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).

### Prerequisites

- [Install Helm v3](https://github.com/helm/helm/releases)
- An existing [Kubernetes cluster running with Dapr]({{% ref cluster %}})

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
   dapr-operator-5cdd6b7f9c-9sl7g           1/1     Running   0          41s
   dapr-placement-server-0                  1/1     Running   0          41s
   dapr-sentry-84565c747b-7bh8h             1/1     Running   0          35s
   dapr-sidecar-injector-68f868668f-6xnbt   1/1     Running   0          41s
   ```

1. Restart your application deployments to update the Dapr runtime:

   ```bash
   kubectl rollout restart deploy/<DEPLOYMENT-NAME>
   ```

{{% /tab %}}

{{< /tabpane >}}


## Upgrade existing Dapr deployment to enable high availability mode

[Enable high availability mode in an existing Dapr deployment with a few additional steps.]({{% ref "kubernetes-production.md#enabling-high-availability-in-an-existing-dapr-deployment" %}})

## Enable scheduler placement in an existing Dapr deployment

Actor placement can be served by the Scheduler service instead of the standalone Placement service by upgrading with `global.scheduler.placement.enabled=true`. The placement StatefulSet is removed by the same upgrade, and running sidecars adopt scheduler placement on their own: no sidecar restarts are needed, in either direction. [Learn more about serving placement from the Scheduler service.]({{% ref "placement#serving-placement-from-the-scheduler-service" %}})

{{% alert title="Important" color="warning" %}}
Complete your Dapr version rollout before enabling this setting. Sidecars running an older Dapr version can only use the Placement service: with it undeployed, their Actor and Workflow APIs stall until the pod is upgraded to a version that supports scheduler placement. No actor state is lost. While a Placement service is running, it remains the placement authority: the Scheduler does not serve placement while one is present, so the cluster keeps a single placement authority throughout the rollout. Once no Placement service remains, the Scheduler serves placement, and a connected older sidecar is logged as a warning, since nothing is left to serve it.
{{% /alert %}}

To roll back, upgrade with the setting `false`: the placement StatefulSet is redeployed and the schedulers hand placement back to it, again without sidecar restarts. In both directions, the change [reassigns actors once]({{% ref "placement#serving-placement-from-the-scheduler-service" %}}) because the two services place actors with different algorithms. Actor state is unaffected.

Because `helm upgrade` resets values not passed on the command line, pass the setting on every subsequent upgrade (or keep it in your values file), otherwise the placement StatefulSet is redeployed and placement hands back to it.

## Related links

- [Dapr on Kubernetes]({{% ref kubernetes-overview.md %}})
- [More on upgrading Dapr with Helm]({{% ref "kubernetes-production.md#upgrade-dapr-with-helm" %}})
- [Dapr production guidelines]({{% ref kubernetes-production.md %}})
