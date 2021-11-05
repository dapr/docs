---
type: docs
title: "Azure Event Grid binding spec"
linkTitle: "Azure Event Grid"
description: "Detailed documentation on the Azure Event Grid binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/eventgrid/"
---

## Component format

To setup Azure Event Grid binding create a component of type `bindings.azure.eventgrid`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://docs.microsoft.com/azure/event-grid/) for Azure Event Grid documentation.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.eventgrid
  version: v1
  metadata:
  # Required Input Binding Metadata
  - name: tenantId
    value: "[AzureTenantId]"
  - name: subscriptionId
    value: "[AzureSubscriptionId]"
  - name: clientId
    value: "[ClientId]"
  - name: clientSecret
    value: "[ClientSecret]"
  - name: subscriberEndpoint
    value: "[SubscriberEndpoint]"
  - name: handshakePort
    value: [HandshakePort]
  - name: scope
    value: "[Scope]"
  # Optional Input Binding Metadata
  - name: eventSubscriptionName
    value: "[EventSubscriptionName]"
  # Required Output Binding Metadata
  - name: accessKey
    value: "[AccessKey]"
  - name: topicEndpoint
    value: "[TopicEndpoint]
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| tenantId | Y | Input | The Azure tenant id in which this Event Grid Event Subscription should be created | `"tenentID"` |
| subscriptionId | Y | Input | The Azure subscription id in which this Event Grid Event Subscription should be created | `"subscriptionId"` |
| clientId | Y | Input | The client id that should be used by the binding to create or update the Event Grid Event Subscription | `"clientId"` |
| clientSecret | Y | Input | The client id that should be used by the binding to create or update the Event Grid Event Subscription | `"clientSecret"` |
| subscriberEndpoint | Y | Input | The https endpoint in which Event Grid will handshake and send Cloud Events. If you aren't re-writing URLs on ingress, it should be in the form of: `https://[YOUR HOSTNAME]/api/events` If testing on your local machine, you can use something like [ngrok](https://ngrok.com) to create a public endpoint. | `"https://[YOUR HOSTNAME]/api/events"` |
| handshakePort | Y | Input | The container port that the input binding will listen on for handshakes and events | `"9000"` |
| scope | Y | Input | The identifier of the resource to which the event subscription needs to be created or updated. See [here](#scope) for more details | `"/subscriptions/{subscriptionId}/"` |
| eventSubscriptionName | N | Input | The name of the event subscription. Event subscription names must be between 3 and 64 characters in length and should use alphanumeric letters only | `"name"` |
| accessKey | Y | Output | The Access Key to be used for publishing an Event Grid Event to a custom topic | `"accessKey"` |
| topicEndpoint | Y | Output | The topic endpoint in which this output binding should publish events | `"topic-endpoint"` |

### Scope

Scope is the identifier of the resource to which the event subscription needs to be created or updated. The scope can be a subscription, or a resource group, or a top level resource belonging to a resource provider namespace, or an Event Grid topic. For example:
- `'/subscriptions/{subscriptionId}/'` for a subscription
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}'` for a resource group
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceType}/{resourceName}'` for a resource
- `'/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventGrid/topics/{topicName}'` for an Event Grid topic
> Values in braces {} should be replaced with actual values.
## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`
## Additional information

