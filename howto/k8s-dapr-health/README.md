# Dapr Health

Dapr now provides a way to determine it's health using HTTP /healthz endpoint.
With that capability, Dapr process or side car can be probed for its readiness and liveness.

Refer Dapr for health API spec [here](../../reference/api/health_api.md)

In this document, you will read about readiness/liveness in Kubernetes and how the Dapr side car is
injected with that kubernetes probe configuration using the Dapr health endpoint.

## Kubernetes Liveness and Readiness

Kubernetes uses Readiness and Liveness probes to determines the health of the container.

The kubelet uses liveness probes to know when to restart a container.

For example, liveness probes could catch a deadlock, where an application is running, but unable to make progress. Restarting a container in such a state can help to make the application more available despite bugs.

The kubelet uses readiness probes to know when a container is ready to start accepting traffic.
A Pod is considered ready when all of its containers are ready. One use of this signal is to control which Pods are used as backends for Services. When a Pod is not ready, it is removed from Service load balancers.


### Configure Liveness probe in Kubernetes

In the Pod configuration file, liveness probe is added in the containers spec section as below :

```
 livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

In the above example, the periodSeconds field specifies that the kubelet should perform a liveness probe every 3 seconds. The initialDelaySeconds field tells the kubelet that it should wait 3 seconds before performing the first probe. To perform a probe, the kubelet sends an HTTP GET request to the server that is running in the container and listening on port 8080. If the handler for the server’s /healthz path returns a success code, the kubelet considers the container to be alive and healthy. If the handler returns a failure code, the kubelet kills the container and restarts it.

Any code greater than or equal to 200 and less than 400 indicates success. Any other code indicates failure.

### Configure Readiness probe in Kubernetes

Readiness probes are configured similarly to liveness probes. The only difference is that you use the readinessProbe field instead of the livenessProbe field.

```
readinessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 3
```

### Dapr Side Car Container Health with Kubernetes

As Dapr now has its HTTP health endpoint `/v1.0/healthz` port 3500 , this can be used with Kubernetes for readiness and liveness probe. When the Dapr side car is injected , the readiness and liveness probes are configured in the pod configuration file.

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

Please refer the above Dapr Kubernetes probe configuration parameters [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

