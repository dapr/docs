# Running Dapr with Docker

### Images
There are published docker images for each of the Dapr components available on [Docker Hub](https://hub.docker.com/u/daprio).
- [Dapr All](https://hub.docker.com/r/daprio/dapr)
- [Dapr Runtime](https://hub.docker.com/r/daprio/daprd)
- [Dapr Placement](https://hub.docker.com/r/daprio/placement)
- [Dapr Sentry](https://hub.docker.com/r/daprio/sentry)
- [Dapr Dev Environment](https://hub.docker.com/r/daprio/dapr-dev)

### Archs
Currently supported OS/ARCH include:
- Linux/amd64
- Linux/arm/v7

### Tags
- latest: The latest release, ONLY use for development purposes
- edge: // TODO: Is this different to edge?!
- major.minor.patch: A released version of Dapr
- major.minor.patch-rc.iteration: A release candidate

## Running the Runtime

###  With a Separate App Process
The dapr runtime and your app communicate over the localhost interface, therefore, you need to ensure that
both processes are using the same localhost interface. 

> Only use the below method for development purposes

If you are running dapr in a docker container and your app on the host machine, then you need to configure
docker to use the host network. Unfortunately, the host networking driver for docker is only supported on
Linux hosts.
If you are running your docker daemon on a Linux host, you should be able to run the following to launch dapr.
```shell
docker run --net="host" daprio/daprd:edge ./daprd -app-id <my-app-id> -app-port <my-app-port>
```
Then you can run your app on the host and they should connect.

However, if you are not running your docker daemon on a Linux host, we recommend you follow the steps below to run
both your app and the dapr runtime in docker using docker compose.

### With an Embedded App Process
We do not publish images for or recommend running both the dapr runtime and your application inside the same
container. However, it is possible if you need to test something for development purposes.
In order to do this, you'll need to write a Dockerfile that installs the dapr runtime, dapr cli and your app code.
You can then invoke both the dapr runtime and your app code using the dapr cli.

Below is just an example on how you might do this
```
FROM python:3.7.1
# Install dapr cli
RUN wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Install daprd
ARG DAPR_BUILD_DIR
COPY $DAPR_BUILD_DIR /opt/dapr
ENV PATH="/opt/dapr/:${PATH}"

# Install your app
WORKDIR /app
COPY python .
RUN pip install requests
ENTRYPOINT ["dapr"]
CMD ["run", "--app-id", "nodeapp", "--app-port", "3000", "node", "app.js"]
```

Remember that if dapr needs to communicate with other components i.e. Redis, these also need to
be made accessible to it.

### With Docker Networks
If you have multiple instances of dapr running in docker containers and want them to be able to
communicate with each other i.e. for service invocation, then you'll need to create a docker network
and make sure those dapr containers are attached to it.

You can create a simple docker networking using
```
docker network create my-dapr-network
```
When running your docker containers, you can attach them to the network using
```
docker run --net=my-dapr-network ...
```
Each container will receive a unique IP on that network and be able to communicate with each other.

### With Docker-Compose
[Docker Compose](https://docs.docker.com/compose/) can be used to define multi-container application
configurations. If you wish to run multiple apps with dapr sidecars locally without Kubernetes then we recommend you
express it as a docker compose definition (`docker-compose.yml`).

A wider discussion on the syntax and tooling of docker compose is outside the scope of this article,
however, I recommend you refer to the [offical docker documentation](https://docs.docker.com/compose/)
if you need a better understanding.

In order to run your applications using dapr and docker compose you'll need to express the sidecar
pattern in your `docker-compose.yml`.

An example of how you can achieve this is documented below.

```yaml
version: '3'
services:
  nodeapp:
    build: ./node
    ports:
      - "50001:50001" # Dapr instances communicate over gRPC so we need to expose the gRPC port
    depends_on:
      - redis
      - placement
    networks:
      - hello-dapr
  nodeapp-dapr:
    image: "daprio/daprd:edge"
    command: [
      "./daprd",
     "-app-id", "nodeapp",
     "-app-port", "3000",
     "-placement-address", "placement:50006" # Dapr's placement service can be reach via the docker dns entry
     ]
    volumes:
        - "./components/:/components" # Mount our components folder for the runtime to use
    depends_on:
      - nodeapp
    network_mode: "service:nodeapp" # Attach the nodeapp-dapr service to the nodeapp network namespace

  ... # Deploy other daprized services and components (i.e. Redis)

  placement:
    image: "daprio/dapr"
    command: ["./placement", "-port", "50006"]
    ports:
      - "50006:50006"
    networks:
      - hello-dapr
```

To get hands on with this we recommend you head over the [dapr samples](https://github.com/dapr/samples) and try out
the docker compose sample for yourself.

### With Kubernetes
If your deployment target is Kubernetes then you're probably better of running your applicaiton and sidecars directly on
a Kubernetes. Running dapr on Kubernetes is a first class experience and is heavily documented. Please refer to the
following references:
- [Setup Dapr on a Kubernetes cluster](https://github.com/dapr/docs/blob/ea5b1918778a47555dbdccff0ed6c5b987ed10cf/getting-started/environment-setup.md#installing-dapr-on-a-kubernetes-cluster)
- [Hello Kubernetes Sample](https://github.com/dapr/samples/tree/master/2.hello-kubernetes)
- [Configuring the Dapr sidecar on Kubernetes](https://github.com/dapr/docs/blob/c88d247a2611d6824d41bb5b6adfeb38152dbbc6/howto/configure-k8s/README.md)
- [Running Dapr in Kubernetes mode](https://github.com/dapr/docs/blob/a7668cab5e16d12f364a42d2fe7d75933c6398e9/overview/README.md#running-dapr-in-kubernetes-mode)