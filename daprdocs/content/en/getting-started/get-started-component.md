---
type: docs
title: "Define a component"
linkTitle: "Define a component"
weight: 40
---

After familiarizing yourself with the Dapr HTTP API and state building block in the previous step, you will now create your first Dapr component to try out the [secrets building block]({{< ref secrets >}}).

In this guide you will:
- Create a local json secret store
- Register the secret store with Dapr using a component
- Obtain the secret using the Dapr HTTP API

## Step 1: Create a json secret store

While Dapr supports [many types of secret stores]({{< ref supported-secret-stores >}}), the easiest way to get started is a local json file with your secret.

Begin by saving the following json contents into a file named `mysecrets.json`:

```json
{
   "my-secret" : "I'm Batman"
}
```

## Step 2: Create a secret store Dapr component

Within your default Dapr components directory create a file named `localSecretStore.yaml` with the following contents:
- Linux/MacOS: `$HOME/.dapr/components`
- Windows: `%USERPROFILE%\.dapr\components`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-secret-store
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: <PATH TO SECRETS FILE>/secrets.json
  - name: nestedSeparator
    value: ":"
```

## Step 3: Run the Dapr sidecar

Run the following command to launch a Dapr sidecar that will listen on port 3500 for a blank application named myapp:

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

## Step 4: Get a secret

In a separate terminal run:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}
{{% codetab %}}

```bash
curl http://localhost:3500/v1.0/secrets/my-secret-store/my-secret
```
{{% /codetab %}}

{{% codetab %}}
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/secrets/my-secret-store/my-secret'
```
{{% /codetab %}}

<a class="btn btn-primary" href="{{< ref quickstarts.md >}}" role="button">Next step: Explore Dapr quickstarts >></a>
