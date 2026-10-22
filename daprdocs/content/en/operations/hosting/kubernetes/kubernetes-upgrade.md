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
   kubectl apply -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/mcpservers.yaml
   kubectl apply -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/workflowaccesspolicy.yaml
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

## Scheduler RBAC

From Dapr 1.19, the Scheduler needs `get`, `list` and `watch` on `pods` in the Dapr control plane namespace to detect whether a Placement service is deployed. It needs this on every 1.19 upgrade, whether or not you enable scheduler placement. The Helm chart and `dapr upgrade -k` add it as the `dapr-scheduler-pods` Role and RoleBinding in the release namespace. The `dapr-scheduler` ClusterRole (or Role, in namespaced RBAC mode) keeps `namespaces` only.

## Upgrade existing Dapr deployment to enable high availability mode

[Enable high availability mode in an existing Dapr deployment with a few additional steps.]({{% ref "kubernetes-production.md#enabling-high-availability-in-an-existing-dapr-deployment" %}})

## Enable scheduler placement in an existing Dapr deployment

Actor placement can be served by the Scheduler service instead of the standalone Placement service by upgrading with `global.scheduler.placement.enabled=true`. The placement StatefulSet is removed by the same upgrade, and running sidecars adopt scheduler placement on their own: no sidecar restarts are needed, in either direction. The schedulers detect the placement pods leaving and take over within a few seconds; outside of this upgrade, a placement pod that crashes or restarts does not move the placement authority. [Learn more about serving placement from the Scheduler service.]({{% ref "placement#serving-placement-from-the-scheduler-service" %}})

{{% alert title="Important" color="warning" %}}
Complete your Dapr version rollout before enabling this setting. Sidecars running an older Dapr version can only use the Placement service: with it undeployed, their Actor and Workflow APIs stall until the pod is upgraded to a version that supports scheduler placement. No actor state is lost. While a Placement service is running, it remains the placement authority: the Scheduler does not serve placement while one is present, so the cluster keeps a single placement authority throughout the rollout. Once no Placement service remains, the Scheduler serves placement, and a connected older sidecar is logged as a warning, since nothing is left to serve it.
{{% /alert %}}

Before you enable it:

- Upgrade every sidecar to 1.19 or later: restart your applications after the control plane upgrade.
- Keep `global.scheduler.enabled=true`, `global.actors.enabled=true` and `global.actors.serviceName=placement` (the defaults). The Helm chart fails to render the setting without them.
- If you manage RBAC outside the Helm chart, add the [Scheduler RBAC](#scheduler-rbac) Role.

Enable it with `helm upgrade` and `--set global.scheduler.placement.enabled=true` plus your usual values, or with the CLI:

```bash
dapr upgrade -k --runtime-version={{% dapr-latest-version long="true" %}} --set global.scheduler.placement.enabled=true
```

The same upgrade restarts the Schedulers to pick up `--placement-enabled=true`, so expect actor and workflow activity to pause until the Schedulers are ready again, longer than the few seconds of the takeover itself.

To verify, check that sidecars log `Connected to scheduler placement leader <address>` and that exactly one Scheduler reports `dapr_scheduler_placement_leader` as `1`. If `dapr_scheduler_placement_incapable_sidecars` is above `0`, or a Scheduler logs `A sidecar running an older Dapr version is connected`, upgrade those pods: their actor and workflow APIs stall.

To roll back, upgrade with the setting `false`: the placement StatefulSet is redeployed and the schedulers hand placement back to it, again without sidecar restarts. In both directions, the change [reassigns actors once]({{% ref "placement#serving-placement-from-the-scheduler-service" %}}) because the two services place actors with different algorithms. Actor state is unaffected.

Because `helm upgrade` resets values not passed on the command line, pass the setting on every subsequent upgrade (or keep it in your values file), otherwise the placement StatefulSet is redeployed and placement hands back to it.

## Downgrade

{{% alert title="Warning" color="warning" %}}
Do not roll back from 1.19 directly to 1.17.6 or earlier. The safe rollback target is 1.18.x.
{{% /alert %}}

Dapr 1.19 still issues the Ed25519 workload identity keys that Dapr 1.18 introduced, and Sentry persists the Ed25519-keyed CA in the `dapr-trust-bundle` secret. Sentry versions before 1.17.7 cannot parse this bundle and crash on startup with:

```
fatal: error creating CA: failed to get CA bundle:
failed to verify CA bundle: unsupported key type ed25519.PrivateKey
```

| From | To | Result |
|---|---|---|
| 1.19 | 1.18.x | Safe. 1.18 and 1.19 write the same trust bundle format. |
| 1.19 | 1.17.7 or a later 1.17.x | Safe. 1.17.7 reads the Ed25519 trust bundle ([#9904](https://github.com/dapr/dapr/pull/9904)). |
| 1.19 | 1.17.6 or earlier | Sentry crash-loops at startup. Roll back to 1.17.7 first, confirm `dapr status -k` is healthy, then downgrade from there. |

A downgrade to 1.18.x or 1.17.7 needs no CA rotation. Rotate the CA only if your target is below 1.17.7 or your security posture requires it.

Downgrade in this order:

1. If you enabled [scheduler placement](#enable-scheduler-placement-in-an-existing-dapr-deployment), upgrade with `global.scheduler.placement.enabled=false` and wait for the Placement pods to be ready. Check that your sidecars log `Connected to placement service: <address>`.

1. If you created `WorkflowAccessPolicy` rules that use `requires`, remove or narrow them. A 1.18 control plane and sidecar do not know the field and apply those rules without the gate.

1. Roll back the control plane with Helm:

   ```bash
   helm history dapr -n dapr-system
   helm rollback dapr <REVISION> -n dapr-system --wait
   ```

   Or pin a specific version:

   ```bash
   helm upgrade dapr dapr/dapr --version 1.18.7 --namespace dapr-system --wait
   ```

1. Restart your application deployments, so the sidecars pick up the older injector image and get new identities from the rolled-back Sentry:

   ```bash
   kubectl rollout restart deploy/<DEPLOYMENT-NAME>
   ```

## Related links

- [Dapr on Kubernetes]({{% ref kubernetes-overview.md %}})
- [More on upgrading Dapr with Helm]({{% ref "kubernetes-production.md#upgrade-dapr-with-helm" %}})
- [Dapr production guidelines]({{% ref kubernetes-production.md %}})
