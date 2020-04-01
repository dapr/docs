# Health

Dapr provides a way to determine it's health using an HTTP /healthz endpoint.
With this endpoint, the Dapr process, or sidecar, can be probed for its health and hence determine its readiness and liveness. See [health API ](../../reference/api/health_api.md)

The Dapr `/healthz` endpoint can be used by health probes from the application hosting platform. This topic describes how Dapr integrates with probes from different hosting platforms. 

As a user, when deploying Dapr to a hosting platform (for example Kubernetes), the Dapr health endpoint is automatically configured for you. There is nothing you need to configure. 

Note: Dapr actors also have a health API endpoint where Dapr probes the application for a response to a signal from Dapr that the actor application is healthy and running. See [actor health API](../../reference/api/actors_api.md#health-check)

## Health endpoint: Integration with Kubernetes

Kubernetes uses *readiness* and *liveness* probes to determines the health of the container.

The kubelet uses liveness probes to know when to restart a container.
For example, liveness probes could catch a deadlock, where an application is running, but unable to make progress. Restarting a container in such a state can help to make the application more available despite having bugs.

The kubelet uses readiness probes to know when a container is ready to start accepting traffic. A pod is considered ready when all of its containers are ready. One use of this readiness signal is to control which Pods are used as backends for Kubernetes services. When a pod is not ready, it is removed from Kubernetes service load balancers.

When integrating with Kubernetes, the Dapr sidecar is injected with a Kubernetes probe configuration telling it to use the Dapr healthz endpoint. This is done by the `Sidecar Injector` system service. The integration with the kubelet  is shown in the diagram below. 

![mTLS System Services on Kubernetes](../../images/security-mTLS-dapr-system-services.png)

### How to configure a liveness probe in Kubernetes

In the pod configuration file, the liveness probe is added in the containers spec section as shown below :

```
 livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

In the above *example*, the `periodSeconds` field specifies that the kubelet should perform a liveness probe every 3 seconds. The `initialDelaySeconds` field tells the kubelet that it should wait 3 seconds before performing the first probe. To perform a probe, the kubelet sends an HTTP GET request to the server that is running in the container and listening on port 8080 in this example. If the handler for the server’s /healthz path returns a success code, the kubelet considers the container to be alive and healthy. If the handler returns a failure code, the kubelet kills the container and restarts it.

Any code greater than or equal to 200 and less than 400 indicates success. Any other code indicates failure.

### How to configure a readiness probe in Kubernetes

Readiness probes are configured similarly to liveness probes. The only difference is that you use the `readinessProbe` field instead of the `livenessProbe` field.

```
readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### How the Dapr sidecar health endpoint is configured with Kubernetes
As mentioned above, this configuration is done automatically by the Sidecar Injector service. This section describes the specific values that are set on the liveness and readiness probes.

Dapr has its HTTP health endpoint `/v1.0/healthz` on port 3500, This can be used with Kubernetes for readiness and liveness probe. When the Dapr sidecar is injected , the readiness and liveness probes are configured in the pod configuration file with the following values.

```
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

For more information refer to;

- [ Endpoint health API](../../reference/api/health_api.md)
- [Actor health API](../../reference/api/actors_api.md#health-check)
- [Kubernetes probe configuration parameters](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
