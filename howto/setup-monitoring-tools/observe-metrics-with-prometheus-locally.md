# Observe Metrics with Prometheus locally

Dapr exposes a Prometheus metrics endpoint you can use to collect time-series
data relating to the execution of the Dapr runtime itself.

## Setup Prometheus Locally
To run Prometheus on your local machine, you can either [install and run it as a process](#install) or run it as a [Docker container](#Run-as-Container).

### Install
> You don't need to install Prometheus if you plan to run it as a Docker container. Please refer to the [Container](#Run-as-Container) instructions.

To install Prometheus, follow the steps outlined [here](https://prometheus.io/docs/prometheus/latest/getting_started/) for your OS.

### Configure
Now you've installed Prometheus, you need to create a configuration.

Below is an example Prometheus configuration, save this to a file i.e. `/tmp/prometheus.yml`
```yaml
global:
  scrape_interval:     15s # By default, scrape targets every 15 seconds.

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  - job_name: 'dapr'

    # Override the global default and scrape targets from this job every 5 seconds.
    scrape_interval: 5s

    static_configs:
      - targets: ['localhost:9090'] # Replace with Dapr metrics port if not default
```

### Run as Process
Run Prometheus with your configuration to start it collecting metrics from the specified targets.
```bash
./prometheus --config.file=/tmp/prometheus.yml --web.listen-address=:8080
```
> We change the port so it doesn't conflict with Dapr's own metrics endpoint.

If you are not currently running a Dapr application, the target will show as offline. In order to start
collecting metrics you must start Dapr with the metrics port matching the one provided as the target in the configuration.

Once Prometheus is running, you'll be able to visit its dashboard by visiting `http://localhost:8080`.

### Run as Container
To run Prometheus as a Docker container on your local machine, first ensure you have [Docker](https://docs.docker.com/install/) installed and running.

Then you can run Prometheus as a Docker container using:
```bash
docker run \
    --net=host \
    -v /tmp/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus --config.file=/etc/prometheus/prometheus.yml --web.listen-address=:8080
```
`--net=host` ensures that the Prometheus instance will be able to connect to any Dapr instances running on the host machine. If you plan to run your Dapr apps in containers as well, you'll need to run them on a shared Docker network and update the configuration with the correct target address.

Once Prometheus is running, you'll be able to visit its dashboard by visiting `http://localhost:8080`.
