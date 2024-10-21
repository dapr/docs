---
type: docs
title: "How-To: Configure Environment Variables from Secrets for Dapr sidecar"
linkTitle: "Environment Variables from Secrets"
weight: 7500
description: "Inject Environment Variables from Kubernetes Secrets into Dapr sidecar"
---
In special cases, Dapr sidecar needs an environment variable injected into it. This use case may be required by a Component, a 3rd party library, or a module that uses environment variables to configure the said Component or customize its behavior. This can be useful for both production and non-production environments.

## Overview
In Dapr 1.15 the new annotation was introduced, `dapr.io/env-from-secret`, similarly to `dapr.io/env`, see [here]({{<ref arguments-annotations-overview>}}).
This annotation allows users to inject an environment variable with a value from a Secret, into the Dapr sidecar.

### Annotation format
The values of this annotation are formatted like so:

- Single key secret: `<ENV_VAR_NAME>=<SECRET_NAME>`
- Multi key-value secret: `<ENV_VAR_NAME>=<SECRET_NAME>:<SECRET_KEY>`

`<ENV_VAR_NAME>` is required to follow the `C_IDENTIFIER` format and captured by the following regex: `[A-Za-z_][A-Za-z0-9_]*`<br/>
- Must start with a letter or underscore
- The rest of the identifier to contain letters, digits, or underscores

Due to the restriction of the `secretKeyRef`, `name` field is required, so both `name` and `key` must be set (read more [here](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#environment-variables), in section "env.valueFrom.secretKeyRef.name")<br/> 
In this case, Dapr will set both to the same value.

## Configuring single key secret environment variable
Example:<br/>
Add the `dapr.io/env-from-secret` annotation to Deployment
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
Annotation: `dapr.io/env-from-secret: "AUTH_TOKEN=auth-headers-secret"` will be injected as:
```yaml
env:
- name: AUTH_TOKEN
    valueFrom:
    secretKeyRef:
        name: auth-headers-secret
        key: auth-headers-secret
```
This will require the Secret to have both `name` and `key` fields with the same value, "auth-headers-secret". <br/>
Example secret (for demo purposes only, don't store secrets in plain text)
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

Add the `dapr.io/env-from-secret` annotation to Deployment
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
Annotation: `dapr.io/env-from-secret: "AUTH_TOKEN=auth-headers-secret:auth-header-value"` will be injected as:
```yaml
env:
- name: AUTH_TOKEN
    valueFrom:
    secretKeyRef:
        name: auth-headers-secret
        key: auth-header-value
```
Example secret (for demo purposes only, don't store secrets in plain text)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: auth-headers-secret
type: Opaque
stringData:
  auth-header-value: "AUTH=mykey"
```