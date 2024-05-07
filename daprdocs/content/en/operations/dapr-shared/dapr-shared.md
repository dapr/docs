---
type: docs
title: "Dapr Shared"
linkTitle: "Dapr Shared"
weight: 20000
description: "Learn more about using Dapr Shared as an alternative deployment strategy"

---

By default, Dapr automatically injects a sidecar to enable the Dapr APIs for your applications. However, using sidecars might not be optimal for your specific use case. 

Dapr Shared enables different deployment strategies to create Dapr applications using Kubernetes `Daemonset` or `Deployment`. 

- **`DaemonSet`:** When running daprd as a Kubernetes `DaemonSet` resource, the daprd container runs in each Kubernetes node, reducing network hops between the applications and Dapr. 
- **`Deployment`:** When running Dapr Shared as a Kubernetes `Deployment`, the Kubernetes scheduler decides in which node the Dapr Shared instance will run.

{{% alert title="Dapr Shared deployments" color="primary" %}}
For each Dapr application, you need to deploy the Dapr Shared chart using different `shared.appId`s.
{{% /alert %}}




## Why Dapr Shared?

By default, when Dapr is installed into a Kubernetes Cluster, the Dapr Control Plane is in charge of injecting the daprd sidecar to workloads annotated with Dapr annotations (`dapr.io/enabled: "true"`). This mechanism delegates the responsibility of defining which workloads will be interacting with the Dapr APIs to the team in charge of deploying and configuring these workloads. Sidecars had the advantage of being co-located with your applications, so all communication between the application and the sidecar happens without involving the network.


<img src="/images/dapr-shared/sidecar.png" width=800 style="padding-bottom:15px;">

While sidecars are Dapr's default deployment strategy, some use cases require other approaches. Let's say you want to decouple the lifecycle of your workloads from the Dapr APIs. A typical example of this is functions, or function-as-a-service runtimes, which might automatically downscale your idle workloads to free up resources. For such cases, keeping the Dapr APIs and all the Dapr async functionalities (such as subscriptions) separate might be required. 

Dapr Shared was created exactly for this kind of scenario, extending the Dapr sidecar model with two new deployment strategies: `DaemonSet` and `Deployment`.

No matter which strategy you choose, it is important to understand that in most use cases you will have one instance of Dapr Shared (Helm Release) per service (app-id). This means that if you have an application composed by three microservices, each service is recommended to have it's own Dapr Shared instance. Check the step-by-step tutorial using Kubernetes KinD here, to see an application using Dapr Shared.


### `DeamonSet` strategy

With Kubernetes `DaemonSet`, you can define workloads that need to be deployed once per node in the cluster. This enables workloads that are running in the same node to communicate with local daprd APIs, no matter where the Kubernetes `Scheduler` schedules your workload.

<img src="/images/dapr-shared/daemonset.png" width=800 style="padding-bottom:15px;">

{{% alert title="Note" color="primary" %}}
Since `DaemonSet` installs one instance per node, it will consume more overall resources in your cluster.
{{% /alert %}}


### `Deployment` strategy

Kubernetes `Deployments` are installed once per cluster. Based on available resources, the Kubernetes `Scheduler` decides in which node the workload will be scheduled. For Dapr Shared, this means that your workload and the daprd instance might be located in separate nodes, which can introduce considerable network latency.

<img src="/images/dapr-shared/deployment.png" width=800 style="padding-bottom:15px;">

## Getting Started with Dapr Shared

{{% alert title="Prerequisites" color="primary" %}}
Before installing Dapr Shared, make sure you have [Dapr installed in your cluster]({{< ref "kubernetes-deploy.md" >}}).
{{% /alert %}}

If you want to get started with Dapr Shared, you can easily create a new Dapr Shared instance by installing the official Helm Chart:

```
helm install my-shared-instance oci://registry-1.docker.io/daprio/dapr-shared-chart --set shared.appId=<DAPR_APP_ID> --set shared.remoteURL=<REMOTE_URL> --set shared.remotePort=<REMOTE_PORT>
```
## Next steps
