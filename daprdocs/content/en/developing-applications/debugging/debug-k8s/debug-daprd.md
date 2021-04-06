---
type: docs
title: "Debug daprd on Kubernetes"
linkTitle: "Dapr sidecar"
weight: 20000
description: "How to debug Dapr sidecar (daprd) on your Kubernetes cluster"
---


## Overview

Sometimes it is necessary to understand what's going on in Dapr sidecar (daprd) side by side to your application, especially when you diagnose your Dapr application and wonder if there's something gets wrong in Dapr sidecar itself, or when you contribute to Dapr relevant to Kubernetes support.

If this is the case, Dapr has built-in Kubernetes debug support coming in to rescue.

## Build Dapr sidecar on Kubernetes

Before read on, pls. refer [this guide]({{< ref kubernetes-deploy.md >}}) to learn how to deploy Dapr to your Kubernetes cluster.

In order to debug Dapr Kubernetes services, it's required to rebuild and reinstall all Dapr binaries, pls. follow the instructions in [Debug Dapr services]({{< ref "debug-dapr-services.md">}}) to build and install Dapr into debug mode.

## Install daprd in debug mode

If Dapr has already been installed in your Kubernetes cluster, uninstall it first:

```bash
dapr uninstall -k
```

We will use 'helm' to install Dapr debugging binaries. For more information pls. check [Install with Helm]({{< ref "kubernetes-deploy.md#install-with-helm-advanced" >}}). 

First configure a values file with these options:

```yaml
global:
   registry: docker.io/<your docker.io id>
   tag: "dev-linux-amd64"
```

Then step into 'dapr' directory which's cloned from GitHub in the beginning of this guide if you haven't, and execute the following command:

```bash
helm install dapr charts/dapr --namespace dapr-system --values values.yml --wait
```

To enable debug mode for daprd, you need to put extra annotations `dapr.io/enable-debug` in your application's deployment file. Let's use [quickstarts/hello-kubernetes](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes) as an example, modify 'deploy/node.yaml' like below:

```diff
diff --git a/hello-kubernetes/deploy/node.yaml b/hello-kubernetes/deploy/node.yaml
index 23185a6..6cdb0ae 100644
--- a/hello-kubernetes/deploy/node.yaml
+++ b/hello-kubernetes/deploy/node.yaml
@@ -33,6 +33,7 @@ spec:
         dapr.io/enabled: "true"
         dapr.io/app-id: "nodeapp"
         dapr.io/app-port: "3000"
+        dapr.io/enable-debug: "true"
     spec:
       containers:
       - name: node
```

The annotation `dapr.io/enable-debug` will hint Dapr injector to inject Dapr sidecar into the debug mode. You can also specify the debug port with annotation `dapr.io/debug-port`, otherwise the default port will be "40000".

Deploy the application with the following command. For the complete guide, pls. refer to [Dapr Kubernetes Quickstart](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes):

```bash
kubectl apply -f ./deploy/node.yaml
```

Figure out the target application's pod name with the following command:

```bash
$ kubectl get pods

NAME                       READY   STATUS        RESTARTS   AGE
nodeapp-78866448f5-pqdtr   1/2     Running       0          14s
```

Then use kubectl's `port-forward` command to expose the internal debug port to the external IDE:

```bash
$ kubectl port-forward nodeapp-78866448f5-pqdtr 40000:40000

Forwarding from 127.0.0.1:40000 -> 40000
Forwarding from [::1]:40000 -> 40000
```

All done. Now you can point to port 40000 and start remote debug session to daprd from your favorite IDE.

## Related links

- [Overview of Dapr on Kubernetes]({{< ref kubernetes-overview >}})
- [Deploy Dapr to a Kubernetes cluster]({{< ref kubernetes-deploy >}})
- [Debug Dapr services on Kubernetes]({{< ref debug-dapr-services >}})  
- [Dapr Kubernetes Quickstart](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes)