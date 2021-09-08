---
type: docs
title: "How-To: Invoke services using HTTP"
linkTitle: "How-To: Invoke with HTTP"
description: "Call between services using service invocation"
weight: 2000
---

This article describe how to deploy services each with an unique application ID, so that other services can discover and call endpoints on them using service invocation API.

## Step 1: Choose an ID for your service

Dapr allows you to assign a global, unique ID for your app. This ID encapsulates the state for your application, regardless of the number of instances it may have.

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
In self hosted mode, set the `--app-id` flag:

```bash
dapr run --app-id cart --dapr-http-port 3500 --app-port 5000 python app.py
```

If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection:

```bash
dapr run --app-id cart --dapr-http-port 3500 --app-port 5000 --app-ssl python app.py
```
{{% /codetab %}}

{{% codetab %}}

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
*If your app uses an SSL connection, you can tell Dapr to invoke your app over an insecure SSL connection with the `app-ssl: "true"` annotation (full list [here]({{< ref arguments-annotations-overview.md >}}))*

{{% /codetab %}}

{{< /tabs >}}


## Step 2: Setup a service

The following is a Python example of a cart app. It can be written in any programming language.

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

## Step 3: Invoke the service

Dapr uses a sidecar, decentralized architecture. To invoke an application using Dapr, you can use the `invoke` API on any Dapr instance.

The sidecar programming model encourages each applications to talk to its own instance of Dapr. The Dapr instances discover and communicate with one another.

{{< tabs curl CLI >}}

{{% codetab %}}
From a terminal or command prompt run:
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

### Additional URL formats

In order to avoid changing URL paths as much as possible, Dapr provides the following ways to call the service invocation API:


1. Change the address in the URL to `localhost:<dapr-http-port>`.
2. Add a `dapr-app-id` header to specify the ID of the target service, or alternatively pass the ID via HTTP Basic Auth: `http://dapr-app-id:<service-id>@localhost:3500/path`.

For example, the following command
```bash
curl http://localhost:3500/v1.0/invoke/cart/method/add
```

is equivalent to:

```bash
curl -H 'dapr-app-id: cart' 'http://localhost:3500/add' -X POST
```

or:

```bash
curl 'http://dapr-app-id:cart@localhost:3500/add' -X POST
```

{{% /codetab %}}

{{% codetab %}}
```bash
dapr invoke --app-id cart --method add
```
{{% /codetab %}}

{{< /tabs >}}

### Namespaces

When running on [namespace supported platforms]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}}), you include the namespace of the target app in the app ID: `myApp.production`

For example, invoking the example python service with a namespace would be:

```bash
curl http://localhost:3500/v1.0/invoke/cart.production/method/add -X POST
```

See the [Cross namespace API spec]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}}) for more information on namespaces.

## Step 4: View traces and logs

The example above showed you how to directly invoke a different service running locally or in Kubernetes. Dapr outputs metrics, tracing and logging information allowing you to visualize a call graph between services, log errors and optionally log the payload body.

For more information on tracing and logs see the [observability]({{< ref observability-concept.md >}}) article.

 ## Related Links

* [Service invocation overview]({{< ref service-invocation-overview.md >}})
* [Service invocation API specification]({{< ref service_invocation_api.md >}})
