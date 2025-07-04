---
type: docs
title: "How-To: Configure Environment Variables from Secrets for Dapr sidecar"
linkTitle: "Environment Variables from Secrets"
weight: 7500
description: "Inject Environment Variables from Kubernetes Secrets into Dapr sidecar"
---
In special cases, the Dapr sidecar needs an environment variable injected into it. This use case may be required by a component, a 3rd party library, or a module that uses environment variables to configure the said component or customize its behavior. This can be useful for both production and non-production environments.

## Overview
In Dapr 1.15, the new `dapr.io/env-from-secret` annotation was introduced, [similar to `dapr.io/env`]({{< ref arguments-annotations-overview >}}).
With this annotation, you can inject an environment variable into the Dapr sidecar, with a value from a secret.

### Annotation format
The values of this annotation are formatted like so:

- Single key secret: `<ENV_VAR_NAME>=<SECRET_NAME>`
- Multi key/value secret: `<ENV_VAR_NAME>=<SECRET_NAME>:<SECRET_KEY>`

`<ENV_VAR_NAME>` is required to follow the `C_IDENTIFIER` format and captured by the `[A-Za-z_][A-Za-z0-9_]*` regex:
- Must start with a letter or underscore
- The rest of the identifier contains letters, digits, or underscores

The `name` field is required due to the restriction of the `secretKeyRef`, so both `name` and `key` must be set. [Learn more from the "env.valueFrom.secretKeyRef.name" section in this Kubernetes documentation.](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#environment-variables)
In this case, Dapr sets both to the same value.

## Configuring single key secret environment variable
In the following example, the `dapr.io/env-from-secret` annotation is added to the Deployment.
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/env-from-secret: "AUTH_TOKEN=auth-headers-secret"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

The `dapr.io/env-from-secret` annotation with a value of `"AUTH_TOKEN=auth-headers-secret"` is injected as:

```yaml
env:
- name: AUTH_TOKEN
    valueFrom:
    secretKeyRef:
        name: auth-headers-secret
        key: auth-headers-secret
```
This requires the secret to have both `name` and `key` fields with the same value, "auth-headers-secret".

**Example secret**

> **Note:** The following example is for demo purposes only. It's not recommended to store secrets in plain text.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-headers-secret
type: Opaque
stringData:
  auth-headers-secret: "AUTH=mykey"
```

## Configuring multi-key secret environment variable

In the following example, the `dapr.io/env-from-secret` annotation is added to the Deployment.
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/env-from-secret: "AUTH_TOKEN=auth-headers-secret:auth-header-value"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```
The `dapr.io/env-from-secret` annotation with a value of `"AUTH_TOKEN=auth-headers-secret:auth-header-value"` is injected as:
```yaml
env:
- name: AUTH_TOKEN
    valueFrom:
    secretKeyRef:
        name: auth-headers-secret
        key: auth-header-value
```

**Example secret**

 > **Note:** The following example is for demo purposes only. It's not recommended to store secrets in plain text.
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-headers-secret
type: Opaque
stringData:
  auth-header-value: "AUTH=mykey"
```