# How Tos

Here you'll find a list of How To guides that walk you through accomplishing specific tasks.

## Contents
- [How Tos](#how-tos)
  - [Contents](#contents)
  - [Service invocation](#service-invocation)
    - [Middleware](#middleware)
  - [State Management](#state-management)
  - [Pub/Sub](#pubsub)
  - [Bindings and Triggers](#bindings-and-triggers)
  - [Actors](#actors)
  - [Observerability](#observerability)
    - [Metric and logs](#metric-and-logs)
    - [Distributed Tracing](#distributed-tracing)
  - [Security](#security)
    - [Mutual Transport Layer Security (TLS)](#mutual-transport-layer-security-tls)
    - [Secrets](#secrets)
  - [Components](#components)
  - [Developer experience](#developer-experience)
    - [Using Visual Studio Code](#using-visual-studio-code)
    - [Using IntelliJ](#using-intellij)
    - [SDKs](#sdks)
  - [Infrastructure integration](#infrastructure-integration)

## Service invocation

* [Invoke other services in your cluster or environment](./invoke-and-discover-services)
* [Create a gRPC enabled app, and invoke Dapr over gRPC](./create-grpc-app)

### Middleware

* [Authorization with oAuth](./authorization-with-oauth)

## State Management

* [Setup Dapr state store](./setup-state-store)
* [Create a service that performs stateful CRUD operations](./create-stateful-service)
* [Query the underlying state store](./query-state-store)
* [Create a stateful, replicated service with different consistency/concurrency levels](./stateful-replicated-service)
* [Control your app's throttling using rate limiting features](./control-concurrency)
* [Configuring Redis for state management ](./configure-redis)


## Pub/Sub

* [Setup Dapr Pub/Sub](./setup-pub-sub-message-broker)
* [Use Pub/Sub to publish messages to a given topic](./publish-topic)
* [Use Pub/Sub to consume events from a topic](./consume-topic)
* [Configuring Redis for pub/sub ](./configure-redis)

## Bindings and Triggers
* [Implementing a new binding](https://github.com/dapr/docs/tree/master/reference/specs/bindings)
* [Trigger a service from different resources with input bindings](./trigger-app-with-input-binding)
* [Invoke different resources using output bindings](./send-events-with-output-bindings)

## Actors
For Actors How Tos see the SDK documentation
* [.NET Actors](https://github.com/dapr/dotnet-sdk/blob/master/docs/get-started-dapr-actor.md)
* [Java Actors](https://github.com/dapr/java-sdk)

## Observerability

### Metric and logs

* [Set up Azure monitor to search logs and collect metrics for Dapr](./setup-monitoring-tools/setup-azure-monitor.md)
* [Set up Fleuntd, Elastic search, and Kibana in Kubernetes](./setup-monitoring-tools/setup-fluentd-es-kibana.md)
* [Set up Prometheus and Grafana for metrics](./setup-monitoring-tools/setup-prometheus-grafana.md)

### Distributed Tracing

* [Diagnose your services with distributed tracing](./diagnose-with-tracing)


## Security
### Mutual Transport Layer Security (TLS)

* [Setup and configure mutual TLS between Dapr instances](./configure-mtls)

### Secrets

* [Configure component secrets using Dapr secret stores](./setup-secret-store)
* [Using the Secrets API to get application secrets](./get-secrets)

## Components

* [Limit components for one or more applications using scopes](./components-scopes)

## Developer experience
### Using Visual Studio Code

* [Using Remote Containers for application development](./vscode-remote-containers-daprd)
* [Developing and debugging  Dapr applications](./vscode-debugging-daprd)

* [Setup development environment for Dapr runtime development ](https://github.com/dapr/dapr/blob/master/docs/development/setup-dapr-development-using-vscode.md)

### Using IntelliJ

* [Developing and debugging with daprd](./intellij-debugging-daprd)

### SDKs

* [Serialization in Dapr's SDKs](./serialize)

## Infrastructure integration

* [Autoscale on Kubernetes using KEDA and Dapr bindings](./autoscale-with-keda)