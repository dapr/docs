---
type: docs
title: "Properties"
linkTitle: "Properties"
weight: 3001
description: SDK-wide properties for configuring the Dapr Java SDK using environment variables and system properties
---

# Properties

The Dapr Java SDK provides a set of global properties that control the behavior of the SDK. These properties can be configured using environment variables or system properties. System properties can be set using the `-D` flag when running your Java application.

These properties affect the entire SDK, including clients and runtime. They control aspects such as:
- Sidecar connectivity (endpoints, ports)
- Security settings (TLS, API tokens)
- Performance tuning (timeouts, connection pools)
- Protocol settings (gRPC, HTTP)
- String encoding

## Environment Variables

The following environment variables are available for configuring the Dapr Java SDK:

### Sidecar Endpoints

When these variables are set, the client will automatically use them to connect to the Dapr sidecar.

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DAPR_GRPC_ENDPOINT` | The gRPC endpoint for the Dapr sidecar | `localhost:50001` |
| `DAPR_HTTP_ENDPOINT` | The HTTP endpoint for the Dapr sidecar | `localhost:3500` |
| `DAPR_GRPC_PORT` | The gRPC port for the Dapr sidecar (legacy, `DAPR_GRPC_ENDPOINT` takes precedence) | `50001` |
| `DAPR_HTTP_PORT` | The HTTP port for the Dapr sidecar (legacy, `DAPR_HTTP_ENDPOINT` takes precedence) | `3500` |

### API Tokens

Dapr supports two types of API tokens for securing communication:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DAPR_API_TOKEN` | API token for authenticating requests **from your app to the Dapr sidecar**. The Java SDK automatically includes this token in requests when using `DaprClient`. | `null` |
| `APP_API_TOKEN` | API token for authenticating requests **from Dapr to your app**. When set, Dapr includes this token in the `dapr-api-token` header/metadata when calling your application (for pubsub subscribers, input bindings, or job triggers). Your application must validate this token. | `null` |

