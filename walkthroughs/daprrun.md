# Sequence of Events on a dapr run in Self Hosting Mode

The doc describes the sequence of events that occur when `dapr run` is executed in self hosting mode.  It uses [sample 1](https://github.com/dapr/quickstarts/tree/master/hello-world) as an example.

Terminology used below:

- Dapr CLI - the Dapr command line tool.  The binary name is dapr (dapr.exe on Windows)
- Dapr runtime - this runs alongside each app.  The binary name is daprd (daprd.exe on Windows)

In self hosting mode, running `dapr init` copies the Dapr runtime onto your machine and starts the Placement service (used for actors placement) Redis and Zipkin in containers.  The Redis and Placement service must be present before running `dapr run`. The Dapr CLI also creates the default components directory which for Linux/MacOS is: `$HOME/.dapr/components` and for Windows: `%USERPROFILE%\.dapr\components` if it does not already exist. The CLI creates a default `config.yaml` in `$HOME/.dapr` for Linux/MacOS or `%USERPROFILE%\.dapr` in Windows to enable tracing by default.

What happens when `dapr run` is executed?  

```bash
dapr run --app-id nodeapp --app-port 3000 --port 3500 node app.js
```

First, the Dapr CLI loads the components from the default directory (specified above) for the state store and pub/sub: `statestore.yaml` and `pubsub.yaml`, respectively.  [Code](https://github.com/dapr/cli/blob/51b99a988c4d1545fdc04909d6308be121a7fe0c/pkg/standalone/run.go#L196-L266).

You can either add components to the default directory or create your own `components` directory and provide the path to the CLI using the `--components-path` flag.

In order to switch components, simply replace or add the YAML files in the components directory and run `dapr run` again.
For example, by default Dapr uses the Redis state store in the default components dir. You can either override it with a different YAML, or supply your own components path.

Then, the Dapr CLI [launches](https://github.com/dapr/cli/blob/d585612185a4a525c05fb62b86e288ccad510006/pkg/standalone/run.go#L290) two proceses: the Dapr runtime and your app (in this sample `node app.js`). 

If you inspect the command line of the Dapr runtime and the app, observe that the Dapr runtime has these args:

```bash
daprd.exe --app-id mynode --dapr-http-port 3500 --dapr-grpc-port 43693 --log-level info --max-concurrency -1 --protocol http --app-port 3000 --placement-address localhost:50005
```

And the app has these args, which are not modified from what was passed in via the CLI:

```bash
node app.js
```

### Dapr runtime

The daprd process is started with the args above.  `--app-id`, "nodeapp", which is the Dapr app id, is forwarded from the Dapr CLI into `daprd` as the `--app-id` arg.  Similarly:

- the `--app-port` from the CLI, which represents the port on the app that `daprd` will use to communicate with it has been passed into the `--app-port` arg.  
- the `--port` arg  from the CLI, which represents the http port that daprd is listening on is passed into the `--dapr-http-port` arg.  (Note to specify grpc instead you can use `--grpc-port`).  If it's not specified, it will be -1 which means the Dapr CLI will chose a random free port.  Below, it's 43693, yours will vary.

### The app

The Dapr CLI doesn't change the command line for the app itself.  Since `node app.js` was specified, this will be the command it runs with.  However, two environment variables are added, which the app can use to determine the ports the Dapr runtime is listening on.
The two ports below match the ports passed to the Dapr runtime above:

```ini
DAPR_GRPC_PORT=43693
DAPR_HTTP_PORT=3500
```
