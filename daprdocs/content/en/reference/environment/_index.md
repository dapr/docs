---
type: docs
title: "Environment variable reference"
linkTitle: "Environment Variables"
description: "A list of all environment variables used by Dapr"
weight: 300
---

Following table lists the environment variables used by the Dapr runtime, CLI, or your applications:

| Environment Variable             | Used By          | Description |
|----------------------------------|------------------|-------------|
| DAPR_HTTP_PORT                   | Your application | The HTTP port that Dapr is listening on. Your application should use this variable to connect to Dapr instead of hardcoding the port value. Injected by the `dapr-sidecar-injector` into all the containers in the pod.
| DAPR_GRPC_PORT                   | Your application | The gRPC port that Dapr is listening on. Your application should use this variable to connect to Dapr instead of hardcoding the port value. Injected by the `dapr-sidecar-injector` into all the containers in the pod.
| DAPR_TOKEN_API                   | Your application | The token value used for API authentication. Refer to the [API token auth page](/operations/security/api-token/) for more information.
| DAPR_NETWORK                     | Dapr CLI         | Optionally used by the Dapr CLI to specify the Docker network on which to deploy the Dapr runtime.
| DAPR_PLACEMENT_HOST              | Your application | The host on which the placement service resides. Used for actors only.
| NAMESPACE                        | Dapr runtime     | Used to specify a component's [namespace in self-hosted mode](/operations/components/component-scopes/#example-of-component-namespacing-in-self-hosted-mode).