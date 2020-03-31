# Set up distributed tracing with Application insights

Dapr integrates with Application Insights through OpenTelemetry's default exporter along with a dedicated agent known as [Local Forwarder](https://docs.microsoft.com/en-us/azure/azure-monitor/app/opencensus-local-forwarder).

> Note: Local forwarder is still under preview, but being deprecated. Application insights team recommends to use [Opentelemetry collector](https://github.com/open-telemetry/opentelemetry-collector) (which is in alpha state) for the future so that we're working on moving from local forwarder to [Opentelemetry collector](https://github.com/open-telemetry/opentelemetry-collector).

## How to configure distributed tracing with Application insights

The following steps will show you how to configure Dapr to send distributed tracing data to Application insights.

### Setup Application insights

1. First, you'll need an Azure account. Please see instructions [here](https://azure.microsoft.com/free/) to apply for a **free** Azure account.
2. Follow instructions [here](https://docs.microsoft.com/en-us/azure/azure-monitor/app/create-new-resource) to create a new Application Insights resource.
3. Get Application insights Intrumentation key from your application insights page
4. Go to `Configure -> API Access`
5. Click `Create API Key`
6. Select all checkboxes under `Choose what this API key will allow apps to do:`
   - Read telemetry
   - Write annotations
   - Authenticate SDK control channel
7. Generate Key and get API key

### Setup the Local Forwarder

#### Local environment

1. Run localfowarder

```bash
docker run -e APPINSIGHTS_INSTRUMENTATIONKEY=<Your Instrumentation Key> -e APPINSIGHTS_LIVEMETRICSSTREAMAUTHENTICATIONAPIKEY=<Your API Key> -d -p 55678:55678 daprio/dapr-localforwarder:0.1-beta1
```

> Note: dapr-localforwarder is created by using [0.1-beta1 release](https://github.com/microsoft/ApplicationInsights-LocalForwarder/releases/tag/v0.1-beta1). If you want to create your own image, please use [this dockerfile](./localforwarder/Dockerfile).

1. Copy *tracing.yaml* to a *components* folder under the same folder where you run you application. 

* native.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: native
spec:
  type: exporters.native
  metadata:
  - name: enabled
    value: "true"
  - name: agentEndpoint
    value: "localhost:55678"
```

* tracing.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
spec:
  tracing:
    enabled: true
    expandParams: true
    includeBody: true
```

3. When running in the local mode, you need to launch Dapr with the `--config` parameter:

```bash
dapr run --app-id mynode --app-port 3000 --config ./tracing.yaml node app.js
```

#### Kubernetes environment

1. Download [dapr-localforwarder.yaml](./localforwarder/dapr-localforwarder.yaml)
2. Replace `<APPINSIGHT INSTRUMENTATIONKEY>` with your Instrumentation Key and `<APPINSIGHT API KEY>` with the generated key in the file

```yaml
          - name: APPINSIGHTS_INSTRUMENTATIONKEY
            value: <APPINSIGHT INSTRUMENTATIONKEY> # Replace with your ikey
          - name: APPINSIGHTS_LIVEMETRICSSTREAMAUTHENTICATIONAPIKEY
            value: <APPINSIGHT API KEY> # Replace with your generated api key
```

3. Deploy dapr-localfowarder.yaml

```bash
kubectl apply -f ./dapr-localforwarder.yaml
```

4. Create the following YAML files

* native.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: native
spec:
  type: exporters.native
  metadata:
  - name: enabled
    value: "true"
  - name: agentEndpoint
    value: "<Local forwarder address, e.g. dapr-localforwarder.default.svc.cluster.local:55678>"
```

* tracing.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
spec:
  tracing:
    enabled: true
    expandParams: true
    includeBody: true
```

5. Use kubectl to apply the above CRD files:

```bash
kubectl apply -f tracing.yaml
kubectl apply -f native.yaml
```

6. Deploy your app with tracing
When running in the Kubernetes model, you need to add a `dapr.io/config` annotation to your container that you want to participate in the distributed tracing, as shown in the following example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  ...
spec:
  ...
  template:
    metadata:
      ...
      annotations:
        dapr.io/enabled: "true"
        dapr.io/id: "calculator-front-end"
        dapr.io/port: "8080"
        dapr.io/config: "tracing"
```

That's it! There's no need include any SDKs or instrument your application code in anyway. Dapr automatically handles distributed tracing for you.

> **NOTE**: You can register multiple exporters at the same time, and tracing logs will be forwarded to all registered exporters.

Generate some workloads. And after a few minutes, you should see tracing logs appearing in your Application Insights resource. And you can also use **Application map** to examine the topology of your services, as shown below:

![Application map](../../images/azure-monitor.png)

## Tracing Configuration

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
tracing:
    enabled: true
    expandParams: true
    includeBody: true
```

The following table lists the different properties.

Property | Type | Description
---- | ------- | -----------
enabled  | bool | Set tracing to be enabled or disabled
expandParams  | bool | When true, expands parameters passed to HTTP endpoints
includeBody  | bool | When true, includes the request body in the tracing event
