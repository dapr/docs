# Common Issues

This section will walk you through some common issues and problems.

### I don't see the Dapr sidecar injected to my pod

There could be several reasons to why a sidecar will not be injected into a pod.
First, check your Deployment or Pod YAML file, and check that you have the following annotations in the right place:

Sample deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
  namespace: default
  labels:
    app: node
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node
  template:
    metadata:
      labels:
        app: node
      annotations:
        <b>dapr.io/enabled: "true"</b>
        <b>dapr.io/id: "nodeapp"</b>
        <b>dapr.io/port: "3000"</b>
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```

If your pod spec template is annotated correctly and you still don't see the sidecar injected, make sure Dapr was deployed to the cluster before your deployment or pod were deployed.

If this is the case, restarting the pods will fix the issue.

In order to further diagnose any issue, check the logs of the Dapr sidecar injector:

```bash
 kubectl logs -l app=dapr-sidecar-injector -n dapr-system
```

*Note: If you installed Dapr to a different namespace, replace dapr-system above with the desired namespace*

### I am unable to save state or get state

Have you installed an Dapr State store in your cluster?

To check, use kubectl get a list of components:

```bash
kubectl get components
```

If there isn't a state store component, it means you need to set one up.
Visit [here](../../howto/setup-state-store/setup-redis.md) for more details.

If everything's set up correctly, make sure you got the credentials right.
Search the Dapr runtime logs and look for any state store errors:

```bash
kubectl logs <name-of-pod> daprd
```

### I am unable to publish and receive events

Have you installed an Dapr Message Bus in your cluster?

To check, use kubectl get a list of components:

```bash
kubectl get components
```

If there isn't a pub/sub component, it means you need to set one up.
Visit [here](../../howto/setup-pub-sub-message-broker/README.md) for more details.

If everything is set up correctly, make sure you got the credentials right.
Search the Dapr runtime logs and look for any pub/sub errors:

```bash
kubectl logs <name-of-pod> daprd
```

### The Dapr Operator pod keeps crashing

Check that there's only one installation of the Dapr Operator in your cluster.
Find out by running

```bash
kubectl get pods -l app=dapr-operator --all-namespaces
```

If two pods appear, delete the redundant Dapr installation.

### I'm getting 500 Error responses when calling Dapr

This means there are some internal issue inside the Dapr runtime.
To diagnose, view the logs of the sidecar:

```bash
kubectl logs <name-of-pod> daprd
```

### I'm getting 404 Not Found responses when calling Dapr

This means you're trying to call an Dapr API endpoint that either doesn't exist or the URL is malformed.
Look at the Dapr API reference [here](../../reference/api/README.md) and make sure you're calling the right endpoint.

### I don't see any incoming events or calls from other services

Have you specified the port your app is listening on?
In Kubernetes, make sure the `dapr.io/port` annotation is specified:

<pre>
annotations:
    dapr.io/enabled: "true"
    dapr.io/id: "nodeapp"
    <b>dapr.io/port: "3000"</b>
</pre>

If using Dapr Standalone and the Dapr CLI, make sure you pass the `--app-port` flag to the `dapr run` command.

### My Dapr-enabled app isn't behaving correctly

The first thing to do is inspect the HTTP error code returned from the Dapr API, if any.
If you still can't find the issue, try enabling `debug` log levels for the Dapr runtime. See [here](logs.md) how to do so.

You might also want to look at error logs from your own process. If running on Kubernetes, find the pod containing your app, and execute the following:

```bash
kubectl logs <pod-name> <name-of-your-container>
```

If running in Standalone mode, you should see the stderr and stdout outputs from your app displayed in the main console session.

### I'm getting timeout/connection errors when running Actors locally

Each Dapr instance reports it's host address to the placement service. The placement service then distributes a table of nodes and their addresses to all Dapr instances. If that host address is unreachable, you are likely to encounter socket timeout errors or other variants of failing request errors.

Unless the host name has been specified by setting an environment variable named `DAPR_HOST_IP` to a reachable, pingable address, Dapr will loop over the network interfaces and select the first non-loopback address it finds.

As described above, in order to tell Dapr what the host name should be used, simply set an environment variable with the name of `DAPR_HOST_IP`.

The following example shows how to set the Host IP env var to `127.0.0.1`:

**Note: for versions <= 0.4.0 use `HOST_IP`**

```bash
export DAPR_HOST_IP=127.0.0.1
```
