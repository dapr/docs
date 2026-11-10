// Diagram regression tests.
//
// Scenes in `diagrams/scenes/` are exported to `daprdocs/assets/diagrams/` and
// inlined by the `{{< diagram >}}` shortcode. The committed SVG already shows a
// moved arrow as a reviewable diff, so these tests are structural rather than
// pixel baselines (design decision 15): is the SVG really inlined, does it name
// itself for screen readers, are the labels the page promises actually drawn,
// does anything escape the viewBox, do the `var(--d-*)` colours resolve in both
// themes, and does the figure fit on a phone.
//
// SCENES is the single registry. Every scene added to `diagrams/scenes/index.mjs`
// and called from a page gets a row here; the last test fails if a page renders
// a diagram that no row covers, so no diagram can ship untested.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * name   the scene, i.e. assets/diagrams/<name>.svg and the figure's data-diagram
 * page   a page that calls `{{< diagram <name> >}}`
 * pages  several such pages, when one scene is drawn on more than one. Use
 *        this rather than a second row: the labels belong to the SCENE and
 *        the page does not change them, so a copied row is a label list that
 *        drifts the first time the scene gains a word. One scene, one row.
 * labels every text label the scene must draw, with multi-line labels written
 *        as one line (the test joins a label's tspan LINES with a space;
 *        richLabel's inline runs join with nothing)
 */
const SCENE_ROWS = [
  {
    name: 'overview',
    page: '/overview/',
    labels: [
      'Use any language or runtime',
      'App',
      'HTTP/gRPC',
      'Dapr APIs',
      'Workflows',
      'Publish & subscribe',
      'Service invocation',
      'State management',
      'Actors',
      'Jobs',
      'Configuration',
      'Secrets',
      'Bindings',
      'Middleware',
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
      'Cross-cutting APIs',
      'Observability',
      'Security',
      'Resiliency',
      'Host on & integrate with any cloud or edge infrastructure',
      'Azure',
      'Virtual or physical machines',
      'Databases',
      'Message brokers',
      'Services',
    ],
    // Tiles that must carry the "alpha" tag, and the only ones that may.
    // Source: daprdocs/content/en/operations/support/alpha-beta-apis.md.
    alpha: [
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
    ],
  },
  {
    name: 'building-blocks',
    pages: [
      '/overview/',
      '/concepts/building-blocks-concept/',
      // Replaced /images/buildingblocks-overview.png, a single row of twelve
      // icon-and-name tiles with no descriptions.
      '/developing-applications/building-blocks/',
    ],
    labels: [
      'Workflows',
      'Publish & subscribe',
      'Service invocation',
      'State management',
      'Actors',
      'Jobs',
      'Configuration',
      'Secrets',
      'Bindings',
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
    ],
    alpha: [
      'Cryptography',
      'Distributed lock',
      'Conversation',
      'Binary Store',
      'Search',
      'Vector',
    ],
  },
  {
    // The URLs are single labels: richLabel joins its tspans with no space.
    name: 'sidecar-model',
    pages: ['/overview/', '/concepts/dapr-services/sidecar/'],
    labels: [
      'App',
      'Application code',
      'Dapr sidecar',
      'Dapr API',
      'HTTP/gRPC',
      'POST',
      'GET',
      'http://localhost:3500/v1.0/invoke/cart/method/order',
      'http://localhost:3500/v1.0/state/inventory/item50',
      'http://localhost:3500/v1.0/publish/mybroker/order-messages',
      'http://localhost:3500/v1.0/secrets/vault/dbaccess',
      'http://localhost:3500/v1.0/workflows/dapr/businessprocess/start',
    ],
  },
  {
    name: 'hosting-standalone',
    pages: [
      '/overview/',
      // Replaced /images/dapr-agents/home_installation_init.png, which is
      // this diagram with "Workflow" and "External Configuration" for
      // "Workflows" and "Configuration", and four OS logos where this scene
      // names the four platforms in a sentence.
      '/developing-ai/dapr-agents/dapr-agents-getting-started/',
    ],
    labels: [
      'Docker Desktop',
      'dapr init',
      'dapr run [flags]',
      'Scheduler',
      'Placement',
      'Redis',
      'Zipkin',
      'App',
      'Use components',
      'Publish & subscribe',
      'Workflows',
      'State management',
      'Configuration',
      'Secrets',
      'Windows, macOS, Linux or ARM: a local dev machine or virtual machine',
    ],
  },
  {
    name: 'hosting-kubernetes',
    pages: [
      '/overview/',
      '/operations/hosting/kubernetes/kubernetes-overview/',
    ],
    labels: [
      'Pod',
      'App',
      'Placement',
      'Injector',
      'Sentry',
      'Operator',
      'Scheduler',
      'Kubelet',
      'Host on any cloud or edge infrastructure',
      'Azure',
      'Alibaba Cloud',
      'Kubernetes',
      'Use components',
      'Publish & subscribe',
      'Workflows',
      'State management',
      'Configuration',
      'Secrets',
    ],
  },
  {
    name: 'hosting-vms',
    page: '/overview/',
    labels: [
      'VM1',
      'VM2',
      'VM3',
      'App A',
      'App B',
      'Consul',
      'Placement',
      'Scheduler',
      'Sentry',
      'Use components',
      'Cert store for all machines',
      'Publish & subscribe',
      'Workflows',
      'State management',
      'Configuration',
      'Secrets',
    ],
  },
  {
    name: 'agents-overview',
    pages: [
      '/overview/',
      // Replaced dapr-agents/concepts-agents-overview.png, the lead image of
      // the Dapr Agents introduction. Same drawing, same claims - the
      // introduction's Key Features table names every capability on the bus.
      '/developing-ai/dapr-agents/dapr-agents-introduction/',
    ],
    labels: [
      'User',
      'Interaction',
      'Dapr Agents',
      'Planning',
      'Memory',
      'Tools',
      'MCP support',
      'Delegate tasks',
      'Outside world',
      'Built on Dapr',
      'Durable execution',
      'Observability',
      'Security',
    ],
  },
  {
    name: 'diagrid-platform',
    page: '/integrations/diagrid/diagrid-platform/',
    labels: [
      'AI agent, on any framework',
      'CrewAI',
      'LangGraph',
      'OpenAI Agents',
      'Pydantic AI',
      'User',
      'Diagrid, built on Dapr',
      'Durable execution',
      'Verifiable execution',
      'Identity and access',
      'LLMs',
      'Model providers',
      'Tools and MCP servers',
      'Infrastructure and databases',
    ],
  },
  {
    name: 'building-blocks-concept',
    pages: [
      '/concepts/building-blocks-concept/',
      // Replaced /images/concepts-building-blocks.png, which drew the same
      // thing vertically and without the caller.
      '/developing-applications/develop-components/pluggable-components/pluggable-components-overview/',
    ],
    labels: ['Your code', 'API', 'HTTP or gRPC', 'Building block', 'Component'],
  },
  {
    name: 'sidecar-apis',
    page: '/concepts/dapr-services/sidecar/',
    labels: [
      'Building block APIs',
      'Metadata API',
      'Health API',
      'HTTP or gRPC',
      'Called from your application business logic',
      'Discover capabilities and set attributes',
      'Health status, readiness and liveness',
    ],
  },
  {
    name: 'scheduler-architecture',
    // Two pages: the jobs overview used to show
    // /images/scheduler/scheduler-architecture.png, which this scene replaces.
    pages: [
      '/concepts/dapr-services/scheduler/',
      '/developing-applications/building-blocks/jobs/jobs-overview/',
    ],
    labels: [
      'My app',
      'Dapr sidecar',
      'Jobs API, gRPC or HTTP',
      'OnJobEvent',
      'the triggered job, back to the app',
      'schedule / get / delete',
      'WatchJobs',
      'jobs as they come due',
      'Scheduler process',
      'Scheduler',
      'etcd',
      'Every tracked job is stored in etcd, embedded in the Scheduler by default',
    ],
  },
  // The six workflow patterns, all on one page. They share the flow
  // vocabulary in diagrams/flow.mjs, so a change to a step's colour or size
  // shows up in all six at once.
  {
    name: 'workflow-task-chaining',
    page: '/developing-applications/building-blocks/workflow/workflow-patterns/',
    labels: ['Start', 'Activity 1', 'Activity 2', 'Activity 3', 'End'],
  },
  {
    name: 'workflow-fan-out-fan-in',
    page: '/developing-applications/building-blocks/workflow/workflow-patterns/',
    labels: ['Start', 'Activity 1', 'Activity 2', 'Activity 3', 'End'],
  },
  {
    name: 'workflow-async-http',
    page: '/developing-applications/building-blocks/workflow/workflow-patterns/',
    labels: [
      'Client',
      'Worker',
      'Start API',
      'Status API',
      'Job queue',
      'Job database',
      'POST /orders',
      '202 Accepted',
      'New order',
      'Start processing',
      'Update status',
      'GET /orders/{id}',
      'GET status',
    ],
  },
  {
    name: 'workflow-monitor',
    page: '/developing-applications/building-blocks/workflow/workflow-patterns/',
    labels: [
      'Start',
      'CheckStatus',
      'SendNotification',
      'CreateTimer',
      'ContinueAsNew',
      'Wait to proceed with workflow until the timer expires',
      'Restart the workflow without the history',
    ],
  },
  {
    name: 'workflow-external-system',
    page: '/developing-applications/building-blocks/workflow/workflow-patterns/',
    labels: [
      'Start',
      'RequestApproval',
      'Wait for event',
      'Approval Event',
      'Is Approved',
      'Is Rejected',
      'Is TimeOut',
      'Approved Activity',
      'Rejected Activity',
      'TimeOut Activity',
      'End',
    ],
  },
  {
    name: 'workflow-compensation',
    page: '/developing-applications/building-blocks/workflow/workflow-patterns/',
    labels: [
      'Start',
      'try',
      'catch',
      'Reserve Inventory',
      'Process Payment',
      'Ship Order',
      'IsException',
      'Yes',
      'No',
      'Cancel Shipment',
      'Refund Payment',
      'Release Inventory',
      'End',
    ],
  },
  {
    name: 'workflow-multi-app-activity',
    page: '/developing-applications/building-blocks/workflow/workflow-multi-app/',
    labels: ['App1', 'App2', 'Start', 'call activity ActivityA on App2', 'ActivityA', 'End'],
  },
  {
    name: 'workflow-multi-app-child-workflow',
    page: '/developing-applications/building-blocks/workflow/workflow-multi-app/',
    labels: [
      'App1',
      'App2',
      'Workflow1',
      'Workflow2',
      'call child workflow (Workflow2) on App2',
      'Activity A',
      'Start',
      'End',
    ],
  },
  {
    name: 'workflow-multi-app-complex',
    page: '/developing-applications/building-blocks/workflow/workflow-multi-app/',
    labels: [
      'Main Orchestration Workflow',
      'GPU activities',
      'ML Training Workflow',
      'call Data Processing Activities on App2',
      'call ML Training Child Workflow on App3',
      'call Model Deployment on App4',
      'Data Ingesting Activity',
      'Feature Engineering Activity',
      'Data Processing Activity',
      'Model Training Activity',
      'Model Validation Activity',
      'Model Loading Activity',
      'Inference Setup Activity',
      'Start',
      'End',
    ],
  },
  {
    name: 'workflow-cross-app-client',
    page: '/developing-applications/building-blocks/workflow/workflow-multi-app/',
    labels: [
      'app-a',
      'app-b',
      'Your code: terminate order-1 naming app-b',
      'Dapr sidecar',
      'caller identity over mTLS',
      'may app-a terminate OrderWF?',
      'WorkflowAccessPolicy',
      'allowed',
      'denied',
      'order-1, an OrderWF instance',
      'PermissionDenied',
    ],
  },
  {
    name: 'bindings-overview',
    // Replaced /images/binding-overview.png, the same three shapes in the same
    // row with the same two captions.
    page: '/developing-applications/building-blocks/bindings/bindings-overview/',
    labels: [
      'Input binding component',
      'Output binding component',
      'App',
      '/method',
      'Trigger endpoint methods on app',
      'Execute operations on component',
    ],
  },
  {
    name: 'binding-output-kafka',
    // Replaced /images/howto-bindings/kafka-output-binding.png. The source ran
    // one arrow from the service straight to Kafka; the sidecar sits between
    // them here, per the 2026-11-02 ruling, the source's caption rides the leg
    // the binding performs, and the app's leg names the endpoint the page's
    // own example posts to.
    page: '/developing-applications/building-blocks/bindings/howto-bindings/',
    labels: [
      'App',
      '/v1.0/bindings/checkout',
      'Dapr sidecar',
      'Output binding',
      'Kafka',
    ],
  },
  {
    name: 'binding-input-kafka',
    // Replaced /images/howto-triggers/kafka-input-binding.png. The mirror of
    // binding-output-kafka: same shapes, same radii, traffic the other way.
    // The source ran one arrow from Kafka straight to the service; the sidecar
    // sits between them per the 2026-11-02 ruling, the source's caption rides
    // the leg the binding performs, and the app's leg names the endpoint the
    // sidecar calls - the binding's own name, which every SDK sample routes.
    page: '/developing-applications/building-blocks/bindings/howto-triggers/',
    labels: [
      'Kafka',
      'Input binding',
      'Dapr sidecar',
      '/checkout',
      'App',
    ],
  },
  {
    name: 'service-invocation-example',
    // Replaced /images/building-block-service-invocation-example.png. The
    // source runs one arrow between the two app hexagons; here it runs
    // between the two SIDECARS, which is what service invocation does and
    // what every call in resiliency-policies already draws. The right-hand
    // app turns its sidecar inward so the line does not cross it.
    page: '/developing-applications/building-blocks/service-invocation/howto-invoke-discover-services/',
    labels: [
      'Checkout',
      // The hexagon's two lines and richLabel's three parts each arrive as one
      // string: the spec reads a <text>'s content, and tspans join.
      'Order Processor',
      '/orders',
      'Invoke /orders method',
    ],
  },
  {
    name: 'configuration-example',
    // Replaced /images/building-block-configuration-example.png. The source is
    // in an older style - grey boxes, a blue square sidecar, a circle for
    // Redis - mapped onto the house shapes, which is how the two bindings
    // how-tos next door draw Kafka. It already ran app, sidecar, store, so
    // unlike those pages nothing had to be re-routed.
    page: '/developing-applications/building-blocks/configuration/howto-manage-configuration/',
    labels: [
      'Order Processing Service',
      'Dapr sidecar',
      'Get configuration',
      'Redis',
      // The page's own command is a GET, not a POST; see the scene header.
      'GET',
      '/v1.0/configuration/configstore?key=orderId1',
    ],
  },
  {
    name: 'state-management-example',
    // Replaced /images/building-block-state-management-example.png. The same
    // picture as configuration-example - the two pages ship the same source
    // image with one word different - so both draw component-call.mjs and
    // differ only in their caption and in the HTTP call each page documents.
    page: '/developing-applications/building-blocks/state-management/howto-get-save-state/',
    labels: [
      'Order Processing Service',
      'Dapr sidecar',
      'State management',
      'Redis',
      'POST',
      '/v1.0/state/statestore',
      '[{ "key": "order_1", "value": "250"}]',
    ],
  },
  {
    name: 'service-invocation-non-dapr-endpoint',
    // Replaced /images/service-invocation-overview-non-dapr-endpoint.png. The
    // source bakes its title into the drawing; the page's own heading and lead
    // sentence directly above the figure already carry it.
    page: '/developing-applications/building-blocks/service-invocation/howto-invoke-non-dapr-endpoints/',
    labels: ['App A', 'Dapr sidecar', 'App B'],
  },
  {
    name: 'service-invocation-overview',
    // Replaced /images/service-invocation-overview.png. The source puts step 3
    // on the return leg beside the padlock; the page's list has 3 as the hop
    // OUT to Service B's sidecar and 6 as the hop back.
    page: '/developing-applications/building-blocks/service-invocation/service-invocation-overview/',
    labels: [
      'App A',
      'Dapr sidecar',
      'App B',
      'Invoke method',
      'mTLS',
      'Name resolution component',
      'Observability backend',
      'POST',
      '/v1.0/invoke/checkout/method/order',
    ],
  },
  {
    name: 'service-invocation-mdns',
    // Replaced /images/service-invocation-mdns-round-robin.png. The source has
    // Service A round-robining across instances of itself; the paragraph above
    // it says FrontEnd calls three instances of Cart.
    page: '/developing-applications/building-blocks/service-invocation/service-invocation-overview/',
    labels: [
      'FrontEnd',
      'Dapr sidecar',
      'Round robin load balancing',
      'Cart',
      'Instance 1',
      'Instance 2',
      'Instance 3',
    ],
  },
  {
    name: 'service-invocation-simple',
    // Replaced /images/service-invocation-simple.webp.
    page: '/developing-applications/building-blocks/service-invocation/service-invocation-overview/',
    labels: ['App A', 'Dapr sidecar A', 'Dapr sidecar B', 'App B'],
  },
  {
    name: 'service-invocation-example-detailed',
    // Replaced /images/service-invocation-overview-example.png. The one scene
    // in the set that keeps the hosts: localhost:3500 against 10.0.0.2:8000 is
    // the location mDNS resolved, which is what the picture is about.
    page: '/developing-applications/building-blocks/service-invocation/service-invocation-overview/',
    labels: [
      'Local machine',
      'pythonapp',
      'Dapr sidecar',
      'nodeapp',
      'mDNS name resolution component',
      'POST',
      'http://10.0.0.2:8000/neworder',
      '{"orderid":"123","data":"item1"}',
    ],
  },
  {
    name: 'secrets-mgmt-overview',
    // Replaced /images/howto-secrets/secrets-mgmt-overview.png. The source's
    // component YAML put secretsFile directly under spec with no type, which
    // would not load, and its secrets.json held a value from another page;
    // both follow the page here.
    page: '/developing-applications/building-blocks/secrets/howto-secrets/',
    labels: [
      'Order Processor',
      'Dapr sidecar',
      'Secret store',
      'GET',
      '/v1.0/secrets/localsecretstore/secret',
      'Order Processor service',
      'local-secret-store.yaml',
      'secrets.json',
    ],
  },
  {
    name: 'secrets-cloud-stores',
    // Replaced /images/secrets-overview-cloud-stores.png. One of three states
    // that share every measurement through diagrams/secrets-example.mjs,
    // because the page's claim is that the call does not change between them.
    page: '/developing-applications/building-blocks/secrets/secrets-overview/',
    labels: [
      'App',
      'Dapr sidecar',
      'Cloud secret stores',
      'AWS Secrets Manager',
      'Azure Key Vault',
      'Google Key Management',
      'HashiCorp Vault',
      'GET',
      '/v1.0/secrets/vault/mysecret',
    ],
  },
  {
    name: 'secrets-kubernetes-store',
    // Replaced /images/secrets-overview-kubernetes-store.png.
    page: '/developing-applications/building-blocks/secrets/secrets-overview/',
    labels: [
      'Kubernetes cluster',
      'Pod',
      'App',
      'Dapr sidecar',
      'Kubernetes secret store',
      'GET',
      '/v1.0/secrets/kubernetes/mysecret',
    ],
  },
  {
    name: 'secrets-azure-aks-keyvault',
    // Replaced /images/secrets-overview-azure-aks-keyvault.png. The store is
    // still named `vault` in the path: that is the COMPONENT's name, and the
    // page's point is that it does not change when the store behind it does.
    page: '/developing-applications/building-blocks/secrets/secrets-overview/',
    labels: [
      'AKS cluster',
      'Pod',
      'App',
      'Dapr sidecar',
      'Pod managed identity',
      'Azure Key Vault',
      'GET',
      '/v1.0/secrets/vault/mysecret',
    ],
  },
  {
    name: 'pubsub-pattern',
    // Replaced /images/pubsub-overview-pattern.png. No Dapr in it: the page
    // opens with the pattern and the API arrives in the section after.
    page: '/developing-applications/building-blocks/pubsub/pubsub-overview/',
    labels: ['Publisher', 'Input channel', 'Message broker', 'Output channel', 'Subscriber'],
  },
  {
    name: 'pubsub-competing-consumers',
    // Replaced /images/pubsub-overview-pattern-competing-consumers.png. The
    // source illustrates many PRODUCERS; the page's sentence is about many
    // instances of one subscriber sharing a consumer group.
    page: '/developing-applications/building-blocks/pubsub/pubsub-overview/',
    labels: [
      'Publisher',
      'Message broker',
      'One consumer group',
      'App',
      'Instance 1',
      'Instance 3',
      'Each message goes to one instance',
    ],
  },
  {
    name: 'pubsub-components',
    // Replaced /images/pubsub-overview-components.png. The fourth component
    // is RabbitMQ, not GCP Pub/Sub, which has no mark this repo can carry;
    // the page's own list was changed with it.
    page: '/developing-applications/building-blocks/pubsub/pubsub-overview/',
    labels: [
      'Publish',
      'Pub/Sub brokers',
      'Subscribe',
      'Cart',
      'Shipping',
      'Email',
      'Redis',
      'NATS',
      'Azure Service Bus',
      'RabbitMQ',
      'Component configuration yaml',
      '+11 more',
    ],
  },
  {
    name: 'pubsub-publish-api',
    // Replaced /images/pubsub-overview-publish-API.png. Same three bands as
    // pubsub-components, with the calls in place of the configuration.
    page: '/developing-applications/building-blocks/pubsub/pubsub-overview/',
    labels: [
      'Publish',
      'Subscribe',
      'Cart',
      'Shipping',
      'Email',
      'POST',
      '/v1.0/publish/pubsub/order',
      '/order',
    ],
  },
  {
    name: 'pubsub-deadletter',
    // Replaced /images/pubsub_deadletter.png. The failed delivery is RED and
    // dashed with a cross beside it, which is how this set draws a blocked
    // path; allow stays navy and solid.
    page: '/developing-applications/building-blocks/pubsub/pubsub-deadletter/',
    labels: [
      'Publisher',
      'Message sent',
      'orders',
      'Dapr sidecar',
      'Delivery fails, after retries',
      '/checkout',
      'poisonMessages',
      'Dead letter topic delivery',
      '/failedMessages',
      'Subscriber',
    ],
  },
  {
    name: 'pubsub-namespace-basic',
    // Replaced /images/howto-namespace/basic-pubsub.png. One of three states
    // that share every measurement through diagrams/pubsub-namespace.mjs; the
    // cluster is sized for two namespaces in all three so nothing moves
    // between them.
    page: '/developing-applications/building-blocks/pubsub/howto-namespace/',
    labels: ['Kubernetes cluster', 'namespace-a', 'App1', 'App2', 'order', 'Message broker', 'Consumer group names', 'subscribe', 'publish'],
  },
  {
    name: 'pubsub-namespace-without',
    // Replaced /images/howto-namespace/without-namespace.png. Both App1s are
    // the same app id, so they take one name and one colour - which is the
    // problem the page is describing.
    page: '/developing-applications/building-blocks/pubsub/howto-namespace/',
    labels: ['Kubernetes cluster', 'namespace-a', 'namespace-b', 'App1', 'App2', 'order', 'Consumer group names'],
  },
  {
    name: 'pubsub-namespace-with',
    // Replaced /images/howto-namespace/with-namespace.png. Nothing moves
    // between this and the picture before it except the card and the cross.
    page: '/developing-applications/building-blocks/pubsub/howto-namespace/',
    labels: ['Kubernetes cluster', 'namespace-a', 'namespace-b', 'App1', 'App2', 'Consumer group names', 'A.App1 A.App2 B.App1 B.App2'],
  },
  {
    name: 'pubsub-howto-overview',
    // Replaced /images/pubsub-howto-overview.png. The source had publish and
    // subscribe the wrong way round; the page's prose, its subscription.yaml,
    // all ten SDK samples and both `dapr run` commands agree that order
    // processing publishes and checkout subscribes, so that is what is drawn.
    page: '/developing-applications/building-blocks/pubsub/howto-publish-subscribe/',
    labels: [
      'Order processor',
      'publish',
      'RabbitMQ',
      'subscribe',
      'Checkout',
      'POST',
      '/v1.0/publish/order-pub-sub/orders',
      '{"orderId": "100"}',
    ],
  },
  {
    name: 'pubsub-publish-raw',
    // Replaced /images/pubsub_publish_raw.png. The page's other diagram is
    // this one with the Dapr app on the other side; they share every
    // measurement through diagrams/pubsub-raw.mjs.
    page: '/developing-applications/building-blocks/pubsub/pubsub-raw/',
    labels: [
      'Dapr publisher',
      'Raw message',
      'Pub/sub topic',
      'Non-Dapr subscriber',
    ],
  },
  {
    name: 'pubsub-subscribe-raw',
    // Replaced /images/pubsub_subscribe_raw.png, the second half of the pair.
    page: '/developing-applications/building-blocks/pubsub/pubsub-raw/',
    labels: [
      'Non-Dapr publisher',
      'Raw message',
      'Pub/sub topic',
      'Dapr subscriber',
    ],
  },
  {
    name: 'configuration-api-overview',
    // Replaced /images/configuration-api-overview.png. The source's URL put
    // the key in the path and its response was a bare string; both are
    // corrected against reference/api/configuration_api.md and recorded in
    // the scene header.
    page: '/developing-applications/building-blocks/configuration/configuration-api-overview/',
    labels: [
      'myApp',
      'Dapr sidecar',
      'Configuration component',
      'Key',
      'Value',
      'myApp||dbname',
      'GET',
      '200 OK',
    ],
  },
  {
    name: 'conversation-overview',
    // Replaced /images/conversation-overview.png. The source showed six
    // providers at v1.0-alpha1; the reference has nine real ones at
    // v1.0-alpha2, and the maintainer ruled this page shows all nine.
    page: '/developing-applications/building-blocks/conversation/conversation-overview/',
    labels: [
      'App',
      'POST',
      'Dapr sidecar',
      'LLMs',
      'Anthropic',
      'AWS Bedrock',
      'DeepSeek',
      'GoogleAI',
      'Huggingface',
      'Mistral',
      'Ollama',
      'OpenAI',
      'OpenRouter',
    ],
  },
  {
    name: 'cryptography-overview',
    // Replaced /images/cryptography-overview.png. The source labelled the API
    // "Encrypt and Decrypt AI", corrected here; the two components the
    // reference pages do not list for this block are drawn on the maintainer's
    // ruling, and both points are recorded in the scene header.
    page: '/developing-applications/building-blocks/cryptography/cryptography-overview/',
    labels: [
      'App',
      'Encrypt and Decrypt API',
      'Dapr sidecar',
      'Built-in cryptographic engine',
      'Generic',
      'JWKS',
      'Kubernetes secrets',
      'Local storage',
      'Clouds',
      'Azure Key Vault',
      'Google Key Management',
      'AWS Secrets Manager',
    ],
  },
  {
    name: 'distributed-lock-overview',
    // Replaced /images/lock-overview.png. App and sidecar are the combined
    // shape appSidecar() draws, as the source draws them, so the runs to the
    // store leave the sidecar. The lock component is a component YAML - a
    // file, not a store - and the one store in the frame is the shared
    // resource, unbranded because the API is agnostic about what is locked.
    // Denial is orange and dashed with fluent-dismiss-circle, as api-scoping
    // already draws a blocked call - not the source's red X.
    page: '/developing-applications/building-blocks/distributed-lock/distributed-lock-api-overview/',
    labels: [
      // BOTH hexagons are "App 1" - two instances of one app id, which is
      // what makes the lock contended; the captions say which is which.
      'App 1',
      'Instance 1',
      'Instance 2',
      'Lock component YAML',
      'Shared resource',
      'Acquire named lock on resource for mutually exclusive access',
      'Named lock denies access to update resource',
    ],
  },
  {
    name: 'lock-example',
    // Replaced /images/building-block-lock-example.png. One of three states of
    // one arrangement on this page, all from diagrams/lock-example.mjs, so the
    // three are the same picture and the same size. Both hexagons are App 1 -
    // two instances of one app id, which is what makes the lock contended.
    page: '/developing-applications/building-blocks/distributed-lock/howto-use-distributed-lock/',
    labels: [
      'App 1',
      'Instance 1',
      'Instance 2',
      'Shared resource',
      'Acquire lock on resource for mutually exclusive access',
      'Lock denies access to update resource',
    ],
  },
  {
    name: 'lock-unlock-example',
    // The same two instances one step later. The source's green tick is the
    // navy checkmark this set uses for a permitted call: C.green is a FILL
    // token that assertInk() refuses as glyph ink.
    page: '/developing-applications/building-blocks/distributed-lock/howto-use-distributed-lock/',
    labels: [
      'App 1',
      'Instance 1',
      'Instance 2',
      'Shared resource',
      'Release lock on resource',
      'Other apps can update the resource',
    ],
  },
  {
    name: 'lock-multiple-example',
    // Two DIFFERENT applications, so two colours - see
    // diagrams/app-colour.test.mjs. The source captions both runs "for
    // mutually exclusive access", which cannot be true of both at once; the
    // scene header raises it.
    page: '/developing-applications/building-blocks/distributed-lock/howto-use-distributed-lock/',
    labels: [
      'App 1',
      'App 2',
      'Shared resource',
      'App 1 acquires lock on resource for mutually exclusive access',
      'App 2 acquires lock on resource for mutually exclusive access',
    ],
  },
  {
    name: 'sentry-selfhosted',
    pages: ['/concepts/dapr-services/sentry/', '/concepts/security-concept/'],
    labels: [
      'App A',
      'App B',
      'Sentry',
      'Filesystem',
      'Operator',
      'mTLS',
      'Request a workload certificate',
    ],
  },
  {
    name: 'sentry-kubernetes',
    pages: ['/concepts/dapr-services/sentry/', '/concepts/security-concept/'],
    labels: [
      'App A',
      'App B',
      'Sentry',
      'Injector',
      'Pod A',
      'Pod B',
      'Operator',
      'Kubernetes Secret',
      'Read the root cert',
    ],
  },
  {
    name: 'security-threat-model',
    page: '/concepts/security-concept/',
    labels: [
      'Certificate authority',
      'Filesystem or Kubernetes secret',
      'Sentry',
      'CA private key',
      'App A',
      'App B',
      'Injector',
      'Trust anchor injector',
      'CSR',
      'Workload certificate',
      'mTLS API calls',
      'Dapr API request',
      'Dapr API response',
      'Inject root certificate',
      'Read root certificate',
    ],
  },
  {
    // The eight numbers are the point: each one indexes an item in the list
    // under the diagram, so every one of them is named here.
    name: 'security-capabilities',
    page: '/concepts/security-concept/',
    labels: [
      'Dapr control plane',
      'namespace: dapr-system',
      'namespace: redis',
      'namespace: default',
      'namespace: A',
      'namespace: B',
      'Reverse proxy',
      'App A',
      'App B',
      'State store (encrypted)',
      'SSL',
      'mTLS',
      'API token authentication',
      'Service access policy',
      'Pub/Sub topic access policy',
      'Component scope policy',
      'API access policy',
      'Secret access policy',
      'Secrets',
      '1', '2', '3', '4', '5', '6', '7', '8',
    ],
  },
  {
    name: 'api-scoping',
    page: '/concepts/security-concept/',
    labels: [
      'Sidecar configuration',
      'MyApp',
      'Service invocation',
      'State management',
      'Publish & subscribe',
      'Bindings',
    ],
  },
  {
    // `hosting-kubernetes` with the person who deploys it: the rows are the
    // same picture, so the labels are the same list plus the operator's own.
    name: 'mtls-system-services',
    page: '/concepts/security-concept/',
    labels: [
      'Operator',
      'Deploys and manages Dapr',
      'Placement',
      'Injector',
      'Sentry',
      'Scheduler',
      'App',
      'Kubelet',
      'Host on any cloud or edge infrastructure',
    ],
  },
  {
    name: 'security-end-to-end',
    page: '/concepts/security-concept/',
    labels: [
      'App A',
      'App B',
      'API token',
      'DAPR_API_TOKEN',
      'APP_API_TOKEN',
      'mTLS, on by default',
      'Checked by the sidecar',
      'Service access policies',
      'Pub/sub topic access policies',
    ],
  },
  {
    name: 'app-health',
    pages: [
      '/concepts/resiliency-concept/',
      '/operations/resiliency/health-checks/app-health/',
    ],
    labels: [
      'my-app',
      '/healthz',
      'Health probe, every 5 seconds',
      '200-299 is healthy',
      'Turn it on',
      'After 3 failures in a row',
    ],
  },
  {
    name: 'sidecar-health',
    page: '/concepts/resiliency-concept/',
    labels: [
      'my-app',
      '/v1.0/healthz',
      'Readiness and liveness',
      'The endpoint',
      'Who calls it',
    ],
  },
  {
    name: 'resiliency-policies',
    page: '/concepts/resiliency-concept/',
    labels: [
      'Your solution',
      'App A',
      'App B',
      'App C',
      'App D',
      'App E',
      'Trigger',
      'Get state',
      'State store',
      'Publish',
      'Pub/sub',
      'Subscribe',
      'Call method',
      'Call actor',
      'Retrieve secret',
      'Secret store',
      'External system',
      'State management components: outbound',
      'Input binding components: inbound',
      'Publish and subscribe components: outbound, inbound',
      'Service invocation apps',
      'Actor calls actors',
      'Secret management components: outbound',
      'Output binding components: outbound',
    ],
  },
  {
    name: 'observability-sidecar',
    page: '/concepts/observability-concept/',
    labels: [
      'Your platform and tools',
      'Kubernetes',
      'Grafana',
      'Fluentd',
      'Health checks',
      'GET http://localhost:3500/v1.0/healthz',
      'Metrics',
      'Prometheus endpoint on port 9090',
      'Logs',
    ],
  },
  {
    name: 'observability-tracing',
    pages: [
      '/concepts/observability-concept/',
      '/operations/observability/tracing/tracing-overview/',
    ],
    labels: [
      'App A',
      'App B',
      'App C',
      'Service invocation',
      'Publish',
      'Subscribe',
      'Message broker',
      'W3C tracing context',
      'Backend monitoring tools',
      'and more',
      'Visualize',
    ],
  },
  {
    name: 'service-mesh',
    page: '/concepts/faq/service-mesh/',
    labels: [
      'Application code, in any language or framework',
      'Service invocation',
      'State management',
      'Publish & subscribe',
      'Bindings',
      'Secrets',
      'Actors',
      'mTLS',
      'Metrics',
      'Resiliency',
      'Distributed tracing',
      'Service mesh',
      'Traffic routing',
      'Traffic splitting',
      'Hosting infrastructure',
      'Developer',
      'Operator',
    ],
  },
  {
    name: 'components-concept',
    pages: [
      '/concepts/components-concept/',
      // Replaced dapr-agents/home_concepts_principles_modular.png, which drew
      // the same thing with a shorter component list. See the note in
      // dapr-agents-why.md's own row about where on that page it sits.
      '/developing-ai/dapr-agents/dapr-agents-why/',
    ],
    labels: [
      'App',
      'State management',
      'Publish & subscribe',
      'Bindings',
      'Secrets',
      'Configuration',
      'Distributed lock',
      'Cryptography',
      'Conversation',
      'Middleware',
      'Binary Store',
      'Search',
      'Vector',
    ],
  },
  {
    name: 'state-management-outbox',
    // Replaced /images/state-management-outbox.png. The store is named State
    // store rather than the source's "database": the page's own step one
    // calls it the state store, and the feature needs a transactional one.
    page: '/developing-applications/building-blocks/state-management/howto-outbox/',
    labels: [
      'Transaction',
      'App A',
      'Save state',
      'State store',
      'Write message',
      'Message broker',
      'Deliver message',
      'App B',
    ],
  },
  {
    name: 'state-management-outbox-steps',
    // Replaced /images/state-management-outbox-steps.png. The source's
    // floating "Transaction" across the top is dropped: it names neither
    // dashed box, and the page puts the atomic transaction in step three.
    page: '/developing-applications/building-blocks/state-management/howto-outbox/',
    labels: [
      'User request processing (sync)',
      'Background outbox processing (async)',
      'My app',
      'Save state',
      'Response',
      'Publish',
      'Save state & marker',
      'Internal topic',
      'Consume',
      'ACK/NACK',
      'Read marker',
      'Delete marker',
      'External topic',
      'State store',
    ],
  },
  {
    name: 'state-management-overview',
    // Replaced /images/state-management-overview.png. Five corrections to the
    // source's values are recorded in the scene's own header: the double-pipe
    // key prefix, 204 on a save, no `query` wrapper, a filter key relative to
    // the value, and `data` plus `etag` in a result.
    page: '/developing-applications/building-blocks/state-management/state-management-overview/',
    labels: [
      'App',
      'Dapr sidecar',
      'State store component',
      'Key',
      'Value',
      'myApp||weapon',
      'myApp||planet',
      '/v1.0/state/myStateStore',
      '204 No Content',
      '/v1.0/state/myStateStore/planet',
      '200 OK',
      '/v1.0-alpha1/state/myStateStore/query',
    ],
  },
  {
    name: 'actor-reentrancy',
    // Replaced /images/actor-reentrancy.png. The two chains the page lists
    // above the image are named under the halves that draw them.
    page: '/developing-applications/building-blocks/actors/actor-reentrancy/',
    labels: [
      'Coordinator Actor',
      'Worker Actor 1',
      'Worker Actor 2',
      'start work',
      'work complete',
      'Actor',
      'Call local method',
      'Actor A → Actor B → Actor A',
      'Actor A → Actor A',
    ],
  },
  {
    name: 'actors-game-example',
    // Replaced /images/actor_background_game_example.png. The source's zoom
    // cone is a dashed leader, and the type's members are in two named
    // columns rather than scattered round the circle.
    page: '/developing-applications/building-blocks/actors/actors-overview/',
    labels: [
      'Video Game Enemy',
      'State',
      'Methods',
      'Difficulty',
      'Spawn()',
      'Attack()',
      'Actor type',
      'Host/Pod',
    ],
  },
  {
    name: 'actors-calling-method',
    // Replaced /images/actors-calling-method.png. The call in step three is
    // a PUT - the app-side actor endpoint - not the source's POST.
    page: '/developing-applications/building-blocks/actors/actors-overview/',
    labels: [
      'Machine 1 or Pod 1',
      'Machine 2 or Pod 2',
      'Ordering Service',
      'Actor 1',
      'Actor 4',
      'POST',
      '/v1.0/actors/OrderActor/3/method/ship',
      'PUT',
      '/actors/OrderActor/3/method/ship',
    ],
  },
  {
    name: 'actors-placement-registration',
    // Replaced /images/actors_background_placement_service_registration.png.
    // The source labels two different instances "Instance 1", and numbers
    // its own two steps rather than the page's three.
    page: '/developing-applications/building-blocks/actors/actors-features-concepts/',
    labels: [
      'Instance 1',
      'Instance 2',
      'Instance 3',
      'Service code',
      'Dapr Placement service',
      'Actor type',
      'Partitions',
      'MyActor1',
      'MyActor2',
    ],
  },
  {
    name: 'actors-id-hashing',
    // Replaced /images/actors_background_id_hashing_calling.png. The lookup
    // is in the caller's own cache, so the link to Placement is the dashed
    // broadcast that fills it, not a live round trip.
    page: '/developing-applications/building-blocks/actors/actors-features-concepts/',
    labels: [
      'Caller',
      'Call ID 123',
      'Dapr Placement service',
      'partition table',
      'Actor ID 123 created',
      'Client code calls actor ID 123 for actor type MyActor1',
      'Client call for actor ID 123 sent to the Dapr instance to create the actor',
    ],
  },
  {
    name: 'actors-communication',
    // Replaced /images/actors_background_communication.png. Each panel is
    // captioned with what it shows, and the tick is navy: green is a fill
    // token assertInk() refuses as glyph ink.
    page: '/developing-applications/building-blocks/actors/actors-features-concepts/',
    labels: [
      'Many clients, one actor',
      'Many clients, many actors',
      'One client, many actors',
      'Client',
      'Actor',
    ],
  },
  {
    name: 'actors-concurrency',
    // Replaced /images/actors_background_concurrency.png. The events sit on
    // a time grid, so two columns level with each other really are.
    page: '/developing-applications/building-blocks/actors/actors-features-concepts/',
    labels: [
      'Time',
      'ActorId1 Method1',
      'ActorId1 Timer',
      'ActorId2 Reminder',
      'Request arrived, lock acquired without wait',
      'Request arrived, waiting for lock asynchronously',
      'Lock acquired',
      'Entered callback',
      'Lock released',
    ],
  },
  {
    name: 'workflow-overview',
    // Replaced /images/workflow-overview/workflow-overview.png. Drawn with
    // the flow kit, which happens to use the same four colours the source
    // does for the same four things.
    page: '/developing-applications/building-blocks/workflow/workflow-overview/',
    labels: [
      'Workflow App',
      'Workflow and Activity definitions',
      'Start',
      'Activity 1',
      'Activity 2',
      'Activity 3',
      'End',
      'Dapr API',
      'HTTP/gRPC',
      'Dapr Workflow engine',
    ],
  },
  {
    name: 'workflow-stateful-client',
    // Replaced the page's `flowchart TD`. Its `sequenceDiagram` stays
    // Mermaid, which is the ruling Task 42's check is written to permit.
    page: '/developing-applications/building-blocks/workflow/workflow-stateful-client/',
    labels: [
      'Work item arrives',
      'Is cachedHistory set?',
      'No (full send)',
      'Replay pastEvents as the full history',
      'Yes (delta send)',
      'No (cache miss)',
      'Fetch the full history via GetInstanceHistory',
      'Replay cached prefix plus the delta',
      'Replay the fetched history',
      'Success',
      'Failure',
    ],
  },
  {
    name: 'workflow-fast-path',
    // Replaced the page's one `flowchart TD`. Its five `sequenceDiagram`
    // blocks stay Mermaid, which is the ruling Task 42's check permits.
    page: '/developing-applications/building-blocks/workflow/workflow-fast-path/',
    labels: [
      'Event committed to the inbox or held for folding',
      'Fast path on and due now?',
      'Durable per-event reminder, unchanged',
      'Janitor reminder asserted?',
      'Create failed',
      'Post notification, capacity 1, coalesces',
      'Drive loop running?',
      'Running loop consumes it, or the reclaim handshake re-posts it',
      'Start drive loop',
      'Run one turn through the reminder path',
      'Committed',
      'More notifications?',
      'Loop exits, actor stays resident',
      'Failed',
      'Retry budget left? about 6s, jittered',
      'Loop exits, the janitor owns recovery',
      'Janitor fire every 20s',
      'Load state',
      'Purged or terminal?',
      'Settle and delete the janitor',
      'Inbox rows pending?',
      'Drive a turn: janitor_recovered',
      'Held completions with no driver?',
      'Drive a turn: janitor_fold_recovered',
      'Unresolved TaskScheduled events?',
      'Re-dispatch activities',
      'No-op, actor stays resident',
    ],
  },

  {
    name: 'workflow-signing-chain',
    // Replaced the first of the four flowcharts. The page keeps its one
    // `gantt`, which is the ruling Task 42's check is written to permit.
    page: '/developing-applications/building-blocks/workflow/workflow-history-signing/',
    labels: [
      'Workflow History',
      'Signature Chain',
      'Certificate Table',
      'prev digest',
      'cert index 0',
      'cert index 1',
      'Event 0',
      'Event 1',
      'Event 2',
      'Event 3',
      'Event 4',
      'Event 5',
      'Sig 0 Events [0,2)',
      'Sig 1 Events [2,4)',
      'Sig 2 Events [4,6)',
      'Cert 0 SVID from Boot 1',
      'Cert 1 SVID from Boot 2',
    ],
  },
  {
    name: 'workflow-signing-steps',
    page: '/developing-applications/building-blocks/workflow/workflow-history-signing/',
    labels: [
      'Marshal events (deterministic protobuf)',
      'Compute digests & chain to previous signature',
      'Sign with SVID private key',
      'Persist signature + certificate + history events',
    ],
  },
  {
    name: 'workflow-signing-verify',
    page: '/developing-applications/building-blocks/workflow/workflow-history-signing/',
    labels: [
      'Signatures present?',
      'Yes',
      'Signer configured?',
      'No, but signer configured and history exists',
      'No, signer not configured',
      'No',
      'Mismatch',
      'Gap',
      'Failed',
      'Expired',
      'Untrusted',
      'Wrong app',
      'All events covered?',
      'For each signature',
      'Load workflow state from state store',
      'FAIL: unsigned history cannot be loaded with signing enabled',
      'FAIL: signed history cannot be loaded without a signer',
      'Continue without verification',
      'Verify chain linkage',
      'Verify event range contiguity',
      'Recompute events digest from raw bytes',
      'Verify cryptographic signature',
      'Validate certificate time window',
      'Verify certificate chain-of-trust to CA',
      'Verify SPIFFE app identity',
      'Verification failed',
      'Verification passed',
    ],
  },
  {
    name: 'workflow-signing-failure',
    page: '/developing-applications/building-blocks/workflow/workflow-history-signing/',
    labels: [
      'Fail',
      'Failure type',
      'Pass',
      'Tamper, in-flight',
      'Tamper, completed or metadata query path',
      'ConfigurationError',
      'Load workflow state',
      'Verify signature chain + attestations + lineage',
      'Continue normal execution',
      'Append unsigned terminal event (DAPR_WORKFLOW_HISTORY_TAMPERED) + delete reminders',
      'Return error to reader',
      'Return error to reader (no terminal append)',
      'Workflow surfaces as FAILED on next read',
      'State store NOT modified',
    ],
  },

  {
    name: 'workflows-architecture-k8s',
    // Replaced workflows-architecture-k8s.png, at the top of the page.
    page: '/developing-applications/building-blocks/workflow/workflow-architecture/',
    labels: [
      'App pod',
      'Sidecar',
      'Workflow App',
      'Workflow code',
      'inbound Dapr API calls',
      'outbound Dapr API calls',
      'Process workflow events',
      'Invoke activity code',
      'gRPC stream',
      '<< Initiate stream State/work items >> << Results/next steps',
      '<< Initiate stream State/work items >> << Results/next steps',
      'Workflow actor (internal)',
      'Activity actor (internal)',
      'Workflow engine',
      'Dapr Workflow SDK',
    ],
  },
  {
    name: 'workflow-engine-protocol',
    // Replaced workflow-engine-protocol.png, under "Sidecar interactions".
    page: '/developing-applications/building-blocks/workflow/workflow-architecture/',
    labels: [
      '1. Get work item stream',
      '2. Fetch work items',
      '3. Send workflow results',
      'Workflow App',
      'Workflow and Activity definitions',
      'Dapr Workflow engine',
    ],
  },
  {
    name: 'workflow-execution',
    // Replaced workflow-execution.png, under "Workflow actors".
    page: '/developing-applications/building-blocks/workflow/workflow-architecture/',
    labels: [
      'Pod 1',
      'Sidecar',
      'App container',
      'gRPC',
      'Actor 1',
      'Actor 2',
      'WF 1 (actor 1)',
      'WF 2 (actor 2)',
      'Pod 2',
      'Actor 3',
      'Actor 4',
      'WF 3 (actor 3)',
      'WF 4 (actor 4)',
      'Placement',
    ],
  },
  {
    name: 'workflow-actor-flowchart',
    // Replaced workflow-actor-flowchart.png: the workflow actor lifecycle.
    page: '/developing-applications/building-blocks/workflow/workflow-architecture/',
    labels: [
      'Start',
      'Message received',
      'Execute workflow code',
      'Schedule tasks',
      'Save state',
      'Idle',
    ],
  },
  {
    name: 'workflow-activity-actor-flowchart',
    // Replaced workflow-activity-actor-flowchart.png: the activity actor lifecycle.
    page: '/developing-applications/building-blocks/workflow/workflow-architecture/',
    labels: [
      'Start',
      'Invocation message received',
      'Execute activity code',
      'Send result to workflow actor',
      'End',
    ],
  },
  {
    name: 'workflow-actor-reminder-flow',
    // Replaced workflow-actor-reminder-flow.png. Step 2 says one-shot, not recurring: the page beats the old picture.
    page: '/developing-applications/building-blocks/workflow/workflow-architecture/',
    labels: [
      '1. Schedule execution',
      '2. Create one-shot reminder',
      '3. Reminder fires',
      '6. Delete reminder',
      '4. Run workflow step',
      '5. Send workflow step result',
      'Actor runtime',
      'Workflow Actor',
      'Workflow code',
    ],
  },
  {
    name: 'workflow-state-store-interactions',
    // Replaced workflow-state-store-interactions.png, under "State store usage".
    page: '/developing-applications/building-blocks/workflow/workflow-architecture/',
    labels: [
      '1. Load existing history (cached)',
      '2. Execute next step',
      '3. Append new history',
      'State store',
      'started',
      'call activity1',
      'activity1 done',
      'call activity2',
      'call activity3',
      'activity2 done',
      'activity3 done',
      'Workflow Actor',
      'Workflow code',
    ],
  },
  {
    name: 'workflow-actor-scale-out',
    // Replaced workflow-actor-scale-out.png, under "Workflow scalability".
    page: '/developing-applications/building-blocks/workflow/workflow-architecture/',
    labels: [
      'Cluster',
      'Node',
      'Dapr runtime',
      'Legend',
      'workflow actor',
      'workflow activity actor',
      'activity call',
      'child workflow',
    ],
  },
  {
    name: 'mcp-access-control',
    // Replaced the page's one `flowchart LR`, under "How OPA gates per-tool MCP traffic".
    page: '/developing-ai/mcp/mcp-access-control/',
    labels: [
      'Dapr sidecar - MCP server side',
      'accessControl App-ID gate',
      'allow',
      'OPA middleware tool-level gate',
      '403',
      'Agent / MCP client',
      'POST',
      '/method/mcp',
      'dapr-caller-app-id',
      'MCP server',
    ],
  },
  {
    name: 'mcp-service-invocation',
    // Replaced the page's one `flowchart LR`, under "How it works". Shares every measurement with the scene above it via diagrams/mcp.mjs.
    page: '/developing-ai/mcp/mcp-service-invocation/',
    labels: [
      'Dapr',
      'Access policy',
      'allow',
      'Bearer middleware',
      'valid JWT',
      'deny',
      '401',
      'Agent / MCP client',
      'mcp-client App ID',
      'mcp-server App ID',
      'MCP server',
    ],
  },
  {
    name: 'rag-overview',
    // Replaced the page's one `flowchart TD`. The orchestrator runs across; the scene header says why.
    page: '/developing-ai/rag/',
    labels: [
      'rag_ingest orchestrator (Dapr Workflow)',
      'done',
      'valid',
      'more batches',
      'download',
      'parse + chunk',
      'embed',
      'write',
      'count + verify',
      'flip active pointer',
      'resolve active version, then search',
      'discover_and_manifest',
      'get_manifest_batch',
      'process_document x N (bounded batch)',
      'update_status',
      'validate_version',
      'activate_version',
      'Document source S3 / Azure Blob',
      'Parser + splitter',
      'Embedder OpenAI / Azure OpenAI',
      'Vector index pgvector / Pinecone / Azure AI Search',
      'Query-time reader',
    ],
  },
  {
    name: 'agents-augmented-llm',
    // Replaced dapr-agents/agents-augmented-llm.png, under "Augmented LLM".
    page: '/developing-ai/dapr-agents/dapr-agents-patterns/',
    labels: [
      'Query / Results',
      'Call / Response',
      'Read / Write',
      'In',
      'LLM',
      'Out',
      'Retrieval',
      'Tools',
      'Memory',
    ],
  },
  {
    name: 'agents-prompt-chaining',
    // Replaced dapr-agents/agents-prompt-chaining.png, under "Prompt Chaining".
    page: '/developing-ai/dapr-agents/dapr-agents-patterns/',
    labels: [
      'Output 1',
      'Pass',
      'Output 2',
      'Output 3',
      'Fail',
      'In',
      'LLM 1',
      'Gate',
      'LLM 2',
      'LLM 3',
      'Out',
      'Exit',
    ],
  },
  {
    name: 'agents-routing',
    // Replaced dapr-agents/agents-routing.png, under "Routing".
    page: '/developing-ai/dapr-agents/dapr-agents-patterns/',
    labels: [
      'The router classifies the request; exactly one route runs',
      'In',
      'Router',
      'LLM 1',
      'LLM 2',
      'LLM 3',
      'Out',
    ],
  },
  {
    name: 'agents-parallelization',
    // Replaced dapr-agents/agents-parallelization.png, under "Parallelization".
    page: '/developing-ai/dapr-agents/dapr-agents-patterns/',
    labels: [
      'In',
      'LLM 1',
      'LLM 2',
      'LLM 3',
      'Aggregator',
      'Out',
    ],
  },
  {
    name: 'agents-orchestrator-workers',
    // Replaced dapr-agents/agents-orchestrator-workers.png, under "Orchestrator-Workers".
    page: '/developing-ai/dapr-agents/dapr-agents-patterns/',
    labels: [
      'The orchestrator decides how many workers there are; three is an example',
      'In',
      'Orchestrator',
      'LLM 1',
      'LLM 2',
      'LLM 3',
      'Synthesizer',
      'Out',
    ],
  },
  {
    name: 'agents-evaluator-optimizer',
    // Replaced dapr-agents/agents-evaluator-optimizer.png, under "Evaluator-Optimizer".
    page: '/developing-ai/dapr-agents/dapr-agents-patterns/',
    labels: [
      'Solution',
      'Rejected + Feedback',
      'In',
      'LLM Call Generator',
      'LLM Call Evaluator',
      'Out',
    ],
  },
  {
    name: 'agents-stateful-llm',
    // Replaced dapr-agents/agents-stateful-llm.png, under "Durable Agent".
    page: '/developing-ai/dapr-agents/dapr-agents-patterns/',
    labels: [
      'Durable agent',
      'Query / Results',
      'Call / Response',
      'Read / Write',
      'In',
      'Workflow',
      'LLM',
      'Out',
      'Retrieval',
      'Tools',
      'Memory',
    ],
  },
  {
    name: 'agents-loop',
    // Replaced dapr-agents/concepts-agents.png. The loop the capabilities on
    // `agents-overview` run inside - the same page carries both, in different
    // sections.
    page: '/developing-ai/dapr-agents/dapr-agents-core-concepts/',
    labels: [
      'AI Agent',
      'User',
      'Prompt',
      'Response',
      'LLM',
      'Reasoning',
      'Planning',
      'Action',
      'Tools',
      'Tool result',
      'Outside world',
    ],
  },
  {
    name: 'agents-tool-call-flow',
    // Replaced dapr-agents/concepts_agents_toolcall_flow.png. Five steps where
    // the source drew four: the scene header has the prose they come from.
    page: '/developing-ai/dapr-agents/dapr-agents-core-concepts/',
    labels: [
      'Chat completion payload',
      'Assistant message',
      'Tool message',
      'User',
      'AI Agent',
      'LLM',
    ],
  },
  {
    name: 'agents-orchestration',
    // Replaced dapr-agents/home_concepts_principles_workflows.png. Two lanes,
    // because the paragraph under it names two approaches and then says what
    // they have in common.
    page: '/developing-ai/dapr-agents/dapr-agents-core-concepts/',
    labels: [
      'Event-driven',
      'Deterministic workflow',
      'Agent',
      'Message broker',
      'Start',
      'End',
    ],
  },
  {
    name: 'agents-message-driven',
    // Replaced dapr-agents/home_concepts_principles_message.png. The payload
    // is drawn once where it is sent, not three times over.
    page: '/developing-ai/dapr-agents/dapr-agents-why/',
    labels: [
      'Frodo',
      'Legolas',
      'Gandalf',
      'Message broker',
      'POST',
      'v1.0/publish/pubsub/broadcast',
      'POST /broadcast/legolas',
      'POST /broadcast/gandalf',
    ],
  },
  {
    name: 'agents-decoupled-infrastructure',
    // Replaced dapr-agents/home_concepts_principles_decoupled.png. Three APIs
    // where the source drew the whole catalogue - the scene header has the
    // arithmetic, and the page is what chose the three.
    page: '/developing-ai/dapr-agents/dapr-agents-why/',
    labels: [
      'Dapr',
      'Agent',
      'Publish & subscribe',
      'State management',
      'Service invocation',
      'Observability',
      'Security',
      'Resiliency',
      'and 13 more building block APIs',
    ],
  },
  {
    name: 'actor-event-stream',
    // Replaced the mermaid sequenceDiagram under "Protocol summary". The only
    // sequence diagram in these docs this set can draw: two participants and
    // nine messages that strictly alternate. The scene header says why the
    // other two are left as they are.
    page: '/developing-applications/building-blocks/actors/howto-actors-app-initiated-streams/',
    labels: [
      'App',
      'daprd (Dapr sidecar)',
      'Step 1: open the stream and register',
      'Step 2: handle callbacks',
      'SubscribeActorEventsAlpha1()',
      'SubscribeActorEventsResponseInitialAlpha1',
      'invoke_request (id="abc", method="x")',
      'reminder_response (id="def")',
      'deactivate_response (id="ghi")',
    ],
  },
  {
    name: 'agents-patterns-overview',
    // Replaced dapr-agents/agents-patterns-overview.png on both pages that
    // drew it. A map of the eight patterns, not eight readable diagrams -
    // the scene header has the measurement that rules the latter out.
    pages: [
      '/developing-ai/dapr-agents/dapr-agents-patterns/',
      '/developing-ai/dapr-agents/dapr-agents-introduction/',
    ],
    labels: [
      'Augmented LLM',
      'Durable Agent',
      'Prompt Chaining',
      'Evaluator-Optimizer',
      'Autonomous Agent',
      'Parallelization',
      'Routing',
      'Orchestrator-Workers',
    ],
  },
];

// One row per (scene, page), which is what every check below reads. The rows
// above are one per SCENE, so a scene drawn on three pages is written once
// and expanded here rather than copied three times.
const SCENES = SCENE_ROWS.flatMap(({ pages, page, ...rest }) =>
  (pages ?? [page]).map((p) => ({ ...rest, page: p })));

// The invariant that makes the expansion worth having. Two rows for one scene
// means two label lists for one drawing, and the day the scene gains a word
// only one of them learns it.
test('each scene has exactly one row, however many pages draw it', () => {
  const seen = new Map();
  for (const s of SCENE_ROWS) seen.set(s.name, (seen.get(s.name) ?? 0) + 1);
  expect(
    [...seen].filter(([, n]) => n > 1).map(([name]) => name),
    'a scene with more than one row - give the row a `pages` list instead',
  ).toEqual([]);
});

// Phone widths. 320 is the narrowest viewport still worth supporting, 360 and
// 412 are the two commonest Android widths; `tests/layout.spec.js` uses the
// same three for the page-level checks.
const PHONE_WIDTHS = [320, 360, 412];

// Nothing may be drawn nearer than this to the edge of the viewBox: the inlined
// SVG has no padding of its own, so geometry on the boundary touches the prose.
const EDGE_MARGIN = 10;

// How far the air on one side may differ from the air on the other. The leans
// this was written to catch ran from 7 to 30 units; the slack is for the font,
// which is what the drawing's extent is mostly made of and which measures a
// little differently on another platform.
const CENTRE_TOLERANCE = 6;

// How far an edge SET BY TEXT may move between platforms, as a fraction of
// the width of the label that sets it.
//
// An edge set by a shape is exact: the same numbers go into the same path on
// every machine. An edge set by text is only as good as that machine's text
// layout, and the same Inter and Geist Mono - loaded, applied, no fallback -
// lay out WIDER on Linux than on Windows: measured on four scenes at +2.0%,
// +2.4%, +3.7% and +4.3% of the label. In each of the three that failed, the
// outermost ink on the left was a mono run inside a mixed label while the
// right edge was a path, a polygon or a rect, so only one side moved and the
// whole difference landed in this assertion.
//
// 6% is about 1.4x the worst of those. It applies ONLY where text sets an
// edge: the scenes whose extent is shapes keep the flat tolerance, which is
// where it means anything.
const TEXT_METRIC_SLACK = 0.06;

/**
 * The air on each side of the drawing, in scene units.
 *
 * Measured against the viewBox's own ORIGIN, not against zero: the exporter
 * moves that origin to centre the content, so a scene's top left corner is no
 * longer the canvas's.
 */
function margins(root) {
  const svg = document.querySelector(`${root} svg`);
  const b = svg.getBBox();
  const v = svg.viewBox.baseVal;
  return {
    left: b.x - v.x,
    top: b.y - v.y,
    right: (v.x + v.width) - (b.x + b.width),
    bottom: (v.y + v.height) - (b.y + b.height),
  };
}

const sel = (name) => `.dapr-diagram[data-diagram="${name}"]`;

/**
 * What sets each edge of the drawing, how far off centre it sits, and how
 * much of that is the machine rather than the scene.
 *
 * A measurement that disagrees between two machines is nearly always a TEXT
 * measurement, so this answers the three questions that follow every time:
 * which element reaches furthest, is it text, and was it drawn in the face
 * the page asked for. `report` is for the failure message; the numbers above
 * it decide the verdict.
 *
 * Leaves only: a <g> reports the union of its children, so it would stand in
 * for the label that actually reaches the edge. The slack, though, comes from
 * the whole <text> that owns the leaf - a centred label lays itself out as
 * one unit, so a run inside it moves with the width of all of it.
 */
function edgeFacts(root) {
  const svg = document.querySelector(`${root} svg`);
  const box = svg.getBBox();
  const v = svg.viewBox.baseVal;
  const inv = svg.getScreenCTM().inverse();
  const extent = (el) => {
    const b = el.getBBox();
    const m = inv.multiply(el.getScreenCTM());
    const ps = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]
      .map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
    const xs = ps.map((p) => p.x);
    const ys = ps.map((p) => p.y);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  };
  const leaves = [];
  for (const n of svg.querySelectorAll('*')) {
    if (n.firstElementChild || typeof n.getBBox !== 'function' || !n.getScreenCTM()) continue;
    let e;
    try { e = extent(n); } catch { continue; }
    if (e.x1 === e.x0 && e.y1 === e.y0) continue;
    leaves.push(Object.assign({ n }, e));
  }
  const m = {
    left: box.x - v.x,
    top: box.y - v.y,
    right: (v.x + v.width) - (box.x + box.width),
    bottom: (v.y + v.height) - (box.y + box.height),
  };
  if (!leaves.length) {
    return Object.assign(m, { slackX: 0, slackY: 0, report: 'nothing measurable to report' });
  }
  const pick = (key, better) => leaves.reduce((a, b) => (better(b[key], a[key]) ? b : a));
  const edges = {
    left: pick('x0', (b, a) => b < a),
    right: pick('x1', (b, a) => b > a),
    top: pick('y0', (b, a) => b < a),
    bottom: pick('y1', (b, a) => b > a),
  };
  const owner = (e) => {
    const t = e.n.closest('text');
    if (!t) return null;
    try { return extent(t); } catch { return null; }
  };
  const spanX = (e) => { const o = owner(e); return o ? o.x1 - o.x0 : 0; };
  const spanY = (e) => { const o = owner(e); return o ? o.y1 - o.y0 : 0; };
  const describe = (e) => {
    const w = `w=${(e.x1 - e.x0).toFixed(1)}`;
    const words = (e.n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28);
    if (!words) return `<${e.n.tagName}> ${w}`;
    const cs = getComputedStyle(e.n);
    const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const has = document.fonts.check(`${cs.fontWeight} ${cs.fontSize} "${family}"`);
    return `"${words}" ${w} in ${family} ${cs.fontWeight} ${cs.fontSize}${has ? '' : ' NOT LOADED'}`;
  };
  const faces = [...document.fonts].map((x) => `${x.family}/${x.weight}:${x.status}`).join(' ');
  return Object.assign(m, {
    slackX: Math.max(spanX(edges.left), spanX(edges.right)),
    slackY: Math.max(spanY(edges.top), spanY(edges.bottom)),
    report: [
      `left edge ${describe(edges.left)}`,
      `right edge ${describe(edges.right)}`,
      `faces ${faces}`,
    ].join('\n  '),
  });
}

