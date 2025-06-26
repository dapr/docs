---
type: docs
title: "AWS Cloudmap"
linkTitle: "AWS Cloudmap"
description: Detailed information on the AWS Cloudmap name resolution component
---


This component uses [AWS Cloud Map](https://aws.amazon.com/cloud-map/) for service discovery in Dapr. It supports both HTTP and DNS namespaces, allowing services to discover and connect to other services using AWS Cloud Map's service discovery capabilities.

## Component Format

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "aws.cloudmap"
    configuration:
      # Required: AWS CloudMap namespace configuration (one of these is required)
      namespaceName: "my-namespace"  # The name of your CloudMap namespace
      # namespaceId: "ns-xxxxxx"    # Alternative: Use namespace ID instead of name

      # Optional: AWS authentication (choose one authentication method)
      # Option 1: Environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
      # Option 2: IAM roles for Amazon EKS
      # Option 3: Explicit credentials (not recommended for production)
      accessKey: "****"
      secretKey: "****"
      sessionToken: "****"  # Optional

      # Optional: AWS region and endpoint configuration
      region: "us-west-2"
      endpoint: "http://localhost:4566"  # Optional: Custom endpoint for testing

      # Optional: Dapr configuration
      defaultDaprPort: 50002  # Default port for Dapr sidecar if not specified in instance attributes
```

## Specification

### AWS Authentication

The component supports multiple authentication methods:

1. Environment Variables:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_SESSION_TOKEN (optional)

2. IAM Roles:
   - When running on AWS (EKS, EC2, etc.), the component can use IAM roles

3. Explicit Credentials:
   - Provided in the component metadata (not recommended for production)

### Required Permissions

The AWS credentials must have the following permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "servicediscovery:DiscoverInstances",
                "servicediscovery:GetNamespace",
                "servicediscovery:ListNamespaces"
            ],
            "Resource": "*"
        }
    ]
}
```

### Configuration Options

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| namespaceName | string | One of namespaceName or namespaceId | "" | The name of your AWS CloudMap namespace |
| namespaceId | string | One of namespaceName or namespaceId | "" | The ID of your AWS CloudMap namespace |
| region | string | N | "" | AWS region. If not provided, will be determined from environment or instance metadata |
| endpoint | string | N | "" | Custom endpoint for AWS CloudMap API. Useful for testing with LocalStack |
| defaultDaprPort | number | N | 3500 | Default port for Dapr sidecar if not specified in instance attributes |

### Service Registration

To use this name resolver, your services must be registered in AWS CloudMap. When registering instances, ensure they have the following attributes:

1. Required: One of these address attributes:
   - `AWS_INSTANCE_IPV4`: IPv4 address of the instance
   - `AWS_INSTANCE_IPV6`: IPv6 address of the instance
   - `AWS_INSTANCE_CNAME`: Hostname of the instance

2. Optional: Dapr sidecar port attribute:
   - `DAPR_PORT`: The port that the Dapr sidecar is listening on
   - If not specified, the component will use the `defaultDaprPort` from configuration (defaults to 3500)

The resolver will only return healthy instances (those with `HEALTHY` status) to ensure reliable service communication.

Example instance attributes:
```json
{
    "AWS_INSTANCE_IPV4": "10.0.0.1",
    "DAPR_PORT": "50002"
}
```


## Example Usage

### Minimal Configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "aws.cloudmap"
    configuration:
      namespaceName: "mynamespace.dev"
      defaultDaprPort: 50002
```

### Local Development with LocalStack

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  nameResolution:
    component: "aws.cloudmap"
    configuration:
      namespaceName: "my-namespace"
      region: "us-east-1"
      endpoint: "http://localhost:4566"
      accessKey: "test"
      secretKey: "test"
``` 