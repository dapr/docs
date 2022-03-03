---
type: docs
title: "Define a component"
linkTitle: "Define a component"
weight: 40
---

In the [previous step]({{<ref get-started-api.md>}}) you called the Dapr HTTP API to store and retrieve a state from a Redis backed state store. Dapr knew to use the Redis instance that was configured locally on your machine through default component definition files that were created when Dapr was initialized.

When building an app, you most likely would create your own component file definitions depending on the building block and specific component that you'd like to use.

As an example of how to define custom components for your application, you will now create a component definition file to interact with the [secrets building block]({{< ref secrets >}}).

In this guide you will:
- Create a local JSON secret store
- Register the secret store with Dapr using a component definition file
- Obtain the secret using the Dapr HTTP API

## Step 1: Create a JSON secret store

While Dapr supports [many types of secret stores]({{< ref supported-secret-stores >}}), the easiest way to get started is a local JSON file with your secret (note this secret store is meant for development purposes and is not recommended for production use cases as it is not secured).

Begin by saving the following JSON contents into a file named `mysecrets.json`:

```json
{
   "my-secret" : "I'm Batman"
}
```

## Step 2: Create a secret store Dapr component

Create a new directory named `my-components` to hold the new component file:

```bash
mkdir my-components
```

Inside this directory create a new file `localSecretStore.yaml` with the following contents:


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
    value: <PATH TO SECRETS FILE>/mysecrets.json
  - name: nestedSeparator
    value: ":"
```

You can see that the above file definition has a `type: secretstores.local.file` which tells Dapr to use the local file component as a secret store. The metadata fields provide component specific information needed to work with this component (in this case, the path to the secret store JSON is relative to where you call `dapr run` from.)

## Step 3: Run the Dapr sidecar

Run the following command to launch a Dapr sidecar that will listen on port 3500 for a blank application named myapp:

```bash
dapr run --app-id myapp --dapr-http-port 3500 --components-path ./my-components
```

> If you encounter a error message stating the app ID is already in use, it may be that the sidecar you ran in the previous step is still running. Make sure you stop the sidecar before running the above command using "Control-C" or running the command `dapr stop --app-id myapp`.

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
{{< /tabs >}}

You should see output with the secret you stored in the JSON file.

```json
{"my-secret":"I'm Batman"}
```

{{< button text="Next step: Explore Dapr quickstarts >>" page="quickstarts" >}}
