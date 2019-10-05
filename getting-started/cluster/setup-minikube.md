
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

> **Note:** [1.16.x Kubernetes doesn't work with helm < 2.15.0](https://github.com/helm/helm/issues/6374#issuecomment-537185486)

```bash
minikube start --cpus=4 --memory=4096 --kubernetes-version=1.14.6 --extra-config=apiserver.authorization-mode=RBAC
```

3. Enable dashboard and ingress addons

```bash
# Enable dashboard
minikube addons enable dashboard

# Enable ingress
minikube addons enable ingress
```

## (optional) Install Helm and deploy Tiller

1. [Install Helm client](https://helm.sh/docs/using_helm/#installing-the-helm-client)

2. Create the Tiller service account

```bash
kubectl create serviceaccount -n kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
```

3. Install Tiller to the minikube

```bash
helm init --service-account tiller --history-max 200
```

4. Ensure that Tiller is deployed and running

```bash
kubectl get pods -n kube-system
```

### Troubleshooting

If Tiller is not running properly, get the logs from `tiller-deploy` deployment to understand the problem:

```bash
kubectl describe deployment tiller-deploy --namespace kube-system
```
