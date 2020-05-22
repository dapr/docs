# Access Application Secrets using the Secrets API

It's common for applications to store sensitive information such as connection strings, keys and tokens that are used to authenticate with databases, services and external systems in secrets by using a dedicated secret store.

Usually this involves setting up a secret store such as Azure Key Vault, Hashicorp Vault and others and storing the application level secrets there. To access these secret stores, the application needs to import the secret store SDK, and use it to access the secrets.

This usually involves writing a fair amount of boilerplate code that is not related to the actual business domain of the app, and this becomes an even greater challenge in multi-cloud scenarios: if an app needs to deploy to two different environments and use two different secret stores, the amount of boilerplate code gets doubled, and the effort increases.

In addition, not all secret stores have native SDKs for all programming languages.

To make it easier for developers everywhere to consume application secrets, Dapr has a dedicated secrets building block API that allows developers to get secrets from a secret store.

## Setting up a secret store component

The first step involves setting up a secret store, either in the cloud or in the hosting environment such as a cluster. This is done by using the relevant instructions from the cloud provider or secret store implementation.

The second step is to configure the secret store with Dapr.

Follow the instructions [here](../setup-secret-store) to set up the secret store of your choice.

## Calling the secrets API

Now that the secret store is set up, you can call Dapr to get the secrets for a given key for a specific secret store.

For a full API reference, go [here](https://github.com/dapr/docs/blob/master/reference/api/secrets_api.md).

Here are a few examples in different programming languages. Note that the code snippets below are fetching the secret from the "default" namespace.

### Go

```Go
import (
  "fmt"
  "net/http"
)

func main() {
  url := "http://localhost:3500/v1.0/secrets/kubernetes/my-secret?metadata.namespace=default"

  res, err := http.Get(url)
  if err != nil {
    panic(err)  
  }
  defer res.Body.Close()

  body, _ := ioutil.ReadAll(res.Body)
  fmt.Println(string(body))
}
```
### Javascript

```javascript
require('isomorphic-fetch');
const secretsUrl = `http://localhost:3500/v1.0/secrets`;

fetch(`${secretsUrl}/kubernetes/my-secret`)
        .then((response) => {
            if (!response.ok) {
                throw "Could not get secret";
            }
            return response.text();
        }).then((secret) => {
            console.log(secret);
        });
```

### Python

```python
import requests as req

resp = req.get("http://localhost:3500/v1.0/secrets/kubernetes/my-secret?metadata.namespace=default")
print(resp.text)
```

### Rust

```rust
#![deny(warnings)]
use std::{thread};

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let res = reqwest::get("http://localhost:3500/v1.0/secrets/kubernetes/my-secret?metadata.namespace=default").await?;
    let body = res.text().await?;
    println!("Secret:{}", body);

    thread::park();

    Ok(())
}
```

### C#

```csharp
var client = new HttpClient();
var response = await client.GetAsync("http://localhost:3500/v1.0/secrets/kubernetes/my-secret?metadata.namespace=default");
response.EnsureSuccessStatusCode();

string secret = await response.Content.ReadAsStringAsync();
Console.WriteLine(secret);
```

## Related Links
- Setting up secret stores: https://github.com/dapr/docs/blob/master/howto/setup-secret-store/README.md
- Secrets API:https://github.com/dapr/docs/blob/master/howto/get-secrets/README.md
- Working Sample: https://github.com/dapr/samples/blob/master/9.secretstore/README.md

