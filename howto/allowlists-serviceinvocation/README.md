# Access Control List for service invocation

Access control enables the configuration of policies that restrict what operations *calling* applications can perform, via service invocation, on the *called* application. To limit access to a called applications from specific operations and HTTP verbs from the calling applications, you can define an access control policy specification in configuration.

Below are some example scenarios for using access control list for service invocation. See [configuration guidance](../../concepts/configuration/README.md) to understand the available configuration settings for an application sidecar.

## Scenario 1 : Deny access to all apps except where trustDomain = public, namespace = default, appId = app1
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
    - app: app1
      defaultAction: allow
      trustDomain: 'public'
      namespace: "default"
```

## Scenario 2 : Deny access to all apps except trustDomain = public, namespace = default, appId = app1, operation = op1
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
    - app: app1
      defaultAction: deny
      trustDomain: 'public'
      namespace: "default"
      operations:
      - name: /op1
        httpVerb: ['*']
        action: allow
```

## Scenario 3 : Deny access to all apps except trustDomain = public, namespace = default, appID = app1, operation = op1, http verb = POST/PUT
With this configuration, only HTTP verbs POST/PUT on method op1 from appId = app1 are allowed and all other method requests from all other apps, including other methods on app1, are denied

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
    - app: app1
      defaultAction: deny
      trustDomain: 'public'
      namespace: "default"
      operations:
      - name: /op1
        httpVerb: ['POST', 'PUT']
        action: allow
```

## Scenario 4 :

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
    - app: pythonapp
      defaultAction: deny
      trustDomain: 'public'
      namespace: "default"
      operations:
      - name: /neworder
        httpVerb: ['POST', 'GET']
        action: deny
      - name: /products/*
        httpVerb: ["*"]
        action: allow
    - app: nodeapp
      defaultAction: allow
      trustDomain: "public"
      namespace: "default"
      operations:
      - name: /neworder
        httpVerb: ['POST', 'PUT']
        action: deny
```

## Policy rules

1. If no access policy is specified, the default behavior is to allow all apps to access to all methods on the called app 
2. If an access polic is defined and if the incoming app credentials cannot be verified, then the default global action takes effect.
3. If either the trust domain or namespace of the incoming app do not match the values specified in the app policy, the app policy is ignored and the global default action takes effect.

## Policy priority

The action corresponding to the most specific policy matched takes effect as ordered below:
1. Specific HTTP verbs in the case of HTTP or at the operation level action in the case of GRPC
2. The default action at the app level
3. The default action at the global level
