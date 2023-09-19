---
type: docs
title: "Production guidelines on Kubernetes"
linkTitle: "Production guidelines"
weight: 40000
description: "Best practices for deploying Dapr to a Kubernetes cluster in a production-ready configuration"
---

## Cluster and capacity requirements

Dapr support for Kubernetes is aligned with [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy/). 

Use the following resource settings as a starting point. Requirements vary depending on cluster size, number of pods, and other factors. Perform individual testing to find the right values for your environment.

| Deployment  | CPU | Memory
|-------------|-----|-------
| **Operator**  | Limit: 1, Request: 100m | Limit: 200Mi, Request: 100Mi
| **Sidecar Injector** | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 30Mi
| **Sentry**    | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 30Mi
| **Placement** | Limit: 1, Request: 250m  | Limit: 150Mi, Request: 75Mi
| **Dashboard** | Limit: 200m, Request: 50m  | Limit: 200Mi, Request: 20Mi

{{% alert title="Note" color="primary" %}}
For more information, refer to the Kubernetes documentation on [CPU and Memory resource units and their meaning](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes).
{{% /alert %}}

### Helm

When installing Dapr using Helm, no default limit/request values are set. Each component has a `resources` option (for example, `dapr_dashboard.resources`), which you can use to tune the Dapr control plane to fit your environment.

The [Helm chart readme](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) has detailed information and examples.

For local/dev installations, you might want to skip configuring the `resources` options.

### Optional components

The following Dapr control plane deployments are optional:

- **Placement**: For using Dapr Actors
- **Sentry**: For mTLS for service-to-service invocation
- **Dashboard**: For an operational view of the cluster

## Sidecar resource settings

[Set the resource assignments for the Dapr sidecar using the supported annotations]({{< ref "arguments-annotations-overview.md" >}}). The specific annotations related to **resource constraints** are:

- `dapr.io/sidecar-cpu-limit`
- `dapr.io/sidecar-memory-limit`
- `dapr.io/sidecar-cpu-request`
- `dapr.io/sidecar-memory-request`

If not set, the Dapr sidecar runs without resource settings, which may lead to issues. For a production-ready setup, it's strongly recommended to configure these settings.

Example settings for the Dapr sidecar in a production-ready setup:

| CPU | Memory |
|-----|--------|
| Limit: 300m, Request: 100m | Limit: 1000Mi, Request: 250Mi

The CPU and memory limits above account for Dapr supporting a high number of I/O bound operations. Use a [monitoring tool]({{< ref observability >}}) to get a baseline for the sidecar (and app) containers and tune these settings based on those baselines.

For more details on configuring resource in Kubernetes, see the following Kubernetes guides:
- [Assign Memory Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/) 
- [Assign CPU Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/)

{{% alert title="Note" color="primary" %}}
Since Dapr is intended to do much of the I/O heavy lifting for your app, the resources given to Dapr drastically reduce the resource allocations for the application.
{{% /alert %}}

### Setting soft memory limits on Dapr sidecar

Set soft memory limits on the Dapr sidecar when you've set up memory limits. With soft memory limits, the sidecar garbage collector frees up memory once it exceeds the limit instead of waiting for it to be double of the last amount of memory present in the heap when it was run. Waiting is the default behavior of the [garbage collector](https://tip.golang.org/doc/gc-guide#Memory_limit) used in Go, and can lead to OOM Kill events.

For example, for an app with app-id `nodeapp` with memory limit set to 1000Mi, you can use the following in your pod annotations:

```yaml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    # our daprd memory settings
    dapr.io/sidecar-memory-limit: "1000Mi"   # your memory limit
    dapr.io/env: "GOMEMLIMIT=900MiB"         # 90% of your memory limit. Also notice the suffix "MiB" instead of "Mi"
```

