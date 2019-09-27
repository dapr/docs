# Secret Store for Azure Key Vault

This document shows how to enable Azure Key Vault secret store using [Actions Secrets Component](../../concepts/components/secrets.md) for standalone and kubernetes mode. Actions secret store uses Service Principal using certificate authorization to authenticate Key Vault.

> **Note:** Managed Identity for Azure Key Vault is not currently supported.

## Contents

  - [Prerequisites](#prerequisites)
  - [Create Azure Key Vault and Service principal](#create-azure-key-vault-and-service-principal)
  - [Use Azure Key Vault secret store in Standalone mode](#use-azure-key-vault-secret-store-in-standalone-mode)
  - [Use Azure Key Vault secret store in Kubernetes mode](#use-azure-key-vault-secret-store-in-kubernetes-mode)
  - [References](#references)

## Prerequisites

* [Azure Subscription](https://azure.microsoft.com/en-us/free/)
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

## Create Azure Key Vault and service principal

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

3. Create service principal

Create service principal with new certificate and store new 1-year certificate inside [your keyvault]'s certificate vault.

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

4. Grant service principal the GET permission to Key Vault

```bash
az keyvault set-policy --name [your_keyvault] --object-id [your_service_principal_object_id] --secret-permissions get
```

Now, your service principal can access to keyvault

5. Download PFX cert from your Azure Keyvault

* **Using Azure Portal**
  Go to your keyvault on Portal and download [certificate_name] pfx cert from certificate vault
* **Using Azure CLI**
   For Linux/MacOS
   ```bash
   # Download base64 encoded cert
   az keyvault secret download --vault-name [your_keyvault] --name [certificate_name] --file [certificate_name].txt

   # Decode base64 encoded cert to pfx cert for linux/macos
   base64 --decode [certificate_name].txt > [certificate_name].pfx
   ```

   For Windows, on powershell
   ```powershell
   # Decode base64 encoded cert to pfx cert for linux/macos
   $EncodedText = Get-Content -Path [certificate_name].txt -Raw
   [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String($EncodedText)) | Set-Content -Path [certificate_name].pfx -Encoding Byte
   ```

## Use Azure Key Vault secret store in Standalone mode

This section walks you through how to enable an Azure Key Vault secret store to store a password to securely access a Redis state store in Standalone mode.

1. Create components directory in your app root

```bash
mkdir components
```

2. Copy downloaded PFX cert from your Azure Keyvault Certificate Vault into `./components` or the secure location in your local disk

3. Create a file called azurekeyvault.yaml in the components directory with the content below

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

5. Create redis.yaml in the components directory with the content below

This Redis component yaml shows how to use the `redisPassword` secret stored in an Azure Key Vault called `azurekeyvault` as a Redis connection password.

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

Make sure that secretstores.azure.keyvault component is loaded and that the Redis server successfully connects using the password retrieved from Azure Keyvault

Here is the log when we run.

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

In Kubernetes mode, you store the certificate for the service principal into the Kubernetes Secret Store and then enable Azure Key Vault secret store with this certificate in Kubernetes secretstore.

1. Create a kubernetes secret using the following command

* **[pfx_certificate_file_local_path]** is the path of PFX cert file you downloaded from [Create Azure Key Vault and Service principal](#create-azure-key-vault-and-service-principal)

* **[your_k8s_spn_secret_name]** is secret name in Kubernetes secret store

```bash
kubectl create secret generic [your_k8s_spn_secret_name] --from-file=[pfx_certificate_file_local_path]
```

2. Create azurekeyvault.yaml component file

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

3. Apply azurekeyvault.yaml component

```bash
kubectl apply -f azurekeyvault.yaml
```

4. Store the redisPassword as a secret into your keyvault

```bash
az keyvault secret set --name redisPassword --vault-name [your_keyvault_name] --value "your redis passphrase"
```

5. Create redis.yaml for state store component

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

6. Apply redis statestore component

  ```bash
  kubectl apply -f redis.yaml
  ```

7. Deploy your app to Kubernetes

Make sure that `secretstores.azure.keyvault` component is loaded successfully by looking at the log

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
