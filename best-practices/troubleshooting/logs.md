# Logs

This section will assist you in understanding how logging works in Dapr, configuring and viewing logs.

## Overview

Logs have different, configurable verbosity levels.
The levels outlined below are the same for both system components and the Dapr sidecar process/container:

1. error
2. warning
3. info
4. debug

error produces the minimum amount of output, where debug produces the maximum amount. The default level is info, which provides a balanced amount of information for operating Dapr in normal conditions.

To set the output level, you can use the `--log-level` command-line option. For example:

```bash
./daprd --log-level error
./placement --log-level debug
```

This will start the Dapr runtime binary with a log level of `error` and the Dapr Actor Placement Service with a log level of `debug`.

## Configuring logs on Standalone Mode

As outlined above, every Dapr binary takes a `--log-level` argument. For example, to launch the placement service with a log level of warning:

```bash
./placement --log-level warning
```

To set the log level when running your app with the Dapr CLI, pass the `log-level` param:

```bash
dapr run --log-level warning node myapp.js
```

## Viewing Logs on Standalone Mode

When running Dapr with the Dapr CLI, both your app's log output and the runtime's output will be redirected to the same session, for easy debugging.
For example, this is the output when running Dapr:

```bash
dapr run node myapp.js
ℹ️  Starting Dapr with id Trackgreat-Lancer on port 56730
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == App listening on port 3000!
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="starting Dapr Runtime -- version 0.3.0-alpha -- commit b6f2810-dirty"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="log level set to: info"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="standalone mode configured"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="app id: Trackgreat-Lancer"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="loaded component statestore (state.redis)"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="loaded component messagebus (pubsub.redis)"
== DAPR == 2019/09/05 12:26:43 redis: connecting to localhost:6379
== DAPR == 2019/09/05 12:26:43 redis: connected to localhost:6379 (localAddr: [::1]:56734, remAddr: [::1]:6379)
== DAPR == time="2019-09-05T12:26:43-07:00" level=warning msg="failed to init input bindings: app channel not initialized"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="actor runtime started. actor idle timeout: 1h0m0s. actor scan interval: 30s"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="actors: starting connection attempt to placement service at localhost:50005"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="http server is running on port 56730"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="gRPC server is running on port 56731"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 8.772922000000001ms"
== DAPR == time="2019-09-05T12:26:43-07:00" level=info msg="actors: established connection to placement service at localhost:50005"
```

## Configuring Logs on Kubernetes

This section shows you how to configure the log levels for Dapr system pods and the Dapr sidecar running on Kubernetes.

### Setting the sidecar log level

You can set the log level individually for every sidecar by providing the following annotation in your pod spec template:

```yml
annotations:
  dapr.io/log-level: "debug"
```

### Setting system pods log level

When deploying Dapr to your cluster using Helm 3.x, you can individually set the log level for every Dapr system component.

#### Setting the Operator log level

```bash
helm install dapr dapr/dapr --namespace dapr-system --set dapr_operator.logLevel=error
```

#### Setting the Placement Service log level

```bash
helm install dapr dapr/dapr --namespace dapr-system --set dapr_placement.logLevel=error
```

#### Setting the Sidecar Injector log level

```bash
helm install dapr dapr/dapr --namespace dapr-system --set dapr_sidecar_injector.logLevel=error
```

## Viewing Logs on Kubernetes

Dapr logs are written to stdout and stderr.
This section will guide you on how to view logs for Dapr system components as well as the Dapr sidecar.

### Sidecar Logs

When deployed in Kubernetes, the Dapr sidecar injector will inject an Dapr container named `daprd` into your annotated pod.
In order to view logs for the sidecar, simply find the pod in question by running `kubectl get pods`:

```bash
NAME                                        READY     STATUS    RESTARTS   AGE
addapp-74b57fb78c-67zm6                     2/2       Running   0          40h
```

Next, get the logs for the Dapr sidecar container:

```bash
kubectl logs addapp-74b57fb78c-67zm6 -c daprd

time="2019-09-04T02:52:27Z" level=info msg="starting Dapr Runtime -- version 0.3.0-alpha -- commit b6f2810-dirty"
time="2019-09-04T02:52:27Z" level=info msg="log level set to: info"
time="2019-09-04T02:52:27Z" level=info msg="kubernetes mode configured"
time="2019-09-04T02:52:27Z" level=info msg="app id: addapp"
time="2019-09-04T02:52:27Z" level=info msg="application protocol: http. waiting on port 6000"
time="2019-09-04T02:52:27Z" level=info msg="application discovered on port 6000"
time="2019-09-04T02:52:27Z" level=info msg="actor runtime started. actor idle timeout: 1h0m0s. actor scan interval: 30s"
time="2019-09-04T02:52:27Z" level=info msg="actors: starting connection attempt to placement service at dapr-placement.dapr-system.svc.cluster.local:80"
time="2019-09-04T02:52:27Z" level=info msg="http server is running on port 3500"
time="2019-09-04T02:52:27Z" level=info msg="gRPC server is running on port 50001"
time="2019-09-04T02:52:27Z" level=info msg="dapr initialized. Status: Running. Init Elapsed 64.234049ms"
time="2019-09-04T02:52:27Z" level=info msg="actors: established connection to placement service at dapr-placement.dapr-system.svc.cluster.local:80"
```

### System Logs

Dapr runs the following system pods:

* Dapr operator
* Dapr sidecar injector
* Dapr placement service

#### Viewing Operator Logs

```Bash
kubectl logs -l app=dapr-operator -n dapr-system
time="2019-09-05T19:03:43Z" level=info msg="log level set to: info"
time="2019-09-05T19:03:43Z" level=info msg="starting Dapr Operator -- version 0.3.0-alpha -- commit b6f2810-dirty"
time="2019-09-05T19:03:43Z" level=info msg="Dapr Operator is started"
```

*Note: If Dapr is installed to a different namespace than dapr-system, simply replace the namespace to the desired one in the command above*

#### Viewing Sidecar Injector Logs

```Bash
kubectl logs -l app=dapr-sidecar-injector -n dapr-system
time="2019-09-03T21:01:12Z" level=info msg="log level set to: info"
time="2019-09-03T21:01:12Z" level=info msg="starting Dapr Sidecar Injector -- version 0.3.0-alpha -- commit b6f2810-dirty"
time="2019-09-03T21:01:12Z" level=info msg="Sidecar injector is listening on :4000, patching Dapr-enabled pods"
```

*Note: If Dapr is installed to a different namespace than dapr-system, simply replace the namespace to the desired one in the command above*

#### Viewing Placement Service Logs

```Bash
kubectl logs -l app=dapr-placement -n dapr-system
time="2019-09-03T21:01:12Z" level=info msg="log level set to: info"
time="2019-09-03T21:01:12Z" level=info msg="starting Dapr Placement Service -- version 0.3.0-alpha -- commit b6f2810-dirty"
time="2019-09-03T21:01:12Z" level=info msg="placement Service started on port 50005"
time="2019-09-04T00:21:57Z" level=info msg="host added: 10.244.1.89"
```

*Note: If Dapr is installed to a different namespace than dapr-system, simply replace the namespace to the desired one in the command above*

### Non Kubernetes Environments

The examples above are specific specific to Kubernetes, but the principal is the same for any kind of container based environment: simply grab the container ID of the Dapr sidecar and/or system component (if applicable) and view its logs.
