# Invoke remote services using well known IDs

In many environments with multiple services that need to communicate with each other, developers often ask themselves the following questions:

* How do I discover and invoke different services?
* How do I handle retries and transient errors?
* How do I use distributed tracing correctly to see a call graph?

Dapr allows developers to overcome these challenges by providing an endpoint that acts as a combination of a reverse proxy with built-in service discovery, while leveraging built-in distributed tracing and error handling.

## 1. Choose an ID for your service

Dapr allows you to assign a global, unique identifier for your app.<br>
This ID will also encapsulate state for your app, regardless of the number of instances it may have.

### Setting up an ID using Kubernetes

In Kubernetes, set the `dapr.io/id` annotation on your pod:

<pre>
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-app
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
        <b>dapr.io/id: "cart"<b>
        dapr.io/port: "5000"
...
</pre>

### Setting up an ID using the Dapr CLI

In Standalone mode, set the `--app-id` flag:

`dapr run --app-id cart --app-port 5000 python app.py`

## Invoke a service

Dapr embraces a sidecar based, decentralized architecture.
To invoke an app using Dapr, you can use the `invoke` endpoint on any Dapr instance in your cluster/environment.

The sidecar programming model encourages each app to talk to its own instance of Dapr. The Dapr instances discover and communicate with one another.

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
Next we'll use Dapr to

### Invoke with curl

```
curl http://localhost:3500/v1.0/invoke/cart/add -X POST
```

Since the aoo endpoint is a 'POST' method, we used `-X POST` in the curl command.

To invoke a 'GET' endpoint:

```
curl http://localhost:3500/v1.0/invoke/cart/add
```

To invoke a 'DELETE' endpoint:

```
curl http://localhost:3500/v1.0/invoke/cart/add -X DELETE
```

Dapr will put any payload return by ther called service in the HTTP response's body.


## Overview

The example above showed us how to directly invoke a different service running in our environment, locally or in Kubernetes.
Dapr will output metrics and tracing information allowing you to visualize a call graph between services, log errors and optionally log the payload body.

For more information on tracing, visit [this link](../../best-practices/troubleshooting/tracing.md).
