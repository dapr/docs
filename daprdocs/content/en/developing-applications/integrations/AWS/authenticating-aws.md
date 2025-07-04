---
type: docs
title: "Authenticating to AWS"
linkTitle: "Authenticating to AWS"
weight: 10
description: "Information about authentication and configuration options for AWS"
aliases:
  - /developing-applications/integrations/authenticating/authenticating-aws/
---

Dapr components leveraging AWS services (for example, DynamoDB, SQS, S3) utilize standardized configuration attributes via the AWS SDK. [Learn more about how the AWS SDK handles credentials](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials).

You can configure authentication using the AWS SDK’s default provider chain or one of the predefined AWS authentication profiles outlined below. Verify your component configuration by testing and inspecting Dapr runtime logs to confirm proper initialization.

### Terminology
- **ARN (Amazon Resource Name):** A unique identifier used to specify AWS resources. Format: `arn:partition:service:region:account-id:resource`. Example: `arn:aws:iam::123456789012:role/example-role`.
- **IAM (Identity and Access Management):** AWS's service for managing access to AWS resources securely.

### Authentication Profiles

#### Access Key ID and Secret Access Key
Use static Access Key and Secret Key credentials, either through component metadata fields or via [default AWS configuration](https://docs.aws.amazon.com/sdkref/latest/guide/creds-config-files.html). 

{{% alert title="Important" color="warning" %}}
Prefer loading credentials via the default AWS configuration in scenarios such as:
- Running the Dapr sidecar (`daprd`) with your application on EKS (AWS Kubernetes).
- Using nodes or pods attached to IAM policies that define AWS resource access.
{{% /alert %}}

| Attribute | Required | Description | Example |
| --------- | ----------- | ----------- | ----------- |
| `region` | Y | AWS region to connect to. | "us-east-1" |
| `accessKey` | N | AWS Access key id. Will be required in Dapr v1.17. | "AKIAIOSFODNN7EXAMPLE" |
| `secretKey` | N | AWS Secret access key, used alongside `accessKey`. Will be required in Dapr v1.17. | "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" |
| `sessionToken` | N | AWS Session token, used with `accessKey` and `secretKey`. Often unnecessary for IAM user keys. | |

#### Assume IAM Role
This profile allows Dapr to assume a specific IAM Role. Typically used when the Dapr sidecar runs on EKS or nodes/pods linked to IAM policies. Currently supported by Kafka and PostgreSQL components.

| Attribute | Required | Description | Example |
| --------- | ----------- | ----------- | ----------- |
| `region` | Y | AWS region to connect to. | "us-east-1" |
| `assumeRoleArn` | N | ARN of the IAM role with AWS resource access. Will be required in Dapr v1.17. | "arn:aws:iam::123456789:role/mskRole" |
| `sessionName` | N | Session name for role assumption. Default is `"DaprDefaultSession"`. | "MyAppSession" |

#### Credentials from Environment Variables
Authenticate using [environment variables](https://docs.aws.amazon.com/sdkref/latest/guide/environment-variables.html). This is especially useful for Dapr in self-hosted mode where sidecar injectors don’t configure environment variables.

There are no metadata fields required for this authentication profile.

#### IAM Roles Anywhere
[IAM Roles Anywhere](https://aws.amazon.com/iam/roles-anywhere/) extends IAM role-based authentication to external workloads. It eliminates the need for long-term credentials by using cryptographically signed certificates, anchored in a trust relationship using Dapr PKI. Dapr SPIFFE identity X.509 certificates are used to authenticate to AWS services, and Dapr handles credential rotation at half the session lifespan.

To configure this authentication profile:
1. Create a Trust Anchor in the trusting AWS account using the Dapr certificate bundle as an `External certificate bundle`.
2. Create an IAM role with the resource permissions policy necessary, as well as a trust entity for the Roles Anywhere AWS service. Here, you specify SPIFFE identities allowed.
3. Create an IAM Profile under the Roles Anywhere service, linking the IAM Role.

| Attribute | Required | Description | Example |
| --------- | ----------- | ----------- | ----------- |
| `trustAnchorArn` | Y | ARN of the Trust Anchor in the AWS account granting trust to the Dapr Certificate Authority. | arn:aws:rolesanywhere:us-west-1:012345678910:trust-anchor/01234568-0123-0123-0123-012345678901 |
| `trustProfileArn` | Y | ARN of the AWS IAM Profile in the trusting AWS account. | arn:aws:rolesanywhere:us-west-1:012345678910:profile/01234568-0123-0123-0123-012345678901 |
| `assumeRoleArn` | Y | ARN of the AWS IAM role to assume in the trusting AWS account. | arn:aws:iam:012345678910:role/exampleIAMRoleName |

### Additional Fields

Some AWS components include additional optional fields:

| Attribute | Required | Description | Example |
| --------- | ----------- | ----------- | ----------- |
| `endpoint` | N | The endpoint is normally handled internally by the AWS SDK. However, in some situations it might make sense to set it locally - for example if developing against [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html). | |

Furthermore, non-native AWS components such as Kafka and PostgreSQL that support AWS authentication profiles have metadata fields to trigger the AWS authentication logic. Be sure to check specific component documentation.

## Alternatives to explicitly specifying credentials in component manifest files

In production scenarios, it is recommended to use a solution such as:
- [Kiam](https://github.com/uswitch/kiam) 
- [Kube2iam](https://github.com/jtblin/kube2iam) 

If running on AWS EKS, you can [link an IAM role to a Kubernetes service account](https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html), which your pod can use.

All of these solutions solve the same problem: They allow the Dapr runtime process (or sidecar) to retrieve credentials dynamically, so that explicit credentials aren't needed. This provides several benefits, such as automated key rotation, and avoiding having to manage secrets.

Both Kiam and Kube2IAM work by intercepting calls to the [instance metadata service](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html).

### Setting Up Dapr with AWS EKS Pod Identity

EKS Pod Identities provide the ability to manage credentials for your applications, similar to the way that Amazon EC2 instance profiles provide credentials to Amazon EC2 instances. Instead of creating and distributing your AWS credentials to the containers or using the Amazon EC2 instance’s role, you associate an IAM role with a Kubernetes service account and configure your Pods to use the service account.

To see a comprehensive example on how to authorize pod access to AWS Secrets Manager from EKS using AWS EKS Pod Identity, [follow the sample in this repository](https://github.com/dapr/samples/tree/master/dapr-eks-podidentity).

### Use an instance profile when running in stand-alone mode on AWS EC2

If running Dapr directly on an AWS EC2 instance in stand-alone mode, you can use instance profiles. 

1. Configure an IAM role.
1. [Attach it to the instance profile](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html) for the ec2 instance.

Dapr then authenticates to AWS without specifying credentials in the Dapr component manifest.

### Authenticate to AWS when running dapr locally in stand-alone mode

{{< tabs "Linux/MacOS" "Windows" >}}
 <!-- linux -->
{{% codetab %}}

When running Dapr (or the Dapr runtime directly) in stand-alone mode, you can inject environment variables into the process, like the following example: 

```bash
FOO=bar daprd --app-id myapp
```

If you have [configured named AWS profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) locally, you can tell Dapr (or the Dapr runtime) which profile to use by specifying the "AWS_PROFILE" environment variable:

```bash
AWS_PROFILE=myprofile dapr run...
```

or

```bash
AWS_PROFILE=myprofile daprd...
```

You can use any of the [supported environment variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list) to configure Dapr in this manner.

{{% /codetab %}}

 <!-- windows -->
{{% codetab %}}

On Windows, the environment variable needs to be set before starting the `dapr` or `daprd` command, doing it inline (like in Linux/MacOS) is not supported.

{{% /codetab %}}

{{< /tabs >}}

### Authenticate to AWS if using AWS SSO based profiles

If you authenticate to AWS using [AWS SSO](https://aws.amazon.com/single-sign-on/), some AWS SDKs (including the Go SDK) don't yet support this natively. There are several utilities you can use to "bridge the gap" between AWS SSO-based credentials and "legacy" credentials, such as:
- [AwsHelper](https://pypi.org/project/awshelper/) 
- [aws-sso-util](https://github.com/benkehoe/aws-sso-util)

{{< tabs "Linux/MacOS" "Windows" >}}
 <!-- linux -->
{{% codetab %}}

If using AwsHelper, start Dapr like this:

```bash
AWS_PROFILE=myprofile awshelper dapr run...
```

or

```bash
AWS_PROFILE=myprofile awshelper daprd...
```
{{% /codetab %}}

 <!-- windows -->
{{% codetab %}}

On Windows, the environment variable needs to be set before starting the `awshelper` command; doing it inline (like in Linux/MacOS) is not supported.

{{% /codetab %}}

{{< /tabs >}}

## Next steps

{{< button text="Refer to AWS component specs >>" page="components-reference" >}}

## Related links

- For more information, see [how the AWS SDK (which Dapr uses) handles credentials](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials).
- [EKS Pod Identity Documentation](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html)
- [AWS SDK Credentials Configuration](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials)
- [Set up an Elastic Kubernetes Service (EKS) cluster](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-eks/)
