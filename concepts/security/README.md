# Security

- [Dapr-to-App Communication](#dapr-to-app-communication)
- [Dapr-to-Dapr Communication](#dapr-to-dapr-communication)
- [Network Security](#network-security)
- [Bindings Security](#bindings-security)
- [State Store Security](#state-store-security)
- [Management Security](#management-security)
- [Component Secrets](#component-secets)

## Dapr-to-app communication

Dapr sidecar runs close to the application through **localhost**. Dapr assumes it runs in the same security domain of the application. So, there are no authentication, authorization or encryption between a Dapr sidecar and the application.

## Dapr-to-dapr communication

Dapr includes an on by default, automatic mutual TLS that provides in-transit encryption for traffic between Dapr instances.
To achieve this, Dapr leverages a system component named `Sentry` which acts as a Certificate Authority (CA) and signs workload certificate requests originating from the Dapr instances.

Dapr also manages workload certificate rotation, and does so with zero downtime to the application.

Sentry, the CA component, automatically creates and persists self signed root certificates valid for one year, unless existing root certs have been provided by the user.

When root certs are replaced (secret in Kubernetes mode and filesystem for self hosted mode), Sentry will pick them up and re-build the trust chain without needing to restart, with zero downtime to Sentry.

When a new Dapr sidecar initializes, it first checks if mTLS is enabled. If it is, an ECDSA private key and certificate signing request are generated and sent to Sentry via a gRPC interface. The communication between the Dapr sidecar and Sentry is authenticated using the trust chain cert, which is injected into each Dapr instance by the Dapr sidecar injector.

In a Kubernetes cluster, the secret that holds the root certificates is scoped to the namespace in which the Dapr components are deployed to and is only accessible by the Dapr system pods.

Dapr also supports strong identities when deployed on Kubernetes, relying on a pod's Service Account token which is sent as part of the certificate signing request (CSR) to Sentry.

By default, a workload cert is valid for 24 hours and the clock skew is set to 15 minutes.

Mutual TLS can be turned off/on by editing the default configuration that is deployed with Dapr via the `spec.mtls.enabled` field.
This can be done for both Kubernetes and self hosted modes.
Specific details for how to do that can be found [here](../../howto/configure-mtls).

### mTLS in Kubernetes

<a href="https://ibb.co/4VXWJ3d"><img src="https://i.ibb.co/rwzkvNs/Screen-Shot-2020-02-10-at-8-35-59-PM.png" alt="Screen-Shot-2020-02-10-at-8-35-59-PM" border="0"></a>

### mTLS self hosted

<a href="https://ibb.co/XWFYsfY"><img src="https://i.ibb.co/rQ5d6Kd/Screen-Shot-2020-02-10-at-8-34-33-PM.png" alt="Screen-Shot-2020-02-10-at-8-34-33-PM" border="0"></a>

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

Dapr components uses Dapr's built-in secret management capability to manage secrets. Please see the [secret topic](../secrets/README.md) for more details.
