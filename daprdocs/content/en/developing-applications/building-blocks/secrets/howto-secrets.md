---
type: docs
title: "How To: Retrieve a secret"
linkTitle: "How To: Retrieve a secret"
weight: 2000
description: "Use the secret store building block to securely retrieve a secret"
---

This article provides guidance on using Dapr's secrets API in your code to leverage the [secrets store building block]({{<ref secrets-overview>}}). The secrets API allows you to easily retrieve secrets in your application code from a configured secret store. 

## Set up a secret store

Before retrieving secrets in your application's code, you must have a secret store component configured. For the purposes of this guide, as an example you will configure a local secret store which uses a local JSON file to store secrets.

>Note: The component used in this example is not secured and is not recommended for production deployments. You can find other alternatives [here]({{<ref supported-secret-stores >}}).

Create a file named `secrets.json` with the following contents:

```json
{
   "my-secret" : "I'm Batman"
}
```

Create a directory for your components file named `components` and inside it create a file named `localSecretStore.yaml` with the following contents:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-secrets-store
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

Make sure to replace `<PATH TO SECRETS FILE>` with the path to the JSON file you just created.

To configure a different kind of secret store see the guidance on [how to configure a secret store]({{<ref secret-stores-overview>}}) and review [supported secret stores]({{<ref supported-secret-stores >}}) to see specific details required for different secret store solutions.
## Get a secret

Now run the Dapr sidecar (with no application)

```bash
dapr run --app-id my-app --port 3500 --components-path ./components
```

And now you can get the secret by calling the Dapr sidecar using the secrets API:

```bash
curl http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret
```

For a full API reference, go [here]({{< ref secrets_api.md >}}).

## Calling the secrets API from your code

Once you have a secret store set up, you can call Dapr to get the secrets from your application code. Here are a few examples in different programming languages:

{{< tabs "Go" "Javascript" "Python" "Rust" "C#" >}}

{{% codetab %}}
```Go
import (
  "fmt"
  "net/http"
)

func main() {
  url := "http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret"

  res, err := http.Get(url)
  if err != nil {
    panic(err)  
  }
  defer res.Body.Close()

  body, _ := ioutil.ReadAll(res.Body)
  fmt.Println(string(body))
}
```

{{% /codetab %}}

{{% codetab %}}

```javascript
require('isomorphic-fetch');
const secretsUrl = `http://localhost:3500/v1.0/secrets`;

fetch(`${secretsUrl}/my-secrets-store/my-secret`)
        .then((response) => {
            if (!response.ok) {
                throw "Could not get secret";
            }
            return response.text();
        }).then((secret) => {
            console.log(secret);
        });
```

{{% /codetab %}}

{{% codetab %}}

```python
import requests as req

resp = req.get("http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret")
print(resp.text)
```

{{% /codetab %}}


{{% codetab %}}

```rust
#![deny(warnings)]
use std::{thread};

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let res = reqwest::get("http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret").await?;
    let body = res.text().await?;
    println!("Secret:{}", body);

    thread::park();

    Ok(())
}
```

{{% /codetab %}}

{{% codetab %}}

```csharp
var client = new HttpClient();
var response = await client.GetAsync("http://localhost:3500/v1.0/secrets/my-secrets-store/my-secret");
response.EnsureSuccessStatusCode();

string secret = await response.Content.ReadAsStringAsync();
Console.WriteLine(secret);
```
{{% /codetab %}}

{{< /tabs >}}

## Related links

- [Dapr secrets overview]({{<ref secrets-overview>}})
- [Secrets API reference]({{<ref secrets_api>}})
- [Configure a secret store]({{<ref secret-stores-overview>}})
- [Supported secrets]({{<ref secret-stores-overview>}})
- [Using secrets in components]({{<ref component-secrets>}})
- [Secret stores quickstart](https://github.com/dapr/quickstarts/tree/master/secretstore)