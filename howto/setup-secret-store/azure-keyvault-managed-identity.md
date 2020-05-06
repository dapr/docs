# Use Azure Key Vault secret store in Kubernetes mode using Managed Identities

This document shows how to enable Azure Key Vault secret store using [Dapr Secrets Component](../../concepts/secrets/README.md) for Kubernetes mode using Managed Identities to authenticate to a Key Vault.

## Contents

- [Prerequisites](#prerequisites)
- [Setup Kubernetes to use managed identities and Azure Key Vault](#setup-kubernetes-to-use-managed-identities-and-azure-key-vault)
- [Use Azure Key Vault secret store in Kubernetes mode with managed identities](#use-azure-key-vault-secret-store-in-kubernetes-mode-with-managed-identities)
- [References](#references)

## Prerequisites

* [Azure Subscription](https://azure.microsoft.com/en-us/free/)
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

## Setup Kubernetes to use Managed identities and Azure Key Vault

1. Login to Azure and set the default subscription

    ```bash
    # Log in Azure
    az login

    # Set your subscription to the default subscription
    az account set -s [your subscription id]
    ```

2. Create an Azure Key Vault in a region

    ```bash
    az keyvault create --location [region] --name [your keyvault] --resource-group [your resource group]
    ```

3. Create the managed identity

    ```bash
    $identity = az identity create -g [your resource group] -n [you managed identity name] -o json | ConvertFrom-Json
    ```

4. Assign the Reader role to the managed identity

    ```bash
    az role assignment create --role "Reader" --assignee $identity.principalId --scope /subscriptions/[your subscription id]/resourcegroups/[your resource group]
    ```

5. Assign the Managed Identity Operator role to the AKS Service Principal

    ```bash
    $aks = az aks show  -g [your resource group]  -n [your AKS name] -o json | ConvertFrom-Json

    az role assignment create  --role "Managed Identity Operator"  --assignee $aks.servicePrincipalProfile.clientId  --scope $identity.id
    ```

6. Add a policy to the Key Vault so the managed identity can read secrets

    ```bash
    az keyvault set-policy --name [your keyvault] --spn $identity.clientId --secret-permissions get list
    ```

7. Enable AAD Pod Identity on AKS

    ```bash
    kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment-rbac.yaml
    ```

8. Configure the Azure Identity and AzureIdentityBinding yaml

    Save the following yaml as azure-identity-config.yaml:

    ```yaml
    apiVersion: "aadpodidentity.k8s.io/v1"
    kind: AzureIdentity
    metadata:
      name: [you managed identity name]
    spec:
      type: 0
      ResourceID: [you managed identity id]
      ClientID: [you managed identity Client ID]
    ---
    apiVersion: "aadpodidentity.k8s.io/v1"
    kind: AzureIdentityBinding
    metadata:
      name: [you managed identity name]-identity-binding
    spec:
      AzureIdentity: [you managed identity name]
      Selector: [you managed identity selector]
    ```

9. Deploy the azure-identity-config.yaml:

    ```yaml
    kubectl apply -f azure-identity-config.yaml
    ```

## Use Azure Key Vault secret store in Kubernetes mode with managed identities

In Kubernetes mode, you store the certificate for the service principal into the Kubernetes Secret Store and then enable Azure Key Vault secret store with this certificate in Kubernetes secretstore.

1. Create azurekeyvault.yaml component file

    The component yaml uses the name of your key vault and the Cliend ID of the managed identity to setup the secret store.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
      namespace: default
    spec:
      type: secretstores.azure.keyvault
      metadata:
      - name: vaultName
        value: [your_keyvault_name]
      - name: spnClientId
        value: [your_managed_identity_client_id]
    ```

2. Apply azurekeyvault.yaml component

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

3. Store the redisPassword as a secret into your keyvault

    Now store the redisPassword as a secret into your keyvault

    ```bash
    az keyvault secret set --name redisPassword --vault-name [your_keyvault_name] --value "your redis passphrase"
    ```

4. Create redis.yaml state store component

    This redis state store component refers to `azurekeyvault` component as a secretstore and uses the secret for `redisPassword` stored in Azure Key Vault.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: statestore
      namespace: default
    spec:
      type: state.redis
      metadata:
      - name: redisHost
        value: "[redis_url]:6379"
      - name: redisPassword
        secretKeyRef:
          name: redisPassword
    auth:
        secretStore: azurekeyvault
    ```

5. Apply redis statestore component

    ```bash
    kubectl apply -f redis.yaml
    ```

6. Create node.yaml deployment

    ```yaml
    kind: Service
    apiVersion: v1
    metadata:
      name: nodeapp
      namespace: default
      labels:
        app: node
    spec:
      selector:
        app: node
      ports:
        - protocol: TCP
          port: 80
          targetPort: 3000
      type: LoadBalancer

    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nodeapp
      namespace: default
      labels:
        app: node
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: node
      template:
        metadata:
          labels:
            app: node
            aadpodidbinding: [you managed identity selector]
          annotations:
            dapr.io/enabled: "true"
            dapr.io/id: "nodeapp"
            dapr.io/port: "3000"
        spec:
          containers:
            - name: node
              image: dapriosamples/hello-k8s-node
              ports:
                - containerPort: 3000
              imagePullPolicy: Always

    ```

7. Apply the node app deployment

    ```bash
    kubectl apply -f redis.yaml
    ```

    Make sure that `secretstores.azure.keyvault` is loaded successfully in `daprd` sidecar log

    Here is the nodeapp log of the sidecar. Note: use the nodeapp name for your deployed container instance.

    ```bash
    $ kubectl logs $(kubectl get po --selector=app=node -o jsonpath='{.items[*].metadata.name}') daprd

    time="2020-02-05T09:15:03Z" level=info msg="starting Dapr Runtime -- version edge -- commit v0.3.0-rc.0-58-ge540a71-dirty"
    time="2020-02-05T09:15:03Z" level=info msg="log level set to: info"
    time="2020-02-05T09:15:03Z" level=info msg="kubernetes mode configured"
    time="2020-02-05T09:15:03Z" level=info msg="app id: nodeapp"
    time="2020-02-05T09:15:03Z" level=info msg="mTLS enabled. creating sidecar authenticator"
    time="2020-02-05T09:15:03Z" level=info msg="trust anchors extracted successfully"
    time="2020-02-05T09:15:03Z" level=info msg="authenticator created"
    time="2020-02-05T09:15:03Z" level=info msg="loaded component azurekeyvault (secretstores.azure.keyvault)"
    time="2020-02-05T09:15:04Z" level=info msg="loaded component statestore (state.redis)"
    ...
    2020-02-05 09:15:04.636348 I | redis: connecting to redis-master:6379
    2020-02-05 09:15:04.639435 I | redis: connected to redis-master:6379 (localAddr: 10.244.0.11:38294, remAddr: 10.0.74.145:6379)
    ...
    ```

## References

- [Azure CLI Keyvault CLI](https://docs.microsoft.com/en-us/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
- [Create an Azure service principal with Azure CLI](https://docs.microsoft.com/en-us/cli/azure/-reate-an-azure-service-principal-azure-cli?view=azure-cli-latest)
- [AAD Pod Identity](https://github.com/Azure/aad-pod-identity)
- [Secrets Component](../../concepts/secrets/README.md)
