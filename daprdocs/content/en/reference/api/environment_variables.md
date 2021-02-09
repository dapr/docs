---
type: docs
title: "Enrivonment variable reference"
linkTitle: "Enrivonment Variables"
description: "A list of all environment variables used by Dapr"
weight: 1500
---

Following table lists the environment variables used by the Dapr runtime, CLI, or your applications:

| Environent Variable              | Description |
|----------------------------------|-------------|
| DAPR_HTTP_PORT                   | The HTTP port that Dapr is listening on. Your application should use this variable to connect to Dapr instead of hardcoding the port value. Injected by the `dapr-sidecar-injector` into all the containers in the pod.
| DAPR_GRPC_PORT                   | The gRPC port that Dapr is listening on. Your application should use this variable to connect to Dapr instead of hardcoding the port value. Injected by the `dapr-sidecar-injector` into all the containers in the pod.
| DAPR_TOKEN_API                   | The token value used for API authentication. Refer to the [API token auth page](/operations/security/api-token/) for more information.
| DAPR_NETWORK                     | Optionally used by the Dapr CLI to specify the Docker network on which to deploy the Dapr runtime.
| DAPR_PLACEMENT_HOST              | The host on which the placement service resides. Used for actors only.
| NAMESPACE                        | Used to specify a component's [namespace in self-hosted mode](/operations/components/component-scopes/#example-of-component-namespacing-in-self-hosted-mode).