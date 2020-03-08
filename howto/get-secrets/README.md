# Access Application Secrets using the Secrets API

Its common for applications to store sensitive information like connection strings, keys and tokens that are used to authenticate with databases, services and external systems in secrets by using a dedicated secret store.

Usually this involves setting up a secret store such as Azure Key Vault, Hashicorp Vault and others and storing the application level secrets there.
To access those secret stores, the application needs to import the secret store SDK, and use it to access the secrets.

This usually involves writing a fair amount of boilerplate code that is not related to the actual business domain of the app, and this becomes an even greater challenge in multi-cloud scenarios: if an app needs to deploy to two different environments and use two different secret stores, the amount of boilerplate code gets doubled, and the effort increases.

In addition, not all secret stores have native SDKs for all programming languages.

To make it easier for developers everywhere to consume application secrets, Dapr has a dedicated Secrets API that allows developers to get secrets from a secret store.

## Setting up a secret store component

The first step involves setting up a secret store, either in the cloud or in-cluster. This is done by using the relevant instructions from the cloud provider or secret store implementations.

The second step is to configure the secret store with Dapr.

Follow the instructions [here](../setup-secret-store) to set up the secret store of your choice.

## Calling the Secrets API

Now that the secret store is set up, you can call Dapr to get the secrets for a given key for a specific secret store.

For a full API reference, go [here](../../reference/api/secrets.md).

Here are a few examples in different programming languages:

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

resp = req.get("http://localhost:3500/v1.0/secrets/kubernetes/my-secret")
print(resp.text)
```

### Go

```Go
import (
  "fmt"
  "net/http"
)

func main() {
  url := "http://localhost:3500/v1.0/secrets/kubernetes/my-secret"

  res, err := http.Get(url)
  if err != nil {
    panic(err)  
  }
  defer res.Body.Close()

  body, _ := ioutil.ReadAll(res.Body)
  fmt.Println(string(body))
}
```

### Rust

```rust
#![deny(warnings)]
use std::{thread};

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let res = reqwest::get("http://localhost:3500/v1.0/secrets/kubernetes/my-secret").await?;
    let body = res.text().await?;
    println!("Secret:{}", body);

    thread::park();

    Ok(())
}
```

### C#

```csharp
var client = new HttpClient();
var response = await client.GetAsync("http://localhost:3500/v1.0/secrets/kubernetes/my-secret");
response.EnsureSuccessStatusCode();

string secret = await response.Content.ReadAsStringAsync();
Console.WriteLine(secret);
```