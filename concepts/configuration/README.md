# Configurations
Dapr configurations are settings that enable you to change the behavior of individual Dapr sidecars or globally on the system services in the Dapr control plane.

An example of a per Dapr sidecar setting is configuring trace settings. An example of a control plane setting is mutual TLS which is a global setting on the Sentry system service.   

- [Self hosted sidecar configuration](#Self-hosted-sidecar-configuration)
- [Kubernetes sidecar configuration](#Kubernetes-sidecar-configuration)
- [Sidecar Configuration settings](#sidecar-configuration-settings)
- [Kubernetes control plane configuration](#Kubernetes-control-plane-configuration)
- [Control plane configuration settings](#control-plane-configuration-settings)

## Self hosted sidecar configuration  
In self hosted mode the Dapr configuration is a configuration file, for example `myappconfig.yaml`. By default Dapr side looks in the `components/` sub-folder under the folder where you run your application for a configuration file.

A Dapr sidecar can also apply a configuration by using a ```--config``` flag to the file path with ```dapr run``` CLI command.

## Kubernetes sidecar configuration 
In Kubernetes mode the Dapr configuration is a Configuration CRD, that is applied to the cluster. For example;

```cli
kubectl apply -f myappconfig.yaml
```

You can use the Dapr CLI to list the Configuration CRDs

```cli
dapr configurations -k
```

A Dapr sidecar can apply a specific configuration by using a ```dapr.io/config``` annotation. For example:

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/id: "nodeapp"
    dapr.io/port: "3000"
    dapr.io/config: "myappconfig"
```
Note: There are more [Kubernetes annotations](../../howto/configure-k8s/readme.md) available to configure the Dapr sidecar on activation by sidecar Injector system service.

## Sidecar configuration settings

The following configuration settings can be applied to Dapr sidecars;

* [Observability distributed tracing](../observability/traces.md)
* [Middleware pipelines](../middleware/README.md)

### Tracing configuration

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

### Middleware configuration

The `middleware` section under the `Configuration` spec contains the following properties:

```yml
httpPipeline:
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

The following table lists the different properties.

Property | Type | Description
---- | ------- | -----------
name  | string | name of the middleware component
type  | string | type of middleware component



Example sidecar configuration

```yml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myappconfig
  namespace: default
spec:
  tracing:
    enabled: true
    expandParams: true
    includeBody: true
  httpPipeline:
    - name: oauth2
      type: middleware.http.oauth2
```

## Kubernetes control plane configuration
There is a single configuration file called `default` installed with the control plane system services that applies global settings.  

## Control plane configuration settings

A Dapr control plane configuration can configure the following settings:

* [Mutual TLS](../../howto/configure-mtls/readme.md). Also see [security concepts](../security/readme.md) 


Property | Type | Description
---- | ------- | -----------
enabled  | bool | Set mtls to be enabled or disabled
allowedClockSkew  | string | The extra time to give for certificate expiry based on possible clock skew on a machine. Default is 15 minutes.
workloadCertTTL  | string | Time a certificate is valid for. Default is 24 hours

Example control plane configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: default
  namespace: default
spec:
  mtls:
    enabled: true
    allowedClockSkew: 15m
    workloadCertTTL: 24h
```

## References
* [Distributed tracing](../observability/traces.md)
* [Middleware pipelines](../middleware/README.md)
* [Security](../security/readme.md) 
* [How-To: Configuring the Dapr sidecar on Kubernetes](../../howto/configure-k8s/readme.md)
