---
type: docs
title: "How-To: Register a pluggable component"
linkTitle: "How To: Register a pluggable component"
weight: 4500
description: "Learn how to register a pluggable component"
---

[uds]: https://en.wikipedia.org/wiki/Unix_domain_socket

## Component registration process

Pluggable, [gRPC-based](https://grpc.io/) components are typically run as containers or processes that need to communicate with the Dapr runtime via [Unix Domain Sockets][uds]. They are automatically discovered and registered in the runtime with the following steps:

1. The component listens to an [Unix Domain Socket][uds] placed on the shared volume.
2. The Dapr runtime lists all [Unix Domain Socket][uds] in the shared volume.
3. The Dapr runtime connects with each socket and uses gRPC reflection to discover all proto services from a given building block API that the component implements.

A single component can implement multiple component interfaces at once.

<img src="/images/components-pluggable-register-grpc.png" width=50%>

While Dapr's built-in components come [included with the runtime](https://github.com/dapr/components-contrib/blob/master/docs/developing-component.md), pluggable components require a few setup steps before they can be used with Dapr.

1. Pluggable components need to be started and ready to take requests _before_ Dapr itself is started.
2. The [Unix Domain Socket][uds] file used for the pluggable component communication need to be made accessible to both Dapr and pluggable component.

Dapr does not launch any pluggable components processes or containers. This is something that you need to do, and it is different depending on how Dapr and your components are run:

- In self-hosted mode as processes or containers.
- In Kubernetes, as containers.

This also changes the approach to share [Unix Domain Socket][uds] files between Dapr and pluggable components.

{{% alert title="Note" color="primary" %}}
As a prerequisite the operating system must supports Unix Domain Sockets, any UNIX or UNIX-like system (Mac, Linux, or for local development [WSL](https://learn.microsoft.com/windows/wsl/install) for Windows users) should be sufficient.
{{% /alert %}}

Select your environment to begin making your component discoverable.

{{< tabs "Standalone" "Kubernetes" >}}

{{% codetab %}}
[uds]: https://en.wikipedia.org/wiki/Unix_domain_socket

## Run the component

Both your component and the Unix Socket must be running before Dapr starts.

By default, Dapr looks for [Unix Domain Socket][uds] files in the folder in `/tmp/dapr-components-sockets`.

Filenames in this folder are significant for component registration. They must be formed by appending the component's name with a file extension of your choice, more commonly `.sock`. For example, the filename `my-component.sock` is a valid UDS file name for a component named `my-component`.

Since you are running Dapr in the same host as the component, verify this folder and the files within it are accessible and writable by both your component and Dapr.

## Define the component

Define your component using a [component spec]({{< ref component-schema.md >}}). Your component's `type` is derived from the socket name, without the file extension.

Save the component YAML file in the components-path, replacing:

- `your_socket_goes_here` with your component socket name (no extension)
- `your_component_type` with your component type

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: prod-mystore
spec:
  type: your_component_type.your_socket_goes_here
  version: v1
  metadata:
```

Using the previous `my-component.sock` example:

- `your_component_type` would be replaced by `state`, as it is a state store.
- `your_socket_goes_here` would be replaced by `my-component`.

The configuration example for `my-component` is below:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: prod-mystore
spec:
  type: state.my-component
  version: v1
  metadata:
```

Save this file as `component.yaml` in Dapr's component configuration folder.

## Run Dapr

[Initialize Dapr]({{< ref get-started-api.md >}}), and make sure that your component file is placed in the right folder.

{{% alert title="Note" color="primary" %}}
Dapr v1.9.0 is the minimum version that supports pluggable components.
Run the following command specify the runtime version: `dapr init --runtime-version 1.9.0`
{{% /alert %}}

<!-- We should list the actual command line the user will be typing here -->

That's it! Now you're able to call the state store APIs via Dapr API. See it in action by running the following. Replace `$PORT` with the Dapr HTTP port:

```shell
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne", "metadata": {}}]' http://localhost:$PORT/v1.0/state/prod-mystore
```

Retrieve the value, replacing `$PORT` with the Dapr HTTP port:

```shell
curl http://localhost:$PORT/v1.0/state/prod-mystore/name
```

{{% /codetab %}}

{{% codetab %}}

[uds]: https://en.wikipedia.org/wiki/Unix_domain_socket

## Build and publish a container for your pluggable component

Make sure your component is running as a container, published first and accessible to your Kubernetes cluster.

## Deploy Dapr on a Kubernetes cluster

Follow the steps provided in the [Deploy Dapr on a Kubernetes cluster]({{< ref kubernetes-deploy.md >}}) docs.

## Add the pluggable component container in your deployments

When running in Kubernetes mode, pluggable components are deployed as containers in the same pod as your application.

Since pluggable components are backed by [Unix Domain Sockets][uds], make the socket created by your pluggable component accessible by Dapr runtime. Configure the deployment spec to:

1. Mount volumes
2. Hint to Dapr the mounted Unix socket volume location
3. Attach volume to your pluggable component container

Below is an example of a deployment that configures a pluggable component:

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
        dapr.io/unix-domain-socket-path: "/tmp/dapr-components-sockets" ## required, the default path where Dapr uses for registering components.
        dapr.io/app-id: "my-app"
        dapr.io/enabled: "true"
    spec:
      volumes: ## required, the sockets volume
        - name: dapr-unix-domain-socket
          emptyDir: {}
      containers:
        ### --------------------- YOUR APPLICATION CONTAINER GOES HERE -----------
        ##
        ### --------------------- YOUR APPLICATION CONTAINER GOES HERE -----------
        ### This is the pluggable component container.
        - name: component
          volumeMounts: # required, the sockets volume mount
            - name: dapr-unix-domain-socket
              mountPath: /dapr-unix-domain-sockets
          image: YOUR_IMAGE_GOES_HERE:YOUR_IMAGE_VERSION
```

Before applying the deployment, let's add one more configuration: the component spec.

## Define a component

Pluggable components are defined using a [component spec]({{< ref component-schema.md >}}). The component `type` is derived from the socket name (without the file extension). In the following example YAML, replace:

- `your_socket_goes_here` with your component socket name (no extension)
- `your_component_type` with your component type

```yaml
apiVersion: dapr.io/v1alpha1
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

[Scope]({{< ref component-scopes >}}) your component to make sure that only the target application can connect with the pluggable component, since it will only be running in its deployment. Otherwise the runtime fails when initializing the component.

That's it! **[Apply the created manifests to your Kubernetes cluster](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#kubectl-apply)**, and call the state store APIs via Dapr API.

Use [Kubernetes pod forwarder](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/) to access the `daprd` runtime.

See it in action by running the following. Replace `$PORT` with the Dapr HTTP port:

```shell
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne", "metadata": {}}]' http://localhost:$PORT/v1.0/state/prod-mystore
```

Retrieve the value, replacing `$PORT` with the Dapr HTTP port:

```shell
curl http://localhost:$PORT/v1.0/state/prod-mystore/name
```

{{% /codetab %}}
{{< /tabs >}}

## Next Steps

Get started with developing .NET pluggable component using this [sample code](https://github.com/dapr/samples/tree/master/pluggable-components-dotnet-template)
