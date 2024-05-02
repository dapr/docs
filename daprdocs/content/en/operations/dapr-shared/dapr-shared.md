---
type: docs
title: "Different Deployment Strategies (Dapr Shared)"
linkTitle: "Dapr Shared"
weight: 20000
description: "Learn more about using other deployment strategies for Dapr"

---

By default, Dapr automatically injects a sidecar to enable the Dapr APIs for your applications. However, using sidecars might not be optimal for your specific use case. 

Dapr Shared enables different deployment strategies to create Dapr applications using Kubernetes `Daemonset` or `Deployment`. 

By running daprd as a Kubernetes `DaemonSet` resource, the daprd container will be running in each Kubernetes Node, reducing the network hops between the applications and Dapr. You can also choose to run Dapr Shared as a Kubernetes `Deployment`, in which case, the Kubernetes scheduler will decide in which node the Dapr Shared instance will run.

{{% alert title="Dapr Shared deployments" color="primary" %}}
For each Dapr Application, you need to deploy the Dapr Shared chart using different `shared.appId`s.
{{% /alert %}}




## Why Dapr Shared?

By default, when Dapr is installed into a Kubernetes Cluster, the Dapr Control Plane is in charge of injecting the daprd sidecar to workloads annotated with Dapr annotations (`dapr.io/enabled: "true"`). This mechanism delegates the responsibility of defining which workloads will be interacting with the Dapr APIs to the team in charge of deploying and configuring these workloads. Sidecars had the advantage of being co-located with your applications, so all communication between the application and the sidecar happens without involving the network.


<img src="/images/dapr-shared/sidecar.png" width=800 style="padding-bottom:15px;">

While sidecars are the default strategy, there are some use cases that require other approaches. For example, you want to decouple the lifecycle of your workloads from the Dapr APIs. A typical example of this is Functions, or function as a service runtimes, which might automatically downscale your idle workloads to free up resources. For such cases, keeping the Dapr APIs and all the Dapr async functionalities (such as subscriptions) might be required. Dapr Shared was created exactly for this kind of scenario.

Dapr Shared extends the Dapr sidecar model with two new deployment strategies: DaemonSet and Deployment.

No matter which strategy you choose, it is important to understand that in most use cases you will have one instance of Dapr Shared (Helm Release) per service (app-id). This means that if you have an application composed by three microservices, each service is recommended to have it's own Dapr Shared instance. Check the step-by-step tutorial using Kubernetes KinD here, to see an application using Dapr Shared.


### Dapr Shared: DeamonSet strategy

Kubernetes `DaemonSets` allows you to define workloads that need to be deployed once per node in the cluster. This enables workloads that are running in the same node to communicate with local daprd APIs, no matter where the `Kubernetes Scheduler` schedules your workload.

<img src="/images/dapr-shared/daemonset.png" width=800 style="padding-bottom:15px;">

{{% alert title="Dapr Shared DaemonSet resources" color="primary" %}}
Note that DaemonSet, because it installs one instance per node, will consume more overall resources in your cluster.
{{% /alert %}}


### Dapr Shared: Deployment strategy

Kubernetes Deployments in the other hand, are installed once per cluster and the Kubernetes Scheduler decides, based on available resources, in which node the workload will be scheduled. For Dapr Shared, this means that your workload and the daprd instance might be located in separate nodes, which can introduce considerable network latency.

<img src="/images/dapr-shared/deployment.png" width=800 style="padding-bottom:15px;">

## Getting Started with Dapr Shared

{{% alert title="Install Dapr before using Dapr Shared" color="primary" %}}
Before installing Dapr Shared, please ensure you have Dapr installed in your cluster.
{{% /alert %}}

If you want to get started with Dapr Shared, you can easily create a new Dapr Shared instance by installing the official Helm Chart:

```
helm install my-shared-instance oci://registry-1.docker.io/daprio/dapr-shared-chart --set shared.appId=<DAPR_APP_ID> --set shared.remoteURL=<REMOTE_URL> --set shared.remotePort=<REMOTE_PORT>
```

