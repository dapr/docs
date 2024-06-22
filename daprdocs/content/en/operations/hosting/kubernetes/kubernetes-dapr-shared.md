---
type: docs
title: "Deploy Dapr per-node or per-cluster with Dapr Shared"
linkTitle: "Dapr Shared"
weight: 50000
description: "Learn more about using Dapr Shared as an alternative deployment to sidecars"

---

Dapr automatically injects a sidecar to enable the Dapr APIs for your applications for the best availability and reliability. 

Dapr Shared enables two alternative deployment strategies to create Dapr applications using a Kubernetes `Daemonset`for a per-node deployment or a`Deployment` for a per-cluster deployment. 

- **`DaemonSet`:** When specifying to run Dapr as a Kubernetes `DaemonSet` resource, the daprd container runs on each Kubernetes node. This can reduce network hops between the applications and Dapr. 
- **`Deployment`:** When running Dapr Shared as a Kubernetes `Deployment`, the Kubernetes scheduler decides in which node the Dapr Shared instance will run.

{{% alert title="Dapr Shared deployments" color="primary" %}}
For each Dapr application, you need to deploy the Dapr Shared chart using different `shared.appId`s.
{{% /alert %}}



## Why Dapr Shared?

By default, when Dapr is installed into a Kubernetes cluster, the Dapr control plane injects a Dapr as sidecar to applications annotated with Dapr annotations ( `dapr.io/enabled: "true"`). Sidecars have many advantages including improved resiliency since there is an instance per application and all communication between the application and the sidecar happens without involving the network.


<img src="/images/dapr-shared/sidecar.png" width=800 style="padding-bottom:15px;">

While sidecars are Dapr's default deployment strategy, some use cases require other approaches. Let's say you want to decouple the lifecycle of your workloads from the Dapr APIs. A typical example of this is functions, or function-as-a-service runtimes, which might automatically downscale your idle workloads to free up resources. For such cases, keeping the Dapr APIs and all the Dapr async functionalities (such as subscriptions) separate might be required. 

Dapr Shared was created for these scenario, extending the Dapr sidecar model with two new deployment approaches: `DaemonSet` and `Deployment`.

{{% alert title="Important" color="primary" %}}
No matter which strategy you choose, it is important to understand that in most use cases, you will have one instance of Dapr Shared (Helm release) per service (app-id). This means that if you have an application composed of three microservices, each service is recommended to have its own Dapr Shared instance. Check the step-by-step tutorial using Kubernetes KinD to see an application using Dapr Shared.
{{% /alert %}}


### `DeamonSet` strategy

With Kubernetes `DaemonSet`, you can define workloads that need to be deployed once per node in the cluster. This enables workloads that are running on the same node to communicate with local Dapr APIs, no matter where the Kubernetes `Scheduler` schedules your workload.

<img src="/images/dapr-shared/daemonset.png" width=800 style="padding-bottom:15px;">

{{% alert title="Note" color="primary" %}}
Since `DaemonSet` installs one instance per node, it consume more overall resources in your cluster when compared to the a`Deployment` for a per-cluster deployment.
{{% /alert %}}


### `Deployment` strategy

Kubernetes `Deployments` are installed once per cluster. Based on available resources, the Kubernetes `Scheduler` decides on which node the workload is scheduled. For Dapr Shared, this means that your workload and the Dapr instance might be located on separate nodes, which can introduce considerable network latency with the trade-off of reduce resource usage.

<img src="/images/dapr-shared/deployment.png" width=800 style="padding-bottom:15px;">

## Getting Started with Dapr Shared

{{% alert title="Prerequisites" color="primary" %}}
Before installing Dapr Shared, make ensure you have [Dapr installed in your cluster]({{< ref "kubernetes-deploy.md" >}}).
{{% /alert %}}

If you want to get started with Dapr Shared, you can create a new Dapr Shared instance by installing the official Helm Chart:

```
helm install my-shared-instance oci://registry-1.docker.io/daprio/dapr-shared-chart --set shared.appId=<DAPR_APP_ID> --set shared.remoteURL=<REMOTE_URL> --set shared.remotePort=<REMOTE_PORT> --set shared.strategy=deployment
```

Your Dapr-enabled applications can now make use of the Dapr Shared instance by pointing the Dapr SDKs to or sending request to the`my-shared-instance-dapr` Kubernetes service exposed by the Dapr Shared instance. Note that the`my-shared-instance` is the Helm Chart release name. 

If you are using the Dapr SDKs you can set the following environment variables for your application to connect to the Dapr Shared instance (in this case running on the `default` namespace): 

```
        env:
        - name: DAPR_HTTP_ENDPOINT
          value: http://my-shared-instance-dapr.default.svc.cluster.local:3500
        - name: DAPR_GRPC_ENDPOINT
          value: http://my-shared-instance-dapr.default.svc.cluster.local:50001 
```

If you are not using the SDKs you can send HTTP or gRCP requests to those endpoints. 

## Next steps

Check the [`Hello Kubernetes with Dapr Shared`](https://github.com/dapr/dapr-shared/blob/main/docs/tutorial/README.md) tutorial.
