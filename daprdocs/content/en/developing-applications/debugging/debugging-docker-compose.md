---
type: docs
title: "Debugging Dapr Apps running in Docker Compose"
linkTitle: "Debugging Docker Compose"
weight: 300
description: "Debug Dapr apps locally which are part of a Docker Compose deployment"
---

The goal of this article is to demonstrate a way to debug one or more daprised applications (via your IDE, locally) while remaining integrated with the other applications that have deployed in the docker compose environment.

Let's take the minimal example of a docker compose file which contains just two services :
- `nodeapp` - your app
- `nodeapp-dapr` - the dapr sidecar process to your `nodeapp` service

#### compose.yml
```yaml
services:
  nodeapp:
    build: ./node
    ports:
      - "50001:50001"
    networks:
      - hello-dapr
  nodeapp-dapr:
    image: "daprio/daprd:edge"
    command: [
      "./daprd",
     "--app-id", "nodeapp",
     "--app-port", "3000",
     "--resources-path", "./components"
     ]
    volumes:
        - "./components/:/components"
    depends_on:
      - nodeapp
    network_mode: "service:nodeapp"
networks:
  hello-dapr
```

When you run this docker file with `docker compose -f compose.yml up` this will deploy to Docker and run as normal.

But how do we debug the `nodeapp` while still integrated to the running dapr sidecar process, and anything else that you may have deployed via the Docker compose file? 

Lets start by introducing a *second* docker compose file called `compose.debug.yml`. This second compose file will augment with the first compose file when the `up` command is ran.

#### compose.debug.yml
```yaml
services:
  nodeapp: # Isolate the nodeapp by removing its ports and taking it off the network
    ports: !reset []
    networks: !reset
      - ""
  nodeapp-dapr:
    command: ["./daprd",
     "--app-id", "nodeapp",
     "--app-port", "8080", # This must match the port that your app is exposed on when debugging in the IDE
     "--resources-path", "./components",
     "--app-channel-address", "host.docker.internal"] # Make the sidecar look on the host for the App Channel
    network_mode: !reset "" # Reset the network_mode...
    networks: # ... so that the sidecar can go into the normal network
      - hello-dapr
    ports:
      - "3500:3500" # Expose the HTTP port to the host
      - "50001:50001" # Expose the GRPC port to the host (Dapr Worfklows depends upon the GRPC channel)

```

Next, ensure that your `nodeapp` is running/debugging in your IDE of choice, and is exposed on the same port that you specifed above in the `compose.debug.yml` - In the example above this is set to port `8080`.

Next, stop any existing compose sessions you may have started, and run the following command to run both docker compose files combined together :

`docker compose -f compose.yml -f compose.debug.yml up`

You should now find that the dapr sidecar and your debugging app will have bi-directional communication with each other as if they were running together as normal in the Docker compose environment.

**Note** : It's important to highlight that the `nodeapp` service in the docker compose environment is actually still running, however it has been removed from the docker network so it is effectively orphaned as nothing can communicate to it.

**Demo** : Watch this video on how to debug local Dapr apps with Docker Compose

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/nWatANwaAik?start=1738" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>