---
type: docs
title: "Production guidelines on Kubernetes"
linkTitle: "Production guidelines"
weight: 40000
description: "Recommendations and practices for deploying Dapr to a Kubernetes cluster in a production-ready configuration"
---

## Cluster capacity requirements

For a production-ready Kubernetes cluster deployment, it is recommended you run a cluster of at least 3 worker nodes to support a highly-available control plane installation.
Use the following resource settings as a starting point. Requirements will vary depending on cluster size and other factors, so perform individual testing to find the right values for your environment:

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

When installing Dapr using Helm, no default limit/request values are set. Each component has a `resources` option (for example, `dapr_dashboard.resources`), which you can use to tune the Dapr control plane to fit your environment. The [Helm chart readme](https://github.com/dapr/dapr/blob/master/charts/dapr/README.md) has detailed information and examples. For local/dev installations, you might simply want to skip configuring the `resources` options.

### Optional components

The following Dapr control plane deployments are optional:

- **Placement** - Needed for Dapr Actors
- **Sentry** - Needed for mTLS for service to service invocation
- **Dashboard** - Needed for operational view of the cluster

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

The CPU and memory limits above account for the fact that Dapr is intended to a high number of I/O bound operations. It is strongly recommended that you use a monitoring tool to baseline the sidecar (and app) containers and tune these settings based on those baselines.

## Highly-available mode

When deploying Dapr in a production-ready configuration, it's recommended to deploy with a highly available (HA) configuration of the control plane, which creates 3 replicas of each control plane pod in the dapr-system namespace. This configuration allows the Dapr control plane to retain 3 running instances and survive node failures and other outages.

For a new Dapr deployment, the HA mode can be set with both the [Dapr CLI]({{< ref "kubernetes-deploy.md#install-in-highly-available-mode" >}}) and with [Helm charts]({{< ref "kubernetes-deploy.md#add-and-install-dapr-helm-chart" >}}).

For an existing Dapr deployment, enabling the HA mode requires additional steps. Please refer to [this paragraph]({{< ref "#enabling-high-availability-in-an-existing-dapr-deployment" >}}) for more details.

## Deploying Dapr with Helm

[Visit the full guide on deploying Dapr with Helm]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}}).

### Parameters file
Instead of specifying parameters on the command line, it's recommended to create a values file. This file should be checked into source control so that you can track its changes.

For a full list of all available options you can set in the values file (or by using the `--set` command-line option), see https://github.com/dapr/dapr/blob/master/charts/dapr/README.md.

Instead of using either `helm install` or `helm upgrade` as shown below, you can also run `helm upgrade --install` - this will dynamically determine whether to install or upgrade.

```bash
# add/update the helm repo
helm repo add dapr https://dapr.github.io/helm-charts/
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

Dapr supports zero downtime upgrades. The upgrade path includes the following steps:

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


## Tracing and metrics configuration

Dapr has tracing and metrics enabled by default. It is *recommended* that you set up distributed tracing and metrics for your applications and the Dapr control plane in production.

If you already have your own observability set-up, you can disable tracing and metrics for Dapr.

### Tracing
To configure a tracing backend for Dapr visit [this]({{< ref "setup-tracing.md" >}}) link.

### Metrics
For metrics, Dapr exposes a Prometheus endpoint listening on port 9090 which can be scraped by Prometheus.

To setup Prometheus, Grafana and other monitoring tools with Dapr, visit [this]({{< ref "monitoring" >}}) link.

## Best Practices 
Watch this video for a deep dive into the best practices for running Dapr in production with Kubernetes

<div class="embed-responsive embed-responsive-16by9">
<iframe width="360" height="315" src="https://www.youtube.com/embed/_U9wJqq-H1g" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
