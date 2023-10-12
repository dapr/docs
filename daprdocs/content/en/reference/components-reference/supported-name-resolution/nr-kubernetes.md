---
type: docs
title: "Kubernetes DNS name resolution provider spec"
linkTitle: "Kubernetes DNS"
description: Detailed information on the Kubernetes DNS name resolution component
---

## Configuration format

Generally, Kubernetes DNS name resolution is configured automatically in [Kubernetes mode]({{< ref kubernetes >}}) by Dapr. There is no configuration needed to use Kubernetes DNS as your name resolution provider unless some overrides are necessary for the Kubernetes name resolution component.

In the scenario that an override is required, within a [Dapr Configuration]({{< ref configuration-overview.md >}}) CRD, add a `nameResolution` spec and set the `component` field to `"kubernetes"`. The other configuration fields can be set as needed in a `configuration` map, as seen below.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "kubernetes"
    configuration:
      clusterDomain: "cluster.local"  # Mutually exclusive with the template field
      template: "{{.ID}}-{{.Data.region}}.internal:{{.Port}}" # Mutually exclusive with the clusterDomain field
```

## Behaviour

The component resolves target apps by using the Kubernetes cluster's DNS provider. You can learn more in the [Kubernetes docs](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/).

## Spec configuration fields

The configuration spec is fixed to v1.3.0 of the Consul API

| Field        | Required | Type | Details  | Examples |
|--------------|:--------:|-----:|:---------|----------|
| clusterDomain       | N        | `string` | The cluster domain to be used for resolved addresses. This field is mutually exclusive with the `template` file.| `cluster.local`
| template | N        | `string` | A template string to be parsed when addresses are resolved using [text/template](https://pkg.go.dev/text/template#Template) . The template will be populated by the fields in the [ResolveRequest](https://github.com/dapr/components-contrib/blob/release-{{% dapr-latest-version short="true" %}}/nameresolution/requests.go#L20) struct. This field is mutually exclusive with `clusterDomain` field. | `{{.ID}}-{{.Data.region}}.{{.Namespace}}.internal:{{.Port}}`


## Related links

- [Service invocation building block]({{< ref service-invocation >}})
- [Kubernetes DNS docs](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)