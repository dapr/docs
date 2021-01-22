---
type: docs
title: "Uninstall Dapr in a self-hosted environment"
linkTitle: "Uninstall Dapr"
weight: 60000
description: "Steps to remove Dapr from your local machine"
---

The following CLI command removes the Dapr sidecar binaries and the placement container:

```bash
dapr uninstall
```
The above command will not remove the Redis or Zipkin containers that were installed during `dapr init` by default, just in case you were using them for other purposes. To remove Redis, Zipkin, Actor Placement container, as well as the default Dapr directory located at `$HOME/.dapr` or `%USERPROFILE%\.dapr\`, run:

```bash
dapr uninstall --all
```

{{% alert title="Note" color="primary" %}}
For Linux/MacOS users, if you run your docker cmds with sudo or the install path is `/usr/local/bin`(default install path), you need to use `sudo dapr uninstall` to remove dapr binaries and/or the containers.
{{% /alert %}}