---
type: docs
title: "Authenticating to AWS"
linkTitle: "Authenticating to AWS"
weight: 10
description: "Information about authentication and configuration options for AWS"
aliases:
  - /developing-applications/integrations/authenticating/authenticating-aws/
---

All Dapr components using various AWS services (DynamoDB, SQS, S3, etc) use a standardized set of attributes for configuration via the AWS SDK. [Learn more about how the AWS SDK handles credentials](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials).

Since you can configure the AWS SDK using the default provider chain, all of the following attributes are optional. Test the component configuration and inspect the log output from the Dapr runtime to ensure that components initialize correctly.

| Attribute | Description |
| --------- | ----------- |
| `region` | Which AWS region to connect to. In some situations (when running Dapr in self-hosted mode, for example), this flag can be provided by the environment variable `AWS_REGION`. Since Dapr sidecar injection doesn't allow configuring environment variables on the Dapr sidecar, it is recommended to always set the `region` attribute in the component spec. |
| `endpoint` | The endpoint is normally handled internally by the AWS SDK. However, in some situations it might make sense to set it locally - for example if developing against [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html). |
| `accessKey` | AWS Access key id. |
| `secretKey` | AWS Secret access key. Use together with `accessKey` to explicitly specify credentials. |
| `sessionToken` | AWS Session token. Used together with `accessKey` and `secretKey`. When using a regular IAM user's access key and secret, a session token is normally not required. |

{{% alert title="Important" color="warning" %}}
You **must not** provide AWS access-key, secret-key, and tokens in the definition of the component spec you're using:
- When running the Dapr sidecar (`daprd`) with your application on EKS (AWS Kubernetes)
- If using a node/pod that has already been attached to an IAM policy defining access to AWS resources 
{{% /alert %}}

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
