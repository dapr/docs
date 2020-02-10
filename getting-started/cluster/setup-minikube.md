
# Set up a Minikube cluster

## Prerequisites

- [Docker](https://docs.docker.com/install/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)

> Note: For Windows, enable Virtualization in BIOS and [install Hyper-V](https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v)

## Start the Minikube cluster

1. (optional) Set the default VM driver

```bash
minikube config set vm-driver [driver_name]
```

> Note: See [DRIVERS](https://minikube.sigs.k8s.io/docs/reference/drivers/) for details on supported drivers and how to install plugins.

2. Start the cluster
Use 1.13.x or newer version of Kubernetes with `--kubernetes-version`

```bash
minikube start --cpus=4 --memory=4096 --kubernetes-version=1.16.2 --extra-config=apiserver.authorization-mode=RBAC
```

3. Enable dashboard and ingress addons

```bash
# Enable dashboard
minikube addons enable dashboard

# Enable ingress
minikube addons enable ingress
```

## (optional) Install Helm v3

1. [Install Helm v3 client](https://helm.sh/docs/intro/install/)

> **Note:** The latest Dapr helm chart no longer supports Helm v2. Please migrate from helm v2 to helm v3 by following [this guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/).

### Troubleshooting

1. The external IP address of load balancer is not shown from `kubectl get svc`

In Minikube, EXTERNAL-IP in `kubectl get svc` shows `<pending>` state for your service. In this case, you can run `minikube service [service_name]` to open your service without external IP address.

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
