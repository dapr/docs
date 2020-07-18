# Set up Zipkin for distributed tracing

- [Configure self hosted mode](#Configure-self-hosted-mode)
- [Configure Kubernetes](#Configure-Kubernetes)
- [Tracing configuration](#Tracing-Configuration)


## Configure self hosted mode

For self hosted mode, on running `dapr init` the following YAML files are created by default and they are referenced by default on `dapr run` calls unless otherwise overridden.

1. The following file in `$HOME/dapr/components/zipkin.yaml` or `%USERPROFILE%\dapr\components\zipkin.yaml`:

* zipkin.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: zipkin
  namespace: default
spec:
  type: exporters.zipkin
  metadata:
  - name: enabled
    value: "true"
  - name: exporterAddress
    value: "http://localhost:9411/api/v2/spans"
```
2. The following file in `$HOME/dapr/config.yaml` or `%USERPROFILE%\dapr\config.yaml`:

* config.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
```

3. The [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) docker container is launched on running `dapr init` or it can be launched with the following code.

Launch Zipkin using Docker:

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

4. The applications launched with `dapr run` will by default reference the config file in `$HOME/dapr/config.yaml` or `%USERPROFILE%\dapr\config.yaml` and can be overridden with the Dapr CLI using the `--config` param:

```bash
dapr run --app-id mynode --app-port 3000 node app.js
```
### Viewing Traces
To view traces, in your browser go to http://localhost:9411 and you will see the Zipkin UI.

## Configure Kubernetes

The following steps shows you how to configure Dapr to send distributed tracing data to Zipkin running as a container in your Kubernetes cluster, how to view them.

### Setup

First, deploy Zipkin:

```bash
kubectl create deployment zipkin --image openzipkin/zipkin
```

Create a Kubernetes service for the Zipkin pod:

```bash
kubectl expose deployment zipkin --type ClusterIP --port 9411
```

Next, create the following YAML files locally:

* zipkin.yaml component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: zipkin
  namespace: default
spec:
  type: exporters.zipkin
  metadata:
  - name: enabled
    value: "true"
  - name: exporterAddress
    value: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

* tracing.yaml configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
```

Finally, deploy the the Dapr component and configuration files:

```bash
kubectl apply -f tracing.yaml
kubectl apply -f zipkin.yaml
```

In order to enable this configuration for your Dapr sidecar, add the following annotation to your pod spec template:

```yml
annotations:
  dapr.io/config: "tracing"
```

That's it! your sidecar is now configured for use with Open Census and Zipkin.

### Viewing Tracing Data

To view traces, connect to the Zipkin Service and open the UI:

```bash
kubectl port-forward svc/zipkin 9411:9411
```

In your browser, go to ```http://localhost:9411``` and you will see the Zipkin UI.

![zipkin](../../images/zipkin_ui.png)

## References

* [How-To: Use W3C Trace Context for distributed tracing](../../howto/use-w3c-tracecontext/readme.md)
