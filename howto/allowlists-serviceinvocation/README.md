# Apply access control list for service invocation

Access control enables the configuration of policies that restrict what operations *calling* applications can perform, via service invocation, on the *called* application. To limit access to a called applications from specific operations and HTTP verbs from the calling applications, you can define an access control policy specification in configuration.

- [Concepts](#concepts)
- [Policy rules](#policy-rules)
- [Policy priority](#policy-priority)
- [Example scenarios](#example-scenarios)
- [Hello world example](#hello-world-example)


## Concepts
**TrustDomain** - A "trust domain" is a logical group to manage trust relationships. Every application is assigned a trust domain which can be specified in the access control list policy spec. If no policy spec is defined or an empty trust domain is specified, then a default value "public" is used. This trust domain is used to generate the identity of the application in the TLS cert.

**App Identity** - Dapr generates a [SPIFFE](https://spiffe.io/) id for all applications which is attached in the TLS cert. The SPIFFE id is of the format: **spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**. For matching policies, the trust domain, namespace and app ID values of the calling app are extracted from the SPIFFE id in the TLS cert of the calling app. These values are matched against the trust domain, namespace and app ID values specified in the policy spec. If all three of these match, then more specific policies are further matched.

## Policy rules

1. If no access policy is specified, the default behavior is to allow all apps to access to all methods on the called app
2. If no global default action is specified and no app specific policies defined, the empty access policy is treated like no access policy specified and the default behavior is to allow all apps to access to all methods on the called app.
3. If no global default action is specified but some app specific policies have been defined, then we resort to a more secure option of assuming the global default action to deny access to all methods on the called app.
4. If an access policy is defined and if the incoming app credentials cannot be verified, then the global default action takes effect.
5. If either the trust domain or namespace of the incoming app do not match the values specified in the app policy, the app policy is ignored and the global default action takes effect.

## Policy priority

The action corresponding to the most specific policy matched takes effect as ordered below:
1. Specific HTTP verbs in the case of HTTP or the operation level action in the case of GRPC.
2. The default action at the app level
3. The default action at the global level

## Example scenarios

Below are some example scenarios for using access control list for service invocation. See [configuration guidance](../../concepts/configuration/README.md) to understand the available configuration settings for an application sidecar.

### Scenario 1 : Deny access to all apps except where trustDomain = public, namespace = default, appId = app1
With this configuration, all calling methods with appId = app1 are allowed and all other invocation requests from other applications are denied

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: deny
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: allow
      trustDomain: 'public'
      namespace: "default"
```

### Scenario 2 : Deny access to all apps except trustDomain = public, namespace = default, appId = app1, operation = op1
With this configuration, only method op1 from appId = app1 is allowed and all other method requests from all other apps, including other methods on app1, are denied

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
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
        httpVerb: ['*']
        action: allow
```

### Scenario 3 : Deny access to all apps except when a specific verb for HTTP and operation for GRPC is matched

With this configuration, the only scenarios below are allowed access and and all other method requests from all other apps, including other methods on app1 or app2, are denied
* trustDomain = public, namespace = default, appID = app1, operation = op1, http verb = POST/PUT
* trustDomain = "myDomain", namespace = "ns1", appID = app2, operation = op2 and application protocol is GRPC
, only HTTP verbs POST/PUT on method op1 from appId = app1 are allowed and all other method requests from all other apps, including other methods on app1, are denied

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
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
        httpVerb: ['POST', 'PUT']
        action: allow
    - appId: app2
      defaultAction: deny
      trustDomain: 'myDomain'
      namespace: "ns1"
      operations:
      - name: /op2
        action: allow
```

### Scenario 4 : Allow access to all methods except trustDomain = public, namespace = default, appId = app1, operation = /op1/*, all http verbs

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: allow
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: allow
      trustDomain: 'public'
      namespace: "default"
      operations:
      - name: /op1/*
        httpVerb: ['*']
        action: deny
```

### Scenario 5 : Allow access to all methods for trustDomain = public, namespace = ns1, appId = app1 and deny access to all methods for trustDomain = public, namespace = ns2, appId = app1

This scenario shows how applications with the same app ID but belonging to different namespaces can be specified

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  accessControl:
    defaultAction: allow
    trustDomain: "public"
    policies:
    - appId: app1
      defaultAction: allow
      trustDomain: 'public'
      namespace: "ns1"
    - appId: app1
      defaultAction: deny
      trustDomain: 'public'
      namespace: "ns2"
```

## Hello world example
This scenario shows how to apply access control to the [hello world](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) or [hello kubernetes](https://github.com/dapr/quickstarts/blob/master/hello-world/README.md) samples where a python app invokes a node.js app. You can create and apply these configuration files `nodeappconfig.yaml` and `pythonappconfig.yaml` as described in the [configuration](../../concepts/configuration/README.md) article.

The nodeappconfig example below shows how to deny access to the `neworder` method from the `pythonapp`, where the python app is in the `myDomain` trust domain and `default` namespace. The nodeapp is in the `public` trust domain.
 
**nodeappconfig.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: nodeappconfig
spec:
  tracing:
    samplingRate: "1"
  accessControl:
    defaultAction: allow
    trustDomain: "public"
    policies:
    - appId: pythonapp
      defaultAction: allow
      trustDomain: 'myDomain'
      namespace: "default"
      operations:
      - name: /neworder
        httpVerb: ['POST']
        action: deny
```    

**pythonappconfig.yaml** 

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pythonappconfig
spec:
  tracing:
    samplingRate: "1"
  accessControl:
    defaultAction: allow
    trustDomain: "myDomain"
```     

For example, this is how the pythonapp is deployed to Kubernetes in the default namespace with this configuration file.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pythonapp
  namespace: default
  labels:
    app: python
spec:
  replicas: 1
  selector:
    matchLabels:
      app: python
  template:
    metadata:
      labels:
        app: python
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "pythonapp"
        dapr.io/config: "pythonappconfig"
    spec:
      containers:
      - name: python
        image: dapriosamples/hello-k8s-python:edge
 ```  
 
## Related Links
 
* [Configuration concepts](../../concepts/configuration/README.md)
