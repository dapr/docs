# Invoke remote services

In many environments with multiple services that need to communicate with each other, developers often ask themselves the following questions:

* How do I discover and invoke different services?
* How do I handle retries and transient errors?
* How do I use distributed tracing correctly to see a call graph?

Dapr allows developers to overcome these challenges by providing an endpoint that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing and error handling.

For more info on service invocation, read the [conceptional documentation](../../concepts/service-invocation/README.md).

## 1. Choose an ID for your service

Dapr allows you to assign a global, unique ID for your app.

This ID encapsulates the state for your application, regardless of the number of instances it may have.

### Setup an ID using the Dapr CLI

In Standalone mode, set the `--app-id` flag:

```bash
dapr run --app-id cart --app-port 5000 python app.py
```

### Setup an ID using Kubernetes

In Kubernetes, set the `dapr.io/id` annotation on your pod:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-app
  namespace: default
  labels:
    app: python-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: python-app
  template:
    metadata:
      labels:
        app: python-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/id: "cart"
        dapr.io/port: "5000"
...
```

## Invoke a service in code

Dapr uses a sidecar, decentralized architecture. To invoke an applications using Dapr, you can use the `invoke` endpoint on any Dapr instance in your cluster/environment.

The sidecar programming model encourages each applications to talk to its own instance of Dapr. The Dapr instances discover and communicate with one another.

*Note: The following is a Python example of a cart app. It can be written in any programming language*

```python
from flask import Flask
app = Flask(__name__)

@app.route('/add', methods=['POST'])
def add():
    return "Added!"

if __name__ == '__main__':
    app.run()
```

This Python app exposes an `add()` method via the `/add` endpoint.

### Invoke with curl

```bash
curl http://localhost:3500/v1.0/invoke/cart/method/add -X POST
```

Since the add endpoint is a 'POST' method, we used `-X POST` in the curl command.

To invoke a 'GET' endpoint:

```bash
curl http://localhost:3500/v1.0/invoke/cart/method/add
```

To invoke a 'DELETE' endpoint:

```bash
curl http://localhost:3500/v1.0/invoke/cart/method/add -X DELETE
```

Dapr puts any payload return by their called service in the HTTP response's body.

## Overview

The example above showed you how to directly invoke a different service running in our environment, locally or in Kubernetes.
Dapr outputs metrics and tracing information allowing you to visualize a call graph between services, log errors and optionally log the payload body.

For more information on tracing, visit [this link](../../best-practices/troubleshooting/tracing.md).

 ## Related Topics
*  [Service invocation concepts](../../concepts/service-invocation/README.md)
* [Service invocation API specification](../../reference/api/service_invocation_api.md)
