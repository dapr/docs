# Access Control List for service invocation

To limit access to applications from specific apps/operations/http verbs, users can define an access control policy specification in the Configuration.

Follow [these instructions](../../concepts/configuration/README.md) to define a configuration CRD.

## Scenario 1 : Deny access to all apps except trustDomain = trustDomain, namespace = default, appID = app1



```yaml
dapr.io/config: appconfig
```

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

With this defined, all methods with appID = app1 will be allowed and all other requests will be denied

## Scenario 2 : Deny access to all apps except trustDomain = trustDomain, namespace = default, appID = app1, operation = op1

To allow a Dapr application to have access to only certain secrets, define the following `config.yaml`:

```yaml
dapr.io/config: appconfig
```

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

With this defined, op1 method from appID = app1 will be allowed and all other requests will be denied

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  tracing:
    samplingRate: "1"
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

## Scenario 3 : Deny access to all apps except trustDomain = trustDomain, namespace = default, appID = app1, operation = op1, http verb = POST/PUT

To allow a Dapr application to have access to only certain secrets, define the following `config.yaml`:

```yaml
dapr.io/config: appconfig
```

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

With this defined, only POST and PUT HTTP operatipn from op1 method and appID = app1 will be allowed and all other requests will be denied

## Policy rules

1. If no access policy is specified, current behavior to allow all apps is unchanged.
2. If the incoming app credentials cannot be verified, then the default global action takes effect.
3. If either the trust domain or namespace of the incoming app do not match the values specified in the app policy, the app policy is ignored and the global default action takes effect.

## Policy priority

The action corresponding to the most specific policy matched will take effect as below:
1. Specific HTTP verb in the case of HTTP or Operation level action in the case of GRPC
2. Default action at the app level
3. Default action at the global level




