# How Tos

Here you'll find a list of "How To" guides that walk you through accomplishing specific tasks.

## Contents
- [Service invocation](#service-invocation)
- [State management](#state-management)
- [Pub/Sub](#pubsub)
- [Bindings](#bindings-and-triggers)
- [Actors](#actors)
- [Observability](#observability)
- [Security](#security)
- [Middleware](#middleware)
- [Components](#components)
- [Hosting platforms](#hosting-platforms)
- [Developer tooling](#developer-tooling)

## Service invocation

* [Invoke other services in your cluster or environment](./invoke-and-discover-services)
* [Create a gRPC enabled app, and invoke Dapr over gRPC](./create-grpc-app)

## State Management

* [Setup a state store](./setup-state-store)
* [Create a service that performs stateful CRUD operations](./create-stateful-service)
* [Query the underlying state store](./query-state-store)
* [Create a stateful, replicated service with different consistency/concurrency levels](./stateful-replicated-service)
* [Control your app's throttling using rate limiting features](./control-concurrency)
* [Configuring Redis for state management ](./configure-redis)

## Pub/Sub

* [Setup Dapr Pub/Sub](./setup-pub-sub-message-broker)
* [Use Pub/Sub to publish messages to a given topic](./publish-topic)
* [Use Pub/Sub to consume events from a topic](./consume-topic)
* [Use Pub/Sub across multiple namespaces](./pubsub-namespaces)
* [Configuring Redis for pub/sub](./configure-redis)
* [Limit the Pub/Sub topics used or scope them to one or more applications](./pubsub-scopes)

## Bindings and Triggers
* [Implementing a new binding](https://github.com/dapr/docs/tree/master/reference/specs/bindings)
* [Trigger a service from different resources with input bindings](./trigger-app-with-input-binding)
* [Invoke different resources using output bindings](./send-events-with-output-bindings)

## Actors
For Actors How Tos see the SDK documentation
* [.NET Actors](https://github.com/dapr/dotnet-sdk/blob/master/docs/get-started-dapr-actor.md)
* [Java Actors](https://github.com/dapr/java-sdk)

## Observability

### Metric and logs

* [Set up Azure monitor to search logs and collect metrics for Dapr](./setup-monitoring-tools/setup-azure-monitor.md)
* [Set up Fleuntd, Elastic search, and Kibana in Kubernetes](./setup-monitoring-tools/setup-fluentd-es-kibana.md)
* [Set up Prometheus and Grafana for metrics](./setup-monitoring-tools/setup-prometheus-grafana.md)

### Distributed Tracing

* [Diagnose your services with distributed tracing](./diagnose-with-tracing)
* [Use W3C Trace Context](./use-w3c-tracecontext)

## Security

### Dapr APIs Authentication

* [Enable Dapr APIs token-based authentication](./enable-dapr-api-token-based-authentication)

### Mutual Transport Layer Security (mTLS)

* [Setup and configure mutual TLS between Dapr instances](./configure-mtls)

### Secrets

* [Configure component secrets using Dapr secret stores](./setup-secret-store)
* [Using the Secrets API to get application secrets](./get-secrets)

## Middleware

* [Configure API authorization with OAuth](./authorization-with-oauth)

## Components

* [Limit components for one or more applications using scopes](./components-scopes)

## Hosting Platforms
### Kubernetes Configuration

* [Production deployment and upgrade guidelines](./deploy-k8s-prod)
* [Sidecar configuration on Kubernetes](./configure-k8s)
* [Autoscale on Kubernetes using KEDA and Dapr bindings](./autoscale-with-keda)
* [Deploy to hybrid Linux/Windows Kubernetes clusters](./hybrid-clusters) 

## Developer tooling
### Using Visual Studio Code

* [Using Remote Containers for application development](./vscode-remote-containers)
* [Developing and debugging  Dapr applications](./vscode-debugging-daprd)

* [Setup development environment for Dapr runtime development ](https://github.com/dapr/dapr/blob/master/docs/development/setup-dapr-development-using-vscode.md)

### Using IntelliJ

* [Developing and debugging with daprd](./intellij-debugging-daprd)

### SDKs

* [Serialization in Dapr's SDKs](./serialize)
