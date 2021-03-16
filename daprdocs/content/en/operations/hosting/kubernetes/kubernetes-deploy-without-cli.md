---
type: docs
title: "Deploy Dapr at a Kubernetes cluster"
linkTitle: "Deploy Dapr without CLI"
weight: 21000
description: "Follow these steps to deploy Dapr at Kubernetes without cluster permissions."
aliases:
    - /getting-started/install-dapr-kubernetes/
---

This part describes the process of installation Dapr without CLI or Helm when you have no cluster permissions. Such situation may arise when you have a project in OKD or namespace in Kubernetes. In this case you have no cluster permission and can't deploy the operator. You can't also address cluster admin to install Dapr operator because you are the only one who needs it.

This approach can also be used with other orchestrators, for example in Docker Swarm.

## Prerequisites

- Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Kubernetes cluster (see below if needed)

### Create cluster

You can install Dapr at any Kubernetes cluster. Here are some helpful links:

- [Setup Minikube Cluster]({{< ref setup-minikube.md >}})
- [Setup Azure Kubernetes Service Cluster]({{< ref setup-aks.md >}})
- [Setup Google Cloud Kubernetes Engine](https://cloud.google.com/kubernetes-engine/docs/quickstart)
- [Setup Amazon Elastic Kubernetes Service](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)


## Install without Dapr CLI

You can install Dapr to a Kubernetes cluster or other orchectrator without Dapr CLI.

### Install Dapr

Dapr installation is done with ordinary Kubernes deployment. 
The example below demonstrates how to describe deployment process.

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  annotations:
  labels:
    app: placement
    name: placement
  name: placement
spec:
  replicas: 1
  selector:
    matchLabels:
      app: placement
      name: placement
  template:
    metadata:
      labels:
        app: placement
        name: placement
      name: placement
    spec:
      containers:
      - command:
        - ./placement
        - -port
        - "50005"
        - --log-level
        - debug
        image: docker.io/daprio/dapr:1.0.0
        name: placement
        ports:
        - containerPort: 50005
          name: placement-port
        resources:
          limits:
            cpu: 50m
            memory: 100Mi
          requests:
            cpu: 10m
            memory: 50Mi
        startupProbe:
          httpGet:
            path: /healthz
            port: 8080
            scheme: HTTP
          failureThreshold: 3
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 15
          periodSeconds: 20
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 15
          periodSeconds: 20

apiVersion: v1
kind: Service
metadata:
  annotations:
  labels:
    app: placement
    name: placement
  name: placement
spec:
  ports:
  - name: placement-port
    port: 50005
    targetPort: placement-port
  selector:
    name: placement
```
The next example shows how to apply it to Kubernetes.

```bash
kubectl apply -f placement.yml
```

### Install application

Installation is done with ordinary Kubernes deployment. 
The example below demonstrates how to describe deployment process.

```yml
apiVersion: v1
data:
  statestore.yaml: |
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: statestore
    spec:
      type: state.redis
      version: v1
      metadata:
      - name: actorStateStore
        value: 'true'
      - name: redisHost
        value: redis:6379
      - name: redisPassword
        value: ""
kind: ConfigMap
metadata:
  labels:
    app: application
    name: application
  name: application-components-statestore

apiVersion: apps/v1
kind: Deployment
metadata:
  annotations:
  labels:
    app: application
    name: application
  name: application
spec:
  replicas: 1
  selector:
    matchLabels:
      app: application
      name: application
  template:
    metadata:
      labels:
        app: application
        name: application
      name: application
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - application
            topologyKey: kubernetes.io/hostname
      containers:
      - command:
        - ./daprd
        - --mode
        - orchestrator
        - --app-id
        - application
        - --app-port
        - "3000"
        - --placement-host-address
        - dapr.dapr.svc:50005
        - --dapr-grpc-port
        - "50001"
        - --dapr-internal-grpc-port
        - "50002"
        - --dapr-http-port
        - "3500"
        - --app-protocol
        - http
        - --log-level
        - debug
        - --components-path
        - /components
        image: daprio/daprd:edge
        name: application-edge
        ports:
        - containerPort: 3500
          name: dapr-http
          protocol: TCP
        - containerPort: 50001
          name: dapr-grpc
          protocol: TCP
        - containerPort: 50002
          name: dapr-internal
          protocol: TCP
        resources:
          limits:
            cpu: 200m
            memory: 200Mi
          requests:
            cpu: 200m
            memory: 200Mi
        volumeMounts:
        - mountPath: /components/statestore.yaml
          name: application-components-statestore
          subPath: statestore.yaml
      - env:
        - name: ACTOR_IDLE_TIMEOUT
          value: "100"
        - name: ACTOR_SCAN_INTERVAL
          value: "10"
        - name: ACTOR_DRAIN_ONGOING_CALL_TIMEOUT
          value: "10"
        - name: ACTOR_DRAIN_BALANCED
          value: "true"
        - name: DAPR_ZIF_UDL_PROVIDER_NAME
          value: zif-cm-provider-udl-service
        - name: DAPR_ZIF_UDL_PROVIDER_CLIENTS
          value: "5"
        - name: DAPR_HTTP_PORT
          value: "3500"
        - name: DAPR_GRPC_PORT
          value: "50001"
        image: application:latest
        name: application
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: 200m
            memory: 200Mi
          requests:
            cpu: 200m
            memory: 200Mi
      enableServiceLinks: false
      imagePullSecrets:
      - name: zyfra
      volumes:
      - configMap:
          defaultMode: 420
          name: application-components-statestore
        name: application-components-statestore

apiVersion: v1
kind: Service
metadata:
  annotations:
    description: Exposes and load balances the application pods
  labels:
    app: application
    name: application
  name: application-dapr
spec:
  ports:
  - name: dapr-http
    port: 80
    protocol: TCP
    targetPort: 3500
  - name: dapr-grpc
    port: 50001
    protocol: TCP
    targetPort: 50001
  - name: dapr-internal
    port: 50002
    protocol: TCP
    targetPort: 50002
  selector:
    name: application
```
The next example shows how to apply it to Kubernetes.

```bash
kubectl apply -f application.yml
```
As you can see, to run application we use mode named **dns**. In this mode to locate the Dapr application we use services with suffix `-dapr`.