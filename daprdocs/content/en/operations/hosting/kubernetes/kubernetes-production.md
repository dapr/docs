---
type: docs
title: "Production guidelines on Kubernetes"
linkTitle: "Production guidelines"
weight: 40000
description: "Recommendations and practices for deploying Dapr to a Kubernetes cluster in a production-ready configuration"
---

## Cluster and capacity requirements

Dapr support for Kubernetes is aligned with [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy/). 

For a production-ready Kubernetes cluster deployment, we recommended you run a cluster of at least 3 worker nodes to support a highly-available control plane installation.

Use the following resource settings as a starting point. Requirements will vary depending on cluster size, number of pods, and other factors, so you should perform individual testing to find the right values for your environment:

| Deployment  | CPU | Memory
|-------------|-----|-------
| **Operator**  | Limit: 1, Request: 100m | Limit: 200Mi, Request: 100Mi
| **Sidecar Injector** | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 30Mi
| **Sentry**    | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 30Mi
| **Placement** | Limit: 1, Request: 250m  | Limit: 150Mi, Request: 75Mi
| **Dashboard** | Limit: 200m, Request: 50m  | Limit: 200Mi, Request: 20Mi

{{% alert title="Note" color="primary" %}}
For more info, read the [concept article on CPU and Memory resource units and their meaning](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes).
{{% /alert %}}

### Helm

When installing Dapr using Helm, no default limit/request values are set. Each component has a `resources` option (for example, `dapr_dashboard.resources`), which you can use to tune the Dapr control plane to fit your environment.

The [Helm chart readme](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) has detailed information and examples.

For local/dev installations, you might simply want to skip configuring the `resources` options.

### Optional components

The following Dapr control plane deployments are optional:

- **Placement**: needed to use Dapr Actors
- **Sentry**: needed for mTLS for service to service invocation
- **Dashboard**: needed to get an operational view of the cluster

## Sidecar resource settings

To set the resource assignments for the Dapr sidecar, see the annotations [here]({{< ref "arguments-annotations-overview.md" >}}).
The specific annotations related to resource constraints are:

- `dapr.io/sidecar-cpu-limit`
- `dapr.io/sidecar-memory-limit`
- `dapr.io/sidecar-cpu-request`
- `dapr.io/sidecar-memory-request`

If not set, the Dapr sidecar will run without resource settings, which may lead to issues. For a production-ready setup it is strongly recommended to configure these settings.

For more details on configuring resource in Kubernetes see [Assign Memory Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/) and [Assign CPU Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/).

Example settings for the Dapr sidecar in a production-ready setup:

| CPU | Memory |
|-----|--------|
| Limit: 300m, Request: 100m | Limit: 1000Mi, Request: 250Mi

{{% alert title="Note" color="primary" %}}
Since Dapr is intended to do much of the I/O heavy lifting for your app, it's expected that the resources given to Dapr enable you to drastically reduce the resource allocations for the application.
{{% /alert %}}

The CPU and memory limits above account for the fact that Dapr is intended to support a high number of I/O bound operations. It is strongly recommended that you use a monitoring tool to get a baseline for the sidecar (and app) containers and tune these settings based on those baselines.

### Setting soft memory limits on Dapr sidecar

It is recommended to set soft memory limits on the Dapr sidecar when you have set up memory limits. 
This allows the sidecar garbage collector to free up memory when the memory usage is above the limit instead of 
waiting to be double of the last amount of memory present in the heap when it was run, which is the default behavior 
of the [garbage collector](https://tip.golang.org/doc/gc-guide#Memory_limit) used in Go, and can lead to OOM Kill events.

For example, for an app with app-id `nodeapp`, if you have set your memory limit to be 1000Mi as mentioned above, you can use the following in your pod annotations:

```yaml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    # our daprd memory settings
    dapr.io/sidecar-memory-limit: "1000Mi"   # your memory limit
    dapr.io/env: "GOMEMLIMIT=900MiB"         # 90% of your memory limit. Also notice the suffix "MiB" instead of "Mi"
```

In this example, the soft limit has been set to be 90% as recommended in [garbage collector tips](https://tip.golang.org/doc/gc-guide#Memory_limit) where it is recommend to leave 5-10% for other services.

The `GOMEMLIMIT` environment variable [allows](https://pkg.go.dev/runtime) certain suffixes for the memory size: `B, KiB, MiB, GiB, and TiB.`

## Highly-available mode

When deploying Dapr in a production-ready configuration, it is recommend to deploy with a highly available (HA) configuration of the control plane, which creates 3 replicas of each control plane pod in the dapr-system namespace. This configuration allows the Dapr control plane to retain 3 running instances and survive individual node failures and other outages.

For a new Dapr deployment, the HA mode can be set with both the [Dapr CLI]({{< ref "kubernetes-deploy.md#install-in-highly-available-mode" >}}) and with [Helm charts]({{< ref "kubernetes-deploy.md#add-and-install-dapr-helm-chart" >}}).

For an existing Dapr deployment, enabling the HA mode requires additional steps. Please refer to [this paragraph]({{< ref "#enabling-high-availability-in-an-existing-dapr-deployment" >}}) for more details.

## Deploying Dapr with Helm

[Visit the full guide on deploying Dapr with Helm]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}}).

