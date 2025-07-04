---
type: docs
title: "How-To: Apply access control list configuration for service invocation"
linkTitle: "Service Invocation access control"
weight: 4000
description: "Restrict what operations calling applications can perform"
---

Using access control, you can configure policies that restrict what the operations _calling_ applications can perform, via service invocation, on the _called_ application. You can define an access control policy specification in the Configuration schema to limit access:
- To a called application from specific operations, and 
- To HTTP verbs from the calling applications.

An access control policy is specified in Configuration and applied to the Dapr sidecar for the _called_ application. Access to the called app is based on the matched policy action. 

You can provide a default global action for all calling applications. If no access control policy is specified, the default behavior is to allow all calling applications to access to the called app.

[See examples of access policies.](#example-scenarios)

## Terminology

### `trustDomain`

A "trust domain" is a logical group that manages trust relationships. Every application is assigned a trust domain, which can be specified in the access control list policy spec. If no policy spec is defined or an empty trust domain is specified, then a default value "public" is used. This trust domain is used to generate the identity of the application in the TLS cert.

### App Identity

Dapr requests the sentry service to generate a [SPIFFE](https://spiffe.io/) ID for all applications. This ID is attached in the TLS cert. 

The SPIFFE ID is of the format: `**spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**`. 

For matching policies, the trust domain, namespace, and app ID values of the calling app are extracted from the SPIFFE ID in the TLS cert of the calling app. These values are matched against the trust domain, namespace, and app ID values specified in the policy spec. If all three of these match, then more specific policies are further matched.

## Configuration properties

The following tables lists the different properties for access control, policies, and operations:

### Access Control

| Property      | Type   | Description |
|---------------|--------|-------------|
| `defaultAction` | string | Global default action when no other policy is matched
| `trustDomain`   | string | Trust domain assigned to the application. Default is "public".
| `policies`      | string | Policies to determine what operations the calling app can do on the called app

### Policies

| Property      | Type   | Description |
|---------------|--------|-------------|
| `app`           | string | AppId of the calling app to allow/deny service invocation from
| `namespace`     | string | Namespace value that needs to be matched with the namespace of the calling app
| `trustDomain`   | string | Trust domain that needs to be matched with the trust domain of the calling app. Default is "public"
| `defaultAction` | string | App level default action in case the app is found but no specific operation is matched
| `operations`    | string | operations that are allowed from the calling app

### Operations

| Property | Type   | Description                                                  |
| -------- | ------ | ------------------------------------------------------------ |
| `name`     | string | Path name of the operations allowed on the called app. Wildcard "\*" can be used in a path to match. Wildcard "\**" can be used to match under multiple paths. |
| `httpVerb` | list   | List specific http verbs that can be used by the calling app. Wildcard "\*" can be used to match any http verb. Unused for grpc invocation. |
| `action`   | string | Access modifier. Accepted values "allow" (default) or "deny" |

## Policy rules

1. If no access policy is specified, the default behavior is to allow all apps to access to all methods on the called app.
1. If no global default action is specified and no app specific policies defined, the empty access policy is treated like no access policy is specified. The default behavior is to allow all apps to access to all methods on the called app.
1. If no global default action is specified but some app specific policies have been defined, then we resort to a more secure option of assuming the global default action to deny access to all methods on the called app.
1. If an access policy is defined and if the incoming app credentials cannot be verified, then the global default action takes effect.
1. If either the trust domain or namespace of the incoming app do not match the values specified in the app policy, the app policy is ignored and the global default action takes effect.

## Policy priority

The action corresponding to the most specific policy matched takes effect as ordered below:
1. Specific HTTP verbs in the case of HTTP or the operation level action in the case of GRPC.
1. The default action at the app level
1. The default action at the global level

## Example scenarios

Below are some example scenarios for using access control list for service invocation. See [configuration guidance]({{< ref "configuration-concept.md" >}}) to understand the available configuration settings for an application sidecar.

### Scenario 1: 

Deny access to all apps except where `trustDomain` = `public`, `namespace` = `default`, `appId` = `app1`

With this configuration, all calling methods with `appId` = `app1` are allowed. All other invocation requests from other applications are denied.

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

### Scenario 2: 

Deny access to all apps except `trustDomain` = `public`, `namespace` = `default`, `appId` = `app1`, `operation` = `op1`

With this configuration, only the method `op1` from `appId` = `app1` is allowed. All other method requests from all other apps, including other methods on `app1`, are denied.

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

### Scenario 3: 

Deny access to all apps except when a specific verb for HTTP and operation for GRPC is matched

With this configuration, only the scenarios below are allowed access. All other method requests from all other apps, including other methods on `app1` or `app2`, are denied. 

- `trustDomain` = `public`, `namespace` = `default`, `appID` = `app1`, `operation` = `op1`, `httpVerb` = `POST`/`PUT`
- `trustDomain` = `"myDomain"`, `namespace` = `"ns1"`, `appID` = `app2`, `operation` = `op2` and application protocol is GRPC

Only the `httpVerb` `POST`/`PUT` on method `op1` from `appId` = `app1` are allowe. All other method requests from all other apps, including other methods on `app1`, are denied.

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

### Scenario 4: 

Allow access to all methods except `trustDomain` = `public`, `namespace` = `default`, `appId` = `app1`, `operation` = `/op1/*`, all `httpVerb`

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

### Scenario 5: 

Allow access to all methods for `trustDomain` = `public`, `namespace` = `ns1`, `appId` = `app1` and deny access to all methods for `trustDomain` = `public`, `namespace` = `ns2`, `appId` = `app1`

This scenario shows how applications with the same app ID while belonging to different namespaces can be specified.

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

### Scenario 6: 

Allow access to all methods except `trustDomain` = `public`, `namespace` = `default`, `appId` = `app1`, `operation` = `/op1/**/a`, all `httpVerb`

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
      - name: /op1/**/a
        httpVerb: ['*']
        action: deny
```

## "hello world" examples

In these examples, you learn how to apply access control to the [hello world](https://github.com/dapr/quickstarts/tree/master/tutorials) tutorials.

Access control lists rely on the Dapr [Sentry service]({{< ref "security-concept.md" >}}) to generate the TLS certificates with a SPIFFE ID for authentication. This means the Sentry service either has to be running locally or deployed to your hosting environment, such as a Kubernetes cluster.

The `nodeappconfig` example below shows how to **deny** access to the `neworder` method from the `pythonapp`, where the Python app is in the `myDomain` trust domain and `default` namespace. The Node.js app is in the `public` trust domain.

### nodeappconfig.yaml

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

### pythonappconfig.yaml

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

### Self-hosted mode

When walking through this tutorial, you: 
- Run the Sentry service locally with mTLS enabled
- Set up necessary environment variables to access certificates
- Launch both the Node app and Python app each referencing the Sentry service to apply the ACLs

#### Prerequisites

- Become familiar with running [Sentry service in self-hosted mode]({{< ref "mtls.md" >}}) with mTLS enabled
- Clone the [hello world](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world/README.md) tutorial

#### Run the Node.js app

1. In a command prompt, set these environment variables:

    {{< tabs "Linux/MacOS" Windows >}}

    {{% codetab %}}

      ```bash
      export DAPR_TRUST_ANCHORS=`cat $HOME/.dapr/certs/ca.crt`
      export DAPR_CERT_CHAIN=`cat $HOME/.dapr/certs/issuer.crt`
      export DAPR_CERT_KEY=`cat $HOME/.dapr/certs/issuer.key`
      export NAMESPACE=default
      ```

    {{% /codetab %}}

    {{% codetab %}}

      ```powershell
      $env:DAPR_TRUST_ANCHORS=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\ca.crt)
      $env:DAPR_CERT_CHAIN=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.crt)
      $env:DAPR_CERT_KEY=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.key)
      $env:NAMESPACE="default"
      ```

    {{% /codetab %}}
    
    {{< /tabs >}}

1. Run daprd to launch a Dapr sidecar for the Node.js app with mTLS enabled, referencing the local Sentry service:

   ```bash
   daprd --app-id nodeapp --dapr-grpc-port 50002 -dapr-http-port 3501 --log-level debug --app-port 3000 --enable-mtls --sentry-address localhost:50001 --config nodeappconfig.yaml
   ```

1. Run the Node.js app in a separate command prompt:

   ```bash
   node app.js
   ```

#### Run the Python app

1. In another command prompt, set these environment variables:

   {{< tabs "Linux/MacOS" Windows >}}

   {{% codetab %}}

    ```bash
    export DAPR_TRUST_ANCHORS=`cat $HOME/.dapr/certs/ca.crt`
    export DAPR_CERT_CHAIN=`cat $HOME/.dapr/certs/issuer.crt`
    export DAPR_CERT_KEY=`cat $HOME/.dapr/certs/issuer.key`
    export NAMESPACE=default
   ```
   {{% /codetab %}}

   {{% codetab %}}

   ```powershell
   $env:DAPR_TRUST_ANCHORS=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\ca.crt)
   $env:DAPR_CERT_CHAIN=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.crt)
   $env:DAPR_CERT_KEY=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.key)
   $env:NAMESPACE="default"
   ```
  
   {{% /codetab %}}

   {{< /tabs >}}

1. Run daprd to launch a Dapr sidecar for the Python app with mTLS enabled, referencing the local Sentry service:

   ```bash
   daprd --app-id pythonapp   --dapr-grpc-port 50003 --metrics-port 9092 --log-level debug --enable-mtls --sentry-address localhost:50001 --config pythonappconfig.yaml
   ```
1. Run the Python app in a separate command prompt:

   ```bash
   python app.py
   ```

You should see the calls to the Node.js app fail in the Python app command prompt, due to the **deny** operation action in the `nodeappconfig` file. Change this action to **allow** and re-run the apps to see this call succeed.

### Kubernetes mode

#### Prerequisites

- Become familiar with running [Sentry service in self-hosted mode]({{< ref "mtls.md" >}}) with mTLS enabled
- Clone the [hello world](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world/README.md) tutorial

#### Configure the Node.js and Python apps

You can create and apply the above [`nodeappconfig.yaml`](#nodeappconfigyaml) and [`pythonappconfig.yaml`](#pythonappconfigyaml) configuration files, as described in the [configuration]({{< ref "configuration-concept.md" >}}).

For example, the Kubernetes Deployment below is how the Python app is deployed to Kubernetes in the default namespace with this `pythonappconfig` configuration file.

Do the same for the Node.js deployment and look at the logs for the Python app to see the calls fail due to the **deny** operation action set in the `nodeappconfig` file. 

Change this action to **allow** and re-deploy the apps to see this call succeed.

##### Deployment YAML example

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

## Demo

Watch this [video](https://youtu.be/j99RN_nxExA?t=1108) on how to apply access control list for service invocation.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/j99RN_nxExA?start=1108" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Next steps

{{< button text="Dapr APIs allow list" page="api-allowlist" >}}