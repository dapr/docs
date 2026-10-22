---
type: docs
title: "Dapr Python SDK integration with Flask"
linkTitle: "Flask"
weight: 300000
description: How to create Dapr Python virtual actors with the Flask extension
---

The Dapr Python SDK provides integration with Flask using the `dapr.ext.flask` extension.

## Installation

You can download and install the Dapr Flask extension with:

{{< tabpane text=true >}}

{{% tab header="Stable" %}}
```bash
pip install "dapr[flask]"
```
{{% /tab %}}

{{% tab header="Development" %}}
{{% alert title="Note" color="warning" %}}
The development version will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Only tagged releases are published to PyPI, so install the development version from the GitHub repository. Make sure to uninstall any stable versions of the Python SDK before installing it.
{{% /alert %}}

```bash
pip install "dapr[flask] @ git+https://github.com/dapr/python-sdk.git@main"
```
{{% /tab %}}

{{< /tabpane >}}

Starting with Dapr 1.19, this extension is an extra of the `dapr` package. The `flask-dapr` package is no longer published. If you installed it before, follow the [upgrade steps]({{% ref "python#install-extensions" %}}) to move to the extra.

{{% alert title="Note" color="primary" %}}
The `flask_dapr` import path still works as a thin compatibility shim, but it emits a `FutureWarning`. Import from `dapr.ext.flask` instead.
{{% /alert %}}

## Example

```python
from flask import Flask
from dapr.ext.flask import DaprActor

from dapr.conf import settings
from demo_actor import DemoActor

app = Flask(f'{DemoActor.__name__}Service')

# Enable DaprActor Flask extension
actor = DaprActor(app)

# Register DemoActor
actor.register_actor(DemoActor)

# Setup method route
@app.route('/GetMyData', methods=['GET'])
def get_my_data():
    return {'message': 'myData'}, 200

# Run application
if __name__ == '__main__':
    app.run(port=settings.HTTP_APP_PORT)
```