### Parameters file

Instead of specifying parameters on the command line, it's recommended to create a values file. This file should be checked into source control so that you can track its changes.

For a full list of all available options you can set in the values file (or by using the `--set` command-line option), see https://github.com/dapr/dapr/blob/master/charts/dapr/README.md.

Instead of using either `helm install` or `helm upgrade` as shown below, you can also run `helm upgrade --install` - this will dynamically determine whether to install or upgrade.

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

This command will run 3 replicas of each control plane service in the dapr-system namespace.

{{% alert title="Note" color="primary" %}}
The Dapr Helm chart automatically deploys with affinity for nodes with the label `kubernetes.io/os=linux`. You can deploy the Dapr control plane to Windows nodes, but most users should not need to. For more information see [Deploying to a Hybrid Linux/Windows K8s Cluster]({{< ref "kubernetes-hybrid-clusters.md" >}}).

{{% /alert %}}

## Upgrading Dapr with Helm

Dapr supports zero-downtime upgrades. The upgrade path includes the following steps:

1. Upgrading a CLI version (optional but recommended)
2. Updating the Dapr control plane
3. Updating the data plane (Dapr sidecars)

### Upgrading the CLI

To upgrade the Dapr CLI, [download the latest version](https://github.com/dapr/cli/releases) of the CLI and ensure it's in your path.

### Upgrading the control plane

See [steps to upgrade Dapr on a Kubernetes cluster]({{< ref "kubernetes-upgrade.md#helm" >}}).

### Updating the data plane (sidecars)

The last step is to update pods that are running Dapr to pick up the new version of the Dapr runtime.
To do that, simply issue a rollout restart command for any deployment that has the `dapr.io/enabled` annotation:

```bash
kubectl rollout restart deploy/<Application deployment name>
```

To see a list of all your Dapr enabled deployments, you can either use the [Dapr Dashboard](https://github.com/dapr/dashboard) or run the following command using the Dapr CLI:

```bash
dapr list -k

APP ID     APP PORT  AGE  CREATED
nodeapp    3000      16h  2020-07-29 17:16.22
```

### Enabling high-availability in an existing Dapr deployment

Enabling HA mode for an existing Dapr deployment requires two steps:

1. Delete the existing placement stateful set:

   ```bash
   kubectl delete statefulset.apps/dapr-placement-server -n dapr-system
   ```

1. Issue the upgrade command:

   ```bash
   helm upgrade dapr ./charts/dapr -n dapr-system --set global.ha.enabled=true
   ```

You delete the placement stateful set because, in the HA mode, the placement service adds [Raft](https://raft.github.io/) for leader election. However, Kubernetes only allows for limited fields in stateful sets to be patched, subsequently failing upgrade of the placement service.

Deletion of the existing placement stateful set is safe. The agents will reconnect and re-register with the newly created placement service, which will persist its table in Raft.

## Recommended security configuration

When properly configured, Dapr ensures secure communication. It can also make your application more secure with a number of built-in features.

It is recommended that a production-ready deployment includes the following settings:

1. **Mutual Authentication (mTLS)** should be enabled. Note that Dapr has mTLS on by default. For details on how to bring your own certificates, see [here]({{< ref "mtls.md#bringing-your-own-certificates" >}})

2. **App to Dapr API authentication** is enabled. This is the communication between your application and the Dapr sidecar. To secure the Dapr API from unauthorized application access, it is recommended to enable Dapr's token based auth. See [enable API token authentication in Dapr]({{< ref "api-token.md" >}}) for details

3. **Dapr to App API authentication** is enabled. This is the communication between Dapr and your application. This ensures that Dapr knows that it is communicating with an authorized application. See [Authenticate requests from Dapr using token authentication]({{< ref "app-api-token.md" >}}) for details

4. All component YAMLs should have **secret data configured in a secret store** and not hard-coded in the YAML file. See [here]({{< ref "component-secrets.md" >}}) on how to use secrets with Dapr components

5. The Dapr **control plane is installed on a dedicated namespace** such as `dapr-system`.

6. Dapr also supports **scoping components for certain applications**. This is not a required practice, and can be enabled according to your security needs. See [here]({{< ref "component-scopes.md" >}}) for more info.

## Service account tokens

By default, Kubernetes mounts a volume containing a [Service Account token](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) in each container. Applications can use this token, whose permissions vary depending on the configuration of the cluster and namespace, among other things, to perform API calls against the Kubernetes control plane.

When creating a new Pod (or a Deployment, StatefulSet, Job, etc), you can disable auto-mounting the Service Account token by setting `automountServiceAccountToken: false` in your pod's spec.

It is recommended that you consider deploying your apps with `automountServiceAccountToken: false` to improve the security posture of your pods, unless your apps depend on having a Service Account token. For example, you may need a Service Account token if:

- You are using Dapr components that interact with the Kubernetes APIs, for example the [Kubernetes secret store]({{< ref "kubernetes-secret-store.md" >}}) or the [Kubernetes Events binding]{{< ref "kubernetes-binding.md" >}}).  
  Note that initializing Dapr components using [component secrets]({{< ref "component-secrets.md" >}}) stored as Kubernetes secrets does **not** require a Service Account token, so you can still set `automountServiceAccountToken: false` in this case. Only calling the Kubernetes secret store at runtime, using the [Secrets management]({{< ref "secrets-overview.md" >}}) building block, is impacted.
- Your own application needs to interact with the Kubernetes APIs.

Because of the reasons above, Dapr does not set `automountServiceAccountToken: false` automatically for you. However, in all situations where the Service Account is not required by your solution, it is recommended that you set this option in the pods spec.

## Tracing and metrics configuration

Dapr has tracing and metrics enabled by default. It is *recommended* that you set up distributed tracing and metrics for your applications and the Dapr control plane in production.

If you already have your own observability set-up, you can disable tracing and metrics for Dapr.

### Tracing

To configure a tracing backend for Dapr visit [this]({{< ref "setup-tracing.md" >}}) link.

### Metrics

For metrics, Dapr exposes a Prometheus endpoint listening on port 9090 which can be scraped by Prometheus.

To setup Prometheus, Grafana and other monitoring tools with Dapr, visit [this]({{< ref "observability" >}}) link.

## Injector watchdog

The Dapr Operator service includes an _injector watchdog_ which can be used to detect and remediate situations where your application's pods may be deployed without the Dapr sidecar (the `daprd` container) when they should have been. For example, it can assist with recovering the applications after a total cluster failure.

The injector watchdog is disabled by default when running Dapr in Kubernetes mode and it is recommended that you consider enabling it with values that are appropriate for your specific situation.

Refer to the documentation for the [Dapr operator]({{< ref operator >}}) service for more details on the injector watchdog and how to enable it.

## Configuring seccompProfile for sidecar containers

By default, the Dapr sidecar Injector injects a sidecar without any `seccompProfile`. However, to have Dapr sidecar container run successfully in a namespace with [Restricted](https://kubernetes.io/docs/concepts/security/pod-security-standards/#restricted) profile, the sidecar container needs to have `securityContext.seccompProfile.Type` to not be `nil`. 

Refer to [this]({{< ref "arguments-annotations-overview.md" >}}) documentation to set appropriate `seccompProfile` on sidecar container according to which profile it is running with.

## Best Practices 

Watch this video for a deep dive into the best practices for running Dapr in production with Kubernetes

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube-nocookie.com/embed/_U9wJqq-H1g" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
