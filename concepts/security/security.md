# Security

## Dapr-to-app communication

Dapr sidecar runs close to the application through **localhost**. Dapr assumes it runs in the same security domain of the application. So, there are no authentication, authorization or encryption between a Dapr sidecar and the application.

## Dapr-to-Dapr communication

Dapr is designed for inter-component communications within an application. Dapr assumes these application components reside within the same trust boundary. Hence, Dapr doesn't secure across-Dapr communications by default.

However, in a multi-tenant environment, a secured communication channel among Dapr sidecars becomes necessary. Supporting TLS and other authentication, authorization, and encryption methods is on the Dapr roadmap.

An alternative is to use service mesh technologies such as [Istio]( https://istio.io/) to provide secured communications among your application components. Dapr works well with popular service meshes.

By default, Dapr supports Cross-Origin Resource Sharing (CORS) from all origins. You can configure Dapr runtime to allow only specific origins.  

## Network security

You can adopt common network security technologies such as network security groups (NSGs), demilitarized zones (DMZs) and firewalls to provide layers of protections over your networked resources.

For example, unless configured to talk to an external binding target, Dapr sidecars don’t open connections to the Internet. And most binding implementations use outbound connections only. You can design your firewall rules to allow outbound connections only through designated ports.

## Bindings security

Authentication with a binding target is configured by the binding’s configuration file. Generally, you should configure the minimum required access rights. For example, if you only read from a binding target, you should configure the binding to use an account with read-only access rights.

## State store security

Dapr doesn't transform the state data from applications. This means Dapr doesn't attempt to encrypt/decrypt state data. However, your application can adopt encryption/decryption methods of your choice, and the state data remains opaque to Dapr.

Dapr uses the configured authentication method to authenticate with the underlying state store. And many state store implementations use official client libraries that generally use secured communication channels with the servers.

## Management security

When deploying on Kubernetes, you can use regular [Kubernetes RBAC]( https://kubernetes.io/docs/reference/access-authn-authz/rbac/) to control access to management activities.

When deploying on Azure Kubernetes Service (AKS), you can use [Azure Active Directory (AD) service principals]( https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals) to control access to management activities and resource management.

## Component secrets

Dapr components uses Dapr's built-in secret management capability to manage secrets. Please see the [secret topic](../components/secrets.md) for more details.
