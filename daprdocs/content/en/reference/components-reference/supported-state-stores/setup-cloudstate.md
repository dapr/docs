---
type: docs
title: "Cloudstate"
linkTitle: "Cloudstate"
description: Detailed information on the Cloudstate state store component
aliases:
  - "/operations/components/setup-state-store/supported-state-stores/setup-cloudstate/"
---

## Component format

To setup Cloudstate state store create a component of type `state.cloudstate.crdt`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.cloudstate.crdt
  version: v1
  metadata:
  - name: host
    value: <REPLACE-WITH-HOST>
  - name: serverPort
    value: <REPLACE-WITH-PORT>
```

## Spec metadata fields

| Field              | Required | Details | Example |
|--------------------|:--------:|---------|---------|
| hosts              | Y        | Specifies the address for the Cloudstate API | `"localhost:8013"`
| serverPort         | Y        | Specifies the port to be opened in Dapr for Cloudstate to callback to. This can be any free port that is not used by either your application or Dapr | `"8080"`

> Since Cloudstate is running as an additional sidecar in the pod, you can reach it via `localhost` with the default port of `8013`.

## Introduction

The Cloudstate-Dapr integration is unique in the sense that it enables developers to achieve high-throughput, low latency scenarios by leveraging Cloudstate running as a sidecar *next* to Dapr, keeping the state near the compute unit for optimal performance while providing replication between multiple instances that can be safely scaled up and down. This is due to Cloudstate forming an Akka cluster between its sidecars with replicated in-memory entities.

Dapr leverages Cloudstate's Conflict-free Replicated Data Type (CRDT) capabilities with last-write-wins semantics.

## Deploy Cloudstate into Kubernetes

To install Cloudstate on your Kubernetes cluster, run the following commands:

```bash
kubectl create namespace cloudstate
kubectl apply -n cloudstate -f https://github.com/cloudstateio/cloudstate/releases/download/v0.5.1/cloudstate-0.5.1.yaml
```

This installs Cloudstate into the `cloudstate` namespace with version `0.5.1`.

> Note that the `0.5.1` and `0.6.0` cloudstate yaml files still use the `apiextensions.k8s.io/v1beta1` API version for Custom Resource Definition (CRD). That API version has been deprecated as of Kubernetes v1.16 and unsupported as of v1.22, so plan accordingly when configuring the target Kubernetes cluster to which Cloudstate will be deployed.

## Apply the Dapr Cloudstate configuration

To apply the [Cloudstate Dapr state store configuration](#component-format) to your Kubernetes cluster, use the `kubectl` CLI:

```bash
kubectl apply -f cloudstate.yaml
```

## Run the Cloudstate sidecar with the app

To run the Cloudstate sidecar with your Dapr app, you can manually inject a Cloudstate sidecar into your app's Kubernetes deployment yaml.

Starting with a basic Dapr-enabled app deployment configuration as an example:

```yaml
kind: Service
apiVersion: v1
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "3000"
    spec:
      containers:
      - name: myapp
        image: myregistry/myapp-image:latest
        ports:
        - containerPort: 3000
```

To add the Cloudstate sidecar to that app deployment definition, you would:

- Add an additional `cloudstate-sidecar` container definition to the `Deployment`.
- Add the `cloudstate-pod-reader` RBAC role and grant it to the default service account.

The result would look like:

```yaml
kind: Service
apiVersion: v1
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "3000"
        dapr.io/metrics-port: "9091"
    spec:
      containers:
      - name: myapp
        image: myregistry/myapp-image:latest
        ports:
        - containerPort: 3000
      - name: cloudstate-sidecar
        env:
        - name: HTTP_PORT
          value: "8013"
        - name: USER_FUNCTION_PORT
          value: "8080"
        - name: REMOTING_PORT
          value: "2552"
        - name: MANAGEMENT_PORT
          value: "8558"
        - name: SELECTOR_LABEL_VALUE
          value: myapp
        - name: SELECTOR_LABEL
          value: app
        - name: REQUIRED_CONTACT_POINT_NR
          value: "1"
        - name: JAVA_OPTS
          value: -Xms256m -Xmx256m
        image: cloudstateio/cloudstate-proxy-no-store:0.5.1
        livenessProbe:
          httpGet:
            path: /alive
            port: 8558
            scheme: HTTP
          initialDelaySeconds: 2
          failureThreshold: 20
          periodSeconds: 2
        readinessProbe:
          httpGet:
            path: /ready
            port: 8558
            scheme: HTTP
          initialDelaySeconds: 2
          failureThreshold: 20
          periodSeconds: 10
        resources:
          limits:
            memory: 512Mi
          requests:
            cpu: 400m
            memory: 512Mi

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: cloudstate-pod-reader
  namespace: default
rules:
- apiGroups:
  - ""
  resources:
  - pods
  verbs:
  - get
  - watch
  - list

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: cloudstate-read-pods-default
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: cloudstate-pod-reader
subjects:
- kind: ServiceAccount
  name: default
```

A few details to pay attention to:

- The `HTTP_PORT` and `USER_FUNCTION_PORT` values should match the values specified in the [Dapr Cloudstate component configuration](#component-format) for your cluster.
- The `SELECTOR_LABEL` and `SELECTOR_LABEL_VALUE` should match the what has been specified for your app configuration.
- You may need to specify a custom `dapr.io/metrics-port` annotation for your app deployment, since both Cloudstate and Dapr sidecars will attempt to use `9090` by default and a binding conflict on that port can prevent the Cloudstate container from running successfully.

## Related links

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) for instructions on configuring state store components
- [State management building block]({{< ref state-management >}})
