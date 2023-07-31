---
type: docs
title: "How-To: Observe metrics with Grafana"
linkTitle: "Grafana dashboards"
weight: 5000
description: "How to view Dapr metrics in a Grafana dashboard."
---

## Available dashboards

{{< tabs "System Service" "Sidecars" "Actors" >}}

{{% codetab %}}
The `grafana-system-services-dashboard.json` template shows Dapr system component status, dapr-operator, dapr-sidecar-injector, dapr-sentry, and dapr-placement:

<img src="/images/grafana-system-service-dashboard.png" alt="Screenshot of the system service dashboard" width=1200>
{{% /codetab %}}

{{% codetab %}}
The `grafana-sidecar-dashboard.json` template shows Dapr sidecar status, including sidecar health/resources, throughput/latency of HTTP and gRPC, Actor, mTLS, etc.:

<img src="/images/grafana-sidecar-dashboard.png" alt="Screenshot of the sidecar dashboard" width=1200>
{{% /codetab %}}

{{% codetab %}}
The `grafana-actor-dashboard.json` template shows Dapr Sidecar status, actor invocation throughput/latency, timer/reminder triggers, and turn-based concurrnecy:

<img src="/images/grafana-actor-dashboard.png" alt="Screenshot of the actor dashboard" width=1200>
{{% /codetab %}}

{{< /tabs >}}

## Pre-requisites

- [Setup Prometheus]({{<ref prometheus.md>}})

## Setup on Kubernetes

### Install Grafana

1. Add the Grafana Helm repo:

   ```bash
   helm repo add grafana https://grafana.github.io/helm-charts
   helm repo update
   ```

1. Install the chart:

   ```bash
   helm install grafana grafana/grafana -n dapr-monitoring
   ```

   {{% alert title="Note" color="primary" %}}
   If you are Minikube user or want to disable persistent volume for development purpose, you can disable it by using the following command instead:

   ```bash
   helm install grafana grafana/grafana -n dapr-monitoring --set persistence.enabled=false
   ```
   {{% /alert %}}


1. Retrieve the admin password for Grafana login:

   ```bash
   kubectl get secret --namespace dapr-monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
   ```

   You will get a password similar to `cj3m0OfBNx8SLzUlTx91dEECgzRlYJb60D2evof1%`. Remove the `%` character from the password to get `cj3m0OfBNx8SLzUlTx91dEECgzRlYJb60D2evof1` as the admin password.

1. Validation Grafana is running in your cluster:

   ```bash
   kubectl get pods -n dapr-monitoring

   NAME                                                READY   STATUS       RESTARTS   AGE
   dapr-prom-kube-state-metrics-9849d6cc6-t94p8        1/1     Running      0          4m58s
   dapr-prom-prometheus-alertmanager-749cc46f6-9b5t8   2/2     Running      0          4m58s
   dapr-prom-prometheus-node-exporter-5jh8p            1/1     Running      0          4m58s
   dapr-prom-prometheus-node-exporter-88gbg            1/1     Running      0          4m58s
   dapr-prom-prometheus-node-exporter-bjp9f            1/1     Running      0          4m58s
   dapr-prom-prometheus-pushgateway-688665d597-h4xx2   1/1     Running      0          4m58s
   dapr-prom-prometheus-server-694fd8d7c-q5d59         2/2     Running      0          4m58s
   grafana-c49889cff-x56vj                             1/1     Running      0          5m10s
   ```

### Configure Prometheus as data source
First you need to connect Prometheus as a data source to Grafana.

1. Port-forward to svc/grafana:

   ```bash
   kubectl port-forward svc/grafana 8080:80 -n dapr-monitoring

   Forwarding from 127.0.0.1:8080 -> 3000
   Forwarding from [::1]:8080 -> 3000
   Handling connection for 8080
   Handling connection for 8080
   ```

1. Open a browser to `http://localhost:8080`

1. Login to Grafana
   - Username = `admin`
   - Password = Password from above

1. Select `Configuration` and `Data Sources`

   <img src="/images/grafana-datasources.png" alt="Screenshot of the Grafana add Data Source menu" width=200>


1. Add Prometheus as a data source.

      <img src="/images/grafana-add-datasources.png" alt="Screenshot of the Prometheus add Data Source" width=600>

1. Get your Prometheus HTTP URL

   The Prometheus HTTP URL follows the format `http://<prometheus service endpoint>.<namespace>`

   Start by getting the Prometheus server endpoint by running the following command:

   ```bash
   kubectl get svc -n dapr-monitoring

   NAME                                 TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)             AGE
   dapr-prom-kube-state-metrics         ClusterIP   10.0.174.177      <none>        8080/TCP            7d9h
   dapr-prom-prometheus-alertmanager    ClusterIP   10.0.255.199      <none>        80/TCP              7d9h
   dapr-prom-prometheus-node-exporter   ClusterIP   None              <none>        9100/TCP            7d9h
   dapr-prom-prometheus-pushgateway     ClusterIP   10.0.190.59       <none>        9091/TCP            7d9h
   dapr-prom-prometheus-server          ClusterIP   10.0.172.191      <none>        80/TCP              7d9h
   elasticsearch-master                 ClusterIP   10.0.36.146       <none>        9200/TCP,9300/TCP   7d10h
   elasticsearch-master-headless        ClusterIP   None              <none>        9200/TCP,9300/TCP   7d10h
   grafana                              ClusterIP   10.0.15.229       <none>        80/TCP              5d5h
   kibana-kibana                        ClusterIP   10.0.188.224      <none>        5601/TCP            7d10h

   ```

      In this guide the server name is `dapr-prom-prometheus-server` and the namespace is `dapr-monitoring`, so the HTTP URL will be `http://dapr-prom-prometheus-server.dapr-monitoring`.

1. Fill in the following settings:

   - Name: `Dapr`
   - HTTP URL: `http://dapr-prom-prometheus-server.dapr-monitoring`
   - Default: On

   <img src="/images/grafana-prometheus-dapr-server-url.png" alt="Screenshot of the Prometheus Data Source configuration" width=600>

1. Click `Save & Test` button to verify that the connection succeeded.

## Import dashboards in Grafana

1. In the upper left corner of the Grafana home screen, click the "+" option, then "Import".

   You can now import [Grafana dashboard templates](https://github.com/dapr/dapr/tree/master/grafana) from [release assets](https://github.com/dapr/dapr/releases) for your Dapr version:

   <img src="/images/grafana-uploadjson.png" alt="Screenshot of the Grafana dashboard upload option" width=700>

1. Find the dashboard that you imported and enjoy

   <img src="/images/system-service-dashboard.png" alt="Screenshot of Dapr service dashboard" width=900>

   {{% alert title="Tip" color="primary" %}}
   Hover your mouse over the `i` in the corner to the description of each chart:

   <img src="/images/grafana-tooltip.png" alt="Screenshot of the tooltip for graphs" width=700>
   {{% /alert %}}

## References

* [Dapr Observability]({{<ref observability-concept.md >}})
* [Prometheus Installation](https://github.com/prometheus-community/helm-charts)
* [Prometheus on Kubernetes](https://github.com/coreos/kube-prometheus)
* [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
* [Supported Dapr metrics](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## Example

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/8W-iBDNvCUM?start=2577" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
