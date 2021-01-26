---
type: docs
title: "Guidelines for production ready deployments on Kubernetes"
linkTitle: "Production guidelines"
weight: 10000
description: "Recommendations and practices for deploying Dapr to a Kubernetes cluster in a production ready configuration"
---

## Cluster capacity requirements

For a production ready Kubernetes cluster deployment, it is recommended you run a cluster of 3 worker nodes to support a highly-available setup of the control plane.
For a baseline production-read setup, the following resource settings might serve as a starting point. The requirements will vary depending on cluster size and other factors, so individual testing is needed to find the right values for your environment:

*Note: For more info on CPU and Memory resource units and their meaning, see [this](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes) link*

| Deployment  | CPU | Memory
|-------------|-----|-------
| Operator    | Limit: 1, Request: 100m | Limit: 200Mi, Request: 100Mi
| Sidecar Injector  | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 30Mi
| Sentry      | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 30Mi
| Placement   | Limit: 1, Request: 250m  | Limit: 150Mi, Request: 75Mi
| Dashboard   | Limit: 200m, Request: 50m  | Limit: 200Mi, Request: 20Mi

When installing Dapr using Helm, no default limit/request values are set. Each component has a `resources` option (for example, `dapr_dashboard.resources`), which you can use to tune the Dapr control plane to fit your environment. The [Helm chart readme](https://github.com/dapr/dapr/blob/master/charts/dapr/README) documents the details and also provides examples. For local/dev installations, you might simply want to skip configuring the `resources` options.

To change the resource assignments for the Dapr sidecar, see the annotations [here]({{< ref "kubernetes-annotations.md" >}}).
The specific annotations related to resource constraints are:

* `dapr.io/sidecar-cpu-limit`
* `dapr.io/sidecar-memory-limit`
* `dapr.io/sidecar-cpu-request`
* `dapr.io/sidecar-memory-request`

For more details on configuring resource in Kubernetes see [Assign Memory Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/) and [Assign CPU Resources to Containers and Pods](https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/)

### Optional components

The following Dapr control plane deployments are optional:

* Placement - Needed for Dapr Actors
* Sentry - Needed for mTLS for service to service invocation
* Dashboard - Needed for operational view of the cluster

## Sidecar resource requirements

The Dapr sidecar requires the following resources in a production-ready setup:

| CPU | Memory |
|-----|--------|
| Limit: 4, Request: 100m | Limit: 4000Mi, Request: 250Mi

*Note: Since Dapr is intended to do much of the I/O heavy lifting for your app, it's expected that the resources given to Dapr enable you to drastically reduce the resource allocations for the application*

The CPU and memory limits above account for the fact that Dapr is intended to do a lot of high performant I/O bound operations. Based on your app needs, you can increase or decrease those limits accordingly.

## Deploying Dapr with Helm

When deploying to a production cluster, it's recommended to use Helm. The Dapr CLI installation into a Kubernetes cluster is for a development and test only setup.
You can find information [here]({{< ref "install-dapr-selfhost.md#using-helm-advanced" >}}) on how to deploy Dapr using Helm.

When deploying Dapr in a production-ready configuration, it's recommended to deploy with a highly available configuration of the control plane. It is also recommended to create a values file instead of specifying parameters on the command-line. This file should be checked in to source control so that you can track changes to it.

For a full list of all available options you can set in the values file (or by using the `--set` command-line option), see https://github.com/dapr/dapr/blob/master/charts/dapr/README.md.

```bash
touch values.yml
cat << EOF >> values.yml
global.ha.enabled: true

EOF


helm upgrade --install dapr dapr/dapr \
  --version=<Dapr chart version> \
  --namespace dapr-system \
  --values values.yml \
  --wait
```

This command will run 3 replicas of each control plane pod in the dapr-system namespace.

*Note: The Dapr Helm chart automatically deploys with affinity for nodes with the label `kubernetes.io/os=linux`. You can deploy the Dapr control plane to Windows nodes, but most users should not need to. For more information see [Deploying to a Hybrid Linux/Windows K8s Cluster]({{< ref "kubernetes-hybrid-clusters.md" >}})*

## Upgrading Dapr with Helm

Dapr supports zero downtime upgrades. The upgrade path includes the following steps:

1. Upgrading a CLI version (optional but recommended)
2. Updating the Dapr control plane
3. Updating the data plane (Dapr sidecars)

### Upgrading the CLI

To upgrade the Dapr CLI, [download the latest version](https://github.com/dapr/cli/releases) of the CLI. After you downloaded the binary, it's recommended you put the CLI binary in your path.

### Updating the control plane

#### Updating the control plane pods

> Note: To upgrade Dapr from 0.11.x to 1.0.0 version, please refer to [this section](#upgrade-from-dapr-011x-to-100).

Next, you need to find a Helm chart version that installs the new desired version of Dapr and perform a `helm upgrade` operation.

First, update the Helm Chart repos:

```bash
helm repo update
```

List all charts in the Dapr repo:

```bash
helm search repo dapr --devel

NAME     	CHART VERSION	APP VERSION	DESCRIPTION
dapr/dapr	1.0.0-rc.3   	1.0.0-rc.3 	A Helm chart for Dapr on Kubernetes
```

The APP VERSION column tells us which Dapr runtime version is installed by the chart. Use the `values.yml` file from the installation step above to upgrade.


```bash
helm upgrade --install dapr dapr/dapr \
  --version=<Dapr chart version> \
  --namespace dapr-system \
  --values values.yml \
  --wait
```


Kubernetes now performs a rolling update. Wait until all the new pods appear as running:

```bash
kubectl get po -n dapr-system -w

NAME                                     READY   STATUS    RESTARTS   AGE
dapr-dashboard-86b94bb768-w4wmj          1/1     Running   0          39s
dapr-operator-67d7d7bb6c-qqkk7           1/1     Running   0          39s
dapr-placement-server-0                  1/1     Running   0          39s
dapr-sentry-647759cd46-nwzkw             1/1     Running   0          39s
dapr-sidecar-injector-74648c9dcb-px2m5   1/1     Running   0          39s
```

You can verify the health and version of the control plane using the Dapr CLI:

```bash
dapr status -k

NAME                   NAMESPACE    HEALTHY  STATUS   REPLICAS  VERSION     AGE  CREATED
dapr-sidecar-injector  dapr-system  True     Running  1         1.0.0-rc.1  1m   2020-11-16 14:42.19
dapr-sentry            dapr-system  True     Running  1         1.0.0-rc.1  1m   2020-11-16 14:42.19
dapr-dashboard         dapr-system  True     Running  1         0.3.0       1m   2020-11-16 14:42.19
dapr-operator          dapr-system  True     Running  1         1.0.0-rc.1  1m   2020-11-16 14:42.19
dapr-placement-server  dapr-system  True     Running  1         1.0.0-rc.1  1m   2020-11-16 14:42.19
```

*Note: If new fields have been added to the target Helm Chart being upgraded to, the `helm upgrade` command will fail. If that happens, you need to find which new fields have been added in the new chart and add them as parameters to the upgrade command, for example: `--set <field-name>=<value>`.*

#### Updating the data plane (sidecars)

The last step is to update pods that are running Dapr to pick up the new version of the Dapr runtime.
To do that, simply issue a rollout restart command for any deployment that has the `dapr.io/enabled` annotation:

```
kubectl rollout restart deploy/<Application deployment name>
```

To see a list of all your Dapr enabled deployments, you can either use the [Dapr Dashboard](https://github.com/dapr/dashboard) or run the following command using the Dapr CLI:

```bash
dapr list -k

APP ID     APP PORT  AGE  CREATED
nodeapp    3000      16h  2020-07-29 17:16.22
```

#### Upgrade from Dapr 0.11.x to 1.0.0

Run the below commands first to migrate from 0.11.x placement service safely:

```sh
kubectl annotate deployment dapr-placement "helm.sh/resource-policy"=keep -n dapr-system
kubectl annotate svc dapr-placement "helm.sh/resource-policy"=keep -n dapr-system
```

Then [export certs manually](#exporting-certs-manually).

```sh
dapr mtls export -o ./certs
```

Upgrade Dapr using the below commands; this example upgrades Dapr from 0.11.x to 1.0.0-rc.1 with HA mode.

```sh
helm repo update
helm upgrade dapr dapr/dapr --version 1.0.0-rc.1 --namespace dapr-system --reset-values --set-file dapr_sentry.tls.root.certPEM=./certs/ca.crt --set-file dapr_sentry.tls.issuer.certPEM=./certs/issuer.crt --set-file dapr_sentry.tls.issuer.keyPEM=./certs/issuer.key --set global.ha.enabled=true --wait
```

Once Dapr is installed completely, ensure that 0.11.x dapr-placement is still running and **wait until all pods are running**
```sh
kubectl get pods -n dapr-system -w

NAME                                     READY   STATUS    RESTARTS   AGE
dapr-dashboard-69f5c5c867-mqhg4          1/1     Running   0          42s
dapr-operator-5cdd6b7f9c-9sl7g           1/1     Running   0          41s
dapr-operator-5cdd6b7f9c-jkzjs           1/1     Running   0          29s
dapr-operator-5cdd6b7f9c-qzp8n           1/1     Running   0          34s
dapr-placement-5dcb574777-nlq4t          1/1     Running   0          76s  ---- 0.11.x placement
dapr-placement-server-0                  1/1     Running   0          41s
dapr-placement-server-1                  1/1     Running   0          41s
dapr-placement-server-2                  1/1     Running   0          41s
dapr-sentry-84565c747b-7bh8h             1/1     Running   0          35s
dapr-sentry-84565c747b-fdlls             1/1     Running   0          41s
dapr-sentry-84565c747b-ldnsf             1/1     Running   0          29s
dapr-sidecar-injector-68f868668f-6xnbt   1/1     Running   0          41s
dapr-sidecar-injector-68f868668f-j7jcq   1/1     Running   0          29s
dapr-sidecar-injector-68f868668f-ltxq4   1/1     Running   0          36s
```


Update pods that are running Dapr to pick up the new version of the Dapr runtime.
```sh
kubectl rollout restart deploy/<Application deployment name>
```

Once the deployment is completed, delete 0.11.x dapr-placement service by following commands:
```sh
kubectl delete deployment dapr-placement -n dapr-system
kubectl delete svc dapr-placement -n dapr-system
```

## Recommended security configuration

Properly configured, Dapr not only be secured with regards to it's control plane and sidecars communication, but can also make your application more secure with a number of built-in features.

It is recommended that a production-ready deployment includes the following settings:

1. Mutual Authentication (mTLS) should be enabled. Note that Dapr has mTLS on by default. For details on how to bring your own certificates, see [here]({{< ref "mtls.md#bringing-your-own-certificates" >}})

2. Dapr API authentication is enabled (this is the between your application and the Dapr sidecar). To secure the Dapr API from unauthorized access, it is recommended to enable Dapr's token based auth. See [here]({{< ref "api-token.md" >}}) for details

3. All component YAMLs should have secret data configured in a secret store and not hard-coded in the YAML file. See [here]({{< ref "component-secrets.md" >}}) on how to use secrets with Dapr components

4. The Dapr control plane is installed on a separate namespace such as `dapr-system`, and never into the `default` namespace

Dapr also supports scoping components for certain applications. This is not a required practice, and can be enabled according to your Sec-Ops needs. See [here]({{< ref "component-scopes.md" >}}) for more info.

## Tracing and metrics configuration

Dapr has tracing and metrics enabled by default.
To configure a tracing backend for Dapr visit [this]({{< ref "setup-tracing.md" >}}) link.

For metrics, Dapr exposes a Prometheus endpoint listening on port 9090 which can be scraped by Prometheus.

It is *recommended* that you set up distributed tracing and metrics for your applications and the Dapr control plane in production.
If you already have your own observability set-up, you can disable tracing and metrics for Dapr.

To setup Prometheus, Grafana and other monitoring tools with Dapr, visit [this]({{< ref "monitoring" >}}) link.
