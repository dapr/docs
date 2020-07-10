# Deploying to Hybrid Linux/Winodws K8s Clusters

## Installing the Dapr Control Plane

If you are installing using the Dapr CLI or via helm chart, you can simply follow our normal deployment procedures:
[Installing Dapr on a Kubernetes cluster](../../getting-started/environment-setup.md#installing-Dapr-on-a-kubernetes-cluster)

Affinity will be automatically set for kubernetes.io/os=linux. If you need to override linux to another value, you can do so by setting:
```
helm install dapr dapr/dapr --set global.daprControlPlaneOs=YOUR_OS
```
Dapr control plane container images are only provided for Linux, so you shouldn't need to do this unless you really know what you are doing.

## Installing Dapr Apps
The Dapr sidecar container is currently linux only. For this reason, if you are writing a Dapr application, you must run it in a Linux container. You can track the progress of Dapr sidecar support for windows containers via [dapr/dapr#842](https://github.com/dapr/dapr/issues/842).

When deploying to a hybrid cluster, you must configure your apps to be deployed to only Linux available nodes. One of the simplest ways to do this is to add kubernetes.io/os=linux to your app's nodeSelector.

```yaml
spec:
  nodeSelector:
    kubernetes.io/os: linux
```

Kubernetes also supports much more advanced configuration via node affinity. 
See https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/ for more examples.

