---
type: docs
title: "Environment variable reference"
linkTitle: "Environment variables"
description: "A list of environment variables used by Dapr"
weight: 300
---

The following table lists the environment variables used by the Dapr runtime, CLI, or from within your application:

| Environment Variable             | Used By          | Description |
|----------------------------------|------------------|-------------|
| DAPR_HTTP_PORT                   | Your application | The HTTP port that Dapr is listening on. Your application should use this variable to connect to Dapr instead of hardcoding the port value. Injected by the `dapr-sidecar-injector` into all the containers in the pod.
| DAPR_GRPC_PORT                   | Your application | The gRPC port that Dapr is listening on. Your application should use this variable to connect to Dapr instead of hardcoding the port value. Injected by the `dapr-sidecar-injector` into all the containers in the pod.
| DAPR_TOKEN_API                   | Your application | The token used for Dapr API authentication for requests from the application. Read [enable API token authentication in Dapr]({{< ref api-token >}}) for more information.
| APP_TOKEN_API                    | Your application | The token used by the app to authenticate requests from Dapr. Read [authenticate requests from Dapr using token authentication]({{< ref app-api-token >}}) for more information.
| DAPR_PLACEMENT_HOST              |Your application | The address for the Dapr Placement service. Only needed in self-hosted mode if you run your app (which creates actors) and you want to tell the app the location of the Placement service. This is never needed outside of local machine development.
| DAPR_NETWORK                     | Dapr CLI         | Optionally used by the Dapr CLI to specify the Docker network on which to deploy the Dapr runtime.
| NAMESPACE                        | Dapr runtime     | Used to specify a component's [namespace in self-hosted mode]({{< ref component-scopes >}})