In this example, the soft limit has been set to be 90% to leave 5-10% for other services, [as recommended](https://tip.golang.org/doc/gc-guide#Memory_limit).

The `GOMEMLIMIT` environment variable [allows certain suffixes for the memory size: `B`, `KiB`, `MiB`, `GiB`, and `TiB`.](https://pkg.go.dev/runtime)

## High availability mode

When deploying Dapr in a production-ready configuration, it's best to deploy with a high availability (HA) configuration of the control plane. This creates three replicas of each control plane pod in the `dapr-system` namespace, allowing the Dapr control plane to retain three running instances and survive individual node failures and other outages.

For a new Dapr deployment, HA mode can be set with both: 
- The [Dapr CLI]({{< ref "kubernetes-deploy.md#install-in-highly-available-mode" >}}), and
- [Helm charts]({{< ref "kubernetes-deploy.md#add-and-install-dapr-helm-chart" >}})

For an existing Dapr deployment, [you can enable HA mode in a few extra steps]({{< ref "#enabling-high-availability-in-an-existing-dapr-deployment" >}}).

## Deploy Dapr with Helm

[Visit the full guide on deploying Dapr with Helm]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}}).

### Parameters file

It's recommended to create a values file, instead of specifying parameters on the command. Check the values file into source control so that you can track its changes.

[See a full list of available parameters and settings](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md).

The following command runs three replicas of each control plane service in the `dapr-system` namespace.

```bash
# Add/update a official Dapr Helm repo.
helm repo add dapr https://dapr.github.io/helm-charts/
# or add/update a private Dapr Helm repo.
helm repo add dapr http://helm.custom-domain.com/dapr/dapr/ \
   --username=xxx --password=xxx
helm repo update

# See which chart versions are available
helm search repo dapr --devel --versions

# create a values file to store variables
touch values.yml
cat << EOF >> values.yml
global:
  ha:
    enabled: true
EOF

# run install/upgrade
helm install dapr dapr/dapr \
  --version=<Dapr chart version> \
  --namespace dapr-system \
  --create-namespace \
  --values values.yml \
  --wait

# verify the installation
kubectl get pods --namespace dapr-system
```

{{% alert title="Note" color="primary" %}}
The example above uses `helm install` and `helm upgrade`. You can also run `helm upgrade --install` to dynamically determine whether to install or upgrade.
{{% /alert %}}

The Dapr Helm chart automatically deploys with affinity for nodes with the label `kubernetes.io/os=linux`. You can deploy the Dapr control plane to Windows nodes. For more information, see [Deploying to a Hybrid Linux/Windows K8s Cluster]({{< ref "kubernetes-hybrid-clusters.md" >}}).

## Upgrade Dapr with Helm

Dapr supports zero-downtime upgrades in the following steps.

### Upgrade the CLI (recommended)

Upgrading the CLI is optional, but recommended.

