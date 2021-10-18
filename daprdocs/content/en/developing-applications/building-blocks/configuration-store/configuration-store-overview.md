---
type: docs
title: "Configuration overview"
linkTitle: "Overview"
weight: 10
description: Overview of the configuration building block
aliases:
---

## Introduction
Using configuration, you can get your application configuration using dapr's API. The configuration can be stored in configuration store you like. This building block's  benefit is to let you to get application configuration easily from any mature solution, like redis, nacos, etc. We call each implement of configuration is a kind of state store. In the API, the statestore parameter is also used to distinguish the configuration stores selected by the user

## Get Configuration

Get configuration operation can be used to get configuraiton content from target state store with target key. The user can start the application and load it from the required State Store with an API call.

## Subscribe Configuration

Subscribe configuration can be used to subscribe configuration in target state store with target key. It would first get exist data and subscribe the changes of target configuration. 

