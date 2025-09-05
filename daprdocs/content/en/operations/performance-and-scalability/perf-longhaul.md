---
type: docs
title: "Longhaul performance and stability"
linkTitle: "Longhaul performance and stability"
weight: 10000
description: ""
---

This article provides longhaul performance and stability benchmarks for Dapr on Kubernetes.

The longhaul tests are designed to run for a period of a week, validating the stability of Dapr and its components, while measuring resource utilization and performance over time.

## Public Dashboard

You can access the live longhaul test results on the public Grafana dashboard. This dashboard is updated in near real-time, showing the latest results from the longhaul tests.
 
[Dapr Longhaul Dashboard](https://dapr.grafana.net/public-dashboards/86d748b233804e74a16d8243b4b64e18).

## System overview

The longhaul environment is run on a 3 node managed Azure Kubernetes Service (AKS) cluster, using standard D2s_v5 nodes running 2 cores and 8GB of RAM, with network acceleration.

## Test Applications

- Feed generator
- Hashtag Actor
- Hashtag counter
- Message Analyzer
- Pubsub Workflow
- Streaming Pubsub Publisher / Producer
- Streaming Pubsub Subscriber / Consumer
- Snapshot App
- Validation Worker App
- Scheduler Jobs App
- Workflow Gen App
- Scheduler Actor Reminders - Client
- Scheduler Actor Reminders - Server
- Scheduler Workflow App

## Redeployments

The longhaul test environment is redeployed every 7 days (Fridays at 08:00 UTC).

## Test Infrastructure

The test infrastructure is sourced from this [GitHub repository](https://github.com/dapr/test-infra).

It is a mixture of Bicep IaC templates and Helm charts to deploy the test applications and Dapr.

