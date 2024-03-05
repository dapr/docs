---
type: docs
title: "Actor workflow backend"
linkTitle: "Actor workflow backend"
description: Detailed information on the Actor workflow backend component
---

## Component format

The Actor workflow backend is the default backend in Dapr. If no workflow backend is explicitly defined, the Actor backend will be used automatically.

You don't need to define any components to use the Actor workflow backend. It's ready to use out-of-the-box.

However, if you wish to explicitly define the Actor workflow backend as a component, you can do so, as shown in the example below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: actorbackend
spec:
  type: workflowbackend.actor
  version: v1
```
