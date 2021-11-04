---
type: docs
title: "Environment variable reference"
linkTitle: "Environment variables"
description: "A list of environment variables used by Dapr"
weight: 300
---

The following table lists the environment variables used by the Dapr runtime, CLI, or from within your application:

| Environment Variable | Used By          | Description                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| APP_ID               | Your application | The id for your application, used for service discovery                                                                                                                                                                                                                                                                        |
| APP_PORT             | Your application | The port your application is listening on                                                                                                                                                                                                                                                                                      |
| APP_API_TOKEN        | Your application | The token used by the application to authenticate requests from Dapr API. Read [authenticate requests from Dapr using token authentication]({{< ref app-api-token >}}) for more information.                                                                                                                                   |
| DAPR_HTTP_PORT       | Your application | The HTTP port that the Dapr sidecar is listening on. Your application should use this variable to connect to Dapr sidecar instead of hardcoding the port value. Set by the Dapr CLI run command for self hosted or injected by the dapr-sidecar-injector into all the containers in the pod.                                   |
| DAPR_GRPC_PORT       | Your application | The gRPC port that the Dapr sidecar is listening on. Your application should use this variable to connect to Dapr sidecar instead of hardcoding the port value. Set by the Dapr CLI run command for self hosted or injected by the dapr-sidecar-injector into all the containers in the pod.                                   |
| DAPR_METRICS_PORT    | Your application | The HTTP [Prometheus]({{< ref prometheus >}}) port that Dapr sends its metrics information to. Your application can use this variable to send its application specific metrics to have both Dapr metrics and application metrics together. See [metrics-port]({{< ref arguments-annotations-overview>}}) for more information |
| DAPR_API_TOKEN       | Dapr sidecar     | The token used for Dapr API authentication for requests from the application. Read [enable API token authentication in Dapr]({{< ref api-token >}}) for more information.                                                                                                                                                      |
| NAMESPACE            | Dapr sidecar     | Used to specify a component's [namespace in self-hosted mode]({{< ref component-scopes >}})                                                                                                                                                                                                                                    |
