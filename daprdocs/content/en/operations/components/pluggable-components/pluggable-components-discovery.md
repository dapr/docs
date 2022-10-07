---
type: docs
title: "Plugging in"
linkTitle: "Plugging in"
weight: 4500
description: "How-To: Making Dapr discover a pluggable component"
---

## Service Discovery Process

<img src="/images/grpc-components.png" width=400>

[gRPC-based](https://grpc.io/) Dapr components are typically run as containers or processes that communicate with the Dapr main process via [Unix Domain Sockets](https://en.wikipedia.org/wiki/Unix_domain_socket). They are automatically discovered and registered in runtime by Dapr using the following steps:

1. The Component listens to an [Unix Domain Socket](https://en.wikipedia.org/wiki/Unix_domain_socket) placed on the shared volume.
2. The Dapr runtime lists all [Unix Domain Socket](https://en.wikipedia.org/wiki/Unix_domain_socket) in the shared volume.
3. The Dapr runtime connects with the socket and uses gRPC reflection to discover all services that such component implements.

A single component can implement multiple [building blocks](http://localhost:1313/concepts/building-blocks-concept/) at once.

Dapr's built-in components come ready to be used out of the box: you just need to have provide Dapr with their YAML configuration and you are ready to go. That is not the case with gRPC-based Components, which require a few setup steps before they can be used with Dapr. Namely:

1. gGRPC-based Components need to be started and ready to take requests _before_ Dapr itself is started;
2. The [Unix Domain Socket](https://en.wikipedia.org/wiki/Unix_domain_socket) file used used for the Pluggable Component communication need to be made accessible to both Dapr and gRPC Component and, as expected,

Dapr does not take part on orchestrating gRPC-components creation and deployment. This is left for its users and it will be different depending on whether Dapr and gRPC-based components are ran in standalone mode, as processes or as containers in Kubernetes. This will also change the mechanisms available to share Unix Domain Socket files between Dapr and gRPC-based components.

In the next sections, we will discuss how to make your component discoveriable by Dapr based on the running environment.

{{< tabs "Standalone" "Kubernetes" >}}

{{% codetab %}}

## Step 1: Running the component

As mentioned previously, your component must be up and running and the Unix Socket must be created running before Dapr starts.

By default, Dapr looks for [Unix Domain Socket](https://en.wikipedia.org/wiki/Unix_domain_socket) files in the folder in `/tmp/dapr-components-sockets`. The name of the file without any extension will be the name of the component, for `memstore.sock`, the component name will be `memstore`. Since you are running Dapr in the same host as the component, all we have to ensure is that this folder and the files within it are accessible and writable by both our component and Dapr.

## Step 2: Declaring a gRPC-based Pluggable Component

gRPC-based Pluggable Components are defined using the [Component Spec]({{< ref component-schema.md >}}) and its `type` is derived from the socket name (without the file extension).

Place the following file in the defined components-path (replace `your_socket_goes_here` by your component socket name without any extension and `your_component_type` by your component type).

```yaml
apiVersion: Dapr.io/v1alpha1
kind: Component
metadata:
  name: prod-mystore
spec:
  type: your_component_type.your_socket_goes_here
  version: v1
  metadata:
```

Using `memstore.sock` as a concrete example we have the following, and assuming that `memstore` implements the StateStoreService.

- `your_component_type` would be replaced by `state`, as it is a state store.
- `your_socket_goes_here` would be replaced by `memstore`: `memstore.sock` without any extension.

The full configuration for `memstore` would be:

```yaml
apiVersion: Dapr.io/v1alpha1
kind: Component
metadata:
  name: prod-mystore
spec:
  type: state.memstore
  version: v1
  metadata:
```

Save this file as `component.yaml` in Dapr's configuration folder.

## Step 3: Running Dapr

Initialize Dapr by following the [tutorial]({{< ref get-started-api.md >}}), and make sure that your component Spec is placed in the right folder.

> Note: 1.9.0 is the minimum Dapr version that supports gRPC-based Pluggable Components
> specify the runtime version by using `--runtime-version` flag

<!-- We should list the actual command line the user will be typing here -->

That's it! Now we are able to call the statestore APIs via Dapr API.

See it working by running

```shell
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne", "metadata": {}}]' http://localhost:$PORT/v1.0/state/prod-mystore
```

Retrieve the value

```shell
curl http://localhost:$PORT/v1.0/state/prod-mystore/name
```

> replace $PORT by Dapr http port

{{% /codetab %}}

{{% codetab %}}

## Step 1: Build and Publish a container for your gRPC-based Component

As a prerequisite for running on kubernetes mode, your component must run as a container. Which means that it should be published first and accessible by your kubernetes cluster.

## Step 2: Deploying Dapr on a Kubernetes cluster

Follow the steps provided in the [Deploy Dapr on a Kubernetes cluster]({{< ref kubernetes-deploy.md >}}) docs and make sure you have a kubernetes cluster configured with Dapr version 1.9+.

## Step 3: Adding Pluggable Component Container in your Deployments

When running on kubernetes mode, gRPC-based Pluggable Components are side-car containers.

As gRPC-based Pluggable Components are backed by [Unix Domain Sockets][uds], the first step is configuring the deployment spec to ensure that the socket created by your Pluggable Component are accessible by Dapr runtime, to do that, you have to:

1. mount volumes,
2. hint Dapr where the mounted unix socket volume is and also,
3. attach such volume to your Pluggable Component container.

Below you can see an example of a Deployment that configures a Pluggable Component:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  labels:
    app: app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
      annotations:
        Dapr.io/unix-domain-socket-path: "/tmp/Dapr-components-sockets" ## required, the default path where Dapr will discovery components.
        Dapr.io/app-id: "my-app"
        Dapr.io/enabled: "true"
        Dapr.io/sidecar-listen-addresses: "0.0.0.0"
    spec:
      volumes: ## required, the sockets volume
        - name: Dapr-unix-domain-socket
          emptyDir: {}
      containers:
        ### --------------------- YOUR APPLICATION CONTAINER GOES HERE -----------
        ##
        ### --------------------- YOUR APPLICATION CONTAINER GOES HERE -----------
        ### This is the pluggable component container.
        - name: component
          volumeMounts: # required, the sockets volume mount
            - name: Dapr-unix-domain-socket
              mountPath: /Dapr-unix-domain-sockets
          image: YOUR_IMAGE_GOES_HERE:YOUR_IMAGE_VERSION
          env:
            - name: DAPR_COMPONENTS_SOCKETS_FOLDER # Tells the component where the sockets should be created.
              value: /Dapr-unix-domain-sockets
```

Great, do not apply the Deployment yet, let's add one more configuration: The Component Spec.

## Step 4: Declaring a gRPC-based Pluggable Component

gRPC-based Pluggable Componets are defined using the [Component Spec]({{< ref component-schema.md >}}) and its `type` is derived from the socket name (without the file extension).

```yaml
apiVersion: Dapr.io/v1alpha1
kind: Component
metadata:
  name: prod-mystore
spec:
  type: your_component_type.your_socket_goes_here
  version: v1
  metadata:
scopes:
  - backend
```

You should also [scope]({{< ref component-scopes >}}) your component to make sure that only the target configured application will try to connect with the pluggable component since it will only be running in its Deployment, otherwise the runtime will fail when initializing the component.

> Note: Replace `your_socket_goes_here` by your component socket name without any extension, and `your_component_type` by your component type.
> That's it! **[Apply the created manifests to your kubernetes cluster](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#kubectl-apply)**, and then you are able to call the statestore APIs via Dapr API,

> Use [kubernetes pod forwarder](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/) to access the Daprd runtime.
> See it working by running

```shell
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne", "metadata": {}}]' http://localhost:$PORT/v1.0/state/prod-mystore
```

Retrieve the value

```shell
curl http://localhost:$PORT/v1.0/state/prod-mystore/name
```

> replace $PORT by Dapr http port

{{% /codetab %}}
{{< /tabs >}}

[uds]: https://en.wikipedia.org/wiki/Unix_domain_socket

## Next Steps

- Getting started with your own .NET Pluggable Component using our [sample code](https://github.com/mcandeia/dapr-samples/tree/sample/pluggable-components/pluggable-components-dotnet-template)
