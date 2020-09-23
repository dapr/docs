# Configurations
Dapr configurations are settings that enable you to change the behavior of individual Dapr sidecars or globally on the system services in the Dapr control plane.

An example of a per Dapr sidecar setting is configuring trace settings. An example of a control plane setting is mutual TLS which is a global setting on the Sentry system service.   

- [Self hosted sidecar configuration](#self-hosted-sidecar-configuration)
- [Kubernetes sidecar configuration](#kubernetes-sidecar-configuration)
- [Sidecar Configuration settings](#sidecar-configuration-settings)
- [Kubernetes control plane configuration](#kubernetes-control-plane-configuration)
- [Control plane configuration settings](#control-plane-configuration-settings)

## Self hosted sidecar configuration
In self hosted mode the Dapr configuration is a configuration file, for example `config.yaml`. By default Dapr sidecar looks in the default Dapr folder for the runtime configuration eg: `$HOME/.dapr/config.yaml` in Linux/MacOS and `%USERPROFILE%\.dapr\config.yaml` in Windows.

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
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "myappconfig"
```
Note: There are more [Kubernetes annotations](../../howto/configure-k8s/README.md) available to configure the Dapr sidecar on activation by sidecar Injector system service.

## Sidecar configuration settings

The following configuration settings can be applied to Dapr sidecars;

* [Observability distributed tracing](../observability/traces.md)
* [Middleware pipelines](../middleware/README.md)
* [Scoping secrets](../../howto/secrets-scopes/README.md)

### Tracing configuration

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
tracing:
    samplingRate: "1"
```

The following table lists the different properties.

Property | Type | Description
---- | ------- | -----------
samplingRate  | string | Set sampling rate for tracing to be enabled or disabled. 


`samplingRate` is used to enable or disable the tracing. To disable the sampling rate ,
set `samplingRate : "0"` in the configuration. The valid range of samplingRate is between 0 and 1 inclusive. The sampling rate determines whether a trace span should be sampled or not based on value. `samplingRate : "1"` samples all traces. By default, the sampling rate is (0.0001) or 1 in 10,000 traces.

### Middleware configuration

The `httpPipeline` section under the `Configuration` spec contains the following properties:

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
    samplingRate: "1"
  httpPipeline:
    - name: oauth2
      type: middleware.http.oauth2
```

### Scoping secrets

In addition to scoping which application can access given secret store component, the secret store component itself can be scoped to one or more secrets. By defining `allowedSecrets` and/or `deniedSecrets` list, applications can be restricted access to specific secrets.

The `secrets` section under the `Configuration` spec contains the following properties:

```yml
secrets:
  scopes:
    - storeName: kubernetes
      defaultAcess: allow
      allowedSecrets: ["redis-password"]
    - storeName: localstore
      defaultAccess: allow
      deniedSecrets: ["redis-password"]
```

The following table lists the different properties.

Property | Type | Description
---- | ------- | -----------
storeName  | string | name of the secret store component. storeName must be unique within the list.
defaultAccess  | string | access modifier. Accepted values "allow"(default) or "deny".
allowedSecrets | list   | list of secret keys that can be accessed. 
deniedSecrets  | list   | list of secret keys that cannot be accessed.

When an `allowedSecrets` list is present with at least one element, only those secrets defined in the list can be accessed by the application.


## Kubernetes control plane configuration
There is a single configuration file called `default` installed with the control plane system services that applies global settings.  

## Control plane configuration settings

A Dapr control plane configuration can configure the following settings:

* [Mutual TLS](../../howto/configure-mtls/README.md). Also see [security concepts](../security/README.md) 


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
* [Security](../security/README.md) 
* [How-To: Configuring the Dapr sidecar on Kubernetes](../../howto/configure-k8s/README.md)
