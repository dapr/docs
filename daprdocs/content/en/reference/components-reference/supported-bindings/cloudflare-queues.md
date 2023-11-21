---
type: docs
title: "Cloudflare Queues bindings spec"
linkTitle: "Cloudflare Queues"
description: "Detailed documentation on the Cloudflare Queues component"
aliases:
  - "/operations/components/setup-bindings/supported-bindings/cloudflare-queues/"
  - "/operations/components/setup-bindings/supported-bindings/cfqueues/"
---

## Component format

This output binding for Dapr allows interacting with [Cloudflare Queues](https://developers.cloudflare.com/queues/) to **publish** new messages. It is currently not possible to consume messages from a Queue using Dapr.

To setup a Cloudflare Queues binding, create a component of type `bindings.cloudflare.queues`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.cloudflare.queues
  version: v1
  # Increase the initTimeout if Dapr is managing the Worker for you
  initTimeout: "120s"
  metadata:
    # Name of the existing Cloudflare Queue (required)
    - name: queueName
      value: ""
    # Name of the Worker (required)
    - name: workerName
      value: ""
    # PEM-encoded private Ed25519 key (required)
    - name: key
      value: |
        -----BEGIN PRIVATE KEY-----
        MC4CAQ...
        -----END PRIVATE KEY-----
    # Cloudflare account ID (required to have Dapr manage the Worker)
    - name: cfAccountID
      value: ""
    # API token for Cloudflare (required to have Dapr manage the Worker)
    - name: cfAPIToken
      value: ""
    # URL of the Worker (required if the Worker has been pre-created outside of Dapr)
    - name: workerUrl
      value: ""
```

{{% alert title="Warning" color="warning" %}}
The above example uses secrets as plain strings. It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## Spec metadata fields

| Field              | Required | Binding support |  Details | Example |
|--------------------|:--------:|-------|--------|---------|
| `queueName` | Y | Output | Name of the existing Cloudflare Queue | `"mydaprqueue"`
| `key` | Y | Output | Ed25519 private key, PEM-encoded | *See example above*
| `cfAccountID` | Y/N | Output | Cloudflare account ID. Required to have Dapr manage the worker. | `"456789abcdef8b5588f3d134f74ac"def`
| `cfAPIToken` | Y/N | Output | API token for Cloudflare. Required to have Dapr manage the Worker. | `"secret-key"`
| `workerUrl` | Y/N | Output | URL of the Worker. Required if the Worker has been pre-provisioned outside of Dapr. | `"https://mydaprqueue.mydomain.workers.dev"`

> When you configure Dapr to create your Worker for you, you may need to set a longer value for the `initTimeout` property of the component, to allow enough time for the Worker script to be deployed. For example: `initTimeout: "120s"`

## Binding support

This component supports **output binding** with the following operations:

- `publish` (alias: `create`): Publish a message to the Queue.  
  The data passed to the binding is used as-is for the body of the message published to the Queue.  
  This operation does not accept any metadata property.

## Create a Cloudflare Queue

To use this component, you must have a Cloudflare Queue created in your Cloudflare account.

You can create a new Queue in one of two ways:

<!-- IGNORE_LINKS -->
- Using the [Cloudflare dashboard](https://dash.cloudflare.com/)  
- Using the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/):
  
  ```sh
  # Authenticate if needed with `npx wrangler login` first
  npx wrangler queues create <NAME>
  # For example: `npx wrangler queues create myqueue`
  ```
<!-- END_IGNORE -->

## Configuring the Worker

Because Cloudflare Queues can only be accessed by scripts running on Workers, Dapr needs to maintain a Worker to communicate with the Queue.

Dapr can manage the Worker for you automatically, or you can pre-provision a Worker yourself. Pre-provisioning the Worker is the only supported option when running on [workerd](https://github.com/cloudflare/workerd).

{{% alert title="Important" color="warning" %}}
Use a separate Worker for each Dapr component. Do not use the same Worker script for different Cloudflare Queues bindings, and do not use the same Worker script for different Cloudflare components in Dapr (for example, the Workers KV state store and the Queues binding).
{{% /alert %}}

{{< tabs "Let Dapr manage the Worker" "Manually provision the Worker script" >}}

{{% codetab %}}
<!-- Let Dapr manage the Worker -->

If you want to let Dapr manage the Worker for you, you will need to provide these 3 metadata options:

<!-- IGNORE_LINKS -->
- **`workerName`**: Name of the Worker script. This will be the first part of the URL of your Worker. For example, if the "workers.dev" domain configured for your Cloudflare account is `mydomain.workers.dev` and you set `workerName` to `mydaprqueue`, the Worker that Dapr deploys will be available at `https://mydaprqueue.mydomain.workers.dev`.
- **`cfAccountID`**: ID of your Cloudflare account. You can find this in your browser's URL bar after logging into the [Cloudflare dashboard](https://dash.cloudflare.com/), with the ID being the hex string right after `dash.cloudflare.com`. For example, if the URL is `https://dash.cloudflare.com/456789abcdef8b5588f3d134f74acdef`, the value for `cfAccountID` is `456789abcdef8b5588f3d134f74acdef`.
- **`cfAPIToken`**: API token with permission to create and edit Workers. You can create it from the ["API Tokens" page](https://dash.cloudflare.com/profile/api-tokens) in the "My Profile" section in the Cloudflare dashboard: 
   1. Click on **"Create token"**.
   1. Select the **"Edit Cloudflare Workers"** template.
   1. Follow the on-screen instructions to generate a new API token.
<!-- END_IGNORE -->

When Dapr is configured to manage the Worker for you, when a Dapr Runtime is started it checks that the Worker exists and it's up-to-date. If the Worker doesn't exist, or if it's using an outdated version, Dapr creates or upgrades it for you automatically.

{{% /codetab %}}

{{% codetab %}}
<!-- Manually provision the Worker script -->

If you'd rather not give Dapr permissions to deploy Worker scripts for you, you can manually provision a Worker for Dapr to use. Note that if you have multiple Dapr components that interact with Cloudflare services via a Worker, you will need to create a separate Worker for each one of them.

To manually provision a Worker script, you will need to have Node.js installed on your local machine.

1. Create a new folder where you'll place the source code of the Worker, for example: `daprworker`.
2. If you haven't already, authenticate with Wrangler (the Cloudflare Workers CLI) using: `npx wrangler login`.
3. Inside the newly-created folder, create a new `wrangler.toml` file with the contents below, filling in the missing information as appropriate:  
  
  ```toml
  # Name of your Worker, for example "mydaprqueue"
  name = ""

  # Do not change these options
  main = "worker.js"
  compatibility_date = "2022-12-09"
  usage_model = "bundled"

  [vars]
  # Set this to the **public** part of the Ed25519 key, PEM-encoded (with newlines replaced with `\n`).
  # Example:
  # PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMCowB...=\n-----END PUBLIC KEY-----
  PUBLIC_KEY = ""
  # Set this to the name of your Worker (same as the value of the "name" property above), for example "mydaprqueue".
  TOKEN_AUDIENCE = ""

  # Set the next two values to the name of your Queue, for example "myqueue".
  # Note that they will both be set to the same value.
  [[queues.producers]]
  queue = ""
  binding = ""
  ```
  
  > Note: see the next section for how to generate an Ed25519 key pair. Make sure you use the **public** part of the key when deploying a Worker!

4. Copy the (pre-compiled and minified) code of the Worker in the `worker.js` file. You can do that with this command:  
  
  ```sh
  # Set this to the version of Dapr that you're using
  DAPR_VERSION="release-{{% dapr-latest-version short="true" %}}"
  curl -LfO "https://raw.githubusercontent.com/dapr/components-contrib/${DAPR_VERSION}/internal/component/cloudflare/workers/code/worker.js"
  ```

5. Deploy the Worker using Wrangler:
  
  ```sh
  npx wrangler publish
  ```

Once your Worker has been deployed, you will need to initialize the component with these two metadata options:

- **`workerName`**: Name of the Worker script. This is the value you set in the `name` property in the `wrangler.toml` file.
- **`workerUrl`**: URL of the deployed Worker. The `npx wrangler command` will show the full URL to you, for example `https://mydaprqueue.mydomain.workers.dev`.

{{% /codetab %}}

{{< /tabs >}}

## Generate an Ed25519 key pair

All Cloudflare Workers listen on the public Internet, so Dapr needs to use additional authentication and data protection measures to ensure that no other person or application can communicate with your Worker (and thus, with your Cloudflare Queue). These include industry-standard measures such as:

- All requests made by Dapr to the Worker are authenticated via a bearer token (technically, a JWT) which is signed with an Ed25519 key. 
- All communications between Dapr and your Worker happen over an encrypted connection, using TLS (HTTPS).
- The bearer token is generated on each request and is valid for a brief period of time only (currently, one minute).

To let Dapr issue bearer tokens, and have your Worker validate them, you will need to generate a new Ed25519 key pair. Here are examples of generating the key pair using OpenSSL or the step CLI.

{{< tabs "Generate with OpenSSL" "Generate with the step CLI" >}}

{{% codetab %}}
<!-- Generate with OpenSSL -->

> Support for generating Ed25519 keys is available since OpenSSL 1.1.0, so the commands below will not work if you're using an older version of OpenSSL.

> Note for Mac users: on macOS, the "openssl" binary that is shipped by Apple is actually based on LibreSSL, which as of writing doesn't support Ed25519 keys. If you're using macOS, either use the step CLI, or install OpenSSL 3.0 from Homebrew using `brew install openssl@3` then replacing `openssl` in the commands below with `$(brew --prefix)/opt/openssl@3/bin/openssl`.

You can generate a new Ed25519 key pair with OpenSSL using:

```sh
openssl genpkey -algorithm ed25519 -out private.pem
openssl pkey -in private.pem -pubout -out public.pem
```

> On macOS, using openssl@3 from Homebrew:
> 
> ```sh
> $(brew --prefix)/opt/openssl@3/bin/openssl genpkey -algorithm ed25519 -out private.pem
> $(brew --prefix)/opt/openssl@3/bin/openssl pkey -in private.pem -pubout -out public.pem
> ```

{{% /codetab %}}

{{% codetab %}}
<!-- Generate with the step CLI -->

If you don't have the step CLI already, install it following the [official instructions](https://smallstep.com/docs/step-cli/installation).

Next, you can generate a new Ed25519 key pair with the step CLI using:

```sh
step crypto keypair \
  public.pem private.pem \
  --kty OKP --curve Ed25519 \
  --insecure --no-password
```

{{% /codetab %}}

{{< /tabs >}}

Regardless of how you generated your key pair, with the instructions above you'll have two files:

- `private.pem` contains the private part of the key; use the contents of this file for the **`key`** property of the component's metadata.
- `public.pem` contains the public part of the key, which you'll need only if you're deploying a Worker manually (as per the instructions in the previoius section).

{{% alert title="Warning" color="warning" %}}
Protect the private part of your key and treat it as a secret value!
{{% /alert %}}

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
- Documentation for [Cloudflare Queues](https://developers.cloudflare.com/queues/)