For implementation examples, see [App API Token Authentication]({{% ref "java-client#app-api-token-authentication" %}}). For more details, see [Dapr API token authentication](https://docs.dapr.io/operations/security/api-token/).

### gRPC Configuration

#### TLS Settings
For secure gRPC communication, you can configure TLS settings using the following environment variables:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DAPR_GRPC_TLS_INSECURE` | When set to "true", enables insecure TLS mode which still uses TLS but doesn't verify certificates. This uses InsecureTrustManagerFactory to trust all certificates. This should only be used for testing or in secure environments. | `false` |
| `DAPR_GRPC_TLS_CA_PATH` | Path to the CA certificate file. This is used for TLS connections to servers with self-signed certificates. | `null` |
| `DAPR_GRPC_TLS_CERT_PATH` | Path to the TLS certificate file for client authentication. | `null` |
| `DAPR_GRPC_TLS_KEY_PATH` | Path to the TLS private key file for client authentication. | `null` |

#### Keepalive Settings
Configure gRPC keepalive behavior using these environment variables:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DAPR_GRPC_ENABLE_KEEP_ALIVE` | Whether to enable gRPC keepalive | `false` |
| `DAPR_GRPC_KEEP_ALIVE_TIME_SECONDS` | gRPC keepalive time in seconds | `10` |
| `DAPR_GRPC_KEEP_ALIVE_TIMEOUT_SECONDS` | gRPC keepalive timeout in seconds | `5` |
| `DAPR_GRPC_KEEP_ALIVE_WITHOUT_CALLS` | Whether to keep gRPC connection alive without calls | `true` |

#### Inbound Message Settings
Configure gRPC inbound message settings using these environment variables:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DAPR_GRPC_MAX_INBOUND_MESSAGE_SIZE_BYTES` | Dapr's maximum inbound message size for gRPC in bytes. This value sets the maximum size of a gRPC message that can be received by the application	| `4194304` |
| `DAPR_GRPC_MAX_INBOUND_METADATA_SIZE_BYTES` | Dapr's maximum inbound metadata size for gRPC in bytes | `8192` |

### HTTP Client Configuration

These properties control the behavior of the HTTP client used for communication with the Dapr sidecar:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DAPR_HTTP_CLIENT_READ_TIMEOUT_SECONDS` | Timeout in seconds for HTTP client read operations. This is the maximum time to wait for a response from the Dapr sidecar. | `60` |
| `DAPR_HTTP_CLIENT_MAX_REQUESTS` | Maximum number of concurrent HTTP requests that can be executed. Above this limit, requests will queue in memory waiting for running calls to complete. | `1024` |
| `DAPR_HTTP_CLIENT_MAX_IDLE_CONNECTIONS` | Maximum number of idle connections in the HTTP connection pool. This is the maximum number of connections that can remain idle in the pool. | `128` |

### API Configuration

These properties control the behavior of API calls made through the SDK:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DAPR_API_MAX_RETRIES` | Maximum number of retries for retriable exceptions when making API calls to the Dapr sidecar | `0` |
| `DAPR_API_TIMEOUT_MILLISECONDS` | Timeout in milliseconds for API calls to the Dapr sidecar. A value of 0 means no timeout. | `0` |

### String Encoding

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `DAPR_STRING_CHARSET` | Character set used for string encoding/decoding in the SDK. Must be a valid Java charset name. | `UTF-8` |

### System Properties

All environment variables can be set as system properties using the `-D` flag. Here is the complete list of available system properties:

| System Property | Description | Default |
|----------------|-------------|---------|
| `dapr.sidecar.ip` | IP address for the Dapr sidecar | `localhost` |
| `dapr.http.port` | HTTP port for the Dapr sidecar | `3500` |
| `dapr.grpc.port` | gRPC port for the Dapr sidecar | `50001` |
| `dapr.grpc.tls.cert.path` | Path to the gRPC TLS certificate | `null` |
| `dapr.grpc.tls.key.path` | Path to the gRPC TLS key | `null` |
| `dapr.grpc.tls.ca.path` | Path to the gRPC TLS CA certificate | `null` |
| `dapr.grpc.tls.insecure` | Whether to use insecure TLS mode | `false` |
| `dapr.grpc.endpoint` | gRPC endpoint for remote sidecar | `null` |
| `dapr.grpc.enable.keep.alive` | Whether to enable gRPC keepalive | `false` |
| `dapr.grpc.keep.alive.time.seconds` | gRPC keepalive time in seconds | `10` |
| `dapr.grpc.keep.alive.timeout.seconds` | gRPC keepalive timeout in seconds | `5` |
| `dapr.grpc.keep.alive.without.calls` | Whether to keep gRPC connection alive without calls | `true` |
| `dapr.http.endpoint` | HTTP endpoint for remote sidecar | `null` |
| `dapr.api.maxRetries` | Maximum number of retries for API calls | `0` |
| `dapr.api.timeoutMilliseconds` | Timeout for API calls in milliseconds | `0` |
| `dapr.api.token` | API token for authentication | `null` |
| `dapr.string.charset` | String encoding used in the SDK | `UTF-8` |
| `dapr.http.client.readTimeoutSeconds` | Timeout in seconds for HTTP client reads | `60` |
| `dapr.http.client.maxRequests` | Maximum number of concurrent HTTP requests | `1024` |
| `dapr.http.client.maxIdleConnections` | Maximum number of idle HTTP connections | `128` |

## Property Resolution Order

Properties are resolved in the following order:
1. Override values (if provided when creating a Properties instance)
2. System properties (set via `-D`)
3. Environment variables
4. Default values

The SDK checks each source in order. If a value is invalid for the property type (e.g., non-numeric for a numeric property), the SDK will log a warning and try the next source. For example:

```bash
# Invalid boolean value - will be ignored
java -Ddapr.grpc.enable.keep.alive=not-a-boolean -jar myapp.jar

# Valid boolean value - will be used
export DAPR_GRPC_ENABLE_KEEP_ALIVE=false
```

In this case, the environment variable is used because the system property value is invalid. However, if both values are valid, the system property takes precedence:

```bash
# Valid boolean value - will be used
java -Ddapr.grpc.enable.keep.alive=true -jar myapp.jar

# Valid boolean value - will be ignored
export DAPR_GRPC_ENABLE_KEEP_ALIVE=false
```

Override values can be set using the `DaprClientBuilder` in two ways:

1. Using individual property overrides (recommended for most cases):
```java
import io.dapr.config.Properties;

// Set a single property override
DaprClient client = new DaprClientBuilder()
    .withPropertyOverride(Properties.GRPC_ENABLE_KEEP_ALIVE, "true")
    .build();

// Or set multiple property overrides
DaprClient client = new DaprClientBuilder()
    .withPropertyOverride(Properties.GRPC_ENABLE_KEEP_ALIVE, "true")
    .withPropertyOverride(Properties.HTTP_CLIENT_READ_TIMEOUT_SECONDS, "120")
    .build();
```

2. Using a Properties instance (useful when you have many properties to set at once):
```java
// Create a map of property overrides
Map<String, String> overrides = new HashMap<>();
overrides.put("dapr.grpc.enable.keep.alive", "true");
overrides.put("dapr.http.client.readTimeoutSeconds", "120");

// Create a Properties instance with overrides
Properties properties = new Properties(overrides);

// Use these properties when creating a client
DaprClient client = new DaprClientBuilder()
    .withProperties(properties)
    .build();
```

For most use cases, you'll use system properties or environment variables. Override values are primarily used when you need different property values for different instances of the SDK in the same application.

## Proxy Configuration

You can configure proxy settings for your Java application using system properties. These are standard Java system properties that are part of Java's networking layer (`java.net` package), not specific to Dapr. They are used by Java's networking stack, including the HTTP client that Dapr's SDK uses.

For detailed information about Java's proxy configuration, including all available properties and their usage, see the [Java Networking Properties documentation](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/net/doc-files/net-properties.html).


For example, here's how to configure a proxy:

```bash
# Configure HTTP proxy - replace with your actual proxy server details
java -Dhttp.proxyHost=your-proxy-server.com -Dhttp.proxyPort=8080 -jar myapp.jar

# Configure HTTPS proxy - replace with your actual proxy server details
java -Dhttps.proxyHost=your-proxy-server.com -Dhttps.proxyPort=8443 -jar myapp.jar
```

Replace `your-proxy-server.com` with your actual proxy server hostname or IP address, and adjust the port numbers to match your proxy server configuration.

These proxy settings will affect all HTTP/HTTPS connections made by your Java application, including connections to the Dapr sidecar.