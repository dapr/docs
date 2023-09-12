---
type: docs
title: "How-To: Set-up New Relic for Dapr logging"
linkTitle: "New Relic"
weight: 3000
description: "Set-up New Relic for Dapr logging"
---

## Prerequisites

- Perpetually [free New Relic account](https://newrelic.com/signup?ref=dapr), 100 GB/month of free data ingest, 1 free full access user, unlimited free basic users

## Background

New Relic offers a [Fluent Bit](https://fluentbit.io/) output [plugin](https://github.com/newrelic/newrelic-fluent-bit-output) to easily forward your logs to [New Relic Logs](https://github.com/newrelic/newrelic-fluent-bit-output). This plugin is also provided in a standalone Docker image that can be installed in a Kubernetes cluster in the form of a DaemonSet, which we refer as the Kubernetes plugin.

This document explains how to install it in your cluster, either using a Helm chart (recommended), or manually by applying Kubernetes manifests.

## Installation

### Install using the Helm chart (recommended)

1. Install Helm following the official instructions.

2. Add the New Relic official Helm chart repository following these instructions

3. Run the following command to install the New Relic Logging Kubernetes plugin via Helm, replacing the placeholder value YOUR_LICENSE_KEY with your [New Relic license key](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key/):

- Helm 3
    ```bash
    helm install newrelic-logging newrelic/newrelic-logging --set licenseKey=YOUR_LICENSE_KEY
    ```

- Helm 2
    ```bash
    helm install newrelic/newrelic-logging --name newrelic-logging --set licenseKey=YOUR_LICENSE_KEY
    ```

For EU users, add `--set endpoint=https://log-api.eu.newrelic.com/log/v1 to any of the helm install commands above.

By default, tailing is set to /var/log/containers/*.log. To change this setting, provide your preferred path by adding --set fluentBit.path=DESIRED_PATH to any of the helm install commands above.

### Install the Kubernetes manifest

1. Download the following 3 manifest files into your current working directory:

    ```bash
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/fluent-conf.yml > fluent-conf.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/new-relic-fluent-plugin.yml > new-relic-fluent-plugin.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/rbac.yml > rbac.yml
    ```

2. In the downloaded new-relic-fluent-plugin.yml file, replace the placeholder value LICENSE_KEY with your New Relic license key.

    For EU users, replace the ENDPOINT environment variable to https://log-api.eu.newrelic.com/log/v1.

3. Once the License key has been added, run the following command in your terminal or command-line interface:
    ```bash
    kubectl apply -f .
    ```

4. [OPTIONAL] You can configure how the plugin parses the data by editing the parsers.conf section in the fluent-conf.yml file. For more information, see Fluent Bit's documentation on Parsers configuration.

    By default, tailing is set to /var/log/containers/*.log. To change this setting, replace the default path with your preferred path in the new-relic-fluent-plugin.yml file.

## View Logs

![Dapr Annotations](/images/nr-logging-1.png)

![Search](/images/nr-logging-2.png)

## Related Links/References

* [New Relic Account Signup](https://newrelic.com/signup)
* [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic Logging](https://github.com/newrelic/helm-charts/tree/master/charts/newrelic-logging)
* [Types of New Relic API keys](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
