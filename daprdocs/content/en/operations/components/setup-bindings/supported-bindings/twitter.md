---
type: docs
title: "Twitter binding spec"
linkTitle: "Twitter"
description: "Detailed documentation on the Twitter binding component"
---

## Setup Dapr component

The Twitter binding supports both `input` and `output` binding configuration. First the common part:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.twitter
  version: v1
  metadata:
  - name: consumerKey
    value: "****" # twitter api consumer key, required
  - name: consumerSecret
    value: "****" # twitter api consumer secret, required
  - name: accessToken
    value: "****" # twitter api access token, required
  - name: accessSecret
    value: "****" # twitter api access secret, required
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Input bindings

For input bindings, where the query matching Tweets are streamed to the user service, the above component has to also include a query: 

```yaml
  - name: query
    value: "dapr" # your search query, required 
```

## Output bindings

For output binding invocation the user code has to invoke the binding:

```shell
POST http://localhost:3500/v1.0/bindings/twitter
```

Where the payload is:

```json
{
  "data": "",
  "metadata": {
    "query": "twitter-query",
    "lang": "optional-language-code",
    "result": "valid-result-type"
  },
  "operation": "get"
}
```

The metadata parameters are:

- `query` - any valid Twitter query (e.g. `dapr` or `dapr AND serverless`). See [Twitter docs](https://developer.twitter.com/en/docs/tweets/rules-and-filtering/overview/standard-operators) for more details on advanced query formats 
- `lang` - (optional, default: `en`) restricts result tweets to the given language using [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- `result` - (optional, default: `recent`) specifies tweet query result type. Valid values include:
  - `mixed` - both popular and real time results
  - `recent` - most recent results
  - `popular` - most popular results

You can see the example of the JSON data that Twitter binding returns [here](https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets)

## Related links
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})