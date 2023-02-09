---
type: docs
title: "Azure Event Grid binding spec"
linkTitle: "Azure Event Grid"
description: "Detailed documentation on the Azure Event Grid binding component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/eventgrid/"
---

## Component format

To setup an Azure Event Grid binding create a component of type `bindings.azure.eventgrid`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

See [this](https://docs.microsoft.com/azure/event-grid/) for the documentation for Azure Event Grid.

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <name>
spec:
  type: bindings.azure.eventgrid
  version: v1
  metadata:
  # Required Output Binding Metadata
  - name: accessKey
    value: "[AccessKey]"
  - name: topicEndpoint
    value: "[TopicEndpoint]"
  # Required Input Binding Metadata
  - name: azureTenantId
    value: "[AzureTenantId]"
  - name: azureSubscriptionId
    value: "[AzureSubscriptionId]"
  - name: azureClientId
    value: "[ClientId]"
  - name: azureClientSecret
    value: "[ClientSecret]"
  - name: subscriberEndpoint
    value: "[SubscriberEndpoint]"
  - name: handshakePort
    # Make sure to pass this as a string, with quotes around the value
    value: "[HandshakePort]"
  - name: scope
    value: "[Scope]"
  # Optional Input Binding Metadata
  - name: eventSubscriptionName
    value: "[EventSubscriptionName]"
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|------------|-----|---------|
| `accessKey` | Y | Output | The Access Key to be used for publishing an Event Grid Event to a custom topic | `"accessKey"` |
| `topicEndpoint` | Y | Output | The topic endpoint in which this output binding should publish events | `"topic-endpoint"` |
| `azureTenantId` | Y | Input | The Azure tenant ID of the Event Grid resource  | `"tenentID"` |
| `azureSubscriptionId` | Y | Input | The Azure subscription ID of the Event Grid resource  | `"subscriptionId"` |
| `azureClientId` | Y | Input | The client ID that should be used by the binding to create or update the Event Grid Event Subscription and to authenticate incoming messages | `"clientId"` |
| `azureClientSecret` | Y | Input | The client id that should be used by the binding to create or update the Event Grid Event Subscription and to authenticate incoming messages | `"clientSecret"` |
| `subscriberEndpoint` | Y | Input | The HTTPS endpoint of the webhook Event Grid sends events (formatted as Cloud Events) to. If you're not re-writing URLs on ingress, it should be in the form of: `"https://[YOUR HOSTNAME]/<path>"`<br/>If testing on your local machine, you can use something like [ngrok](https://ngrok.com) to create a public endpoint. | `"https://[YOUR HOSTNAME]/<path>"` |
| `handshakePort` | Y | Input | The container port that the input binding listens on when receiving events on the webhook | `"9000"` |
| `scope` | Y | Input | The identifier of the resource to which the event subscription needs to be created or updated. See the [scope section](#scope) for more details | `"/subscriptions/{subscriptionId}/"` |
| `eventSubscriptionName` | N | Input | The name of the event subscription. Event subscription names must be between 3 and 64 characters long and should use alphanumeric letters only | `"name"` |

### Scope

Scope is the identifier of the resource to which the event subscription needs to be created or updated. The scope can be a subscription, a resource group, a top-level resource belonging to a resource provider namespace, or an Event Grid topic. For example:

- `/subscriptions/{subscriptionId}/` for a subscription
- `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}` for a resource group
- `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceType}/{resourceName}` for a resource
- `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventGrid/topics/{topicName}` for an Event Grid topic

> Values in braces {} should be replaced with actual values.

## Binding support

This component supports both **input and output** binding interfaces.

This component supports **output binding** with the following operations:

- `create`: publishes a message on the Event Grid topic

## Azure AD credentials

The Azure Event Grid binding requires an Azure AD application and service principal for two reasons:

- Creating an [event subscription](https://docs.microsoft.com/azure/event-grid/concepts#event-subscriptions) when Dapr is started (and updating it if the Dapr configuration changes)
- Authenticating messages delivered by Event Hubs to your application.

Requirements:

- The [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) installed.
- [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell) installed.
- [Az module for PowerShell](https://learn.microsoft.com/powershell/azure/install-az-ps) for PowerShell installed:  
  `Install-Module Az -Scope CurrentUser -Repository PSGallery -Force`
- [Microsoft.Graph module for PowerShell](https://learn.microsoft.com/powershell/microsoftgraph/installation) for PowerShell installed:  
  `Install-Module Microsoft.Graph -Scope CurrentUser -Repository PSGallery -Force`

For the first purpose, you will need to [create an Azure Service Principal](https://learn.microsoft.com/azure/active-directory/develop/howto-create-service-principal-portal). After creating it, take note of the Azure AD application's **clientID** (a UUID), and run the following script with the Azure CLI:

```bash
# Set the client ID of the app you created
CLIENT_ID="..."
# Scope of the resource, usually in the format:
# `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.EventGrid/topics/{topicName}`
SCOPE="..."

# First ensure that Azure Resource Manager provider is registered for Event Grid
az provider register --namespace "Microsoft.EventGrid"
az provider show --namespace "Microsoft.EventGrid" --query "registrationState"
# Give the SP needed permissions so that it can create event subscriptions to Event Grid
az role assignment create --assignee "$CLIENT_ID" --role "EventGrid EventSubscription Contributor" --scopes "$SCOPE"
```

For the second purpose, first download a script:

```sh
curl -LO "https://raw.githubusercontent.com/dapr/components-contrib/master/.github/infrastructure/conformance/azure/setup-eventgrid-sp.ps1"
```

Then, **using PowerShell** (`pwsh`), run:

```powershell
# Set the client ID of the app you created
$clientId = "..."

# Authenticate with the Microsoft Graph
# You may need to add the -TenantId flag to the next command if needed
Connect-MgGraph -Scopes "Application.Read.All","Application.ReadWrite.All"
./setup-eventgrid-sp.ps1 $clientId
```

> Note: if your directory does not have a Service Principal for the application "Microsoft.EventGrid", you may need to run the command `Connect-MgGraph` and sign in as an admin for the Azure AD tenant (this is related to permissions on the Azure AD directory, and not the Azure subscription). Otherwise, please ask your tenant's admin to sign in and run this PowerShell command: `New-MgServicePrincipal -AppId "4962773b-9cdb-44cf-a8bf-237846a00ab7"` (the UUID is a constant)

### Testing locally

- Install [ngrok](https://ngrok.com/download)
- Run locally using a custom port, for example `9000`, for handshakes

```bash
# Using port 9000 as an example
ngrok http --host-header=localhost 9000
```

- Configure the ngrok's HTTPS endpoint and the custom port to input binding metadata
- Run Dapr

```bash
# Using default ports for .NET core web api and Dapr as an example
dapr run --app-id dotnetwebapi --app-port 5000 --dapr-http-port 3500 dotnet run
```

### Testing on Kubernetes

Azure Event Grid requires a valid HTTPS endpoint for custom webhooks; self-signed certificates aren't accepted. In order to enable traffic from the public internet to your app's Dapr sidecar you need an ingress controller enabled with Dapr. There's a good article on this topic: [Kubernetes NGINX ingress controller with Dapr](https://carlos.mendible.com/2020/04/05/kubernetes-nginx-ingress-controller-with-dapr/).

To get started, first create a `dapr-annotations.yaml` file for Dapr annotations:

```yaml
controller:
  podAnnotations:
    dapr.io/enabled: "true"
    dapr.io/app-id: "nginx-ingress"
    dapr.io/app-port: "80"
```

Then install the NGINX ingress controller to your Kubernetes cluster with Helm 3 using the annotations:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx -f ./dapr-annotations.yaml -n default
# Get the public IP for the ingress controller
kubectl get svc -l component=controller -o jsonpath='Public IP is: {.items[0].status.loadBalancer.ingress[0].ip}{"\n"}'
```

If deploying to Azure Kubernetes Service, you can follow [the official Microsoft documentation for rest of the steps](https://docs.microsoft.com/azure/aks/ingress-tls):

- Add an A record to your DNS zone
- Install cert-manager
- Create a CA cluster issuer

Final step for enabling communication between Event Grid and Dapr is to define `http` and custom port to your app's service and an `ingress` in Kubernetes. This example uses a .NET Core web api and Dapr default ports and custom port 9000 for handshakes.

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

Deploy the binding and app (including ingress) to Kubernetes

```bash
# Deploy Dapr components
kubectl apply -f eventgrid.yaml
# Deploy your app and Nginx ingress
kubectl apply -f dotnetwebapi.yaml
```

> **Note:** This manifest deploys everything to Kubernetes' default namespace.

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
