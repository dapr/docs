---
type: docs
title: "Debug Dapr control plane on Kubernetes"
linkTitle: "Dapr control plane"
weight: 1000
description: "How to debug Dapr control plane on your Kubernetes cluster"
---

## Overview

Sometimes it is necessary to understand what's going on in Dapr control plane (aka, Kubernetes services), including `dapr-sidecar-injector`, `dapr-operator`, `dapr-placement`, and `dapr-sentry`, especially when you diagnose your Dapr application and wonder if there's something wrong in Dapr itself. Additionally, you may be developing a new feature for Dapr on Kubernetes and want to debug your code.

This guide will cover how to use Dapr debugging binaries to debug the Dapr services on your Kubernetes cluster.

## Debugging Dapr Kubernetes services

### Pre-requisites

- Familiarize yourself with [this guide]({{< ref kubernetes-deploy.md >}}) to learn how to deploy Dapr to your Kubernetes cluster.
- Setup your [dev environment](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md)
-  [Helm](https://github.com/helm/helm/releases)

### 1. Build Dapr debugging binaries

In order to debug Dapr Kubernetes services, it's required to rebuild all Dapr binaries and Docker images to disable compiler optimization. To do this, execute the following commands:

```bash
git clone https://github.com/dapr/dapr.git
cd dapr
make release GOOS=linux GOARCH=amd64 DEBUG=1
```

>On Windows download [MingGW](https://sourceforge.net/projects/mingw/files/MinGW/Extension/make/mingw32-make-3.80-3/) and use `ming32-make.exe` instead of `make`.

In the above command, 'DEBUG' is specified  to '1' to disable compiler optimization. 'GOOS=linux' and 'GOARCH=amd64' are also necessary since the binaries will be packaged into Linux-based Docker image in the next step.

The binaries could be found under 'dist/linux_amd64/debug' sub-directory under the 'dapr' directory.

### 2. Build Dapr debugging Docker images

Use the following commands to package the debugging binaries into Docker images. Before this, you need to login your docker.io account, and if you don't have it yet, you may need to consider registering one from "https://hub.docker.com/".

```bash
export DAPR_TAG=dev
export DAPR_REGISTRY=<your docker.io id>
docker login
make docker-push DEBUG=1
```

Once the Dapr Docker images are built and pushed onto Docker hub, then you are ready to re-install Dapr in your Kubernetes cluster.

### 3. Install Dapr debugging binaries

If Dapr has already been installed in your Kubernetes cluster, uninstall it first:

```bash
dapr uninstall -k
```

We will use 'helm' to install Dapr debugging binaries. In the following sections, we will use Dapr operator as an example to demonstrate how to configure, install, and debug Dapr services in a Kubernetes environment.

First configure a values file with these options:

```yaml
global:
   registry: docker.io/<your docker.io id>
   tag: "dev-linux-amd64"
dapr_operator:
  debug:
    enabled: true
    initialDelaySeconds: 3000
```

{{% alert title="Notice" color="primary" %}}
If you need to debug the startup time of Dapr services, you need to consider configuring `initialDelaySeconds` to a very long time value, e.g. "3000" seconds. If this is not the case, configure it to a short time value, e.g. "3" seconds.
{{% /alert %}}

Then step into 'dapr' directory which's cloned from GitHub in the beginning of this guide if you haven't, and execute the following command:

```bash
helm install dapr charts/dapr --namespace dapr-system --values values.yml --wait
```

### 4. Forward debugging port

To debug the target Dapr service (Dapr operator in this case), its pre-configured debug port needs to be visible to your IDE. In order to achieve this, we need to find the target Dapr service's pod first:

```bash
$ kubectl get pods -n dapr-system -o wide

NAME                                     READY   STATUS    RESTARTS   AGE   IP            NODE       NOMINATED NODE   READINESS GATES
dapr-dashboard-64b46f98b6-dl2n9          1/1     Running   0          61s   172.17.0.9    minikube   <none>           <none>
dapr-operator-7878f94fcd-6bfx9           1/1     Running   1          61s   172.17.0.7    minikube   <none>           <none>
dapr-placement-server-0                  1/1     Running   1          61s   172.17.0.8    minikube   <none>           <none>
dapr-sentry-68c7d4c7df-sc47x             1/1     Running   0          61s   172.17.0.6    minikube   <none>           <none>
dapr-sidecar-injector-56c8f489bb-t2st9   1/1     Running   0          61s   172.17.0.10   minikube   <none>           <none>
```

Then use kubectl's `port-forward` command to expose the internal debug port to the external IDE:

```bash
$ kubectl port-forward dapr-operator-7878f94fcd-6bfx9 40000:40000 -n dapr-system

Forwarding from 127.0.0.1:40000 -> 40000
Forwarding from [::1]:40000 -> 40000
```

All done. Now you can point to port 40000 and start a remote debug session from your favorite IDE.

## Related links

- [Overview of Dapr on Kubernetes]({{< ref kubernetes-overview >}})
- [Deploy Dapr to a Kubernetes cluster]({{< ref kubernetes-deploy >}})
- [Dapr Kubernetes Quickstart](https://github.com/dapr/quickstarts/tree/master/hello-kubernetes)
