# Guidelines for production-ready deployments on Kubernetes

This section outlines recommendations and practices for deploying Dapr to a Kubernetes cluster in a production-ready configuration.

## Contents

- [Cluster capacity requirements](#cluster-capacity-requirements)
- [Sidecar resource requirements](#sidecar-resource-requirements)
- [Deploying Dapr with Helm](#deploying-dapr-with-helm)
- [Upgrading Dapr with Helm](#upgrading-dapr-with-helm)
- [Recommended security configuration](#recommended-security-configuration)
- [Tracing and metrics configuration](#tracing-and-metrics-configuration)

## Cluster Capacity Requirements

For a production ready Kubernetes cluster deployment, it is recommended you run a cluster of 3 nodes to support a highly-available setup of the control plane.
The Dapr control plane pods are designed to be very lightweight and require the following resources in a production-ready setup:

| Deployment  | CPU | Memory
| ------------| ---- | ------
| Operator | Limit: 1, Request: 100m | Limit: 200Mi, Request: 20Mi
| Sidecar Injector  | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 20Mi
| Sentry  | Limit: 1, Request: 100m  | Limit: 200Mi, Request: 20Mi
| Placement | Limit: 1, Request: 250m  | Limit: 500Mi, Request: 100Mi
| Dashboard  | Limit: 200m, Request: 50m  | Limit: 200Mi, Request: 20Mi


### Optional components

The following control plane deployments are optional:

* Placement - Needed for Dapr Actors
* Sentry - Needed for mTLS for service to service invocation
* Dashboard - Needed for operational view of the cluster

## Sidecar Resource Requirements

The Dapr sidecar requires the following resources in a production-ready setup:

| CPU | Memory
| --------- | --------- |
| Limit: 4, Request: 100m | Limit: 4000Mi, Request: 250Mi

*Note: Since Dapr is intended to do much of the I/O heavy lifting for your app, it's expected that the resources given to Dapr will enable you to drastically reduce the resoure allocations for the app*

The CPU and Memory limits above account for the fact that Dapr is intended to do a lot of high performant I/O bound operations. Based on your app needs, you can increase or decrease those limits accordingly.

## Deploying Dapr with Helm

When deploying to a production cluster, it's recommended to use Helm. The Dapr CLI installation into a Kubernetes cluster is for a development and test only setup.
You can find information [here](../../getting-started/environment-setup.md#using-helm-(advanced)) about how to deploy Dapr using Helm.

When deploying Dapr in a production-ready configuration, it's recommended to deploy with a highly available configuration of the control plane:

```bash
helm install dapr dapr/dapr --namespace dapr-system --set global.ha.enabled=true
```

This command will run 3 replicas of each control plane pod with the exception of the Placement pod.

## Upgrading Dapr with Helm

Dapr supports zero downtime upgrades. The upgrade path includes the following steps:

1. Upgrading a CLI version (optional but recommended)
2. Updating the control plane
3. Updating the data plane (sidecars)

### 1. Upgrading the CLI

To upgrade the Dapr CLI, [download a release version](https://github.com/dapr/cli/releases) of the CLI that matches the Dapr runtime version.
For example, if upgrading to Dapr 0.9.0, download a CLI version of 0.9.x.

After you downloaded the binary, it's recommended you put the CLI binary in your path.

### Updating the control plane

#### Saving the current certificates

When upgrading to a new version of Dapr, it is recommended we carry over our Root and Issuer certificates instead of re-generating them, which might cause a downtime for applications that make use of service invocation or actors.

To get the current certificates, run the following command:

```
kubectl get secret dapr-trust-bundle -o yaml -n dapr-system

apiVersion: v1
data:
  ca.crt: <ROOT-CERTIFICATE-VALUE>
  issuer.crt: <ISSUER-CERTIFICATE-VALUE>
  issuer.key: <ISSUER-KEY-VALUE>
kind: Secret
```

Copy the contents of `ca.crt`, `issuer.crt` and `issuer.key` and base64 decode them.

Finally, you should have the following files saved on your disk:, containing the base64 decoded text from the secret:

1. ca.crt
2. issuer.crt
3. issuer.key

#### Updating the control plane pods

Next, we need to find a Helm Chart version that installs our desired version of Dapr and perform a `helm upgrade` operation.

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

Use the following command to upgrade Dapr to your desired version:

```bash
helm upgrade dapr dapr/dapr --version <CHART-VERSION> --namespace dapr-system --reset-values --set-file dapr_sentry.tls.root.certPEM=ca.crt --set-file dapr_sentry.tls.issuer.certPEM=issuer.crt --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key
```

Kubernetes will now issue a rolling update.
Wait until all the new pods appear as running:

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

*Note: If new fields have been added to the target Helm Chart being upgraded to, the `helm upgrade` command will fail. If that happens, you will need to find which new fields have been added in the new chart and add them as parameters to the upgrade command, for example: `--set <field-name>=<value>`.*

#### Updating the data plane (sidecars)

The last step is to update pods that are running Dapr to pick up the new version of the Dapr runtime.
To do that, simply issue a rollout restart command for any deployment that has the `dapr.io/enabled` annotation:

```
kubectl rollout restart deploy/<DEPLOYMENT-NAME>
```

## Recommended security configuration

Properly configured, Dapr will not only be secured with regards to it's control plane and sidecars, but can also make your application more secure with a number of built-in features.

It is recommended that a production-ready deployment includes the following:

1. Mutual Authentication (mTLS) should be enabled. Note that Dapr has mTLS on by default. For details on how to bring your own certificates, see [here](../configure-mtls/README.md#bringing-your-own-certificates)

2. Dapr API authentication is enabled. To secure the Dapr API from unauthorized access, it is recommended to enable Dapr's token based auth. See [here](../enable-dapr-api-token-based-authentication/README.md) for details

3. All component YAMLs should have secret data configured in a secret store and not hard-coded in the YAML file. See [here](../../concepts/secrets/component-secrets.md) on how to use secrets with Dapr components

4. Dapr control plane is installed on a separate namespace such as `dapr-system`, and never into the `default` namespace

Dapr also supports scoping components for certain applications.
This is not a required practice, and can be enabled according to your Sec-Ops needs. See [here](../components-scopes/README.md) for more info.

## Tracing and metrics configuration

TBD
