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
| DAPR_HTTP_PORT       | Your application | The HTTP port that the Dapr sidecar is listening on. Your application should use this variable to connect to Dapr sidecar instead of hardcoding the port value. Set by the Dapr CLI run command for self-hosted or injected by the `dapr-sidecar-injector` into all the containers in the pod.                                   |
| DAPR_GRPC_PORT       | Your application | The gRPC port that the Dapr sidecar is listening on. Your application should use this variable to connect to Dapr sidecar instead of hardcoding the port value. Set by the Dapr CLI run command for self-hosted or injected by the `dapr-sidecar-injector` into all the containers in the pod.                                   |
| DAPR_METRICS_PORT    | Your application | The HTTP [Prometheus]({{< ref prometheus >}}) port to which Dapr sends its metrics information. With this variable, your application sends its application-specific metrics to have both Dapr metrics and application metrics together. See [metrics-port]({{< ref arguments-annotations-overview>}}) for more information |
| DAPR_PROFILE_PORT    | Your application | The [profiling port]({{< ref profiling-debugging >}}) through which Dapr lets you enable profiling and track possible CPU/memory/resource spikes in your application's behavior. Enabled by `--enable-profiling` command in Dapr CLI for self-hosted or `dapr.io/enable-profiling` annotation in Dapr annotated pod. |
| DAPR_API_TOKEN  | Dapr sidecar     | The token used for Dapr API authentication for requests from the application. [Enable API token authentication in Dapr]({{< ref api-token >}}). |
| NAMESPACE | Dapr sidecar | Used to specify a component's [namespace in self-hosted mode]({{< ref component-scopes >}}). |
| DAPR_DEFAULT_IMAGE_REGISTRY | Dapr CLI | In self-hosted mode, it is used to specify the default container registry to pull images from. When its value is set to `GHCR` or `ghcr`, it pulls the required images from Github container registry. To default to Docker hub, unset this environment variable. |