Event Grid Binding creates an [event subscription](https://docs.microsoft.com/azure/event-grid/concepts#event-subscriptions) when Dapr initializes. Your Service Principal needs to have the RBAC permissions to enable this.

```bash
# First ensure that Azure Resource Manager provider is registered for Event Grid
az provider register --namespace Microsoft.EventGrid
az provider show --namespace Microsoft.EventGrid --query "registrationState"
# Give the SP needed permissions so that it can create event subscriptions to Event Grid
az role assignment create --assignee <clientId> --role "EventGrid EventSubscription Contributor" --scopes <scope>
```

_Make sure to also to add quotes around the `[HandshakePort]` in your Event Grid binding component because Kubernetes expects string values from the config._

### Testing locally

- Install [ngrok](https://ngrok.com/download)
- Run locally using custom port `9000` for handshakes

```bash
# Using random port 9000 as an example
ngrok http -host-header=localhost 9000
```

- Configure the ngrok's HTTPS endpoint and custom port to input binding metadata
- Run Dapr

```bash
# Using default ports for .NET core web api and Dapr as an example
dapr run --app-id dotnetwebapi --app-port 5000 --dapr-http-port 3500 dotnet run
```

### Testing on Kubernetes

Azure Event Grid requires a valid HTTPS endpoint for custom webhooks. Self signed certificates won't do. In order to enable traffic from public internet to your app's Dapr sidecar you need an ingress controller enabled with Dapr. There's a good article on this topic: [Kubernetes NGINX ingress controller with Dapr](https://carlos.mendible.com/2020/04/05/kubernetes-nginx-ingress-controller-with-dapr/).

To get started, first create `dapr-annotations.yaml` for Dapr annotations

```yaml
controller:
    podAnnotations:
      dapr.io/enabled: "true"
      dapr.io/app-id: "nginx-ingress"
      dapr.io/app-port: "80"
```

Then install NGINX ingress controller to your Kubernetes cluster with Helm 3 using the annotations

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx -f ./dapr-annotations.yaml -n default
# Get the public IP for the ingress controller
kubectl get svc -l component=controller -o jsonpath='Public IP is: {.items[0].status.loadBalancer.ingress[0].ip}{"\n"}'
```

If deploying to Azure Kubernetes Service, you can follow [the official MS documentation for rest of the steps](https://docs.microsoft.com/azure/aks/ingress-tls)
- Add an A record to your DNS zone
- Install cert-manager
- Create a CA cluster issuer

Final step for enabling communication between Event Grid and Dapr is to define `http` and custom port to your app's service and an `ingress` in Kubernetes. This example uses .NET Core web api and Dapr default ports and custom port 9000 for handshakes.

```yaml
# dotnetwebapi.yaml
kind: Service
apiVersion: v1
metadata:
  name: dotnetwebapi
  labels:
    app: dotnetwebapi
spec:
  selector:
    app: dotnetwebapi
  ports:
    - name: webapi
      protocol: TCP
      port: 80
      targetPort: 80
    - name: dapr-eventgrid
      protocol: TCP
      port: 9000
      targetPort: 9000
  type: ClusterIP

---
  apiVersion: extensions/v1beta1
  kind: Ingress
  metadata:
    name: eventgrid-input-rule
    annotations:
      kubernetes.io/ingress.class: nginx
      cert-manager.io/cluster-issuer: letsencrypt
  spec:
    tls:
      - hosts:
        - dapr.<your custom domain>
        secretName: dapr-tls
    rules:
      - host: dapr.<your custom domain>
        http:
          paths:
            - path: /api/events
              backend:
                serviceName: dotnetwebapi
                servicePort: 9000

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dotnetwebapi
  labels:
    app: dotnetwebapi
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dotnetwebapi
  template:
    metadata:
      labels:
        app: dotnetwebapi
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "dotnetwebapi"
        dapr.io/app-port: "5000"
    spec:
      containers:
      - name: webapi
        image: <your container image>
        ports:
        - containerPort: 5000
        imagePullPolicy: Always
```

Deploy binding and app (including ingress) to Kubernetes

```bash
# Deploy Dapr components
kubectl apply -f eventgrid.yaml
# Deploy your app and Nginx ingress
kubectl apply -f dotnetwebapi.yaml
```

> **Note:** This manifest deploys everything to Kubernetes default namespace.

#### Troubleshooting possible issues with Nginx controller

After initial deployment the "Daprized" Nginx controller can malfunction. To check logs and fix issue (if it exists) follow these steps.

```bash
$ kubectl get pods -l app=nginx-ingress

NAME                                                   READY   STATUS    RESTARTS   AGE
nginx-nginx-ingress-controller-649df94867-fp6mg        2/2     Running   0          51m
nginx-nginx-ingress-default-backend-6d96c457f6-4nbj5   1/1     Running   0          55m

$ kubectl logs nginx-nginx-ingress-controller-649df94867-fp6mg nginx-ingress-controller

# If you see 503s logged from calls to webhook endpoint '/api/events' restart the pod
# .."OPTIONS /api/events HTTP/1.1" 503..

$ kubectl delete pod nginx-nginx-ingress-controller-649df94867-fp6mg

# Check the logs again - it should start returning 200
# .."OPTIONS /api/events HTTP/1.1" 200..
```

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
