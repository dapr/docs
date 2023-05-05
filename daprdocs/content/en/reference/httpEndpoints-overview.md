---
type: docs
title: "HTTPEndpoint spec"
linkTitle: "HTTPEndpoint spec"
description: "The HTTPEndpoint Dapr resource spec"
weight: 300
aliases:
  - "/operations/httpEndpoints/"
---

The HTTPEndpoint is a Dapr resource that can be used to allow the invocation of non-Daprized endpoints from a Dapr application.

## HTTPEndpoint format

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
| baseUrl            | Y        | Base URL of the non-Daprized endpoint  | `"https://docs.dapr.io"`, `"http://api.github.com"`
| headers            | N        | HTTP request headers for service invocation | `name: "Accept-Language" value: "en-US"` <br/> `name: "Authorization" secretKeyRef.name: "my-secret" secretKeyRef.key: "myGithubToken" `