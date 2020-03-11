# Middleware

Dapr allows custom processing pipelines to be defined by chaining a series of custom middleware. A request goes through all defined middleware before it's routed to user code, and it goes through the defined middleware (in reversed order) before it's returned to the client, as shown in the following diagram.

![Middleware](../../images/middleware.png)

## Customize processing pipeline

When launched, a Dapr sidecar constructs a processing pipeline. The pipeline consists of a [tracing middleware](../observabilty/traces.md) (when tracing is enabled) and a CORS middleware by default. Additional middleware, configured by a Dapr [configuration](../configuration/README.md), are added to the pipeline in the order as they are defined. The pipeline applies to all Dapr API endpoints, including state, pub/sub, direct messaging, bindings and others.

> **NOTE:** Dapr provides a **middleware.http.uppercase** middleware that doesn't need any configurations. The middleware changes all texts in a request body to uppercase. You can use it to test/verify if your custom pipeline is in place.

The following configuration defines a custom pipeline that uses a [OAuth 2.0 middleware](../../howto/authorization-with-oauth/README.md) and an uppercase middleware. In this case, all requests are authorized through the OAuth 2.0 protocol, and transformed to uppercase texts, before they are forwarded to user code.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
spec:
  httpPipeline:
    handlers:
    - name: middleware.http.oauth2
    - name: middleware.http.uppercase    
```

> **NOTE:** in future versions, a middleware can be conditionally applied by matching selectors.

## Writing a custom middleware

Dapr uses [FastHTTP](https://github.com/valyala/fasthttp) to implement it's HTTP server. Hence, your HTTP middleware needs to be written as a FastHTTP handler. Your middleware needs to implement a Middleware interface, which defines a **GetHandler** method that returns a **fasthttp.RequestHandler**:

```go
type Middleware interface {
  GetHandler(metadata Metadata) (func(h fasthttp.RequestHandler) fasthttp.RequestHandler, error)
}
```

Your handler implementation can include any inbound logic, outbound logic, or both:

```go
func GetHandler(metadata Metadata) fasthttp.RequestHandler {
  return func(h fasthttp.RequestHandler) fasthttp.RequestHandler {
    return func(ctx *fasthttp.RequestCtx) {
      //inboud logic
            h(ctx)  //call the downstream handler
            //outbound logic
    }
  }
}
```

Your code should be contributed to the https://github.com/dapr/components-contrib repository, under the */middleware* folder. Then, you'll need to submit another pull request against the https://github.com/dapr/dapr repository to register the new middleware type. You'll need to modify the **Load()** method under https://github.com/dapr/dapr/blob/master/pkg/components/middleware/http/registry.go to register your middleware using the **Register** method.
