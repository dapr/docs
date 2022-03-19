---
type: docs
title: "How-To: Apply access control list configuration for service invocation"
linkTitle: "Service Invocation access control"
weight: 4000
description: "Restrict what operations *calling* applications can perform, via service invocation, on the *called* application"
---

Access control enables the configuration of policies that restrict what operations *calling* applications can perform, via service invocation, on the *called* application. To limit access to a called applications from specific operations and HTTP verbs from the calling applications, you can define an access control policy specification in configuration.

An access control policy is specified in configuration and be applied to Dapr sidecar for the *called* application. Example access policies are shown below and access to the called app is based on the matched policy action. You can provide a default global action for all calling applications and if no access control policy is specified, the default behavior is to allow all calling applications to access to the called app.

## Concepts

**TrustDomain** - A "trust domain" is a logical group to manage trust relationships. Every application is assigned a trust domain which can be specified in the access control list policy spec. If no policy spec is defined or an empty trust domain is specified, then a default value "public" is used. This trust domain is used to generate the identity of the application in the TLS cert.

**App Identity** - Dapr requests the sentry service to generate a [SPIFFE](https://spiffe.io/) id for all applications and this id is attached in the TLS cert. The SPIFFE id is of the format: `**spiffe://\<trustdomain>/ns/\<namespace\>/\<appid\>**`. For matching policies, the trust domain, namespace and app ID values of the calling app are extracted from the SPIFFE id in the TLS cert of the calling app. These values are matched against the trust domain, namespace and app ID values specified in the policy spec. If all three of these match, then more specific policies are further matched.

## Configuration properties

The following tables lists the different properties for access control, policies and operations:

### Access Control

| Property      | Type   | Description |
|---------------|--------|-------------|
| defaultAction | string | Global default action when no other policy is matched
| trustDomain   | string | Trust domain assigned to the application. Default is "public".
| policies      | string | Policies to determine what operations the calling app can do on the called app

### Policies

| Property      | Type   | Description |
|---------------|--------|-------------|
| app           | string | AppId of the calling app to allow/deny service invocation from
| namespace     | string | Namespace value that needs to be matched with the namespace of the calling app
| trustDomain   | string | Trust domain that needs to be matched with the trust domain of the calling app. Default is "public"
| defaultAction | string | App level default action in case the app is found but no specific operation is matched
| operations    | string | operations that are allowed from the calling app

### Operations

| Property | Type   | Description |
|----------|--------|-------------|
| name     | string | Path name of the operations allowed on the called app. Wildcard "\*" can be used to under a path to match
| httpVerb | list   | List specific http verbs that can be used by the calling app. Wildcard "\*" can be used to match any http verb. Unused for grpc invocation
| action   | string | Access modifier. Accepted values "allow" (default) or "deny"

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

Below are some example scenarios for using access control list for service invocation. See [configuration guidance]({{< ref "configuration-concept.md" >}}) to understand the available configuration settings for an application sidecar.

<font size=5>Scenario 1: Deny access to all apps except where trustDomain = public, namespace = default, appId = app1</font>

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

<font size=5>Scenario 2: Deny access to all apps except trustDomain = public, namespace = default, appId = app1, operation = op1</font>

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

<font size=5>Scenario 3: Deny access to all apps except when a specific verb for HTTP and operation for GRPC is matched</font>

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

<font size=5>Scenario 4: Allow access to all methods except trustDomain = public, namespace = default, appId = app1, operation = /op1/*, all http verbs</font>

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

<font size=5>Scenario 5: Allow access to all methods for trustDomain = public, namespace = ns1, appId = app1 and deny access to all methods for trustDomain = public, namespace = ns2, appId = app1</font>

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

## Hello world examples
These examples show how to apply access control to the [hello world](https://github.com/dapr/quickstarts#quickstarts) quickstart samples where a python app invokes a node.js app.
Access control lists rely on the Dapr [Sentry service]({{< ref "security-concept.md" >}}) to generate the TLS certificates with a SPIFFE id for authentication, which means the Sentry service either has to be running locally or deployed to your hosting environment such as a Kubernetes cluster.

The nodeappconfig example below shows how to **deny** access to the `neworder` method from the `pythonapp`, where the python app is in the `myDomain` trust domain and `default` namespace. The nodeapp is in the `public` trust domain.

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

### Self-hosted mode
This example uses the [hello world](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world/README.md) quickstart.

The following steps run the Sentry service locally with mTLS enabled, set up necessary environment variables to access certificates, and then launch both the node app and python app each referencing the Sentry service to apply the ACLs.

 1. Follow these steps to run the [Sentry service in self-hosted mode]({{< ref "mtls.md" >}}) with mTLS enabled

 2. In a command prompt, set these environment variables:

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

3. Run daprd to launch a Dapr sidecar for the node.js app with mTLS enabled, referencing the local Sentry service:

   ```bash
   daprd --app-id nodeapp --dapr-grpc-port 50002 -dapr-http-port 3501 --log-level debug --app-port 3000 --enable-mtls --sentry-address localhost:50001 --config nodeappconfig.yaml
   ```

4. Run the node app in a separate command prompt:

   ```bash
   node app.js
   ```

5. In another command prompt, set these environment variables:

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

6. Run daprd to launch a Dapr sidecar for the python app with mTLS enabled, referencing the local Sentry service:

   ```bash
   daprd --app-id pythonapp   --dapr-grpc-port 50003 --metrics-port 9092 --log-level debug --enable-mtls --sentry-address localhost:50001 --config pythonappconfig.yaml
   ```

7. Run the python app in a separate command prompt:

   ```bash
   python app.py
   ```

8. You should see the calls to the node app fail in the python app command prompt based due to the **deny** operation action in the nodeappconfig file. Change this action to **allow** and re-run the apps and you should then see this call succeed.

### Kubernetes mode
This example uses the [hello kubernetes](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes/README.md) quickstart.

You can create and apply the above configuration files `nodeappconfig.yaml` and `pythonappconfig.yaml` as described in the [configuration]({{< ref "configuration-concept.md" >}}) to the Kubernetes deployments.

For example, below is how the pythonapp is deployed to Kubernetes in the default namespace with this pythonappconfig configuration file.
Do the same for the nodeapp deployment and then look at the logs for the pythonapp to see the calls fail due to the **deny** operation action set in the nodeappconfig file. Change this action to **allow** and re-deploy the apps and you should then see this call succeed.

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

## Community call demo
Watch this [video](https://youtu.be/j99RN_nxExA?t=1108) on how to apply access control list for service invocation.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube.com/embed/j99RN_nxExA?start=1108" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>