---
type: docs
title: "Cron binding spec"
linkTitle: "Cron"
description: "Detailed documentation on the cron binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/cron/"
---

## Component format

To setup cron binding create a component of type `bindings.cron`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 15m" # valid cron schedule
```

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|-------|--------|---------|
| schedule | Y | Input/Output |  The valid cron schedule to use. See [this](#schedule-format) for more details | `"@every 15m"`

### Schedule Format

The Dapr cron binding supports following formats:

| Character |	Descriptor        | Acceptable values                             |
|:---------:|-------------------|-----------------------------------------------|
| 1	        | Second	          | 0 to 59, or *                                 |
| 2	        | Minute	          | 0 to 59, or *                                 |
| 3	        | Hour	            | 0 to 23, or * (UTC)                           |
| 4	        | Day of the month	| 1 to 31, or *                                 |
| 5	        | Month	            | 1 to 12, or *                                 |
| 6	        | Day of the week	  | 0 to 7 (where 0 and 7 represent Sunday), or * |

For example:

* `30 * * * * *` - every 30 seconds
* `0 15 * * * *` - every 15 minutes
* `0 30 3-6,20-23 * * *` - every hour on the half hour in the range 3-6am, 8-11pm
* `CRON_TZ=America/New_York 0 30 04 * * *` - every day at 4:30am New York time

> You can learn more about cron and the supported formats [here](https://en.wikipedia.org/wiki/Cron)

For ease of use, the Dapr cron binding also supports few shortcuts:

* `@every 15s` where `s` is seconds, `m` minutes, and `h` hours
* `@daily` or `@hourly` which runs at that period from the time the binding is initialized

## Listen to the cron binding

After setting up the cron binding, all you need to do is listen on an endpoint that matches the name of your component. Assume the [NAME] is `scheduled`. This will be made as a HTTP `POST` request. The below example shows how a simple Node.js Express application can receive calls on the `/scheduled` endpoint and write a message to the console.
  
```js
app.post('/scheduled', async function(req, res){
    console.log("scheduled endpoint called", req.body)
    res.status(200).send()
});
```
  
When running this code, note that the `/scheduled` endpoint is called every five minutes by the Dapr sidecar.


## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `delete`

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
