# Send events to external systems using Output Bindings

Using bindings, its possible to invoke external resources without tying in to special SDK or libraries.
For a complete sample showing output bindings, visit this [link](https://github.com/dapr/samples/tree/master/5.bindings).

Watch this [video](https://www.youtube.com/watch?v=ysklxm81MTs&feature=youtu.be&t=1960) on how to use bi-directional output bindings.


## 1. Create a binding

An output binding represents a resource that Dapr will use invoke and send messages to.

For the purpose of this guide, we'll use a Kafka binding. You can find a list of the different binding specs [here](../../concepts/bindings/README.md).

Create the following YAML file, named binding.yaml, and save this to a `components` sub-folder in your application directory.
(Use the `--components-path` flag with `dapr run` to point to your custom components dir)

*Note: When running in Kubernetes, apply this file to your cluster using `kubectl apply -f binding.yaml`*

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myevent
  namespace: default
spec:
  type: bindings.kafka
  metadata:
  - name: brokers
    value: localhost:9092
  - name: publishTopic
    value: topic1
```

Here, we create a new binding component with the name of `myevent`.

Inside the `metadata` section, we configure Kafka related properties such as the topic to publish the message to and the broker.

## 2. Send an event

All that's left now is to invoke the bindings endpoint on a running Dapr instance.

We can do so using HTTP:

```bash
curl -X POST -H  http://localhost:3500/v1.0/bindings/myevent -d '{ "data": { "message": "Hi!" }, "operation": "create" }'
```

As seen above, we invoked the `/binding` endpoint with the name of the binding to invoke, in our case its `myevent`.
The payload goes inside the mandatory `data` field, and can be any JSON serializable value.

You'll also notice that there's an `operation` field that tells the binding what we need it to do.
You can check [here](../../reference/specs/bindings) which operations are supported for every output binding.


## References

* Binding [API](https://github.com/dapr/docs/blob/master/reference/api/bindings_api.md)
* Binding [Components](https://github.com/dapr/docs/tree/master/concepts/bindings)
* Binding [Detailed specifications](https://github.com/dapr/docs/tree/master/reference/specs/bindings) 
