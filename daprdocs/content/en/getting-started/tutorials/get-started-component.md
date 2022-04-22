---
type: docs
title: "Define a component"
linkTitle: "Define a component"
weight: 70
description: "Create a component definition file to interact with the secrets building block"
---

When building an app, you'd most likely create your own component file definitions, depending on the building block and specific component that you'd like to use.

In this tutorial, you will create a component definition file to interact with the [secrets building block API]({{< ref secrets >}}):

- Create a local JSON secret store.
- Register the secret store with Dapr using a component definition file.
- Obtain the secret using the Dapr HTTP API.

## Step 1: Create a JSON secret store

Dapr supports [many types of secret stores]({{< ref supported-secret-stores >}}), but for this tutorial, create a local JSON file named `mysecrets.json` with the following secret:

```json
{
   "my-secret" : "I'm Batman"
}
```

## Step 2: Create a secret store Dapr component

1. Create a new directory named `my-components` to hold the new component file:

   ```bash
   mkdir my-components
   ```

1. Navigate into this directory.

   ```bash
   cd my-components
   ```

1. Create a new file `localSecretStore.yaml` with the following contents:

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

In the above file definition:
- `type: secretstores.local.file` tells Dapr to use the local file component as a secret store. 
- The metadata fields provide component-specific information needed to work with this component. In this case, the secret store JSON path is relative to where you call `dapr run`.

## Step 3: Run the Dapr sidecar

Launch a Dapr sidecar that will listen on port 3500 for a blank application named `myapp`:

```bash
dapr run --app-id myapp --dapr-http-port 3500 --components-path ./my-components
```

{{% alert title="Tip" color="primary" %}}
If an error message occurs, stating the `app-id` is already in use, you may need to stop any currently running Dapr sidecars. Stop the sidecar before running the next `dapr run` command by either:

- Pressing Ctrl+C or Command+C.
- Running the `dapr stop` command in the terminal.

{{% /alert %}}

## Step 4: Get a secret

In a separate terminal, run:

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

**Output:**

```json
{"my-secret":"I'm Batman"}
```

{{< button text="Next step: Set up a Pub/sub broker >>" page="pubsub-quickstart" >}}