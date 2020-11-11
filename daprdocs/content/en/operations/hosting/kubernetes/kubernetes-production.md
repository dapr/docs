---
type: docs
title: "Guidelines for production ready deployments on Kubernetes"
linkTitle: "Production guidelines"
weight: 10000
description: "Recommendations and practices for deploying Dapr to a Kubernetes cluster in a production ready configuration"
---

## Cluster capacity requirements

For a production ready Kubernetes cluster deployment, it is recommended you run a cluster of 3 worker nodes to support a highly-available setup of the control plane.
The Dapr control plane pods are designed to be lightweight and require the following resources in a production-ready setup:

*Note: For more info on CPU and Memory resource units and their meaning, see [this](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#resource-units-in-kubernetes) link*

| Deployment  | CPU | Memory
|-------------|-----|-------
| Operator    | Limit: 1, Request: 100m | Limit: 200Mi, Request: 20Mi
| Sidecar Injector  | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 20Mi
| Sentry      | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 20Mi
| Placement   | Limit: 1, Request: 250m  | Limit: 500Mi, Request: 100Mi
| Dashboard   | Limit: 200m, Request: 50m  | Limit: 200Mi, Request: 20Mi

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
You can find information [here]({{< ref "install-dapr.md#using-helm-advanced" >}}) on how to deploy Dapr using Helm.

When deploying Dapr in a production-ready configuration, it's recommended to deploy with a highly available configuration of the control plane:

```bash
helm install dapr dapr/dapr --namespace dapr-system --set global.ha.enabled=true
```

This command will run 3 replicas of each control plane pod with the exception of the Placement pod in the dapr-system namespace.

*Note: The Dapr Helm chart automatically deploys with affinity for nodes with the label `kubernetes.io/os=linux`. You can deploy the Dapr control plane to Windows nodes, but most users should not need to. For more information see [Deploying to a Hybrid Linux/Windows K8s Cluster]({{< ref "kubernetes-hybrid-clusters.md" >}})*

## Upgrading Dapr with Helm

Dapr supports zero downtime upgrades. The upgrade path includes the following steps:

1. Upgrading a CLI version (optional but recommended)
2. Updating the Dapr control plane
3. Updating the data plane (Dapr sidecars)

### Upgrading the CLI

To upgrade the Dapr CLI, [download a release version](https://github.com/dapr/cli/releases) of the CLI that matches the Dapr runtime version.
For example, if upgrading to Dapr 0.9.0, download a CLI version of 0.9.x.

After you downloaded the binary, it's recommended you put the CLI binary in your path.

### Updating the control plane

#### Saving the current certificates

When upgrading to a new version of Dapr, it is recommended you carry over the root and issuer certificates instead of re-generating them, which might cause a downtime for applications that make use of service invocation or actors.

#### Exporting certs with the Dapr CLI

To get your current certs with the Dapr CLI, run the following command:

```
dapr mtls export -o ./certs
```

This will save any existing root cert, issuer cert and issuer key in the output dir of your choice.

### Exporting certs manually

To get the current root and issuer certificates, run the following command:

```
kubectl get secret dapr-trust-bundle -o yaml -n dapr-system

apiVersion: v1
data:
  ca.crt: <ROOT-CERTIFICATE-VALUE>
  issuer.crt: <ISSUER-CERTIFICATE-VALUE>
  issuer.key: <ISSUER-KEY-VALUE>
kind: Secret
```

Copy the contents of `ca.crt`, `issuer.crt` and `issuer.key` and base64 decode them. Save these certificates as files.

You should have the following files containing the base64 decoded text from the secret saved on your disk:

1. ca.crt
2. issuer.crt
3. issuer.key

#### Updating the control plane pods

Next, you need to find a Helm chart version that installs the new desired version of Dapr and perform a `helm upgrade` operation.

First, update the Helm Chart repos:

```bash
helm repo update
```

List all charts in the Dapr repo:

```bash
helm search repo dapr

NAME     	CHART VERSION	APP VERSION	DESCRIPTION
dapr/dapr	0.4.3        	0.9.0      	A Helm chart for Dapr on Kubernetes
dapr/dapr	0.4.2        	0.8.0      	A Helm chart for Dapr on Kubernetes
```

The APP VERSION column tells us which Dapr runtime version is installed by the chart.

Use the following command to upgrade Dapr to your desired runtime version providing a path to the certificate files you saved:

```bash
helm upgrade dapr dapr/dapr --version <CHART-VERSION> --namespace dapr-system --reset-values --set-file dapr_sentry.tls.root.certPEM=ca.crt --set-file dapr_sentry.tls.issuer.certPEM=issuer.crt --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key
```

Kubernetes now performs a rolling update. Wait until all the new pods appear as running:

```bash
kubectl get po -n dapr-system -w

NAME                                     READY   STATUS    RESTARTS   AGE
dapr-dashboard-dcd7cc8fb-ml2p8           1/1     Running   0          12s
dapr-operator-7b57d884cd-6spcq           1/1     Running   0          12s
dapr-placement-86b76f6545-vkc6f          1/1     Running   0          12s
dapr-sentry-7c7bf75d8b-dcnhm             1/1     Running   0          12s
dapr-sidecar-injector-7b847db96f-kwst9   1/1     Running   0          12s
```

You can verify the health and version of the control plane using the Dapr CLI:

```bash
dapr status -k

NAME                   NAMESPACE      HEALTHY  STATUS   VERSION  AGE  CREATED
dapr-placement         dapr-system    True     Running  0.9.0    12s  2020-07-24 15:38.15
dapr-operator          dapr-system    True     Running  0.9.0    12s  2020-07-24 15:38.15
dapr-sidecar-injector  dapr-system    True     Running  0.9.0    12s  2020-07-24 15:38.16
dapr-sentry            dapr-system    True     Running  0.9.0    12s  2020-07-24 15:38.15
```

*Note: If new fields have been added to the target Helm Chart being upgraded to, the `helm upgrade` command will fail. If that happens, you need to find which new fields have been added in the new chart and add them as parameters to the upgrade command, for example: `--set <field-name>=<value>`.*

#### Updating the data plane (sidecars)

The last step is to update pods that are running Dapr to pick up the new version of the Dapr runtime.
To do that, simply issue a rollout restart command for any deployment that has the `dapr.io/enabled` annotation:

```
kubectl rollout restart deploy/<DEPLOYMENT-NAME>
```

To see a list of all your Dapr enabled deployments, you can either use the [Dapr Dashboard](https://github.com/dapr/dashboard) or run the following command using the Dapr CLI:

```bash
dapr list -k

APP ID     APP PORT  AGE  CREATED
nodeapp    3000      16h  2020-07-29 17:16.22
```

#### Upgrade from 0.11.x to 1.0.0

Upgrading from 0.11.x to 1.0.0 safely requires additional step to keep 0.11.x placement service to migrate from 0.11.x placement service to 1.0.0 placement service. These two commands disables helm upgrade to uninstall 0.11.x placement service.

```sh
kubectl annotate deployment dapr-placement "helm.sh/resource-policy"=keep -n dapr-system
kubectl annotate svc dapr-placement "helm.sh/resource-policy"=keep -n dapr-system
```

Then [export certs manually](#exporting-certs-manually).

```sh
dapr mtls export -o ./certs
```

Upgrade Dapr using the below commands:

```sh
helm repo update
helm upgrade dapr dapr/dapr --version 1.0.0-rc1 --namespace dapr-system --reset-values --set-file dapr_sentry.tls.root.certPEM=./certs/ca.crt --set-file dapr_sentry.tls.issuer.certPEM=./certs/issuer.crt --set-file dapr_sentry.tls.issuer.keyPEM=./certs/issuer.key --set global.ha.enabled=true --wait
```

Once Dapr is installed completely, ensure that 0.11.x dapr-placement is still running
```sh
kubectl get pods -n dapr-system

NAME                                     READY   STATUS    RESTARTS   AGE
dapr-dashboard-69f5c5c867-mqhg4          1/1     Running   0          42s
dapr-operator-5cdd6b7f9c-9sl7g           1/1     Running   0          41s
dapr-operator-5cdd6b7f9c-jkzjs           1/1     Running   0          29s
dapr-operator-5cdd6b7f9c-qzp8n           1/1     Running   0          34s
dapr-placement-5dcb574777-nlq4t          1/1     Running   0          76s  ---- 0.11.x placement
dapr-placement-server-0                  0/1     Running   0          41s
dapr-placement-server-1                  0/1     Running   0          41s
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
kubectl rollout restart deploy/<DEPLOYMENT-NAME>
```

Once all your application is restarted successfully, delete 0.11.x dapr-placement service by following commands:
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
