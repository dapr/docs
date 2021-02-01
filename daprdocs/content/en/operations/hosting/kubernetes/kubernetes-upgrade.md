---
type: docs
title: "Steps to upgrade Dapr on a Kubernetes cluster"
linkTitle: "Upgrade Dapr"
weight: 50000
description: "Follow these steps to upgrade Dapr on Kubernetes and ensure a smooth upgrade."
---

## Prerequisites

- [Helm 3](https://github.com/helm/helm/releases)


## Upgrade existing cluster to 1.0.0 / 1.0.0-rc.3
From version 1.0.0-rc.3 onwards, upgrading Dapr using Helm is no longer a disruptive action since existing certificate values will automatically be re-used.

1. Upgrade Dapr from 1.0.0-rc.1 (or newer) to 1.0.0-rc.3 (or newer):

   ```bash
   helm repo update
   ```
   
   ```bash
   helm upgrade dapr dapr/dapr --version 1.0.0-rc.3 --namespace dapr-system --set global.ha.enabled=true --wait
   ```
   *If you're using a values file, remember to add the `--values` option when running the upgrade command.*

2. Ensure all pods are running:

   ```bash
   kubectl get pods -n dapr-system -w
   
   NAME                                     READY   STATUS    RESTARTS   AGE
   dapr-dashboard-69f5c5c867-mqhg4          1/1     Running   0          42s
   dapr-operator-5cdd6b7f9c-9sl7g           1/1     Running   0          41s
   dapr-operator-5cdd6b7f9c-jkzjs           1/1     Running   0          29s
   dapr-operator-5cdd6b7f9c-qzp8n           1/1     Running   0          34s
   dapr-placement-server-0                  1/1     Running   0          41s
   dapr-placement-server-1                  1/1     Running   0          41s
   dapr-placement-server-2                  1/1     Running   0          41s
   dapr-sentry-84565c747b-7bh8h             1/1     Running   0          35s
   dapr-sentry-84565c747b-fdlls             1/1     Running   0          41s
   dapr-sentry-84565c747b-ldnsf             1/1     Running   0          29s
   dapr-sidecar-injector-68f868668f-6xnbt   1/1     Running   0          41s
   dapr-sidecar-injector-68f868668f-j7jcq   1/1     Running   0          29s
   dapr-sidecar-injector-68f868668f-ltxq4   1/1     Running   0          36s
   ```

3. Restart your application deployments to update the Dapr runtime:

   ```bash
   kubectl rollout restart deploy/<DEPLOYMENT-NAME>
   ```

4. All done!


## Upgrade existing cluster to 1.0.0-rc.2
If you have an older Dapr version installed and want to upgrade to a version lower than 1.0.0-rc.3 (for example, upgrade from 0.11.1 to 1.0.0-rc.2), follow these steps:

1. Run these two commands to prevent `helm upgrade` from uninstalling `0.11.x` placement service:

   ```bash
   kubectl annotate deployment dapr-placement helm.sh/resource-policy=keep -n dapr-system
   ```
   ```bash
   kubectl annotate svc dapr-placement helm.sh/resource-policy=keep -n dapr-system
   ```

2. Export certificates: 

   ```bash
   dapr mtls export -o ./certs
   ```

3. Upgrade Dapr to 1.0.0-rc.2:

   ```bash
   helm repo update
   ```
   ```bash
   helm upgrade dapr dapr/dapr --version 1.0.0-rc.2 --namespace dapr-system --reset-values --set-file dapr_sentry.tls.root.certPEM=./certs/ca.crt --set-file    dapr_sentry.tls.issuer.certPEM=./certs/issuer.crt --set-file dapr_sentry.tls.issuer.keyPEM=./certs/issuer.key --set global.ha.enabled=true --wait
   ```

4. Upgrade CRDs:

   ```bash
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/21636a9237f2dcecd9c80f329e99b512e8377739/charts/dapr/crds/configuration.yaml
   ```
   ```bash
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/21636a9237f2dcecd9c80f329e99b512e8377739/charts/dapr/crds/components.yaml
   ```

5. Ensure 0.11.x dapr-placement service is still running and wait until all pods are running:

   ```bash
   kubectl get pods -n dapr-system -w
   
   NAME                                     READY   STATUS    RESTARTS   AGE
   dapr-dashboard-69f5c5c867-mqhg4          1/1     Running   0          42s
   dapr-operator-5cdd6b7f9c-9sl7g           1/1     Running   0          41s
   dapr-operator-5cdd6b7f9c-jkzjs           1/1     Running   0          29s
   dapr-operator-5cdd6b7f9c-qzp8n           1/1     Running   0          34s
   dapr-placement-5dcb574777-nlq4t          1/1     Running   0          76s  <---- 0.11.x placement
   dapr-placement-server-0                  1/1     Running   0          41s
   dapr-placement-server-1                  1/1     Running   0          41s
   dapr-placement-server-2                  1/1     Running   0          41s
   dapr-sentry-84565c747b-7bh8h             1/1     Running   0          35s
   dapr-sentry-84565c747b-fdlls             1/1     Running   0          41s
   dapr-sentry-84565c747b-ldnsf             1/1     Running   0          29s
   dapr-sidecar-injector-68f868668f-6xnbt   1/1     Running   0          41s
   dapr-sidecar-injector-68f868668f-j7jcq   1/1     Running   0          29s
   dapr-sidecar-injector-68f868668f-ltxq4   1/1     Running   0          36s
   ```

6. Restart your application deployments to update the Dapr runtime.

   ```bash
   kubectl rollout restart deploy/<DEPLOYMENT-NAME>
   ```

7. Once the deployment is completed, delete the 0.11.x dapr-placement service:

   ```bash
   kubectl delete deployment dapr-placement -n dapr-system
   ```

   ```bash
   kubectl delete svc dapr-placement -n dapr-system
   ```

8. All done!

## Next steps

- [Dapr on Kubernetes]({{< ref kubernetes-overview.md >}})
- [Dapr production guidelines]({{< ref kubernetes-production.md >}})