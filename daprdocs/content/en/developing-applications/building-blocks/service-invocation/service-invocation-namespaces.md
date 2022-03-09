---
type: docs
title: "Service invocation across namespaces"
linkTitle: "Service invocation namespaces"
weight: 1000
description: "Call between services deployed to different namespaces"
---

This article describes how you can call between services deployed to different namespaces. By default, you can invoke services within the *same* namespace by simply referencing the app ID (`nodeapp`):

```sh
localhost:3500/v1.0/invoke/nodeapp/method/neworder
```
Service invocation also supports calls across namespaces. On all supported hosting platforms, Dapr app IDs conform to a valid FQDN format that includes the target namespace. You can therefore specify both the app ID (`nodeapp`) in addition to the namespace the app runs in (`production`). For example to call the `neworder` method on the `nodeapp`, in the `production` namespace would look like this:

```sh
localhost:3500/v1.0/invoke/nodeapp.production/method/neworder
```

When using service invocation to call an application in a namespace you qualify it with the namespace. This is especially useful in cross namespace calls in a Kubernetes cluster. As another example, calling the `ping` method on `myapp` which is scoped to the `production` namespace would look like this:

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
