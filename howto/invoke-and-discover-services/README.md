# Get started with HTTP service invocation

This article describe how to deploy services each with an unique application ID, so that other services can discover and call endpoints on them using service invocation API.

## 1. Choose an ID for your service

Dapr allows you to assign a global, unique ID for your app.

This ID encapsulates the state for your application, regardless of the number of instances it may have.

### Setup an ID using the Dapr CLI

In self hosted mode, set the `--app-id` flag:

```bash
dapr run --app-id cart --app-port 5000 python app.py
```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash
dapr run --app-id cart --app-port 5000 --app-ssl python app.py
```

*Note: the Kubernetes annotation can be found [here](../configure-k8s).*

### Setup an ID using Kubernetes

In Kubernetes, set the `dapr.io/app-id` annotation on your pod:

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
        dapr.io/app-id: "cart"
        dapr.io/app-port: "5000"
...
```

## 2. Invoke a service

Dapr uses a sidecar, decentralized architecture. To invoke an application using Dapr, you can use the `invoke` API on any Dapr instance.

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

### Invoke with curl over HTTP

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

Dapr puts any payload returned by the called service in the HTTP response's body.

### Namespaces

When running on [namespace supported platforms](../../reference/api/service_invocation_api.md#namespace-supported-platforms), you include the namespace of the target app in the app ID:

```
myApp.production
```

For example, invoking the example python service with a namespace would be;

```bash
curl http://localhost:3500/v1.0/invoke/cart.production/method/add -X POST
```

See the [Cross namespace API spec](../../reference/api/service_invocation_api.md#cross-namespace-invocation) for more information on namespaces.

## 3. View traces and logs

The example above showed you how to directly invoke a different service running locally or in Kubernetes. Dapr outputs metrics, tracing and logging information allowing you to visualize a call graph between services, log errors and optionally log the payload body.

For more information on tracing and logs see the [observability](../../concepts/observability) article.

 ## Related Links
 
* [Service invocation concepts](../../concepts/service-invocation/README.md)
* [Service invocation API specification](../../reference/api/service_invocation_api.md)
