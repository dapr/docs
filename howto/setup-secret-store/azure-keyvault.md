# Secret Store for Azure Key Vault

This document shows how to enable Azure Key Vault secret store using [Actions Secrets Component](../../concepts/components/secrets.md) for standalone and kubernetes mode. Actions secret store uses Service Principal using certificate authorization to authenticate Key Vault. 

> **Note:** The Managed Service Identity for Azure Key Vault is not supported now.

## Contents

  - [Prerequisites](#prerequisites)
  - [Create Azure Key Vault and Service principal](#create-azure-key-vault-and-service-principal)
  - [Use Azure Key Vault secret store in Standalone mode](#use-azure-key-vault-secret-store-in-standalone-mode)
  - [Use Azure Key Vault secret store in Kubernetes mode](#use-azure-key-vault-secret-store-in-kubernetes-mode)
  - [References](#references)

## Prerequisites

* [Azure Subscription]()
* [Azure CLI]()

## Create Azure Key Vault and Service principal

This creates new service principal and grants it the permission to keyvault.

1. Login Azure and Set default subscription

```bash
# Log in Azure
az login

# Set your subscription to the default subscription
az account set -s [your subscription id]
```

2. Create Key Vault

```bash
az keyvault create --location westus2 --name [your_keyvault] --resource-group [your resource group]
```

3. Create Service Principal

Create Service Principal with new certificate and store new 1-year certificate inside [your keyvault]'s certificate vault.

```bash
az ad sp create-for-rbac --name [your_service_principal_name] --create-cert --cert [certificate_name] --keyvault [your_keyvault] --skip-assignment --years 1

{
  "appId": "a4f90000-0000-0000-0000-00000011d000",
  "displayName": "[your_service_principal_name]",
  "name": "http://[your_service_principal_name]",
  "password": null,
  "tenant": "34f90000-0000-0000-0000-00000011d000"
}
```

**Get appId and tenant which will be used for the next step**

> **Note** you can skip this step if you want to use your existing service principal for keyvault instead of creating new one

3. Get Object Id for [your_service_principal_name]

```bash
az ad sp show --id [service_principal_app_id]

{
    ...
    "objectId": "[your_service_principal_object_id]",
    "objectType": "ServicePrincipal",
    ...
}
```

4. Grant Service Principal the GET permission to Key Vault

```bash
az keyvault set-policy --name actions-sample-vault --object-id [your_service_principal_object_id] --secret-permissions get
```

Now, your service principal can access to keyvault

## Use Azure Key Vault secret store in Standalone mode

This section walks through how to enable Azure Key Vault secret store and Redis state store in Standalone mode.

1. Create components directory in your app root

```bash
mkdir components
```

2. Download PFX cert from your Azure Portal Keyvault Certificate Vault into `./components` or the secure location in your local disk

3. Create azurekeyvault.yaml in components

```yaml
apiVersion: actions.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  metadata:
  - name: vaultName
    value: [your_keyvault_name]
  - name: spnTenantId
    value: "[your_service_principal_tenant_id]"
  - name: spnClientId
    value: "[your_service_principal_app_id]"
  - name: spnCertificateFile
    value : "[pfx_certificate_file_local_path]"
```

4. Store redisPassword secret to keyvault

```bash
az keyvault secret set --name redisPassword --vault-name [your_keyvault_name] --value "your redis passphrase"
```

5. Create redis.yaml

This Redis component Yaml enables using `redisPassword` secret in Azure Key Vault as a Redis connection password.

```yaml
apiVersion: actions.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: "[redis]:6379"
  - name: redisPassword
    secretKeyRef:
      name: redisPassword
auth:
    secretStore: azurekeyvault
```

6. Run your app

Make sure that `secretstores.azure.keyvault` is loaded and redis server is connected successfully.

Here is the log when we run [HelloWorld sample](https://github.com/actionscore/actions/tree/master/samples/1.hello-world) with Azure Key Vault secret store.

```bash
$ actions run --app-id mynode --app-port 3000 --port 3500 node app.js

ℹ️  Starting Actions with id mynode on port 3500
✅  You're up and running! Both Actions and your app logs will appear here.

...
== ACTIONS == time="2019-09-25T17:57:37-07:00" level=info msg="loaded component azurekeyvault (secretstores.azure.keyvault)"
== APP == Node App listening on port 3000!
== ACTIONS == time="2019-09-25T17:57:38-07:00" level=info msg="loaded component statestore (state.redis)"
== ACTIONS == time="2019-09-25T17:57:38-07:00" level=info msg="loaded component messagebus (pubsub.redis)"
...
== ACTIONS == 2019/09/25 17:57:38 redis: connecting to [redis]:6379
== ACTIONS == 2019/09/25 17:57:38 redis: connected to [redis]:6379 (localAddr: x.x.x.x:62137, remAddr: x.x.x.x:6379)
...
```

## Use Azure Key Vault secret store in Kubernetes mode

In Kubernetes mode, we will store the certificate for Service Principal into Kubernetes Secret Store and enable Azure Key Vault secret store with this certificate in Kubernetes secretstore.

1. Download PFX cert from your Azure Portal Keyvault Certificate Vault

2. Add secret to kubernetes secret store

```bash
kubectl create secret generic [your_k8s_spn_secret_name] --from-file=[pfx_certificate_file_local_path]
```

3. Create azurekeyvault.yaml component file

Component yaml refers to Kubernetes secretstore using `auth` property and use `secretKeyRef` to refer to the certificate stored in Kubernetes secret store.

```yaml
apiVersion: actions.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  metadata:
  - name: vaultName
    value: [your_keyvault_name]
  - name: spnTenantId
    value: "[your_service_principal_tenant_id]"
  - name: spnClientId
    value: "[your_service_principal_app_id]"
  - name: spnCertificate
    secretKeyRef:
      name: [your_k8s_spn_secret_name]
      key: [pfx_certficiate_file_local_name]
auth:
    secretStore: kubernetes
```

4. Apply azurekeyvault.yaml component

```bash
kubectl apply -f azurekeyvault.yaml
```

5. Store redisPassword secret to keyvault

```bash
az keyvault secret set --name redisPassword --vault-name [your_keyvault_name] --value "your redis passphrase"
```

6. Create redis.yaml

This redis state store component refers to `azurekeyvult` component as a secretstore and use the secret for `redisPassword` stored in Key Vault.

```yaml
apiVersion: actions.io/v1alpha1
kind: Component
metadata:
  name: statestore
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

7. Apply redis statestore component

  ```bash
  kubectl apply -f redis.yaml
  ```

8. Deploy your app to Kubernetes

Make sure that `secretstores.azure.keyvault` are loaded successfully in sidecar log

Here is the nodeapp sidecar log of [HelloWorld Kubernetes sample](https://github.com/actionscore/actions/tree/master/samples/2.hello-kubernetes).

```bash
$ kubectl logs nodeapp-f7b7576f4-4pjrj actionsrt

time="2019-09-26T20:34:23Z" level=info msg="starting Actions Runtime -- version 0.4.0-alpha.4 -- commit 876474b-dirty"
time="2019-09-26T20:34:23Z" level=info msg="log level set to: info"
time="2019-09-26T20:34:23Z" level=info msg="kubernetes mode configured"
time="2019-09-26T20:34:23Z" level=info msg="action id: nodeapp"
time="2019-09-26T20:34:24Z" level=info msg="loaded component azurekeyvault (secretstores.azure.keyvault)"
time="2019-09-26T20:34:25Z" level=info msg="loaded component statestore (state.redis)"
...
2019/09/26 20:34:25 redis: connecting to redis-master:6379
2019/09/26 20:34:25 redis: connected to redis-master:6379 (localAddr: 10.244.3.67:42686, remAddr: 10.0.1.26:6379)
...
```

## References

* [Azure CLI Keyvault CLI](https://docs.microsoft.com/en-us/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
* [Create an Azure service principal with Azure CLI](https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli?view=azure-cli-latest)
* [Secrets Component](../../concepts/components/secrets.md)
