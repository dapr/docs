---
type: docs
title: "HTTPEndpoint spec"
linkTitle: "HTTPEndpoint"
description: "The basic spec for a Dapr HTTPEndpoint resource"
weight: 4000
aliases:
  - "/operations/httpEndpoints/"
---

The `HTTPEndpoint` is a Dapr resource that is used to enable the invocation of non-Dapr endpoints from a Dapr application.

## Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: HTTPEndpoint
metadata:
  name: <NAME>  
spec:
  baseUrl: <REPLACE-WITH-BASEURL> # Required. Use "http://" or "https://" prefix.
  headers: # Optional
  - name: <REPLACE-WITH-A-HEADER-NAME>
    value: <REPLACE-WITH-A-HEADER-VALUE>
  - name: <REPLACE-WITH-A-HEADER-NAME>
    secretKeyRef:
      name: <REPLACE-WITH-SECRET-NAME>
      key: <REPLACE-WITH-SECRET-KEY>
scopes: # Optional
  - <REPLACE-WITH-SCOPED-APPIDS>
auth: # Optional
  secretStore: <REPLACE-WITH-SECRETSTORE>
```

## Spec fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| baseUrl            | Y        | Base URL of the non-Dapr endpoint | `"https://api.github.com"`, `"http://api.github.com"`
| headers            | N        | HTTP request headers for service invocation | `name: "Accept-Language" value: "en-US"` <br/> `name: "Authorization" secretKeyRef.name: "my-secret" secretKeyRef.key: "myGithubToken" `

## Related links

[Learn how to invoke non-Dapr endpoints.]({{< ref howto-invoke-non-dapr-endpoints.md >}})
