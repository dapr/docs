---
type: docs
title: "How to: Service invocation across namespaces"
linkTitle: "How to: Service invocation namespaces"
weight: 50
description: "Call between services deployed to different namespaces"
---

In this article, you'll learn how you can call between services deployed to different namespaces. By default, service invocation supports invoking services within the *same* namespace by simply referencing the app ID (`nodeapp`):

```sh
localhost:3500/v1.0/invoke/nodeapp/method/neworder
```

Service invocation also supports calls across namespaces. On all supported hosting platforms, Dapr app IDs conform to a valid FQDN format that includes the target namespace. You can specify both:

- The app ID (`nodeapp`), and
- The namespace the app runs in (`production`).

**Example 1**

Call the `neworder` method on the `nodeapp` in the `production` namespace:

```sh
localhost:3500/v1.0/invoke/nodeapp.production/method/neworder
```

When calling an application in a namespace using service invocation, you qualify it with the namespace. This proves useful in cross-namespace calls in a Kubernetes cluster.

**Example 2**

Call the `ping` method on `myapp` scoped to the `production` namespace:

```bash
https://localhost:3500/v1.0/invoke/myapp.production/method/ping
```

**Example 3**

Call the same `ping` method as example 2 using a curl command from an external DNS address (in this case, `api.demo.dapr.team`) and supply the Dapr API token for authentication:

MacOS/Linux:

```
curl -i -d '{ "message": "hello" }' \
     -H "Content-type: application/json" \
     -H "dapr-api-token: ${API_TOKEN}" \
     https://api.demo.dapr.team/v1.0/invoke/myapp.production/method/ping
```
