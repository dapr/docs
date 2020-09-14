# Scope components to be used by one or more applications

There are two things to know about Dapr components in terms of security and access.
First, Dapr components are namespaced. That means a Dapr runtime instance can only access components that have been deployed to the same namespace.

Although namespace sounds like a Kubernetes term, this is true for Dapr not only on Kubernetes.

## Namespaces
Namespaces can be used to limit component access to particular Dapr instances.

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

In this example, the Redis component is only accessible to Dapr instances running inside the `production` namespace.

### Example of component namsespacing in self-hosted mode

In self hosted mode, a developer can specify the namespace to a Dapr instance by setting the `NAMESPACE` environment variable.
If the `NAMESPACE` environment variable is set, Dapr will not load any component that does not specify the same namespace in its metadata.

Considering the example above, to tell Dapr which namespace it is deployed to, set the environment variable:

MacOS/Linux:

```bash
export NAMESPACE=production

# run Dapr as usual
```

Windows:

```powershell
setx NAMESPACE "production"

# run Dapr as usual
```


When Dapr runs, it matches it's own configured namespace with the namespace of the components that it loads and initializes only the the one matching its namespaces. All other components in a different namespace are not loaded.

## Application access to components with scopes

Developers and operators might want to limit access for one database to a certain application, or a specific set of applications.
To achieve this, Dapr allows you to specify `scopes` on the component YAML. Application scopes added to a component limit only the applications with specific IDs to be able to use the component.

The following example shows how to give access to two Dapr enabled apps, with the app IDs of `app1` and `app2` to the Redis component named `statestore` which itself is in the `production` namespace 

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
Watch this [video](https://www.youtube.com/watch?v=8W-iBDNvCUM&feature=youtu.be&t=1765) for an example on how to component scopes with secret components and the secrets API.