1. [Download the latest version](https://github.com/dapr/cli/releases) of the CLI.
1. Verify the Dapr CLI is in your path.

### Upgrade the control plane

[Upgrade Dapr on a Kubernetes cluster]({{< ref "kubernetes-upgrade.md#helm" >}}).

### Update the data plane (sidecars)

Update pods that are running Dapr to pick up the new version of the Dapr runtime.

1. Issue a rollout restart command for any deployment that has the `dapr.io/enabled` annotation:

   ```bash
   kubectl rollout restart deploy/<Application deployment name>
   ```

1. View a list of all your Dapr enabled deployments via either:  
   - The [Dapr Dashboard](https://github.com/dapr/dashboard) 
   - Running the following command using the Dapr CLI:

      ```bash
      dapr list -k
      
      APP ID     APP PORT  AGE  CREATED
      nodeapp    3000      16h  2020-07-29 17:16.22
      ```

### Enable high availability in an existing Dapr deployment

Enabling HA mode for an existing Dapr deployment requires two steps:

1. Delete the existing placement stateful set.

   ```bash
   kubectl delete statefulset.apps/dapr-placement-server -n dapr-system
   ```

   You delete the placement stateful set because, in HA mode, the placement service adds [Raft](https://raft.github.io/) for leader election. However, Kubernetes only allows for limited fields in stateful sets to be patched, subsequently failing upgrade of the placement service.

   Deletion of the existing placement stateful set is safe. The agents reconnect and re-register with the newly created placement service, which persist its table in Raft.

1. Issue the upgrade command.

   ```bash
   helm upgrade dapr ./charts/dapr -n dapr-system --set global.ha.enabled=true
   ```

## Recommended security configuration

When properly configured, Dapr ensures secure communication and can make your application more secure with a number of built-in features.

Verify your production-ready deployment includes the following settings:

1. **Mutual Authentication (mTLS)** is enabled. Dapr has mTLS on by default. [Learn more about how to bring your own certificates]({{< ref "mtls.md#bringing-your-own-certificates" >}}).

1. **App to Dapr API authentication** is enabled. This is the communication between your application and the Dapr sidecar. To secure the Dapr API from unauthorized application access, [enable Dapr's token-based authentication]({{< ref "api-token.md" >}}).

1. **Dapr to App API authentication** is enabled. This is the communication between Dapr and your application. [Let Dapr know that it is communicating with an authorized application using token authentication]({{< ref "app-api-token.md" >}}).

1. **Component secret data is configured in a secret store** and not hard-coded in the component YAML file. [Learn how to use secrets with Dapr components]({{< ref "component-secrets.md" >}}).

1. The Dapr **control plane is installed on a dedicated namespace**, such as `dapr-system`.

1. Dapr supports and is enabled to **scope components for certain applications**. This is not a required practice. [Learn more about component scopes]({{< ref "component-scopes.md" >}}).

## Service account tokens

By default, Kubernetes mounts a volume containing a [Service Account token](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) in each container. Applications can use this token, whose permissions vary depending on the configuration of the cluster and namespace, among other things, to perform API calls against the Kubernetes control plane.

When creating a new Pod (or a Deployment, StatefulSet, Job, etc), you can disable auto-mounting the Service Account token by setting `automountServiceAccountToken: false` in your pod's spec.

It's recommended that you consider deploying your apps with `automountServiceAccountToken: false` to improve the security posture of your pods, unless your apps depend on having a Service Account token. For example, you may need a Service Account token if:

- Your application needs to interact with the Kubernetes APIs.
- You are using Dapr components that interact with the Kubernetes APIs; for example, the [Kubernetes secret store]({{< ref "kubernetes-secret-store.md" >}}) or the [Kubernetes Events binding]({{< ref "kubernetes-binding.md" >}}).  

Thus, Dapr does not set `automountServiceAccountToken: false` automatically for you. However, in all situations where the Service Account is not required by your solution, it's recommended that you set this option in the pods spec.

{{% alert title="Note" color="primary" %}}
Initializing Dapr components using [component secrets]({{< ref "component-secrets.md" >}}) stored as Kubernetes secrets does **not** require a Service Account token, so you can still set `automountServiceAccountToken: false` in this case. Only calling the Kubernetes secret store at runtime, using the [Secrets management]({{< ref "secrets-overview.md" >}}) building block, is impacted.
{{% /alert %}}

## Tracing and metrics configuration

Tracing and metrics are enabled in Dapr by default. It's recommended that you set up distributed tracing and metrics for your applications and the Dapr control plane in production.

If you already have your own observability setup, you can disable tracing and metrics for Dapr.

### Tracing

[Configure a tracing backend for Dapr]({{< ref "setup-tracing.md" >}}).

### Metrics

For metrics, Dapr exposes a Prometheus endpoint listening on port 9090, which can be scraped by Prometheus.

[Set up Prometheus, Grafana, and other monitoring tools with Dapr]({{< ref "observability" >}}).

## Injector watchdog

The Dapr Operator service includes an **injector watchdog**, which can be used to detect and remediate situations where your application's pods may be deployed without the Dapr sidecar (the `daprd` container). For example, it can assist with recovering the applications after a total cluster failure.

The injector watchdog is disabled by default when running Dapr in Kubernetes mode. However, you should consider enabling it with the appropriate values for your specific situation.

Refer to the [Dapr operator service documentation]({{< ref operator >}}) for more details on the injector watchdog and how to enable it.

## Configure `seccompProfile` for sidecar containers

By default, the Dapr sidecar injector injects a sidecar without any `seccompProfile`. However, for the Dapr sidecar container to run successfully in a namespace with the [Restricted](https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted) profile, the sidecar container needs `securityContext.seccompProfile.Type` to not be `nil`. 

Refer to [the Arguments and Annotations overview]({{< ref "arguments-annotations-overview.md" >}}) to set the appropriate `seccompProfile` on the sidecar container.

## Best Practices 

Watch this video for a deep dive into the best practices for running Dapr in production with Kubernetes.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/_U9wJqq-H1g" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Related links

- [Deploy Dapr on Kubernetes]({{< ref kubernetes-deploy.md >}})
- [Upgrade Dapr on Kubernetes]({{< ref kubernetes-upgrade.md >}})