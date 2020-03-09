# Sequence of Events on a dapr run in Self Hosting Mode

The doc describes the sequence of events that occur when `dapr run` is executed in self hosting mode (formerly known as standalone mode).  It uses [sample 1](https://github.com/dapr/samples/tree/master/1.hello-world) as an example.

Terminology used below:

- Dapr CLI - the Dapr command line tool.  The binary name is dapr (dapr.exe on Windows)
- Dapr runtime - this runs alongside each app.  The binary name is daprd (daprd.exe on Windows)

In self hosting mode, running `dapr init` copies the Dapr runtime onto your box and starts the placement service (used for actors) and Redis in containers.  These must be present before running `dapr run`.

What happens when `dapr run` is executed?  

```bash
dapr run --app-id nodeapp --app-port 3000 --port 3500 node app.js
```

First, the Dapr CLI creates the `\components` directory if it does not not already exist, and writes two component files representing the default state store and the default message bus: `redis.yaml` and `redis_messagebus.yaml`, respectively.  [Code](https://github.com/dapr/cli/blob/d585612185a4a525c05fb62b86e288ccad510006/pkg/standalone/run.go#L254-L288).

*Note as of this writing (Dec 2019) the names have been changed to `statestore.yaml` and `messagebus.yaml` in the master branch, but this change is not in the latest release, 0.3.0*.  

yaml files in components directory contains configuration for various Dapr components (e.g. statestore, pubsub, bindings etc.). The components must be created prior to using them with Dapr, for example, redis is launched as a container when running dapr init. If these component files already exist, they are not overwritten.  This means you could overwrite `statestore.yaml`, which by default uses Redis, with a content for a different statestore (e.g. Mongo) and the latter would be what gets used.  If you did this and ran `dapr run` again, the Dapr runtime would use the specified Mongo state store.

Then, the Dapr CLI will [launch](https://github.com/dapr/cli/blob/d585612185a4a525c05fb62b86e288ccad510006/pkg/standalone/run.go#L290) two proceses: the Dapr runtime and your app (in this sample `node app.js`). 

If you inspect the command lines of the Dapr runtime and the app, observe that the Dapr runtime has these args:

```bash
daprd.exe --app-id mynode --dapr-http-port 3500 --dapr-grpc-port 43693 --log-level info --max-concurrency -1 --protocol http --app-port 3000 --placement-address localhost:50005
```

And the app has these args, which are not modified from what was passed in via the CLI:

```bash
node app.js
```

### Dapr runtime

The daprd process is started with the args above.  `--app-id`, "nodeapp", which is the dapr app id, is forwarded from the Dapr CLI into `daprd` as the `--app-id` arg.  Similarly:

- the `--app-port` from the CLI, which represents the port on the app that `daprd` will use to communicate with it has been passed into the `--app-port` arg.  
- the `--port` arg  from the CLI, which represents the http port that daprd is listening on is passed into the `--dapr-http-port` arg.  (Note to specify grpc instead you can use `--grpc-port`).  If it's not specified, it will be -1 which means the Dapr CLI will chose a random free port.  Below, it's 43693, yours will vary.

### The app

The Dapr CLI doesn't change the command line for the app itself.  Since `node app.js` was specified, this will be the command it runs with.  However, two environment variables are added, which the app can use to determine the ports the Dapr runtime is listening on.
The two ports below match the ports passed to the Dapr runtime above:

```ini
DAPR_GRPC_PORT=43693
DAPR_HTTP_PORT=3500
```
