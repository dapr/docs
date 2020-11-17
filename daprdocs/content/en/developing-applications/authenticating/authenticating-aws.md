---
type: docs
title: "AWS"
linkTitle: "AWS"
weight: 10
description: "Information about authentication and configuration options for AWS"
---

All dapr components using various AWS services (DynamoDB, SQS, S3, etc) use a standardized set of attributes for configuration, these are described below.

<https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials> provides a good overview of how the AWS SDK (which dapr uses) handles credentials

None of the following attributes are required, since the AWS SDK may be configured using the default provider chain described in the link above. It's important to test the component configuration and inspect the log output from daprd to ensure that components initialize correctly.

`region`: Which AWS region to connect to. In some situations (when running dapr stand-alone for example) this flag can be provided by the environment variable `AWS_REGION`. Since dapr sidecar injection doesn't allow configuring environment variables on the daprd sidecar, it is recommended to always set the `region` attribute in the component spec.

`endpoint`: The endpoint is normally handled internally by the AWS SDK. However, in some situations it might make sense to set it locally - for example if developing against DynamoDB Local <https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html>.

`accessKey`: AWS Access key id.
`secretKey`: AWS Secret access key. Use together with `accessKey` to explicitly specify credentials.
`sessionToken`: AWS Session token. Used together with `accessKey` and `secretKey`. When using a regular IAM user's access key and secret, a session token is normally NOT required.

## Alternatives to explicitly specifying credentials in component manifest files
In production scenarios, it is recommended to use a solution such as Kiam <https://github.com/uswitch/kiam> or kube2iam <https://github.com/jtblin/kube2iam>. If running on AWS EKS, you can link an IAM role to a Kubernetes service account, which your pod can use <https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html>.

All of these solutions solve the same problem: They allow the daprd sidecar to retrive credentials dynamically, so that explicit credentials aren't needed. This provides several benefits, such as automated key rotation, and avoiding having to manage secrets. 

Both Kiam and Kube2IAM work by intercepting calls to the instance metadata service <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html>.

## Using instance role/profile when running in stand-alone mode on AWS EC2
If running dapr directly on an AWS EC2 instance in stand-alone mode, instance profiles can be used. Simply configure an iam role and attach it to the instance profile for the ec2 instance <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html>, and Dapr should be able to authenticate to AWS without specifying credentials in the component manifest.