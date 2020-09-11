# Set up Prometheus and Grafana on Kubernetes

This document describes how to install Prometheus and Grafana on a Kubernetes cluster which can then be used to view the Dapr metrics dashboards.

Watch this [video](https://www.youtube.com/watch?v=8W-iBDNvCUM&feature=youtu.be&t=2580) for a demonstration of the Grafana Dapr metrics dashboards.

## Prerequisites

- Kubernetes (> 1.14)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Helm 3](https://helm.sh/)

## Contents

  - [Install Prometheus](#install-prometheus)
  - [Install Grafana](#install-grafana)

## Install Prometheus

1.  First create namespace that can be used to deploy the Grafana and Prometheus monitoring tools

```bash
kubectl create namespace dapr-monitoring
```

2. Install Prometheus

```bash
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo update
helm install dapr-prom stable/prometheus -n dapr-monitoring
```

If you are Minikube user or want to disable persistent volume for development purposes, you can disable it by using the following command.

```bash
helm install dapr-prom stable/prometheus -n dapr-monitoring --set alertmanager.persistentVolume.enable=false --set pushgateway.persistentVolume.enabled=false --set server.persistentVolume.enabled=false
```

3. Validation

Ensure Prometheus is running in your cluster.

```bash
kubectl get pods -n dapr-monitoring

NAME                                                READY   STATUS    RESTARTS   AGE
dapr-prom-kube-state-metrics-9849d6cc6-t94p8        1/1     Running   0          4m58s
dapr-prom-prometheus-alertmanager-749cc46f6-9b5t8   2/2     Running   0          4m58s
dapr-prom-prometheus-node-exporter-5jh8p            1/1     Running   0          4m58s
dapr-prom-prometheus-node-exporter-88gbg            1/1     Running   0          4m58s
dapr-prom-prometheus-node-exporter-bjp9f            1/1     Running   0          4m58s
dapr-prom-prometheus-pushgateway-688665d597-h4xx2   1/1     Running   0          4m58s
dapr-prom-prometheus-server-694fd8d7c-q5d59         2/2     Running   0          4m58s
```

## Install Grafana

1. Install Grafana

```bash
helm install grafana stable/grafana -n dapr-monitoring
```

If you are Minikube user or want to disable persistent volume for development purpose, you can disable it by using the following command.

```bash
helm install grafana stable/grafana -n dapr-monitoring --set persistence.enabled=false
```

2. Retrieve the admin password for Grafana login

> Note: Remove the `%` character from the password that this command returns. For example, the admin password is `cj3m0OfBNx8SLzUlTx91dEECgzRlYJb60D2evof1`.

```
kubectl get secret --namespace dapr-monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode
cj3m0OfBNx8SLzUlTx91dEECgzRlYJb60D2evof1%
```

3. Validation

Ensure Grafana is running in your cluster (see last line below)

```bash
kubectl get pods -n dapr-monitoring

NAME                                                READY   STATUS    RESTARTS   AGE
dapr-prom-kube-state-metrics-9849d6cc6-t94p8        1/1     Running   0          4m58s
dapr-prom-prometheus-alertmanager-749cc46f6-9b5t8   2/2     Running   0          4m58s
dapr-prom-prometheus-node-exporter-5jh8p            1/1     Running   0          4m58s
dapr-prom-prometheus-node-exporter-88gbg            1/1     Running   0          4m58s
dapr-prom-prometheus-node-exporter-bjp9f            1/1     Running   0          4m58s
dapr-prom-prometheus-pushgateway-688665d597-h4xx2   1/1     Running   0          4m58s
dapr-prom-prometheus-server-694fd8d7c-q5d59         2/2     Running   0          4m58s
grafana-c49889cff-x56vj                             1/1     Running   0          5m10s 
```

# References

* [Observe Metrics with Grafana](../observe-metrics-with-grafana.md)
* [Prometheus Installation](https://github.com/helm/charts/tree/master/stable/prometheus-operator)
* [Prometheus on Kubernetes](https://github.com/coreos/kube-prometheus)
* [Prometheus Kubernetes Operator](https://github.com/helm/charts/tree/master/stable/prometheus-operator)
* [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
