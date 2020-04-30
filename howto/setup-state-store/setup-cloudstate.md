# Setup Cloudstate 

The Cloudstate-Dapr integration is unique in the sense that it enables developers to achieve high-throughput, low latency scenarios by leveraging Cloudstate running as a sidecar *next* to Dapr, keeping the state near the compute unit for optimal performance while providing replication between multiple instances that can be safely scaled up and down. This is due to Cloudstate forming an Akka cluster between its sidecars with replicated in-memory entities.

Dapr leverages Cloudstate's CRDT capabilities with last-write-wins semantics.

## Kubernetes

To install Cloudstate on your Kubernetes cluster, run the following commands:

```
kubectl create namespace cloudstate
kubectl apply -n cloudstate -f https://github.com/cloudstateio/cloudstate/releases/download/v0.5.0/cloudstate-0.5.0.yaml
```

This will install Cloudstate into the `cloudstate` namespace with version `0.5.0`.

## Create a Dapr component

The next step is to create a Dapr component for Cloudstate.

Create the following YAML file named `cloudstate.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cloudstate
  namespace: default
spec:
  type: state.cloudstate
  metadata:
  - name: host
    value: "localhost:8013"
  - name: serverPort
    value: "8080"
```

The `metadata.host` field specifies the address for the Cloudstate API. Since Cloudstate will be running as an additional sidecar in the pod, you can reach it via `localhost` with the default port of `8013`.

The `metadata.serverPort` field specifies the port to be opened in Dapr for Cloudstate to callback to. This can be any free port that is not used by either your application or Dapr.

## Apply the configuration

### In Kubernetes

To apply the Cloudstate state store to Kubernetes, use the `kubectl` CLI:

```
kubectl apply -f cloudstate.yaml
```

## Running the Cloudstate sidecar alongside Dapr

The next examples shows you how to manually inject a Cloudstate sidecar into a Dapr enabled deployment:

*Notice the `HTTP_PORT` for the `cloudstate-sidecar` container is the port to be used in the Cloudstate component yaml in `host`.*

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  annotations:
  name: test-dapr-app
  namespace: default
  labels:
    app: test-dapr-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: test-dapr-app
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/id: "testapp"
      labels:
        app: test-dapr-app
    spec:
      containers:
      - name: user-container
        image: nginx
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
          value: test-dapr-app
        - name: SELECTOR_LABEL
          value: app
        - name: REQUIRED_CONTACT_POINT_NR
          value: "1"
        - name: JAVA_OPTS
          value: -Xms256m -Xmx256m
        image: cloudstateio/cloudstate-proxy-no-store:0.5.0
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
