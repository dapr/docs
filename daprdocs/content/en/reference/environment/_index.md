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
| APP_ID               | Your application | The id for your application, used for service discovery  |
| APP_PORT             | Dapr sidecar | The port your application is listening on  |
| APP_API_TOKEN        | Your application | The token used by the application to authenticate requests from Dapr API. Read [authenticate requests from Dapr using token authentication]({{< ref app-api-token >}}) for more information. |
| DAPR_HTTP_PORT       | Your application | The HTTP port that the Dapr sidecar is listening on. Your application should use this variable to connect to Dapr sidecar instead of hardcoding the port value. Set by the Dapr CLI run command for self-hosted or injected by the `dapr-sidecar-injector` into all the containers in the pod.                                   |
| DAPR_GRPC_PORT       | Your application | The gRPC port that the Dapr sidecar is listening on. Your application should use this variable to connect to Dapr sidecar instead of hardcoding the port value. Set by the Dapr CLI run command for self-hosted or injected by the `dapr-sidecar-injector` into all the containers in the pod.                                   |
| DAPR_API_TOKEN  | Dapr sidecar     | The token used for Dapr API authentication for requests from the application. [Enable API token authentication in Dapr]({{< ref api-token >}}). |
| NAMESPACE | Dapr sidecar | Used to specify a component's [namespace in self-hosted mode]({{< ref component-scopes >}}). |
| DAPR_DEFAULT_IMAGE_REGISTRY | Dapr CLI | In self-hosted mode, it is used to specify the default container registry to pull images from. When its value is set to `GHCR` or `ghcr`, it pulls the required images from Github container registry. To default to Docker hub, unset this environment variable. |
| SSL_CERT_DIR | Dapr sidecar | Specifies the location where the public certificates for all the trusted certificate authorities (CA) are located. Not applicable when the sidecar is running as a process in self-hosted mode.|
| DAPR_HELM_REPO_URL | Your private Dapr Helm chart url  | Specifies a private Dapr Helm chart url, which defaults to the official Helm chart URL: `https://dapr.github.io/helm-charts`|
| DAPR_HELM_REPO_USERNAME | A username for a private Helm chart | The username required to access the private Dapr Helm chart. If it can be accessed publicly, this env variable does not need to be set|
| DAPR_HELM_REPO_PASSWORD | A password for a private Helm chart  |The password required to access the private Dapr helm chart. If it can be accessed publicly, this env variable does not need to be set| 
| OTEL_EXPORTER_OTLP_ENDPOINT | OpenTelemetry Tracing | Sets the Open Telemetry (OTEL) server address, turns on tracing. (Example: `http://localhost:4318`) |
| OTEL_EXPORTER_OTLP_INSECURE | OpenTelemetry Tracing | Sets the connection to the endpoint as unencrypted. (`true`, `false`) |
| OTEL_EXPORTER_OTLP_PROTOCOL | OpenTelemetry Tracing | The OTLP protocol to use Transport protocol. (`grpc`, `http/protobuf`, `http/json`) |
| DAPR_COMPONENTS_SOCKETS_FOLDER | Dapr runtime and the .NET, Go, and Java pluggable component SDKs | The location or path where Dapr looks for Pluggable Components Unix Domain Socket files. If unset this location defaults to `/tmp/dapr-components-sockets` |
| DAPR_COMPONENTS_SOCKETS_EXTENSION | .NET and Java pluggable component SDKs | A per-SDK configuration that indicates the default file extension applied to socket files created by the SDKs. Not a Dapr-enforced behavior. |
| DAPR_HOST_IP | Dapr sidecar | The host's chosen IP address. If not specified, will loop over the network interfaces and select the first non-loopback address it finds.|
