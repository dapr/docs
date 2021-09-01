---
type: docs
title: "How-To: Set up Jaeger for distributed tracing"
linkTitle: "Jaeger"
weight: 3000
description: "Set up Jaeger for distributed tracing"
type: docs
---

Dapr supports the Zipkin protocol. Since Jaeger is compatible with Zipkin, the Zipkin protocol can be used to communication with Jaeger.

## Configure self hosted mode

### Setup

The simplest way to start Jaeger is to use the pre-built all-in-one Jaeger image published to DockerHub:

```bash
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9412 \
  -p 16686:16686 \
  -p 9412:9412 \
  jaegertracing/all-in-one:1.22
```


Next, create the following YAML files locally:

* **config.yaml**: Note that because we are using the Zipkin protocol
to talk to Jaeger, we specify the `zipkin` section of tracing
configuration set the `endpointAddress` to address of the Jaeger
instance.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://localhost:9412/api/v2/spans"
```

To launch the application referring to the new YAML file, you can use
`--config` option:

```bash
dapr run --app-id mynode --app-port 3000 node app.js --config config.yaml
```

### Viewing Traces
To view traces, in your browser go to http://localhost:16686 to see the Jaeger UI.

## Configure Kubernetes
The following steps shows you how to configure Dapr to send distributed tracing data to Jaeger running as a container in your Kubernetes cluster, how to view them.

### Setup

First create the following YAML file to install Jaeger, file name is `jaeger-operator.yaml`

#### Development and test

By default, the allInOne Jaeger image uses memory as the backend storage and it is not recommended to use this in a production environment.

```yaml
apiVersion: jaegertracing.io/v1
kind: "Jaeger"
metadata:
  name: jaeger
spec:
  strategy: allInOne
  ingress:
    enabled: false
  allInOne:
    image: jaegertracing/all-in-one:1.22
    options:
      query:
        base-path: /jaeger
```

#### Production

Jaeger uses Elasticsearch as the backend storage, and you can create a secret in k8s cluster to access Elasticsearch server with access control. See [Configuring and Deploying Jaeger](https://docs.openshift.com/container-platform/4.7/jaeger/jaeger_install/rhbjaeger-deploying.html)

```shell
kubectl create secret generic jaeger-secret --from-literal=ES_PASSWORD='xxx' --from-literal=ES_USERNAME='xxx' -n ${NAMESPACE}
```

```yaml
apiVersion: jaegertracing.io/v1
kind: "Jaeger"
metadata:
  name: jaeger
spec:
  strategy: production
  query:
    options:
      log-level: info
      query:
        base-path: /jaeger
  collector:
    maxReplicas: 5
    resources:
      limits:
        cpu: 500m
        memory: 516Mi
  storage:
    type: elasticsearch
    esIndexCleaner:
      enabled: false                                ## turn the job deployment on and off
      numberOfDays: 7                               ## number of days to wait before deleting a record
      schedule: "55 23 * * *"                       ## cron expression for it to run
      image: jaegertracing/jaeger-es-index-cleaner  ## image of the job
    secretName: jaeger-secret
    options:
      es:
        server-urls: http://elasticsearch:9200
```

The pictures are as follows, include Elasticsearch and Grafana tracing data:

![jaeger-storage-es](/images/jaeger_storage_elasticsearch.png)

![grafana](/images/jaeger_grafana.png)


Now, use the above YAML file to install Jaeger

```bash
# Install Jaeger
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm install jaeger-operator jaegertracing/jaeger-operator
kubectl apply -f jaeger-operator.yaml

# Wait for Jaeger to be up and running
kubectl wait deploy --selector app.kubernetes.io/name=jaeger --for=condition=available
```

Next, create the following YAML file locally:

* **tracing.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://jaeger-collector.default.svc.cluster.local:9411/api/v2/spans"
```

Finally, deploy the the Dapr component and configuration files:

```bash
kubectl apply -f tracing.yaml
```

In order to enable this configuration for your Dapr sidecar, add the following annotation to your pod spec template:

```yml
annotations:
  dapr.io/config: "tracing"
```

That's it! Your Dapr sidecar is now configured for use with Jaeger.

### Viewing Tracing Data

To view traces, connect to the Jaeger Service and open the UI:

```bash
kubectl port-forward svc/jaeger-query 16686
```

In your browser, go to `http://localhost:16686` and you will see the Jaeger UI.

![jaeger](/images/jaeger_ui.png)

## References
- [Jaeger Getting Started](https://www.jaegertracing.io/docs/1.21/getting-started/#all-in-one)
- [W3C distributed tracing]({{< ref w3c-tracing >}})
