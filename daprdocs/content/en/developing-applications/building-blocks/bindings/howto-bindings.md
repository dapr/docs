---
type: docs
title: "How-To: Use output bindings to interface with external resources"
linkTitle: "How-To: Output bindings"
description: "Invoke external systems with output bindings"
weight: 300
---

Output bindings enable you to invoke external resources without taking dependencies on special SDK or libraries.
For a complete sample showing output bindings, visit this [link](https://github.com/dapr/quickstarts/tree/master/bindings).

Watch this [video](https://www.youtube.com/watch?v=ysklxm81MTs&feature=youtu.be&t=1960) on how to use bi-directional output bindings.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/ysklxm81MTs?start=1960" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 1. Create a binding

An output binding represents a resource that Dapr uses to invoke and send messages to.

For the purpose of this guide, you'll use a Kafka binding. You can find a list of the different binding specs [here]({{< ref setup-bindings >}}).

Create a new binding component with the name of `myevent`.

Inside the `metadata` section, configure Kafka related properties such as the topic to publish the message to and the broker.

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

Create the following YAML file, named `binding.yaml`, and save this to a `components` sub-folder in your application directory.
(Use the `--components-path` flag with `dapr run` to point to your custom components dir)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myevent
  namespace: default
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: brokers
    value: localhost:9092
  - name: publishTopic
    value: topic1
```

{{% /codetab %}}

{{% codetab %}}

To deploy this into a Kubernetes cluster, fill in the `metadata` connection details of your [desired binding component]({{< ref setup-bindings >}}) in the yaml below (in this case kafka), save as `binding.yaml`, and run `kubectl apply -f binding.yaml`.


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myevent
  namespace: default
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: brokers
    value: localhost:9092
  - name: publishTopic
    value: topic1
```

{{% /codetab %}}

{{< /tabs >}}

## 2. Send an event

All that's left now is to invoke the output bindings endpoint on a running Dapr instance.

You can do so using HTTP:

```bash
curl -X POST -H 'Content-Type: application/json' http://localhost:3500/v1.0/bindings/myevent -d '{ "data": { "message": "Hi!" }, "operation": "create" }'
```

As seen above, you invoked the `/binding` endpoint with the name of the binding to invoke, in our case its `myevent`.
The payload goes inside the mandatory `data` field, and can be any JSON serializable value.

You'll also notice that there's an `operation` field that tells the binding what you need it to do.
You can check [here]({{< ref supported-bindings >}}) which operations are supported for every output binding.

## References

- [Binding API]({{< ref bindings_api.md >}})
- [Binding components]({{< ref bindings >}})
- [Binding detailed specifications]({{< ref supported-bindings >}})