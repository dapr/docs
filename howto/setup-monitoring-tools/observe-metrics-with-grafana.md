# Observe metrics with Grafana

This document describes how to view Dapr metrics in a Grafana dashboard. You can see example screenshots of the Dapr dashboards [here](../../reference/dashboard/img/).

Or watch this [video](https://www.youtube.com/watch?v=8W-iBDNvCUM&feature=youtu.be&t=2580) for a demonstration of the Grafana Dapr metrics dashboard.

## Prerequisites

- [Set up Prometheus and Grafana](./setup-prometheus-grafana.md)

## Steps to view metrics

- [Configure Prometheus as Data Source](#configure-prometheus-as-data-source)
- [Import Dashboards in Grafana](#import-dashboards-in-grafana)

### Configure Prometheus as data source
First you need to connect Prometheus as a data source to Grafana.

1. Port-forward to svc/grafana

```
$ kubectl port-forward svc/grafana 8080:80 -n dapr-monitoring
Forwarding from 127.0.0.1:8080 -> 3000
Forwarding from [::1]:8080 -> 3000
Handling connection for 8080
Handling connection for 8080
```

2. Browse `http://localhost:8080`

3. Login with admin and password

4. Click Configuration Settings -> Data Sources

      ![data source](./img/grafana-datasources.png)

5. Add Prometheus as a data soruce.

      ![add data source](./img/grafana-datasources.png)

6. Enter Promethesus server address in your cluster.

      You can get the Prometheus server address by running the following command.

```bash
kubectl get svc -n dapr-monitoring

NAME                                 TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)             AGE
dapr-prom-kube-state-metrics         ClusterIP   10.0.174.177   <none>        8080/TCP            7d9h
dapr-prom-prometheus-alertmanager    ClusterIP   10.0.255.199   <none>        80/TCP              7d9h
dapr-prom-prometheus-node-exporter   ClusterIP   None           <none>        9100/TCP            7d9h
dapr-prom-prometheus-pushgateway     ClusterIP   10.0.190.59    <none>        9091/TCP            7d9h
dapr-prom-prometheus-server          ClusterIP   10.0.172.191   <none>        80/TCP              7d9h
elasticsearch-master                 ClusterIP   10.0.36.146    <none>        9200/TCP,9300/TCP   7d10h
elasticsearch-master-headless        ClusterIP   None           <none>        9200/TCP,9300/TCP   7d10h
grafana                              ClusterIP   10.0.15.229    <none>        80/TCP              5d5h
kibana-kibana                        ClusterIP   10.0.188.224   <none>        5601/TCP            7d10h

```

In this Howto, the server is `dapr-prom-prometheus-server`.

You now need to set up Prometheus data source with the following settings:

- Name: `Dapr`
- HTTP URL: `http://dapr-prom-prometheus-server.dapr-monitoring`
- Default: On

![prometheus server](./img/grafana-prometheus-dapr-server-url.png)

7. Click `Save & Test` button to verify that the connection succeeded.

### Import dashboards in Grafana
Next you import the Dapr dashboards into Grafana. 

In the upper left, click the "+" then "Import". 

You can now import built-in [Grafana dashboard templates](https://github.com/dapr/dapr/tree/master/grafana).

The Grafana dashboards are part of [release assets](https://github.com/dapr/dapr/releases) with this URL https://github.com/dapr/dapr/releases/ 
You can find `grafana-actor-dashboard.json`, `grafana-sidecar-dashboard.json` and `grafana-system-services-dashboard.json` in release assets location.

![upload json](./img/grafana-uploadjson.png)

8. Find the dashboard that you imported and enjoy!

![upload json](../../reference/dashboard/img/system-service-dashboard.png)

# References

* [Set up Prometheus and Grafana](./setup-prometheus-grafana.md)
* [Prometheus Installation](https://github.com/helm/charts/tree/master/stable/prometheus-operator)
* [Prometheus on Kubernetes](https://github.com/coreos/kube-prometheus)
* [Prometheus Kubernetes Operator](https://github.com/helm/charts/tree/master/stable/prometheus-operator)
* [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
