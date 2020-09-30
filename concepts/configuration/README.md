# Configurations
Dapr configurations are settings that enable you to change the behavior of individual Dapr application sidecars or globally on the system services in the Dapr control plane.
An example of a per Dapr application sidecar setting is configuring trace settings. An example of a Dapr control plane setting is mutual TLS which is a global setting on the Sentry system service.   

- [Setting self hosted sidecar configuration](#setting-self-hosted-sidecar-configuration)
- [Setting Kubernetes sidecar configuration](#setting-kubernetes-sidecar-configuration)
- [Sidecar configuration settings](#sidecar-configuration-settings)
- [Setting Kubernetes control plane configuration](#kubernetes-control-plane-configuration)
- [Control plane configuration settings](#control-plane-configuration-settings)

## Setting self hosted sidecar configuration
In self hosted mode the Dapr configuration is a configuration file, for example `config.yaml`. By default the Dapr sidecar looks in the default Dapr folder for the runtime configuration eg: `$HOME/.dapr/config.yaml` in Linux/MacOS and `%USERPROFILE%\.dapr\config.yaml` in Windows.

A Dapr sidecar can also apply a configuration by using a ```--config``` flag to the file path with ```dapr run``` CLI command.

## Setting Kubernetes sidecar configuration 
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

The following configuration settings can be applied to Dapr application sidecars;
- [Tracing](#tracing)
- [Middleware](#middleware)
- [Scoping secrets for secret stores](#scoping-secrets-for-secret-stores)
- [Access control allow lists for service invocation](#access-control-allow-lists-for-service-invocation)
- [Example application sidecar configuration](#example-application-sidecar-configuration)

### Tracing

Tracing configuration turns on tracing for an application.

The `tracing` section under the `Configuration` spec contains the following properties:

```yml
tracing:
    samplingRate: "1"
```

The following table lists the properties for tracing:

Property | Type | Description
---- | ------- | -----------
samplingRate  | string | Set sampling rate for tracing to be enabled or disabled. 


`samplingRate` is used to enable or disable the tracing. To disable the sampling rate ,
set `samplingRate : "0"` in the configuration. The valid range of samplingRate is between 0 and 1 inclusive. The sampling rate determines whether a trace span should be sampled or not based on value. `samplingRate : "1"` samples all traces. By default, the sampling rate is (0.0001) or 1 in 10,000 traces.

See [Observability distributed tracing](../observability/traces.md) for more information

### Middleware

Middleware configuration set named Http pipeline middleware handlers 
The `httpPipeline` section under the `Configuration` spec contains the following properties:

```yml
httpPipeline:
  handlers:
    - name: oauth2
      type: middleware.http.oauth2
    - name: uppercase
      type: middleware.http.uppercase
```

The following table lists the properties for HTTP handlers:

Property | Type | Description
---- | ------- | -----------
name  | string | name of the middleware component
type  | string | type of middleware component

See [Middleware pipelines](../middleware/README.md) for more information

### Scoping secrets for secret stores

In addition to scoping which applications can access a given component, for example a secret store component (see [Scoping components](../../howto/components-scopes)), a named secret store component itself can be scoped to one or more secrets for an application. By defining `allowedSecrets` and/or `deniedSecrets` list, applications can be restricted to access only specific secrets.

The `secrets` section under the `Configuration` spec contains the following properties:

```yml
secrets:
  scopes:
    - storeName: kubernetes
      defaultAccess: allow
      allowedSecrets: ["redis-password"]
    - storeName: localstore
      defaultAccess: allow
      deniedSecrets: ["redis-password"]
```

The following table lists the properties for secret scopes:

Property | Type | Description
---- | ------- | -----------
storeName  | string | name of the secret store component. storeName must be unique within the list
defaultAccess  | string | access modifier. Accepted values "allow" (default) or "deny"
allowedSecrets | list   | list of secret keys that can be accessed
deniedSecrets  | list   | list of secret keys that cannot be accessed

When an `allowedSecrets` list is present with at least one element, only those secrets defined in the list can be accessed by the application.

See the [Scoping secrets](../../howto/secrets-scopes/README.md) HowTo for examples on how to scope secrets to an application.

### Access Control allow lists for service invocation
Access control enables the configuration of policies that restrict what operations *calling* applications can perform, via service invocation, on the *called* application. 
An access control policy is specified in configuration and be applied to Dapr sidecar for the *called* application. Example access policies are shown below and access to the called app is based on the matched policy action. You can provide a default global action for all calling applications and if no access control policy is specified, the default behavior is to allow all calling applicatons to access to the called app.

## Concepts
**TrustDomain** - A "trust domain" is a logical group to manage trust relationships. Every application is assigned a trust domain which can be specified in the access control list policy spec. If no policy spec is defined or an empty trust domain is specified, then a default value "public" is used. This trust domain is used to generate the identity of the application in the TLS cert.

**App Identity** - Dapr generates a [SPIFFE](https://spiffe.io/) id for all applications which is attached in the TLS cert. The SPIFFE id is of the format: **spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**. For matching policies, the trust domain, namespace and app ID values of the calling app are extracted from the SPIFFE id in the TLS cert of the calling app. These values are matched against the trust domain, namespace and app ID values specified in the policy spec. If all three of these match, then more specific policies are further matched.

```
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: deny --> Global default action in case no other policy is matched
    trustDomain: "public" --> The called application is assigned a trust domain and is used to generate the identity of this app in the TLS certificate.
    policies:
    - appId: app1 --> AppId of the calling app to allow/deny service invocation from
      defaultAction: deny --> App level default action in case the app is found but no specific operation is matched
      trustDomain: 'public' --> Trust domain of the calling app is matched against the specified value here.
      namespace: "default" --> Namespace of the calling app is matched against the specified value here.
      operations:
      - name: /op1 --> operation name on the called app
        httpVerb: ['POST', 'GET'] --> specific http verbs, unused for grpc invocation
        action: deny --> allow/deny access
      - name: /op2/* --> operation name with a postfix
        httpVerb: ["*"] --> wildcards can be used to match any http verb
        action: allow
    - appId: app2
      defaultAction: allow
      trustDomain: "public"
      namespace: "default"
      operations:
      - name: /op3
        httpVerb: ['POST', 'PUT']
        action: deny
```

The following tables lists the different properties for access control, policies and operations:

Access Control 
Property | Type | Description
---- | ------- | -----------
defaultAction  | string | Global default action when no other policy is matched
trustDomain  | string | Trust domain assigned to the application. Default is "public".
policies | string   | Policies to determine what operations the calling app can do on the called app

Policies 
Property | Type | Description
---- | ------- | -----------
app  | string   | AppId of the calling app to allow/deny service invocation from
namespace  | string |  Namespace value that needs to be matched with the namespace of the calling app
trustDomain  | string | Trust domain that needs to be matched with the trust domain of the calling app. Default is "public"
defaultAction  | string | App level default action in case the app is found but no specific operation is matched
operations | string   | operations that are allowed from the calling app

Operations
Property | Type | Description
---- | ------- | -----------
name | string   | Path name of the operations allowed on the called app. Wildcard "\*" can be used to under a path to match 
httpVerb  | list   | list specific http verbs that can be used by the calling app. Wildcard "\*" can be used to match any http verb. Unused for grpc invocation
action  | string   | Access modifier. Accepted values "allow" (default) or "deny"

See the [Allow lists for service invocation](../../howto/allowlists-serviceinvocation/README.md) HowTo for examples on how to set allow lists.

### Example application sidecar configuration
The following yaml shows an example configuration file that can be applied to an applications' Dapr sidecar.

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
    handlers:
      - name: oauth2
        type: middleware.http.oauth2
  secrets:
    scopes:
      - storeName: localstore
        defaultAccess: allow
        deniedSecrets: ["redis-password"]
  accessControl:
    defaultAction: deny
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: deny 
      trustDomain: 'public'
      namespace: "default" 
      operations:
      - name: /op1 
        httpVerb: ['POST', 'GET'] 
        action: deny
      - name: /op2/* 
        httpVerb: ["*"]
        action: allow
```

## Setting Kubernetes control plane configuration
There is a single configuration file called `default` installed with the Dapr control plane system services that applies global settings. This is set up when Dapr is deployed to Kubernetes

## Control plane configuration settings
A Dapr control plane configuration can configure the following settings:

Property | Type | Description
---- | ------- | -----------
enabled  | bool | Set mtls to be enabled or disabled
allowedClockSkew  | string | The extra time to give for certificate expiry based on possible clock skew on a machine. Default is 15 minutes.
workloadCertTTL  | string | Time a certificate is valid for. Default is 24 hours

See the [Mutual TLS](../../howto/configure-mtls/README.md) HowTo and [security concepts](../security/README.md) for more information.

### Example control plane configuration

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
