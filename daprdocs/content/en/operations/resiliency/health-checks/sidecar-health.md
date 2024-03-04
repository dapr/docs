---
type: docs
title: "Sidecar health"
linkTitle: "Sidecar health"
weight: 200
description: Dapr sidecar health checks
---

Dapr provides a way to determine its health using an [HTTP `/healthz` endpoint]({{< ref health_api.md >}}). With this endpoint, the *daprd* process, or sidecar, can be:

- Probed for its overall health
- Probed for Dapr sidecar readiness during initialization
- Determined for readiness and liveness with Kubernetes

In this guide, you learn how the Dapr `/healthz` endpoint integrates with health probes from the application hosting platform (for example, Kubernetes) as well as the Dapr SDKs. 

{{% alert title="Note" color="primary" %}}
Dapr actors also have a health API endpoint where Dapr probes the application for a response to a signal from Dapr that the actor application is healthy and running. See [actor health API]({{< ref "actors_api.md#health-check" >}}).
{{% /alert %}} 

The following diagram shows the steps when a Dapr sidecar starts, the healthz endpoint and when the app channel is initialized.  

<img src="/images/healthz-outbound.png" width="800" alt="Diagram of Dapr checking oubound health connections." />

## Outbound health endpoint

As shown by the red boundary lines in the diagram above, the `v1.0/healthz/` endpoint is used to wait for when:
- All components are initialized;
- The Dapr HTTP port is available; _and,_
- The app channel is initialized. 

This is used to check the complete initialization of the Dapr sidecar and its health. 

Setting the `DAPR_HEALTH_TIMEOUT` environment variable lets you control the health timeout, which, for example, can be important in different environments with higher latency.

On the other hand, as shown by the green boundary lines in the diagram above, the `v1.0/healthz/outbound` endpoint returns successfully when:
- All the components are initialized;
- The Dapr HTTP port is available; _but,_ 
- The app channel is not yet established. 

In the Dapr SDKs, the `waitForSidecar`/`wait_until_ready` method (depending on [which SDK you use]({{< ref "#sdks-supporting-outbound-health-endpoint" >}})) is used for this specific check with the `v1.0/healthz/outbound` endpoint. Using this behavior, instead of waiting for the app channel to be available (see: red boundary lines) with the `v1.0/healthz/` endpoint, Dapr waits for a successful response from `v1.0/healthz/outbound`. This approach enables your application to perform calls on the Dapr sidecar APIs before the app channel is initalized - for example, reading secrets with the secrets API.

If you are using the `waitForSidecar`/`wait_until_ready` method on the SDKs, then the correct initialization is performed. Otherwise, you can call the `v1.0/healthz/outbound` endpoint during initalization, and if successesful, you can call the Dapr sidecar APIs.

### SDKs supporting outbound health endpoint
Currently, the `v1.0/healthz/outbound` endpoint is supported in the:
- [.NET SDK]({{< ref "dotnet-client.md#wait-for-sidecar" >}})
- [Java SDK]({{< ref "java-client.md#wait-for-sidecar" >}})
- [Python SDK]({{< ref "python-client.md#health-timeout" >}})
- [JavaScript SDK](https://github.com/dapr/js-sdk/blob/4189a3d2ad6897406abd766f4ccbf2300c8f8852/src/interfaces/Client/IClientHealth.ts#L14)


## Health endpoint: Integration with Kubernetes
When deploying Dapr to a hosting platform like Kubernetes, the Dapr health endpoint is automatically configured for you.

Kubernetes uses *readiness* and *liveness* probes to determines the health of the container.

### Liveness
The kubelet uses liveness probes to know when to restart a container. For example, liveness probes could catch a deadlock (a running application that is unable to make progress). Restarting a container in such a state can help to make the application more available despite having bugs.

#### How to configure a liveness probe in Kubernetes

In the pod configuration file, the liveness probe is added in the containers spec section as shown below:

```yaml
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

In the above example, the `periodSeconds` field specifies that the kubelet should perform a liveness probe every 3 seconds. The `initialDelaySeconds` field tells the kubelet that it should wait 3 seconds before performing the first probe. To perform a probe, the kubelet sends an HTTP GET request to the server that is running in the container and listening on port 8080. If the handler for the server's `/healthz` path returns a success code, the kubelet considers the container to be alive and healthy. If the handler returns a failure code, the kubelet kills the container and restarts it.

Any HTTP status code between 200 and 399 indicates success; any other status code indicates failure.

### Readiness
The kubelet uses readiness probes to know when a container is ready to start accepting traffic. A pod is considered ready when all of its containers are ready. One use of this readiness signal is to control which pods are used as backends for Kubernetes services. When a pod is not ready, it is removed from Kubernetes service load balancers.

{{% alert title="Note" color="primary" %}}
The Dapr sidecar will be in ready state once the application is accessible on its configured port. The application cannot access the Dapr components during application start up/initialization.
{{% /alert %}}

#### How to configure a readiness probe in Kubernetes

Readiness probes are configured similarly to liveness probes. The only difference is that you use the `readinessProbe` field instead of the `livenessProbe` field:

```yaml
    readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### Sidecar Injector

When integrating with Kubernetes, the Dapr sidecar is injected with a Kubernetes probe configuration telling it to use the Dapr `healthz` endpoint. This is done by the "Sidecar Injector" system service. The integration with the kubelet is shown in the diagram below.

<img src="/images/security-mTLS-dapr-system-services.png" width="800" alt="Diagram of Dapr services interacting" />

#### How the Dapr sidecar health endpoint is configured with Kubernetes

As mentioned above, this configuration is done automatically by the Sidecar Injector service. This section describes the specific values that are set on the liveness and readiness probes.

Dapr has its HTTP health endpoint `/v1.0/healthz` on port 3500. This can be used with Kubernetes for readiness and liveness probe. When the Dapr sidecar is injected, the readiness and liveness probes are configured in the pod configuration file with the following values:

```yaml
    livenessProbe:
      httpGet:
        path: v1.0/healthz
        port: 3500
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds : 5
      failureThreshold : 3
    readinessProbe:
      httpGet:
        path: v1.0/healthz
        port: 3500
      initialDelaySeconds: 5
      periodSeconds: 10
      timeoutSeconds : 5
      failureThreshold: 3
```

## Related links

- [Endpoint health API]({{< ref health_api.md >}})
- [Actor health API]({{< ref "actors_api.md#health-check" >}})
- [Kubernetes probe configuration parameters](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
