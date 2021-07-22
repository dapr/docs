---
type: docs
title: "Invoke service"
linkTitle: "Invoke"
weight: 8000
description: "Invoke service method in middleware call chains"
---

The invoke [HTTP middleware]({{< ref middleware-concept.md >}}) provides the ability of calling other service in middleware chain.


## Component format

In the following definition, it makes that middleware invokes other service method rightly. 

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: invoke
spec:
  type: middleware.http.invoke
  version: v1
  metadata:
  - name: invokeURL
    value: http://127.0.0.1:3500/v1.0/invoke/xxx/method/xxx
  - name: invokeVerb
    value: POST
  - name: enforceRequestVerbs
    value: get,post,put,patch,delete
  - name: timeout
    value: 7
  - name: insecureSkipVerify
    value: true 
  - name: maxRetry
    value: 3
  - name: expectedStatusCode
    value: 200
  - name: forwardURLHeaderName
    value: x-forward-url
  - name: forwardMethodHeaderName
    value: x-forward-method

```


## Spec metadata fields

| Field                   | Details                                                                             | Example                                             |
| ----------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| invokeURL               | Dapr invoked service http invoke url                                                | http://127.0.0.1:3500/v1.0/invoke/goapp/method/test |
| invokeVerb              | Dapr invoked service method accepted verb                                           | POST                                                |
| enforceRequestVerbs     | Dapr middleware allowed enforce verbs                                               | get,post,put,delete                                 |
| timeout                 | Dapr middleware invoke timeout seconds                                              | such as: 7, middleware will timeout after 7 seconds |
| insecureSkipVerify      | Dapr middleware invoke config that verify https connect, use net/http.Client config | true/false                                          |
| maxRetry                | Dapr middleware max retry count, when errors occurred                               | 3                                                   |
| expectedStatusCode      | Dapr middleware expected response status code that invoked other service method     | 200                                                 |
| forwardURLHeaderName    | Dapr middleware request header name with origin request url                         | x-forward-url                                       |
| forwardMethodHeaderName | Dapr middleware request header name with origin request method                      | x-forward-method                                    |


## Dapr configuration

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware-concept.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: invoke
      type: middleware.http.invoke
```


## Related links

- [Dapr Service invoke API]({{< ref service_invocation_api.md >}})
- [Middleware concept]({{< ref middleware-concept.md >}})
- [Configuration concept]({{< ref configuration-concept.md >}})
- [Configuration overview]({{< ref configuration-overview.md >}})
