---
type: docs
title: "How-To: Add custom annotations to the Dapr sidecar service"
linkTitle: "Sidecar Service Annotations"
weight: 8000
description: "Configure custom annotations on the Dapr sidecar service"
---

The Dapr operator automatically creates a Service (named with the `-dapr` suffix) for the Dapr sidecar when running in Kubernetes. In some cases, you may need to add custom annotations to this service, for example to support specific network policies (such as Illumio) or metrics scraping configurations.

## Overview

The `dapr.io/sidecar-svc-annotations` annotation allows you to specify a comma-separated list of `key=value` pairs that will be added as annotations to the Dapr sidecar service.

## Usage

Add the annotation to your Deployment or StatefulSet pod template.

### Format

The value should be a comma-separated list of key-value pairs:
`key1=value1,key2=value2`

### Example

Here is an example of a Deployment that adds custom annotations to the Dapr sidecar service:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app
  namespace: default
  labels:
    app: test-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test-app
  template:
    metadata:
      labels:
        app: test-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "test-app"
        dapr.io/sidecar-svc-annotations: "com.example.policy.app=test-app,com.example.policy.env=test,com.example.policy.team=platform"
    spec:
      containers:
      - name: test-app
        image: nginx:1.19.2
```

The resulting Service created by the Dapr operator will include these annotations:

```yaml
apiVersion: v1
kind: Service
metadata:
  annotations:
    com.example.policy.app: test-app
    com.example.policy.env: test
    com.example.policy.team: platform
    dapr.io/app-id: test-app
    prometheus.io/path: /
    prometheus.io/port: "9090"
    prometheus.io/probe: "true"
    prometheus.io/scrape: "true"
  labels:
    dapr.io/enabled: "true"
  name: test-app-dapr
  namespace: default
...
```
