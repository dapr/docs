---
type: docs
title: "Overview"
linkTitle: "Overview"
description: "General overview on set up of middleware components for Dapr"
weight: 10000
type: docs
---

Dapr allows custom processing pipelines to be defined by chaining a series of middleware components. Middleware pipelines can be defined in Dapr configuration files.

As with other building block components, middleware components are extensible and can be found in the [components-contrib repo](https://github.com/dapr/components-contrib).

Middleware in Dapr is described using a `Component` file with the following fields:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <COMPONENT NAME>
  namespace: default
spec:
  type: middleware.http.<MIDDLEWARE NAME>
  version: v1
  metadata:
  - name: <KEY>
    value: <VALUE>
  - name: <KEY>
    value: <VALUE>
...
```

Next, the Dapr configuration defines the pipeline of middleware components

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
spec:
  httpPipeline:
    handlers:
    - name: <COMPONENT NAME>
      type: middleware.http.<MIDDLEWARE NAME>
    - name: <NEXT COMPONENT NAME>
      type: middleware.http.<NEXT MIDDLEWARE NAME>
```

The type of middleware is determined by the `type` field, and configuration like rate limits, OAuth credentials and other metadata are put in the `.metadata` section.
Even though metadata values can secrets in plain text, it is recommended you use a [secret store]({{< ref component-secrets.md >}}).

## Related links

[Middleware quickstart](https://github.com/dapr/quickstarts/tree/master/middleware) which demonstrates use of Dapr middleware to enable OAuth 2.0 authorization.