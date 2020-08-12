
# Hosting environments

Dapr can run on multiple hosting platforms.

## Contents
- [Running Dapr on a local developer machine in self hosted mode](#running-dapr-on-a-local-developer-machine-in-self-hosted-mode)
- [Running Dapr in Kubernetes mode](#running-dapr-in-kubernetes-mode)

## Running Dapr on a local developer machine in self hosted mode

Dapr can be configured to run on your local developer machine in [self hosted mode](../getting-started). Each running service has a Dapr runtime process (or sidecar) which is configured to use state stores, pub/sub, binding components and the other building blocks. 

In self hosted mode, Redis is running locally in a container and is configured to serve as both the default component for state store and for pub/sub. A Zipkin container is also configured for diagnostics and tracing.  After running `dapr init`, see the `$HOME/.dapr/components` directory (Mac/Linux) or `%USERPROFILE%\.dapr\components` on Windows.

The `dapr-placement` service is responsible for managing the actor distribution scheme and key range settings. This service is only required if you are using Dapr actors. For more information on the actor `Placement` service read [actor overview](../concepts/actors). 

<img src="../../images/overview_standalone.png" width=800>

You can use the [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) to run a Dapr enabled application on your local machine.

## Running Dapr in Kubernetes mode

Dapr can be configured to run on any [Kubernetes cluster](https://github.com/dapr/samples/tree/master/2.hello-kubernetes). In Kubernetes the `dapr-sidecar-injector` and `dapr-operator` services provide first class integration to launch Dapr as a sidecar container in the same pod as the service container and provide notifications of Dapr component updates provisioned into the cluster. Additionally, the `dapr-sidecar-injector` also injects the environment variables `DAPR_HTTP_PORT` and `DAPR_GRPC_PORT` into **all** the containers in the pod to enable user defined applications to easily communicate with Dapr without hardcoding Dapr port values. 

The `dapr-sentry` service is a certificate authority that enables mutual TLS between Dapr sidecar instances for secure data encryption. For more information on the `Sentry` service read the [security overview](../concepts/security/README.md#dapr-to-dapr-communication)

<img src="../../images/overview_kubernetes.png" width=800>

Deploying and running a Dapr enabled application into your Kubernetes cluster is a simple as adding a few annotations to the deployment schemes. To give your service an `id` and `port` known to Dapr, turn on tracing through configuration and launch the Dapr sidecar container, you annotate your Kubernetes deployment like this. 

```yml
  annotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nodeapp"
    dapr.io/app-port: "3000"
    dapr.io/config: "tracing"
```
You can see some examples [here](https://github.com/dapr/samples/tree/master/2.hello-kubernetes/deploy) in the Kubernetes getting started sample.

Read [Kubernetes how to topics](https://github.com/dapr/docs/tree/master/howto#kubernetes-configuration) for more information about setting up Kubernetes and Dapr.
