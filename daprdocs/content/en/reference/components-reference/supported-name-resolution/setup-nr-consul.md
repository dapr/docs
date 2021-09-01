---
type: docs
title: "HashiCorp Consul name resolution provider spec"
linkTitle: "HashiCorp Consul"
description: Detailed information on the HashiCorp Consul name resolution component
---

## Configuration format

Hashicorp Consul is setup within the [Dapr Configuration]({{< ref configuration-overview.md >}}).

Within the config, add a `nameResolution` spec and set the `component` field to `"consul"`.

If you are using the Dapr sidecar to register your service to Consul then you will need the following configuration:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
    configuration:
      selfRegister: true
```

If Consul service registration is managed externally from Dapr you need to ensure that the Dapr-to-Dapr internal gRPC port is added to the service metadata under `DAPR_PORT` (this key is configurable) and that the Consul service Id matches the Dapr app Id. You can then omit `selfRegister` from the config above.

## Behaviour

On `init` the Consul component either validates the connection to the configured (or default) agent or registers the service if configured to do so. The name resolution interface does not cater for an "on shutdown" pattern so consider this when using Dapr to register services to Consul as it does not deregister services.

The component resolves target apps by filtering healthy services and looks for a `DAPR_PORT` in the metadata (key is configurable) in order to retrieve the Dapr sidecar port. Consul `service.meta` is used over `service.port` so as to not interfere with existing Consul estates.


## Spec configuration fields

The configuration spec is fixed to v1.3.0 of the Consul API

| Field        | Required | Type | Details  | Examples |
|--------------|:--------:|-----:|:---------|----------|
| Client       | N        | [*api.Config](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#Config) | Configures client connection to the Consul agent. If blank it will use the sdk defaults, which in this case is just an address of `127.0.0.1:8500` | `10.0.4.4:8500`
| QueryOptions | N        | [*api.QueryOptions](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#QueryOptions) | Configures query used for resolving healthy services, if blank it will default to `UseCache:true` | `UseCache: false`, `Datacenter: "myDC"`
| Checks       | N        | [[]*api.AgentServiceCheck](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#AgentServiceCheck) | Configures health checks if/when registering. If blank it will default to a single health check on the Dapr sidecar health endpoint | See [sample configs](#sample-configurations)
| Tags         | N        | `[]string` | Configures any tags to include if/when registering services | `- "dapr"`
| Meta         | N        | `map[string]string` | Configures any additional metadata to include if/when registering services | `DAPR_METRICS_PORT: "${DAPR_METRICS_PORT}"`
| DaprPortMetaKey | N     | `string` | The key used for getting the Dapr sidecar port from Consul service metadata during service resolution, it will also be used to set the Dapr sidecar port in metadata during registration. If blank it will default to `DAPR_PORT` | `"DAPR_TO_DAPR_PORT"`
| SelfRegister | N        | `bool` | Controls if Dapr will register the service to Consul. The name resolution interface does not cater for an "on shutdown" pattern so please consider this if using Dapr to register services to Consul as it will not deregister services. If blank it will default to `false` | `true`
| AdvancedRegistration | N | [*api.AgentServiceRegistration](https://pkg.go.dev/github.com/hashicorp/consul/api@v1.3.0#AgentServiceRegistration) | Gives full control of service registration through configuration. If configured the component will ignore any configuration of Checks, Tags, Meta and SelfRegister. | See [sample configs](#sample-configurations)

## Sample configurations

### Basic

The minimum configuration needed is the following:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
```

### Registration with additional customizations

Enabling `SelfRegister` it is then possible to customize the checks, tags and meta

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
    configuration:
      client:
        address: "127.0.0.1:8500"
      selfRegister: true
      checks:
        - name: "Dapr Health Status"
          checkID: "daprHealth:${APP_ID}"
          interval: "15s"
          http: "http://${HOST_ADDRESS}:${DAPR_HTTP_PORT}/v1.0/healthz"
        - name: "Service Health Status"
          checkID: "serviceHealth:${APP_ID}"
          interval: "15s"
          http: "http://${HOST_ADDRESS}:${APP_PORT}/health"
      tags:
        - "dapr"
        - "v1"
        - "${OTHER_ENV_VARIABLE}"
      meta:
        DAPR_METRICS_PORT: "${DAPR_METRICS_PORT}"
        DAPR_PROFILE_PORT: "${DAPR_PROFILE_PORT}"
      daprPortMetaKey: "DAPR_PORT"
      queryOptions:
        useCache: true
        filter: "Checks.ServiceTags contains dapr"
```

### Advanced registration

Configuring the advanced registration gives you full control over setting all the Consul properties possible when registering.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "consul"
    configuration:
      client:
          address: "127.0.0.1:8500"
      selfRegister: false
      queryOptions:
        useCache: true
      daprPortMetaKey: "DAPR_PORT"
      advancedRegistration:
        name: "${APP_ID}"
        port: ${APP_PORT}
        address: "${HOST_ADDRESS}"
        check:
          name: "Dapr Health Status"
          checkID: "daprHealth:${APP_ID}"
          interval: "15s"
          http: "http://${HOST_ADDRESS}:${DAPR_HTTP_PORT}/v1.0/healthz"
        meta:
          DAPR_METRICS_PORT: "${DAPR_METRICS_PORT}"
          DAPR_PROFILE_PORT: "${DAPR_PROFILE_PORT}"
        tags:
          - "dapr"
```

## Setup HashiCorp Consul
{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
HashiCorp offer in depth guides on how to setup Consul for different hosting models. Check out the [self-hosted guide here](https://learn.hashicorp.com/collections/consul/getting-started)
{{% /codetab %}}

{{% codetab %}}
HashiCorp offer in depth guides on how to setup Consul for different hosting models. Check out the [Kubernetes guide here](https://learn.hashicorp.com/collections/consul/gs-consul-service-mesh)
{{% /codetab %}}

{{< /tabs >}}

## Related links
- [Service invocation building block]({{< ref service-invocation >}})
