# Configuring the Dapr sidecar on Kubernetes

On Kubernetes, Dapr uses a sidecar injector pod that automatically injects the Dapr sidecar container into a pod that has the correct annotations.
The sidecar injector is an implementation of a Kubernetes [Admission Controller](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/). 

The following table shows all the supported pod Spec annotations supported by Dapr.

| Annotation          | Description 
| ----------------------------------- | -------------- |
| `dapr.io/enabled`   | Setting this paramater to `true` injects the Dapr sidecar into the pod
| `dapr.io/port`   | This parameter tells Dapr which port your application is listening on
| `dapr.io/id`   | The unique ID of the application. Used for service discovery, state encapsulation and the pub/sub consumer ID
| `dapr.io/log-level`   | Sets the log level for the Dapr sidecar. Allowed values are `debug`, `info`, `warn`, `error`. Default is `info`
| `dapr.io/config`   | Tells Dapr which Configuration CRD to use
| `dapr.io/log-as-json`   | Setting this parameter to `true` outputs logs in JSON format. Default is `false`
| `dapr.io/profiling`   | Setting this paramater to `true` starts the Dapr profiling server on port `7777`. Default is `false`
| `dapr.io/protocol`   | Tells Dapr which protocol your application is using. Valid options are `http` and `grpc`. Default is `http`
| `dapr.io/max-concurrency`   | Limit the concurrency of your application. A valid value is any number larger than `0`
| `dapr.io/metrics-port`   | Sets the port for the sidecar metrics server. Default is `9090`
| `dapr.io/sidecar-cpu-limit`   | Maximum amount of CPU that the Dapr sidecar can use. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set
| `dapr.io/sidecar-memory-limit`   | Maximum amount of Memory that the Dapr sidecar can use. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set
| `dapr.io/sidecar-cpu-request`   | Amount of CPU that the Dapr sidecar requests. See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set
| `dapr.io/sidecar-memory-request`   | Amount of Memory that the Dapr sidecar requests .See valid values [here](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/). By default this is not set
