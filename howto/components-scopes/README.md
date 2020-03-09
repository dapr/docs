# Scope components to be used by one or more applications

There are two things to know about Dapr components in terms of security and access.
First, Dapr components are namespaced. That means a Dapr runtime instance can only access components that have been deployed to the same namespace.

Although namespace sounds like a Kubernetes term, this is true for Dapr not only on Kubernetes.

## Namespaces

### Example of component namespacing in Kubernetes

Let's consider the following component in Kubernetes:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: redis-master:6379
```

This component will only be accessible to Dapr instances running inside the `production` namespace.

### Example of component namsespacing in self-hosted mode

In self hosed, a developer can specify the namespace to a Dapr instance by setting the `NAMESPACE` environment variable.
If the `NAMESPACE` environment variable is set, Dapr will not load any component that does not specify the same namespace in its metadata.

Considering the example above, to tell Dapr which namespace it is deployed to, set the environment variable:

```bash
export NAMESPACE=production

# run Dapr as usual
```

When Dapr will run, it will match it's own configured namespace with the namespace of the components that it loads and init the matching ones.

## Scopes

Developers and operators might want to limit access for one database to a certain application, or a number of applications.
To achieve that, Dapr allows to specify `scopes` on the component YAML.

The following example shows how to give access to the Redis component to two Dapr-enabled apps, with the IDs of `app1` and `app2`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  metadata:
  - name: redisHost
    value: redis-master:6379
scopes:
- app1
- app2
```
