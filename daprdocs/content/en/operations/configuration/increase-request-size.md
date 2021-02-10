---
type: docs
title: "How-To: Configure Dapr to handle requests that are bigger that 4 MB"
linkTitle: "Configure request body size"
weight: 6000
description: >-
     How-To: Configure Dapr to handle requests that are bigger that 4 MB.
---

## How-To: Configure Dapr to handle requests that are bigger that 4 MB.

By default Dapr have a limit for the request body size which is a 4 MB, but users can change it by defining `dapr.io/http-max-request-size` flag.


### Self hosted

When running in self hosted mode, use the `--dapr-http-max-request-size` flag to configure Dapr to use non-default request body size:

```bash
dapr run --dapr-http-max-request-size 16 node app.js
```
This tells Dapr to set maximum request body size to `16` MB.



### Kubernetes

On Kubernetes, set the following annotations in your deployment YAML:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "8000"
        dapr.io/http-max-request-size: "16"
...
```
