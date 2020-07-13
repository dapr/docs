# Deploy to hybrid Linux/Windows Kubernetes clusters

Deploying Dapr to a Kubernetes cluster that contains both Windows and Linux nodes has known limitiations. All Dapr control plane components must be run exclusively on Linux enabled nodes. The same is currently true for all Dapr applications. Thus when deploying to hybrid Kubernetes clusters you will need to ensure that Kubernetes knows to place your application containers exclusively on Linux enabled nodes.

> **Note:** Windows container support for Dapr applications is in progress. Please see: [dapr/dapr#842](https://github.com/dapr/dapr/issues/842).

## Installing the Dapr Control Plane

If you are installing using the Dapr CLI or via a helm chart, simply follow the normal deployment procedures:
[Installing Dapr on a Kubernetes cluster](../../getting-started/environment-setup.md#installing-Dapr-on-a-kubernetes-cluster)

Affinity will be automatically set for kubernetes.io/os=linux. If you need to override Linux to another value, you can do so by setting:

```
helm install dapr dapr/dapr --set global.daprControlPlaneOs=YOUR_OS
```

Dapr control plane container images are only provided for Linux, so you shouldn't need to do this unless you really know what you are doing.

## Installing Dapr applications
The Dapr sidecar container is currently Linux only. For this reason, if you are writing a Dapr application, you must run it in a Linux container. 

When deploying to a hybrid cluster, you must configure your applications to be deployed to only Linux available nodes. One of the simplest ways to do this is to add kubernetes.io/os=linux to your app's nodeSelector.

```yaml
spec:
  nodeSelector:
    kubernetes.io/os: linux
```

## Related links

 - See the [official Kubernetes documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) for examples of more advanced configuration via node affinity