/**
 * Opens a page and waits for the webfonts to settle.
 *
 * Nearly every measurement in this file is made of text. A label's width sets
 * where its shape's contents end, and a label that overhangs the shape it sits
 * under sets the DRAWING's own extent. Until Inter has swapped in, the browser
 * is laying that text out in whatever the stack falls back to - on an Ubuntu
 * runner the system UI face, which is wider than Inter - and `domcontentloaded`
 * fires before the font request has even been made.
 *
 * Three scenes failed `centres its drawing in its canvas` in CI by 7 to 13
 * units while passing here, with their RIGHT edges, set by shapes, agreeing to
 * the hundredth and their LEFT edges, set by a label wider than the shape above
 * it, disagreeing. Six tests in this file already waited for the fonts; the
 * rest measured whatever happened to be on screen. They all wait now.
 */
async function openScene(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Collects the drawn text of every <text>.
 *
 * A tspan is used for two different things. label() starts each LINE of a
 * multi-line label with one, and gives it an `x`, so those join with a space
 * and read as one sentence. richLabel() uses them for INLINE runs of a single
 * line that differ in colour or weight, with no `x`, and those must join with
 * nothing or a URL comes back with spaces in it.
 */
function readLabels(page, name) {
  return page.$$eval(`${sel(name)} svg text`, (nodes) =>
    nodes.map((n) => {
      const spans = [...n.querySelectorAll('tspan')];
      if (!spans.length) return n.textContent.replace(/\s+/g, ' ').trim();
      return spans
        .map((s) => (s.hasAttribute('x') ? ` ${s.textContent}` : s.textContent))
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
    }),
  );
}

/**
 * Every resolved paint in the scene, plus the two a scene always has: the panel
 * stroke and the first label's fill. Scene-agnostic on purpose, so a scene that
 * happens not to use a given builder does not silently skip the check.
 */
function readPaint(page, name) {
  return page.evaluate((root) => {
    const svg = document.querySelector(`${root} svg`);
    const all = [];
    for (const el of svg.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      all.push(`${cs.fill}|${cs.stroke}`);
    }
    const pick = (q, prop) => {
      const el = svg.querySelector(q);
      return el ? getComputedStyle(el)[prop] : null;
    };
    // A scene need not use panel(), and its first <text> may be plate ink or
    // the name on a solid app hexagon, both of which are the same colour in
    // both themes by design - they sit on a shape, not on the page. Pick what
    // exists, and prefer a text node that is on neither; the fingerprint below
    // carries the real signal and does not care about scene shape.
    const offPlate = [...svg.querySelectorAll('text')].find(
      (t) => !t.closest('.d-icon-group')
        && !t.closest('.d-hex-solid')
        && !t.closest('.d-on-fill')
        && !t.previousElementSibling?.classList?.contains('d-plate'),
    );
    // A few tokens are the same in both themes ON PURPOSE: the app green and
    // the ink that sits on it, the sky blue (bright enough to carry on either
    // ground, so it never needed a second value), the near-white plate and its
    // ink, and a vendor's own brand colour. A panel drawn in one of those is
    // not evidence that the theme failed to apply, so look past it for one
    // that is themed. _tokens.scss is the list this must agree with.
    const FIXED = ['--d-green', '--d-app-ink', '--d-sky', '--d-diagram-ink', '--d-diagram-plate', '--d-brand-'];
    const themedPanel = [...svg.querySelectorAll('.d-panel')].find(
      (p) => !FIXED.some((t) => (p.getAttribute('stroke') ?? '').includes(t)),
    );

    return {
      // null when the scene has no themed panel at all - every panel a pod,
      // say. The loop below skips a null key; the fingerprint still carries
      // the assertion that the scene re-themes.
      panelStroke: themedPanel ? getComputedStyle(themedPanel).stroke : null,
      textFill: offPlate ? getComputedStyle(offPlate).fill : pick('text', 'fill'),
      fingerprint: all.join(';'),
      unresolved: all.filter((v) => v.includes('var(') || v.includes('||')),
    };
  }, sel(name));
}

for (const scene of SCENES) {
  test.describe(`${scene.name} on ${scene.page}`, () => {
    test(`${scene.name} renders an inline svg with a title and desc`, async ({ page }) => {
      await openScene(page, scene.page);

      const figure = page.locator(sel(scene.name));
      await expect(figure).toHaveCount(1);

      // Inlined, not an <img>: only an inline SVG re-themes and is searchable.
      const svg = figure.locator('> svg');
      await expect(svg).toHaveCount(1);
      // Four numbers, and the ORIGIN is not assumed to be 0 0: the exporter
      // moves it by the measured amount that centres the drawing, which can be
      // negative and is rarely whole. The size is still positive.
      await expect(svg).toHaveAttribute('viewBox', /^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/);
      await expect(svg).toHaveAttribute('role', 'img');

      // The accessible name and description come from inside the SVG and are
      // wired up by id, so a renamed scene cannot quietly lose them.
      const labelledBy = (await svg.getAttribute('aria-labelledby')).split(/\s+/);
      expect(labelledBy).toHaveLength(2);
      for (const id of labelledBy) {
        await expect(svg.locator(`[id="${id}"]`)).toHaveCount(1);
      }
      await expect(svg.locator('> title')).toHaveText(/\S/);
      await expect(svg.locator('> desc')).toHaveText(/\S/);

      // Our own copy rule: no em dash or en dash in the description.
      const desc = await svg.locator('> desc').textContent();
      expect(desc).not.toMatch(/[–—]/);
    });

    test(`${scene.name} shows every expected label`, async ({ page }) => {
      await openScene(page, scene.page);
      const drawn = await readLabels(page, scene.name);
      for (const label of scene.labels) {
        expect(drawn, `missing label "${label}"`).toContain(label);
      }
    });

    if (scene.alpha) {
      test(`${scene.name} tags exactly the alpha APIs`, async ({ page }) => {
        await openScene(page, scene.page);
        // A tile's tag and its label are two <text> nodes in the same .d-tile
        // group, so read each tile whole and keep the ones carrying "alpha".
        // A card's description is excluded: it is prose, not the tile's name.
        const tagged = await page.$$eval(`${sel(scene.name)} svg .d-tile`, (tiles) =>
          tiles
            .map((t) => {
              const texts = [...t.querySelectorAll('text')].filter((n) => !n.closest('.d-tile-desc')).map((n) => {
                const spans = n.querySelectorAll('tspan');
                const parts = spans.length ? [...spans].map((s) => s.textContent) : [n.textContent];
                return parts.join(' ').replace(/\s+/g, ' ').trim();
              });
              return { texts, isAlpha: texts.includes('alpha') };
            })
            .filter((t) => t.isAlpha)
            .map((t) => t.texts.filter((x) => x !== 'alpha').join(' ')),
        );
        expect(tagged.sort()).toEqual([...scene.alpha].sort());
      });
    }

    // NOTE: this measures USER UNITS inside the viewBox, not what a reader sees.
    // _diagrams.scss sets `svg { width: 100% }`, so the rendered size is
    // size x columnWidth / viewBoxWidth: on a 1512-wide canvas a 12-unit label
    // lands near 6-7 CSS px in a typical Docsy column. The floor is therefore
    // canvas-relative, and the same floor is four times more readable on a
    // 600-wide canvas than on a 1512-wide one. Whether the house style should
    // express this as a ratio instead is an open question for the skill text.
    // The number itself is MIN_LABEL, imported rather than repeated, so this
    // test cannot disagree with the builders about where the floor is.
    test(`${scene.name} draws no text below the label floor`, async ({ page }) => {
      // Imported, not repeated: this spec is CommonJS and the builders are
      // ESM, so the constant comes in dynamically rather than as a literal
      // that could drift from the one the builders enforce.
      const { MIN_LABEL } = await import('../diagrams/shapes.mjs');
      await openScene(page, scene.page);
      const sizes = await page.$$eval(`${sel(scene.name)} svg text`, (nodes) =>
        nodes.map((n) => parseFloat(getComputedStyle(n).fontSize)),
      );
      expect(sizes.length).toBeGreaterThan(0);
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(MIN_LABEL);
    });

    // A label wider than the card it sits in is a real defect that every other
    // check here misses: the scene still resolves, still fits the viewBox and
    // still shows every expected label. Only its own box is too small.
    // TWO DRAWN OBJECTS STANDING TOO CLOSE TOGETHER, which nothing measured
    // until two HTTP cards shipped overlapping on
    // `service-invocation-example-detailed` - the left card's URL drawn UNDER
    // the right card and truncated - and three subscriber hexagons shipped six
    // units apart on `pubsub-pattern`. Every other check passed both times:
    // the labels existed, were the right size, were inside the canvas, and
    // their colours resolved.
    //
    // WHY IT COULD NOT BE WRITTEN BEFORE. `appSidecar()` returned an anonymous
    // group, and the two hexagons in it overlap BY DESIGN - the sidecar is
    // docked onto the app's lower corner - so every scene using one reported
    // a pair thirty to sixty units inside each other. Classing that group
    // `d-app-pair` is what makes the deliberate overlap declarable, and with
    // it declared the whole set is clean: this check flags nothing at ten
    // units across all sixty-seven scenes.
    //
    // EIGHT UNITS, set just under where the set already sits. The tightest
    // deliberate spacing anywhere in it is ten - two Component boxes on the
    // building-block concept pictures - and the next band up is well clear, so
    // eight separates "drawn close on purpose" from "about to touch" without
    // picking a number out of the air. Measured in SCENE units: the svg is
    // scaled to the prose column by a different factor on every page, and a
    // bar in screen pixels would be a different bar on each.
    //
    // Objects inside one named mark are skipped: a mark and its plate, a
    // store and the glyph on it, are one object drawn in pieces.
    test(`${scene.name} keeps its shapes clear of each other`, async ({ page }) => {
      await openScene(page, scene.page);
      const close = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        // IN SCENE UNITS, not screen pixels. The svg is scaled to the prose
        // column, and by a different factor per scene, so a bar set in pixels
        // would be a different bar on every page - which is how a first run of
        // this flagged two tile grids whose gutters are identical in the
        // drawings that define them.
        const vb = svg.viewBox.baseVal;
        const scale = (svg.getBoundingClientRect().width || vb.width) / vb.width;
        const MIN = 8 * scale;
        const OBJECTS = [
          'd-box', 'd-node', 'd-decision', 'd-hex', 'd-dapr-app', 'd-cylinder',
          'd-envelope', 'd-broker', 'd-lock-box', 'd-secure-lock', 'd-tile',
          'd-pipe', 'd-http-card', 'd-code-card', 'd-mark-hex',
        ].map((c) => `g.${c}`).join(', ');
        const all = [...svg.querySelectorAll(OBJECTS)];
        // A nested object would report one overlap twice, under two names.
        const outer = all.filter((o) => !all.some((p) => p !== o && p.contains(o)));
        // One object drawn in pieces, or a pair that overlaps on purpose.
        const unit = (o) => o.closest('g.d-named-mark') || o.closest('g.d-app-pair');
        // The object's own body, not its group's box: a callout carries its
        // dashed leader inside the group, and an arrow's head is not the shape.
        const body = (o) => {
          const parts = [...o.querySelectorAll('rect, polygon, circle, ellipse, path')]
            .filter((p) => !p.closest('g.d-arrow'))
            .map((p) => p.getBoundingClientRect())
            .filter((b) => b.width && b.height);
          if (!parts.length) return null;
          return {
            l: Math.min(...parts.map((b) => b.left)),
            r: Math.max(...parts.map((b) => b.right)),
            t: Math.min(...parts.map((b) => b.top)),
            b: Math.max(...parts.map((b) => b.bottom)),
          };
        };
        // Clear when they are apart on EITHER axis, which is what lets a row
        // of shapes sit at a sensible pitch and a column at another.
        const gap = (a, b) => Math.max(a.l - b.r, b.l - a.r, a.t - b.b, b.t - a.b);
        const out = [];
        for (let i = 0; i < outer.length; i += 1) {
          for (let j = i + 1; j < outer.length; j += 1) {
            const A = outer[i]; const B = outer[j];
            if (unit(A) && unit(A) === unit(B)) continue;
            const ba = body(A); const bb = body(B);
            if (!ba || !bb) continue;
            const g = gap(ba, bb);
            if (g < MIN) {
              const name = (o) => (o.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)
                || o.getAttribute('class');
              out.push(`${name(A)} and ${name(B)} are ${Math.round(g / scale)} apart`);
            }
          }
        }
        return [...new Set(out)];
      }, sel(scene.name));

      expect(close, 'two shapes stand closer than eight units - move them apart, or say they are one object').toEqual([]);
    });

    // THE SAME RULE AS THE TILE CHECK BELOW, ON EVERY OTHER SHAPE THAT CARRIES
    // ITS OWN NAME. A hexagon, a broker, a store and a box all set their name
    // INSIDE themselves, and the exporter has no font metrics - so a name that
    // outgrows its shape is invisible to every numeric test: the text exists,
    // it is the right size, it is inside the canvas and its colours resolve.
    //
    // It kept happening. "Subscriber" ran to 85 units inside a 90-unit hexagon
    // on `pubsub-pattern` and touched both sloping edges; "poisonMessages"
    // filled its broker end to end on `pubsub-deadletter`. Both were caught by
    // looking, which is what this replaces.
    //
    // HALF AN EM OF CLEAR SPACE EACH SIDE, the same rule `captionPad()` sets
    // for a caption pill - a shape whose outline grazes its own letters reads
    // as a mistake long before it reads as tight.
    //
    // A hexagon is measured against its BOUNDING BOX, which is the widest the
    // shape ever gets. That is lenient at the sloping corners and exact across
    // the middle, where a one-line name sits; it is the same approximation the
    // tile check makes, and it still catches the case this exists for.
    test(`${scene.name} holds every shape's own name inside it`, async ({ page }) => {
      await openScene(page, scene.page);
      const tight = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        // IN SCENE UNITS. getBoundingClientRect() is scaled to the prose
        // column but a font-size attribute is not, so comparing the two
        // directly measures the shortfall in two different units - the same
        // mistake the shape-clearance check beside this one started with.
        const vb = svg.viewBox.baseVal;
        const scale = (svg.getBoundingClientRect().width || vb.width) / vb.width;
        // The builders that set a name inside the shape. A tile has its own
        // check; a pill has two of its own; a region's name sits ON its
        // border by design and is not inside anything.
        const INSIDE = ['d-hex', 'd-cylinder', 'd-pipe', 'd-box', 'd-lock-box', 'd-node', 'd-decision'];
        const out = [];
        for (const sel2 of INSIDE) {
          for (const g of svg.querySelectorAll(`g.${sel2}`)) {
            // The shape's own outline, not the group's box: a group may also
            // carry a name drawn OUTSIDE it, and markHex's mark sits in one.
            const body = g.querySelector('polygon, rect, path, ellipse, circle');
            const texts = [...g.querySelectorAll('text')]
              .filter((t) => t.getAttribute('aria-hidden') !== 'true');
            if (!body || !texts.length) continue;
            const r = body.getBoundingClientRect();
            if (!r.width || !r.height) continue;
            for (const t of texts) {
              const b = t.getBoundingClientRect();
              if (!b.width || !b.height) continue;
              // A name drawn OUTSIDE the shape - under a store, beside a
              // hexagon - is a different thing and not this rule's business.
              const inside = b.left >= r.left - 2 && b.right <= r.right + 2
                && b.top >= r.top - 2 && b.bottom <= r.bottom + 2;
              const straddles = b.left < r.right && b.right > r.left
                && b.top < r.bottom && b.bottom > r.top;
              if (!inside && !straddles) continue;
              const pad = parseFloat(getComputedStyle(t).fontSize) * 0.5 * scale;
              const worst = Math.max(
                r.left + pad - b.left,
                b.right - (r.right - pad),
              );
              if (worst > 0.5) {
                out.push({
                  shape: sel2,
                  label: (t.textContent || '').replace(/\s+/g, ' ').trim(),
                  short: Math.round(worst / scale),
                });
              }
            }
          }
        }
        return out;
      }, sel(scene.name));

      expect(tight, "a shape's own name has less than half an em of clear space inside it").toEqual([]);
    });

    test(`${scene.name} keeps every tile label inside its tile`, async ({ page }) => {
      await openScene(page, scene.page);
      const overflowing = await page.$$eval(`${sel(scene.name)} svg .d-tile`, (tiles) =>
        tiles
          .map((t) => {
            const rect = t.querySelector('rect');
            const texts = [...t.querySelectorAll('text')];
            if (!rect || !texts.length) return null;
            const r = rect.getBoundingClientRect();
            const worst = texts
              .map((n) => {
                const b = n.getBoundingClientRect();
                return Math.max(r.left - b.left, b.right - r.right, r.top - b.top, b.bottom - r.bottom);
              })
              .reduce((a, b) => Math.max(a, b), -Infinity);
            return worst > 0
              ? { label: texts.map((n) => n.textContent).join(' ').trim(), over: Math.round(worst) }
              : null;
          })
          .filter(Boolean),
      );
      expect(overflowing, 'tile labels wider or taller than their tile').toEqual([]);
    });

    // The same defect as the tile check above, on the one shape whose width is
    // handed in rather than derived: a caption pill. `captionW` is MEASURED,
    // because the exporter has no font metrics - and a measurement taken as
    // the text's own width leaves a pill whose ends graze its letters. Nothing
    // else here notices: the scene exports, the bbox is inside the viewBox,
    // the caption is clear of the contents it names, and the label is drawn.
    //
    // The rule is half an em of clear space each side. Every scene written
    // before this cleared it, the tightest (`security-capabilities`, at 12px)
    // by 0.8 units. All five workflow scenes using region() failed it, and
    // `workflow-multi-app-complex` drew "Main Orchestration Workflow" 0.4
    // units WIDER than the pill it sits in.
    test(`${scene.name} keeps every caption pill's text clear of its own ends`, async ({ page }) => {
      const { CAPTION_PAD_EM } = await import('../diagrams/shapes.mjs');
      await openScene(page, scene.page);
      const tight = await page.$$eval(
        `${sel(scene.name)} svg g.d-region > g.d-pill`,
        (pills, em) =>
          pills
            .map((pill) => {
              const rect = pill.querySelector('rect');
              const t = pill.querySelector('text');
              if (!rect || !t) return null;
              // getBBox, not getBoundingClientRect: scene units are what
              // `captionW` is expressed in, so the number a failure prints is
              // the number to change.
              const r = rect.getBBox();
              const b = t.getBBox();
              const pad = Math.min(b.x - r.x, r.x + r.width - (b.x + b.width));
              const size = Number(t.getAttribute('font-size'));
              const need = size * em;
              return pad < need
                ? {
                  caption: t.textContent.replace(/\s+/g, ' ').trim(),
                  pad: +pad.toFixed(1),
                  need: +need.toFixed(1),
                  captionW: +r.width.toFixed(1),
                  textW: +b.width.toFixed(1),
                  // Which face actually drew it: a pill that fits on one
                  // machine and not another is a font question first.
                  face: (() => {
                    const cs = getComputedStyle(t);
                    const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
                    const has = document.fonts.check(`${cs.fontWeight} ${cs.fontSize} "${family}"`);
                    return `${family} ${cs.fontWeight} ${cs.fontSize}${has ? '' : ' NOT LOADED'}`;
                  })(),
                  useAtLeast: Math.ceil(b.width + 2 * need),
                }
                : null;
            })
            .filter(Boolean),
        CAPTION_PAD_EM,
      );
      expect(tight, 'caption text too close to its pill ends - raise captionW').toEqual([]);
    });

    // The third member of the same family, and the one the pilot found by
    // eye. A label that NAMES a shape is a child of that shape, and the two
    // checks above own it. A FREE label - "Approval Event", "allowed", "Dapr
    // sidecar" - is placed by hand against a run or under a shape, and
    // nothing measured it against the shapes beside it. On
    // `workflow-human-interaction` two of them landed on what they annotated:
    // one over the wait step, one touching the box its arrow pointed at. Both
    // read as a drawing mistake, and both were caught by a person looking.
    //
    // A free label ON a lane border or ON a run is fine - that is what the
    // halo is for, and `paints ground behind any label a line crosses` owns
    // that question. This one is only about the filled, named objects.
    test(`${scene.name} keeps every free label clear of the shapes around it`, async ({ page }) => {
      await openScene(page, scene.page);
      const hits = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        // Every builder that draws an object carrying its own name. A region,
        // a run and a bare pill are deliberately absent: type belongs on those.
        const OBJECTS = [
          'd-box', 'd-node', 'd-decision', 'd-hex', 'd-dapr-app', 'd-badge',
          'd-cylinder', 'd-envelope', 'd-broker', 'd-lock-box', 'd-secure-lock',
          'd-callout', 'd-tile', 'd-pipe', 'd-socket',
        ].map((c) => `g.${c}`).join(', ');
        const objects = [...svg.querySelectorAll(OBJECTS)];
        // A nested object - the hexagon inside a d-dapr-app - would report one
        // overlap twice, under two names.
        const outer = objects.filter((o) => !objects.some((p) => p !== o && p.contains(o)));

        // The object's own body, not its group's box. `callout()` carries its
        // dashed LEADER inside the group, so the group's bounding box is the
        // card plus a line reaching across the drawing - which is how the
        // first run of this check reported `resiliency-policies`' lane caption
        // as sitting on a card eight hundred units away.
        const bodyOf = (o) => {
          const parts = [...o.querySelectorAll('rect, polygon, circle, ellipse')]
            .filter((p) => !p.closest('g.d-arrow'))
            .map((p) => p.getBoundingClientRect())
            .filter((b) => b.width && b.height);
          if (!parts.length) return null;
          return {
            left: Math.min(...parts.map((b) => b.left)),
            right: Math.max(...parts.map((b) => b.right)),
            top: Math.min(...parts.map((b) => b.top)),
            bottom: Math.max(...parts.map((b) => b.bottom)),
          };
        };
        const bodies = outer.map((o) => ({ o, b: bodyOf(o) })).filter((e) => e.b);

        const INSET = 1; // a descender grazing an outline is not a collision
        const found = [];
        for (const t of svg.querySelectorAll('text')) {
          if (t.getAttribute('aria-hidden') === 'true') continue; // the halo copy
          if (outer.some((o) => o.contains(t))) continue;         // the shape's own name
          const r = t.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const box = { l: r.left + INSET, r: r.right - INSET, t: r.top + INSET, b: r.bottom - INSET };
          if (box.r <= box.l || box.b <= box.t) continue;
          for (const { o, b } of bodies) {
            if (box.l < b.right && b.left < box.r && box.t < b.bottom && b.top < box.b) {
              found.push(`"${t.textContent.replace(/\s+/g, ' ').trim()}" over ${o.getAttribute('class')}`);
              break;
            }
          }
        }
        return [...new Set(found)];
      }, sel(scene.name));

      expect(hits, 'a free label is drawn on top of a shape').toEqual([]);
    });

    // A WORD DRAWN ON AN ARROWHEAD, which every other check in the suite
    // reads as fine. The word is haloed, so `paints ground behind any label a
    // line crosses` is satisfied - and what the halo then hides is the head
    // itself, which is the one part of a run that says which way it goes. On
    // `rag-overview` all three runs into the systems row had their word set
    // the house eleven units above the shape, and eleven units is where the
    // chevron is: a head is drawn BACK from its tip, seven units along the
    // line it ends, so the type and the head were in the same place and the
    // arrows read as plain lines touching boxes.
    //
    // WHAT IT CHECKS. No text at all - not a free word, not a shape's own
    // name - may overlap the chevron arrow() draws at a run's end. There is
    // no tolerance band and no "mostly clear": a head is eight units of ink
    // whose whole job is to be seen, and a word over any of it has taken the
    // direction out of the drawing. The lever is the word's offset, which is
    // the scene's own number to set; nothing about the head is adjustable.
    //
    // WHY THE POLYLINE. arrow() draws its line as a <line> and its head as
    // the only <polyline> in the group, and elbowArrow() lays its chevron
    // down with the same arrow(), so one selector finds every head in the
    // set however the run that carries it was built.
    test(`${scene.name} keeps every label clear of an arrowhead`, async ({ page }) => {
      await openScene(page, scene.page);
      const hits = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        const INSET = 1; // a descender grazing the tip is not a collision
        const heads = [...svg.querySelectorAll('g.d-arrow > polyline')]
          .map((h) => h.getBoundingClientRect())
          .filter((r) => r.width || r.height);
        if (!heads.length) return [];

        const found = [];
        for (const t of svg.querySelectorAll('text')) {
          if (t.getAttribute('aria-hidden') === 'true') continue; // the halo copy
          const r = t.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const box = { l: r.left + INSET, r: r.right - INSET, t: r.top + INSET, b: r.bottom - INSET };
          if (box.r <= box.l || box.b <= box.t) continue;
          if (heads.some((h) => box.l < h.right && h.left < box.r && box.t < h.bottom && h.top < box.b)) {
            found.push(t.textContent.replace(/\s+/g, ' ').trim());
          }
        }
        return [...new Set(found)];
      }, sel(scene.name));

      expect(hits, 'a label is drawn over an arrowhead - lift the word clear of the head, not of the shape').toEqual([]);
    });

    // TWO WORDS CROWDING EACH OTHER, and a word lying across a run it does
    // not name. Both shipped on `rag-overview` at once: `write` sat on the
    // descent into the vector index AND across validate_version's run to the
    // same store, three units under `count + verify`. Every check passed. The
    // word was the right size, inside the canvas, off every shape, haloed
    // against the lines it crossed, and its colours resolved. What a reader
    // got was two words in one place naming two different runs.
    //
    // WHAT IT CHECKS, for the scene's own FREE labels - the ones it places
    // itself, told apart by the "no `d-` ancestor" rule type-size.test.mjs
    // uses, so a shape's own name is somebody else's problem:
    //
    //   1. No two of them come within MIN_AIR of each other. Boxes are clear
    //      when they are apart on EITHER axis, which is what lets a column of
    //      words run down a bus at a sensible pitch. A BLOCK is exempt - see
    //      below.
    //   2. At most ONE run crosses any one of them. A word on a run names
    //      that run; a word two runs pass through names neither, and no
    //      offset of a few units will tell a reader which was meant. A run
    //      here is the whole arrow - elbowArrow() draws a path and lays a
    //      chevron over its last leg, and those are one line, not two.
    //
    // A BLOCK IS TYPE SET AS SEVERAL LABELS, and it is meant to sit at line
    // spacing. The set writes a name over its own sub-line this way all over
    // - "Sentry" above "Certificate authority", "Metadata API" above
    // "Discover capabilities and set attributes", "DAPR_API_TOKEN" above
    // "APP_API_TOKEN" - and in every one of them the two labels are SET TO
    // THE SAME EDGE: same left, same right, or same centre, because one call
    // was written directly under the other. Seven scenes do it, and holding
    // them to the air below would be telling a reviewed set to stop writing
    // the way it writes. A pair that agrees on an edge to within ALIGN is
    // therefore one piece of type and is skipped. A pair that does not is two
    // words that have drifted into each other, which is the defect: `write`
    // and `count + verify` agreed on nothing - 18 units apart on the left, 68
    // on the right, 43 on the centre - and still overlapped.
    //
    // SIX UNITS, and measured in SCENE units: the svg is scaled to the prose
    // column by a different factor on every page, so a bar in screen pixels
    // would be a different bar on each. Six is under the eight
    // `keeps its shapes clear of each other` holds two drawn objects to -
    // type sits closer together than boxes do.
    test(`${scene.name} keeps every free label clear of the lines and labels around it`, async ({ page }) => {
      await openScene(page, scene.page);
      const hits = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        const MIN_AIR = 6;
        // How near two labels' left edges, right edges or centres have to be
        // for the pair to read as one piece of type set on one axis.
        const ALIGN = 4;
        const INSET = 1;
        // px per scene unit, so the bars above are the same bars on every page.
        const unit = svg.getScreenCTM()?.a ?? 1;
        const air = MIN_AIR * unit;
        const aligned = ALIGN * unit;

        const free = [];
        for (const t of svg.querySelectorAll('text')) {
          if (t.getAttribute('aria-hidden') === 'true') continue;
          if (t.closest('g[class^="d-"]')) continue; // a shape's own name
          const r = t.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          free.push({ el: t, r, text: t.textContent.replace(/\s+/g, ' ').trim() });
        }

        const found = [];

        // 1. two words too near each other
        for (let i = 0; i < free.length; i++) {
          for (let j = i + 1; j < free.length; j++) {
            const a = free[i].r;
            const b = free[j].r;
            // One piece of type set as two labels: skip it.
            const sameEdge = Math.abs(a.left - b.left) <= aligned
              || Math.abs(a.right - b.right) <= aligned
              || Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) <= aligned;
            if (sameEdge) continue;
            const apartX = b.left - a.right >= air || a.left - b.right >= air;
            const apartY = b.top - a.bottom >= air || a.top - b.bottom >= air;
            if (!apartX && !apartY) {
              found.push(`"${free[i].text}" and "${free[j].text}" are less than ${MIN_AIR} apart`);
            }
          }
        }

        // 2. a word with more than one run through it
        const runOf = (el) => el.closest('g.d-elbow-arrow') ?? el.closest('g.d-arrow') ?? el;
        const strokes = [];
        for (const g of svg.querySelectorAll('g.d-arrow line, g.d-arrow polyline, g.d-elbow-arrow path')) {
          if (typeof g.getTotalLength !== 'function') continue;
          let len = 0;
          try { len = g.getTotalLength(); } catch { continue; }
          const m = len && g.getScreenCTM();
          if (!m) continue;
          const pts = [];
          const stepLen = Math.max(0.75, len / 4000);
          for (let d = 0; d <= len; d += stepLen) {
            const q = g.getPointAtLength(d);
            pts.push(new DOMPoint(q.x, q.y).matrixTransform(m));
          }
          strokes.push({ run: runOf(g), pts });
        }

        for (const f of free) {
          const box = {
            l: f.r.left + INSET, r: f.r.right - INSET, t: f.r.top + INSET, b: f.r.bottom - INSET,
          };
          if (box.r <= box.l || box.b <= box.t) continue;
          const runs = new Set();
          for (const s of strokes) {
            if (s.pts.some((q) => q.x > box.l && q.x < box.r && q.y > box.t && q.y < box.b)) {
              runs.add(s.run);
            }
          }
          if (runs.size > 1) found.push(`"${f.text}" has ${runs.size} runs through it`);
        }

        return [...new Set(found)];
      }, sel(scene.name));

      expect(hits, 'a free label is crowded by another label or claimed by two runs').toEqual([]);
    });

    // The point of the standalone copy: a file that still looks like the
    // diagram once it is away from this page's tokens. Without this the
    // download and copy buttons hand over something that paints black.
    test(`${scene.name} offers a standalone svg that resolves on its own`, async ({ page }) => {
      await openScene(page, scene.page);

      const href = await page.locator(`${sel(scene.name)} a[data-diagram-download="svg"]`).getAttribute('href');
      expect(href).toBe(`/diagrams/${scene.name}.svg`);

      const res = await page.request.get(href);
      expect(res.status(), `${href} did not serve`).toBe(200);
      const body = await res.text();
      expect(body.startsWith('<svg')).toBe(true);
      expect(
        body.match(/\bvar\(--d-[a-z-]+\)/g) ?? [],
        'the standalone copy still refers to page tokens, so it will not paint elsewhere',
      ).toEqual([]);
    });

    // The PNG beside it, for the places an SVG does not go: a slide, a chat
    // window, an issue comment. It is a committed file under static/, not
    // something Hugo builds, so nothing here would notice it missing - which
    // is why this asks the server for it and reads the signature off the
    // front rather than trusting the href.
    test(`${scene.name} offers a png download`, async ({ page }) => {
      await openScene(page, scene.page);

      const href = await page
        .locator(`${sel(scene.name)} a[data-diagram-download="png"]`)
        .getAttribute('href');
      expect(href).toBe(`/diagrams/${scene.name}.png`);

      const res = await page.request.get(href);
      expect(res.status(), `${href} did not serve`).toBe(200);
      expect(res.headers()['content-type'], `${href} is not served as a PNG`).toContain('image/png');
      expect(
        [...(await res.body()).subarray(0, 8)],
        `${href} does not start with the PNG signature`,
      ).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    });

    test(`${scene.name} has no element outside its viewBox`, async ({ page }) => {
      await openScene(page, scene.page);
      const m = await page.evaluate(margins, sel(scene.name));

      expect(m.left).toBeGreaterThanOrEqual(EDGE_MARGIN);
      expect(m.top).toBeGreaterThanOrEqual(EDGE_MARGIN);
      expect(m.right).toBeGreaterThanOrEqual(EDGE_MARGIN);
      expect(m.bottom).toBeGreaterThanOrEqual(EDGE_MARGIN);
    });

    // A canvas is not a frame the drawing is centred in by construction: the
    // parts land where the arithmetic put them and the air left over falls
    // wherever it falls. It does not show while a figure fills the content
    // column, because the figure's edges ARE the page's; it shows the moment
    // one renders narrower, where the drawing sits off to one side of its own
    // white space. `bbox.json` holds the viewBox origin that squares it up,
    // and `npm run measure:bbox` regenerates it after a scene moves.
    test(`${scene.name} centres its drawing in its canvas`, async ({ page }) => {
      await openScene(page, scene.page);
      const m = await page.evaluate(edgeFacts, sel(scene.name));
      const across = Math.abs(m.left - m.right);
      const down = Math.abs(m.top - m.bottom);
      // Flat where a shape sets the edge, wider where a label does.
      const allowX = CENTRE_TOLERANCE + m.slackX * TEXT_METRIC_SLACK;
      const allowY = CENTRE_TOLERANCE + m.slackY * TEXT_METRIC_SLACK;
      const why = across > allowX || down > allowY ? `\n  ${m.report}` : '';

      expect(
        across,
        `off-centre across: ${m.left.toFixed(1)} left against ${m.right.toFixed(1)} right${why}`,
      ).toBeLessThanOrEqual(allowX);
      expect(
        down,
        `off-centre down: ${m.top.toFixed(1)} top against ${m.bottom.toFixed(1)} bottom${why}`,
      ).toBeLessThanOrEqual(allowY);
    });

    // A region's caption is centred ON its border, so half of it hangs INSIDE
    // the box, over whatever stands at the top of the contents. Nothing warns
    // you: the scene still exports, the bbox is still inside the viewBox, and
    // every label is still drawn. `sentry-kubernetes` shipped a review round
    // with both app hexagons through their own pod names after the pods were
    // shortened to save height, which is the clearance that goes first.
    //
    // Lines are not checked: a run is SUPPOSED to cross a pod's border. This
    // is about the shapes and marks a caption can land on.
    test(`${scene.name} keeps every caption clear of the contents it names`, async ({ page }) => {
      await openScene(page, scene.page);
      const hits = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        // getBoundingClientRect, NOT getBBox: a mark is a <g> under a
        // transform, and getBBox would hand back its local box - the icon
        // file's own coordinates - which overlaps everything and nothing.
        const box = (node) => node.getBoundingClientRect();
        const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const found = [];
        // Only a REGION's caption: a bare pill() is a label on a line and
        // is placed against the line, not against a border.
        for (const pill of svg.querySelectorAll('g.d-region > g.d-pill')) {
          const caption = pill.querySelector('text')?.textContent?.trim() ?? '(unnamed)';
          const pb = box(pill);
          for (const shape of svg.querySelectorAll('polygon, g.d-icon')) {
            if (pill.contains(shape)) continue;
            if (overlaps(pb, box(shape))) found.push(caption);
          }
        }
        return [...new Set(found)];
      }, sel(scene.name));

      expect(hits, 'a caption is drawn over the contents it captions').toEqual([]);
    });

    // A name with a line drawn through it is the one legibility fault the
    // other checks cannot see: the scene resolves, the label is present, it
    // holds its colours, and it is still unreadable. The rule is that text
    // over ANY line - an arrow, a bus, a dashed border - carries ground
    // behind it, and this is what says so.
    // A CAPTION PILL IS A SHAPE, not just a label, and a line through the
    // middle of one cuts it in half. The check above does not see this: a
    // pill is FILLED, so its own background counts as ground behind its own
    // words and the label is deemed covered while the line crosses the
    // rounded box around it. On `pubsub-namespace-*` the first app's riser
    // came up at 174.6 and the cluster's pill ran from 49 to 199 - straight
    // through the middle of "Kubernetes cluster" - and every other check in
    // the suite passed.
    //
    // A region's name sits ON its border, and every run that leaves the
    // region crosses that border, so this is a collision the layout has to be
    // arranged around rather than one that happens by accident.
    test(`${scene.name} keeps every line clear of a caption pill`, async ({ page }) => {
      await openScene(page, scene.page);
      const hits = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        // A pill's own rounded rect, and the text inside it, are not lines.
        const pills = [...svg.querySelectorAll('.d-pill')].map((p) => ({
          el: p,
          r: p.getBoundingClientRect(),
          text: (p.textContent || '').trim(),
        })).filter((p) => p.r.width && p.r.height);
        if (!pills.length) return [];

        const found = [];
        for (const g of svg.querySelectorAll('path, line, polyline')) {
          if (g.closest('.d-pill')) continue;
          const cs = getComputedStyle(g);
          if (cs.fill !== 'none' || cs.stroke === 'none' || parseFloat(cs.strokeWidth) === 0) continue;
          if (typeof g.getTotalLength !== 'function') continue;
          let len = 0;
          try { len = g.getTotalLength(); } catch { continue; }
          const m = len && g.getScreenCTM();
          if (!m) continue;
          const step = Math.max(0.75, len / 4000);
          for (let d = 0; d <= len; d += step) {
            const q = g.getPointAtLength(d);
            const pt = new DOMPoint(q.x, q.y).matrixTransform(m);
            const hit = pills.find((p) =>
              pt.x > p.r.left && pt.x < p.r.right && pt.y > p.r.top && pt.y < p.r.bottom);
            if (hit) { found.push(hit.text); break; }
          }
        }
        return [...new Set(found)];
      }, sel(scene.name));

      expect(hits, 'a line is drawn through a caption pill - move the run clear of the name on the border').toEqual([]);
    });

    test(`${scene.name} paints ground behind any label a line crosses`, async ({ page }) => {
      await openScene(page, scene.page);
      const hits = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        const INSET = 1; // a stroke grazing the box's own corner is not a crossing

        // A LINE is a stroked shape with no fill. A filled shape that also has
        // a stroke is an object, and a label on one of those is a different
        // question - the hexagon's own name is not struck through by it.
        const strokes = [];
        for (const g of svg.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse')) {
          const cs = getComputedStyle(g);
          if (cs.fill !== 'none' || cs.stroke === 'none' || parseFloat(cs.strokeWidth) === 0) continue;
          if (typeof g.getTotalLength !== 'function') continue;
          let len = 0;
          try { len = g.getTotalLength(); } catch { continue; }
          const m = len && g.getScreenCTM();
          if (!m) continue;
          // Walk the geometry rather than test its bounding box: an elbow's box
          // is the whole L, most of which the line never touches.
          const pts = [];
          const step = Math.max(0.75, len / 4000);
          for (let d = 0; d <= len; d += step) {
            const q = g.getPointAtLength(d);
            pts.push(new DOMPoint(q.x, q.y).matrixTransform(m));
          }
          strokes.push({ el: g, pts });
        }

        // Ground is anything filled: a halo, a caption pill, a plate, a card.
        const filled = [...svg.querySelectorAll('path, polygon, rect, circle, ellipse')]
          .filter((f) => getComputedStyle(f).fill !== 'none')
          .map((f) => ({ el: f, r: f.getBoundingClientRect() }));

        const found = [];
        for (const t of svg.querySelectorAll('text')) {
          if (t.getAttribute('aria-hidden') === 'true') continue; // the halo copy itself
          const prev = t.previousElementSibling;
          const haloed = prev && prev.tagName.toLowerCase() === 'text'
            && prev.getAttribute('aria-hidden') === 'true';
          if (haloed) continue;
          const r = t.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const box = { l: r.left + INSET, r: r.right - INSET, t: r.top + INSET, b: r.bottom - INSET };
          if (box.r <= box.l || box.b <= box.t) continue;
          for (const s of strokes) {
            if (!s.pts.some((q) => q.x > box.l && q.x < box.r && q.y > box.t && q.y < box.b)) continue;
            // Ground only counts if it paints AFTER the line it has to hide,
            // and in SVG that is document order.
            const covered = filled.some((f) =>
              f.r.left <= box.l && f.r.right >= box.r && f.r.top <= box.t && f.r.bottom >= box.b
              && (s.el.compareDocumentPosition(f.el) & Node.DOCUMENT_POSITION_FOLLOWING));
            if (!covered) { found.push(t.textContent.trim()); break; }
          }
        }
        return [...new Set(found)];
      }, sel(scene.name));

      expect(hits, 'a line is drawn through a label with nothing behind it').toEqual([]);
    });

    test(`${scene.name} resolves its token colors in light and in dark`, async ({ page }) => {
      await openScene(page, scene.page);
      await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'light'));
      const light = await readPaint(page, scene.name);

      // The site's toggle flips this attribute on <html>; no media query involved.
      await page.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'dark'));
      const dark = await readPaint(page, scene.name);

      // A var() that does not resolve survives as the literal text, which is
      // exactly the failure this catches.
      expect(light.unresolved, 'unresolved paint in light').toEqual([]);
      expect(dark.unresolved, 'unresolved paint in dark').toEqual([]);

      // Only assert on what this scene actually draws: a missing .d-panel is a
      // legitimate scene shape, not a regression. The fingerprint below is the
      // assertion that every scene must pass.
      for (const key of ['panelStroke', 'textFill']) {
        if (light[key] === null && dark[key] === null) continue;
        expect(light[key], `${key} did not resolve`).toMatch(/^rgba?\(/);
        expect(dark[key], `${key} did not resolve in dark`).toMatch(/^rgba?\(/);
        expect(dark[key], `${key} is the same in both themes`).not.toBe(light[key]);
      }
      expect(dark.fingerprint, 'the scene paints identically in both themes').not.toBe(
        light.fingerprint,
      );
    });

    for (const width of PHONE_WIDTHS) {
      test(`${scene.name} does not overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 780 });
        await openScene(page, scene.page);

        const figure = page.locator(sel(scene.name));
        const svgBox = await figure.locator('> svg').boundingBox();
        expect(svgBox.x + svgBox.width).toBeLessThanOrEqual(width + 1);

        // Scoped to the figure on purpose. Page-level overflow is
        // tests/layout.spec.js's job, and a page can overflow for reasons that
        // have nothing to do with its diagram (overview.md's wide Markdown
        // tables push 3px past 320px today, with or without this figure).
        const inner = await page.evaluate(
          (root) => {
            const fig = document.querySelector(root);
            return { scroll: fig.scrollWidth, client: fig.clientWidth };
          },
          sel(scene.name),
        );
        expect(inner.scroll).toBeLessThanOrEqual(inner.client + 1);
      });
    }

    test(`${scene.name} centres a narrowed diagram on the prose column`, async ({ page }) => {
      // Docsy caps every `.td-content > *` at 80% of the content area and
      // leaves it LEFT-aligned, so the prose occupies the left four fifths and
      // the last fifth is empty. A figure centred with `auto` margins centres
      // on .td-content instead, which put a 50%-wide diagram 100px right of
      // the paragraph above it - a drawing that reads as having drifted, on a
      // page where nothing else is off-centre.
      //
      // `_diagrams.scss` offsets the figure by (prose - width) / 2 to correct
      // it. That 80% is the THEME's number, not ours, so this test measures
      // the two centres on the real page rather than asserting the constant:
      // if Docsy ever moves the cap, this fails instead of the pages quietly
      // drifting again.
      //
      // Only below the prose width. A diagram asked for at more than 80% -
      // and one at the full width, which passes no `width` at all - cannot be
      // centred inside a column narrower than itself without hanging off the
      // left edge, so those stay aligned to the prose's left edge and this
      // test checks that instead.
      await page.setViewportSize({ width: 1600, height: 1000 });
      await openScene(page, scene.page);

      const geom = await page.evaluate((root) => {
        const fig = document.querySelector(root);
        const content = fig.closest('.td-content');
        // Any block of prose Docsy has capped; its box is the text column.
        const prose = [...content.children].find(
          (el) => el !== fig && /^(P|UL|OL|H2|H3)$/.test(el.tagName)
            && el.textContent.trim().length > 40,
        );
        if (!prose) return null;
        const f = fig.getBoundingClientRect();
        const p = prose.getBoundingClientRect();
        return {
          figCentre: (f.left + f.right) / 2,
          figLeft: f.left,
          figWidth: f.width,
          proseCentre: (p.left + p.right) / 2,
          proseLeft: p.left,
          proseWidth: p.width,
        };
      }, sel(scene.name));

      // A page with no capped prose block beside the figure has nothing to
      // measure against; that is not a failure of the figure.
      test.skip(geom === null, 'no prose block on this page to measure against');

      if (geom.figWidth <= geom.proseWidth + 1) {
        expect(
          Math.abs(geom.figCentre - geom.proseCentre),
          'a diagram narrower than the prose shares its centre',
        ).toBeLessThanOrEqual(1);
      } else {
        expect(
          Math.abs(geom.figLeft - geom.proseLeft),
          'a diagram wider than the prose shares its left edge',
        ).toBeLessThanOrEqual(1);
      }
    });

    test(`${scene.name} runs no engine in the browser`, async ({ page }) => {
      await openScene(page, scene.page);

      // Decision 3 stands where it matters: the SVG is the artifact and the
      // browser never runs the engine that drew it. What the page MAY now
      // ship is the copy button's script, which only fetches a file and
      // writes it to the clipboard - it draws nothing, and the diagram is
      // complete without it. The figure itself still carries no script.
      await expect(page.locator(`${sel(scene.name)} script`)).toHaveCount(0);

      const handlers = await page.evaluate((root) => {
        const bad = [];
        for (const el of document.querySelectorAll(`${root} *`)) {
          for (const attr of el.attributes) {
            if (/^on/i.test(attr.name)) bad.push(`${el.tagName}[${attr.name}]`);
          }
        }
        return bad;
      }, sel(scene.name));
      expect(handlers).toEqual([]);

      const srcs = await page.$$eval('script[src]', (nodes) => nodes.map((n) => n.getAttribute('src')));
      // diagram-actions.js is the ONE allowed diagram script, allowed by name
      // so a second one cannot arrive unnoticed.
      const engines = srcs.filter(
        (s) => /diagram|\bd3\b/i.test(s) && !/diagram-actions(\.[a-f0-9]+)?\.js$/.test(s),
      );
      expect(engines, 'a diagram script other than the copy button').toEqual([]);
    });
  });
}

// The two accessibility properties of the actions row, checked ONCE rather than
// per scene. The shortcode is a single template, so one page proves what 109
// navigations would prove 109 times on a suite that already runs 12 minutes.
//
// `service-invocation-example` is the page because its figure is the narrowest
// in the content - the call passes `width="50"` - so it is where the row has
// least room to lay itself out.
const ACTIONS_SCENE = 'service-invocation-example';
const ACTIONS_ROW = SCENE_ROWS.find((s) => s.name === ACTIONS_SCENE);

// `document.fonts.ready` makes every measurement here wait for the swap, but a
// font that never ARRIVES settles too: the promise resolves and the labels are
// laid out in a fallback face. That failure reaches this suite as geometry - a
// drawing reported off-centre because the label under its leftmost shape grew
// wider than the shape. Name it here, once, so the next time it is the font the
// suite says so instead of sending somebody to `npm run measure:bbox`.
test('the page really draws its diagram labels in Inter', async ({ page }) => {
  expect(ACTIONS_ROW, `no SCENE_ROWS row for ${ACTIONS_SCENE}`).toBeTruthy();
  await openScene(page, ACTIONS_ROW.page);

  const face = await page.evaluate((root) => {
    const text = document.querySelector(`${root} svg text`);
    if (!text) return null;
    const { fontFamily, fontSize } = getComputedStyle(text);
    return { stack: fontFamily, size: fontSize, loaded: document.fonts.check(`${fontSize} Inter`) };
  }, sel(ACTIONS_SCENE));

  expect(face, `no <text> in ${ACTIONS_SCENE} to read a face from`).not.toBeNull();
  expect(face.stack, 'the diagram labels no longer name Inter at all').toContain('Inter');
  expect(
    face.loaded,
    `Inter is not loaded at ${face.size} - every measurement in this file is of a fallback face`,
  ).toBe(true);
});

// Label in Name. A speech-input user says "click Download SVG", and the browser
// matches what they said against the ACCESSIBLE name, not against the words
// painted on the control. The aria-label is there because the same three words
// repeat beside every diagram on a page - so it has to OPEN with those three
// words, or the control cannot be operated by voice at all (WCAG 2.5.3,
// failure F96). Nothing else on this branch holds the ordering: write the scene
// name first and every one of the other 3116 tests still passes.
test('each download control opens its accessible name with the words on it', async ({ page }) => {
  expect(ACTIONS_ROW, `no SCENE_ROWS row for ${ACTIONS_SCENE}`).toBeTruthy();
  await openScene(page, ACTIONS_ROW.page);

  const controls = await page.$$eval(`${sel(ACTIONS_SCENE)} a[data-diagram-download]`, (nodes) =>
    nodes.map((n) => ({
      kind: n.dataset.diagramDownload,
      text: (n.textContent || '').replace(/\s+/g, ' ').trim(),
      label: (n.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
    })),
  );

  expect(controls.map((c) => c.kind).sort(), 'the two download controls').toEqual(['png', 'svg']);
  // Without this an empty visible string would satisfy startsWith() and the
  // check below would pass on a control nobody can see the name of.
  expect(controls.filter((c) => !c.text || !c.label), 'a control missing its text or its label').toEqual([]);
  expect(
    controls.filter((c) => !c.label.startsWith(c.text)),
    'an aria-label that does not OPEN with the control\'s visible text - a speech-input'
    + ' user cannot operate it (WCAG 2.5.3, failure F96)',
  ).toEqual([]);
});

// `.dapr-diagram-actions` wraps, and this is the reproduction that made it
// wrap: a phone-width viewport with the reader's default text size doubled,
// which is a setting people actually use and which widens three controls that
// sit in a row at the end of a narrow figure.
//
// Containment, not pixel positions. Where exactly the controls land is a
// layout detail that may move; that they are INSIDE the figure, and that the
// page does not scroll sideways, is the property. Without `flex-wrap: wrap`
// the first control's left edge goes negative here and both assertions fail.
test('the download controls stay inside the narrowest figure at double text size', async ({ page }) => {
  expect(ACTIONS_ROW, `no SCENE_ROWS row for ${ACTIONS_SCENE}`).toBeTruthy();
  await page.setViewportSize({ width: 375, height: 800 });
  await openScene(page, ACTIONS_ROW.page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });

  const out = await page.evaluate((root) => {
    const figure = document.querySelector(root);
    const f = figure.getBoundingClientRect();
    const controls = [...figure.querySelectorAll('.dapr-diagram-action')];
    // Sub-pixel slack: a border can round a fraction of a pixel past its box.
    const escaped = controls
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.left < f.left - 0.5 || r.right > f.right + 0.5)
      .map(({ el, r }) =>
        `"${(el.textContent || '').trim()}" spans ${r.left.toFixed(0)}-${r.right.toFixed(0)},`
        + ` figure ${f.left.toFixed(0)}-${f.right.toFixed(0)}`);
    const scroller = document.scrollingElement;
    return { count: controls.length, escaped, overflow: scroller.scrollWidth - scroller.clientWidth };
  }, sel(ACTIONS_SCENE));

  expect(out.count, 'two downloads and a copy button').toBe(3);
  expect(
    out.escaped,
    'a diagram action sticks out of its figure at 375px with a 32px root font'
    + ' - `.dapr-diagram-actions` needs `flex-wrap: wrap`',
  ).toEqual([]);
  expect(out.overflow, 'the page scrolls sideways at 375px with a 32px root font').toBe(0);
});

// Where the call sites actually are, read from the repo rather than from SCENES.
// Building the page list out of SCENES (as this guard used to) can only ever see
// pages that already have a row, so the failure it exists to prevent - a scene
// shipped on a page nobody listed - was invisible to it.
const CONTENT_DIR = path.join(REPO_ROOT, 'daprdocs', 'content', 'en');

function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return markdownFiles(full);
    return e.isFile() && e.name.endsWith('.md') ? [full] : [];
  });
}

// content/en/overview.md -> /overview/ ; .../_index.md -> that directory's url
function urlFor(file) {
  const rel = path.relative(CONTENT_DIR, file).split(path.sep).join('/');
  // Hugo lowercases URLs (disablePathToLower is off), so integrations/Diagrid/
  // is served at /integrations/diagrid/.
  const stem = rel.replace(/\.md$/, '').replace(/(^|\/)_index$/, '').toLowerCase();
  return `/${stem}${stem.endsWith('/') || stem === '' ? '' : '/'}`;
}

function diagramCallSites() {
  const calls = [];
  for (const file of markdownFiles(CONTENT_DIR)) {
    const body = fs.readFileSync(file, 'utf8');
    // Both call forms: `{{< diagram overview >}}` and, where the page asks for
    // a width, the all-named `{{< diagram name="x" width="70" >}}` - Hugo
    // refuses to mix positional and named parameters, so passing one means
    // naming both.
    for (const m of body.matchAll(/\{\{<\s*diagram\s+([^>]*?)\s*>\}\}/g)) {
      const args = m[1];
      const named = args.match(/(^|\s)name\s*=\s*["']([^"']+)["']/);
      const name = named ? named[2] : args.split(/\s+/)[0].replace(/^["']|["']$/g, '');
      calls.push({ name, page: urlFor(file) });
    }
  }
  return calls;
}

test('every exported diagram has a row in SCENES', () => {
  // The exporter writes one svg per registered scene and deletes orphans, so
  // the directory listing is the registry.
  const exported = fs
    .readdirSync(path.join(REPO_ROOT, 'daprdocs', 'assets', 'diagrams'))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.slice(0, -4));
  const known = SCENES.map((s) => s.name);
  expect(
    exported.filter((n) => !known.includes(n)),
    'exported but untested - add a SCENES row',
  ).toEqual([]);
});

test('every {{< diagram >}} call site in the content is listed in SCENES', () => {
  const rows = SCENES.map((s) => `${s.name} ${s.page}`);
  const missing = diagramCallSites()
    .filter(({ name, page }) => !rows.includes(`${name} ${page}`))
    .map(({ name, page }) => `${name} on ${page}`);
  expect(missing, 'diagram call sites with no matching SCENES row').toEqual([]);
});

test('every .dapr-diagram on a visited page is listed in SCENES', async ({ page }) => {
  const known = SCENES.map((s) => s.name);
  const pages = new Set([...SCENES.map((s) => s.page), ...diagramCallSites().map((c) => c.page)]);
  for (const url of pages) {
    await openScene(page, url);
    const found = await page.$$eval('.dapr-diagram', (nodes) =>
      nodes.map((n) => n.dataset.diagram ?? '(no data-diagram)'),
    );
    expect(found.length, `${url} renders no diagram`).toBeGreaterThan(0);
    for (const name of found) {
      expect(known, `${url} renders diagram "${name}", which has no row in SCENES`).toContain(name);
    }
  }
});


// Windows high contrast drops author colours entirely. A diagram that depends on
// var(--d-*) can collapse to invisible there, which is why _diagrams.scss has a
// forced-colors block - and why it needs a test, as a named Review Focus item.
test.describe('high contrast', () => {
  for (const scene of SCENES) {
    test(`${scene.name} on ${scene.page} stays visible in forced-colors mode`, async ({ page }) => {
      // emulateMedia, not test.use({ forcedColors }): the fixture form did not
      // make the media query match in this Chromium, so the test silently
      // measured the ordinary light theme instead of high contrast.
      await page.emulateMedia({ forcedColors: 'active' });
      await openScene(page, scene.page);
      expect(
        await page.evaluate(() => matchMedia('(forced-colors: active)').matches),
        'forced-colors emulation did not take effect; this test would prove nothing',
      ).toBe(true);
      const paints = await page.evaluate((root) => {
        const svg = document.querySelector(`${root} svg`);
        const text = [...svg.querySelectorAll('text')].map((n) => getComputedStyle(n).fill);
        const strokes = [...svg.querySelectorAll('path, rect, polygon, polyline, line')]
          .filter((n) => !n.closest('.d-icon'))
          .map((n) => getComputedStyle(n).stroke);
        return { text, strokes };
      }, sel(scene.name));

      // Nothing may still be asking for a custom property the UA has dropped.
      expect(paints.text.filter((v) => v.includes('var(')), 'unresolved text fill').toEqual([]);
      expect(paints.strokes.filter((v) => v.includes('var(')), 'unresolved stroke').toEqual([]);
      expect(paints.text.length, 'no text found').toBeGreaterThan(0);
      // And text must not be painted in the window background colour.
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(paints.text.filter((v) => v === bg), 'text painted in the page background').toEqual([]);
    });
  }
});


// Where each converted page's source lives, so a check can read what the page
// actually says rather than what a list remembers about it.
const SOURCE_FOR_URL = (() => {
  const map = new Map();
  for (const file of markdownFiles(CONTENT_DIR)) map.set(urlFor(file), file);
  return map;
})();


// THE MAINTAINER'S RULING, STATED AS A RULE. A converted page shows the drawing
// and not the thing it replaced: none of the images this conversion catalogued
// as a diagram, and no Mermaid except the two families it deliberately does not
// draw.
//
// NOT "keeps no image", which is what this check first said and what the plan
// asked for. Two converted pages legitimately keep a screenshot - RedisInsight
// and the dev dashboard on dapr-agents-getting-started - and a screenshot of
// running software is evidence, not a diagram anyone should redraw. The
// anti-goal was ever only a page showing the new SVG BESIDE the PNG it
// replaced.
//
// "Catalogued as a diagram" is read from the sibling guard rather than listed
// here, because that file is where an image path lives by construction: every
// image this conversion touched is in one of its lists. Reading it as TEXT
// instead of importing it is deliberate - requiring one spec file from another
// runs its `test()` calls and registers its whole suite a second time.
const GUARDED_IMAGES = (() => {
  const src = fs.readFileSync(path.join(__dirname, 'images-still-resolve.spec.js'), 'utf8');
  return new Set([...src.matchAll(/['"]([\w./-]+\.(?:png|jpg|jpeg|gif|svg|webp))['"]/g)].map((m) => m[1]));
})();

// A silently empty extraction would make the check below pass on everything,
// which is the one way a guard like this fails without anyone noticing.
test('the diagram-image catalogue was actually read', () => {
  expect(GUARDED_IMAGES.size, 'no image paths found in images-still-resolve.spec.js').toBeGreaterThan(50);
});

test('a converted page keeps no image it replaced, and no mermaid but a sequence or gantt', () => {
  const offences = [];
  for (const url of new Set(SCENES.map((s) => s.page))) {
    const file = SOURCE_FOR_URL.get(url);
    expect(file, `no source file found for converted page ${url}`).toBeTruthy();
    const body = fs.readFileSync(file, 'utf8');

    // Both syntaxes that reach /images/: a raw tag and a markdown image. The
    // conversion found 92 of the former and 14 of the latter in the tree, so
    // checking only one would pass a page that still shows the other.
    const shown = [
      ...[...body.matchAll(/<img[^>]+src=["']\/images\/([^"']+)["']/g)].map((m) => m[1]),
      ...[...body.matchAll(/!\[[^\]]*\]\(\/images\/([^)]+)\)/g)].map((m) => m[1]),
    ];
    for (const img of shown) {
      if (GUARDED_IMAGES.has(img)) offences.push(`${url} still shows the diagram it replaced: ${img}`);
    }

    // A Mermaid block may stay only if it is a family this set has no shapes
    // for: a sequence diagram needs a lifeline and a gantt needs a time axis.
    // Anything else - a flowchart above all - is a diagram that was converted
    // on every other page and missed here.
    for (const m of body.matchAll(/\{\{<\s*mermaid\s*>\}\}\s*\n\s*(\w+)/g)) {
      if (!['sequenceDiagram', 'gantt'].includes(m[1])) {
        offences.push(`${url} still holds a {{< mermaid >}} "${m[1]}" block`);
      }
    }
  }
  expect(offences, 'converted pages that still show what the diagram replaced').toEqual([]);
});
