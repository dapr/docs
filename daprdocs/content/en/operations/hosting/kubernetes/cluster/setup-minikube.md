---
type: docs
title: "Set up a Minikube cluster"
linkTitle: "Minikube"
weight: 1000
description: >
  How to setup a Minikube cluster
---

## Prerequisites

- Install:
   - [Docker](https://docs.docker.com/install/)
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- For Windows:
   - Enable Virtualization in BIOS 
   - [Install Hyper-V](https://docs.microsoft.com/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)

{{% alert title="Note" color="primary" %}}
See [the official Minikube documentation on drivers](https://minikube.sigs.k8s.io/docs/reference/drivers/) for details on supported drivers and how to install plugins.
{{% /alert %}}

## Start the Minikube cluster

1. If applicable for your project, set the default VM.

   ```bash
   minikube config set vm-driver [driver_name]
   ```

1. Start the cluster. If necessary, specify version 1.13.x or newer of Kubernetes with `--kubernetes-version`

    ```bash
    minikube start --cpus=4 --memory=4096
    ```

1. Enable the Minikube dashboard and ingress add-ons.

   ```bash
   # Enable dashboard
   minikube addons enable dashboard
   
   # Enable ingress
   minikube addons enable ingress
   ```

## Install Helm v3 (optional)

If you are using Helm, install the [Helm v3 client](https://helm.sh/docs/intro/install/).

{{% alert title="Important" color="warning" %}}
The latest Dapr Helm chart no longer supports Helm v2. [Migrate from Helm v2 to Helm v3](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).
{{% /alert %}}

## Troubleshooting

The external IP address of load balancer is not shown from `kubectl get svc`.

In Minikube, `EXTERNAL-IP` in `kubectl get svc` shows `<pending>` state for your service. In this case, you can run `minikube service [service_name]` to open your service without external IP address.

```bash
$ kubectl get svc
NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)            AGE
...
calculator-front-end        LoadBalancer   10.103.98.37     <pending>     80:30534/TCP       25h
calculator-front-end-dapr   ClusterIP      10.107.128.226   <none>        80/TCP,50001/TCP   25h
...

$ minikube service calculator-front-end
|-----------|----------------------|-------------|---------------------------|
| NAMESPACE |         NAME         | TARGET PORT |            URL            |
|-----------|----------------------|-------------|---------------------------|
| default   | calculator-front-end |             | http://192.168.64.7:30534 |
|-----------|----------------------|-------------|---------------------------|
🎉  Opening kubernetes service  default/calculator-front-end in default browser...
```

## Related links
- [Try out a Dapr quickstart]({{< ref quickstarts.md >}})
- Learn how to [deploy Dapr on your cluster]({{< ref kubernetes-deploy.md >}})
- [Upgrade Dapr on Kubernetes]({{< ref kubernetes-upgrade.md >}})
- [Kubernetes production guidelines]({{< ref kubernetes-production.md >}})