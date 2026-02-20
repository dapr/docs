---
type: docs
title: "Dapr Python SDK integration with Flask"
linkTitle: "Flask"
weight: 300000
description: How to create Dapr Python virtual actors with the Flask extension
---

The Dapr Python SDK provides integration with Flask using the `flask-dapr` extension.

## Installation

You can download and install the Dapr Flask extension with:

{{< tabpane text=true >}}

{{% tab header="Stable" %}}
```bash
pip install flask-dapr
```
{{% /tab %}}

{{% tab header="Development" %}}
{{% alert title="Note" color="warning" %}}
The development package will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. Make sure to uninstall any stable versions of the Python SDK extension before installing the `dapr-dev` package.
{{% /alert %}}

```bash
pip install flask-dapr-dev
```
{{% /tab %}}

{{< /tabpane >}}

## Example

```python
from flask import Flask
from flask_dapr.actor import DaprActor

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
