---
type: docs
title: "How-To: Set-up New Relic to collect and analyze metrics"
linkTitle: "New Relic"
weight: 6000
description: "Set-up New Relic for Dapr metrics"
---

## Prerequisites

- Perpetually [free New Relic account](https://newrelic.com/signup?ref=dapr), 100 GB/month of free data ingest, 1 free full access user, unlimited free basic users

## Background

New Relic offers a Prometheus OpenMetrics Integration.

This document explains how to install it in your cluster, either using a Helm chart (recommended).

## Installation

1. Install Helm following the official instructions.

2. Add the New Relic official Helm chart repository following [these instructions](https://github.com/newrelic/helm-charts/blob/master/README.md#installing-charts)

3. Run the following command to install the New Relic Logging Kubernetes plugin via Helm, replacing the placeholder value YOUR_LICENSE_KEY with your [New Relic license key](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key):

    ```bash
    helm install nri-prometheus newrelic/nri-prometheus --set licenseKey=YOUR_LICENSE_KEY
    ```

## View Metrics

![Dapr Metrics](/images/nr-metrics-1.png)

![Dashboard](/images/nr-dashboard-dapr-metrics-1.png)

## Related Links/References

* [New Relic Account Signup](https://newrelic.com/signup)
* [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic Prometheus OpenMetrics Integration](https://github.com/newrelic/helm-charts/tree/master/charts/nri-prometheus)
* [Types of New Relic API keys](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
