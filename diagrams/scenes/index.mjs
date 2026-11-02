// Registry of diagram scenes: { '<name>': sceneModuleDefaultExport }.
// <name> becomes daprdocs/assets/diagrams/<name>.svg and the svg() id base.
// Scenes are added here as they are written.
import agentsOverview from './agents-overview.mjs';
import buildingBlocks from './building-blocks.mjs';
import buildingBlocksConcept from './building-blocks-concept.mjs';
import componentsConcept from './components-concept.mjs';
import hostingKubernetes from './hosting-kubernetes.mjs';
import hostingStandalone from './hosting-standalone.mjs';
import hostingVms from './hosting-vms.mjs';
import overview from './overview.mjs';
import sidecarApis from './sidecar-apis.mjs';
import schedulerArchitecture from './scheduler-architecture.mjs';
import serviceMesh from './service-mesh.mjs';
import observabilityTracing from './observability-tracing.mjs';
import observabilitySidecar from './observability-sidecar.mjs';
import resiliencyPolicies from './resiliency-policies.mjs';
import appHealth from './app-health.mjs';
import sidecarHealth from './sidecar-health.mjs';
import securityEndToEnd from './security-end-to-end.mjs';
import sentrySelfhosted from './sentry-selfhosted.mjs';
import sentryKubernetes from './sentry-kubernetes.mjs';
import mtlsSystemServices from './mtls-system-services.mjs';
import apiScoping from './api-scoping.mjs';
import securityCapabilities from './security-capabilities.mjs';
import securityThreatModel from './security-threat-model.mjs';
import sidecarModel from './sidecar-model.mjs';
import workflowTaskChaining from './workflow-task-chaining.mjs';
import workflowFanOutFanIn from './workflow-fan-out-fan-in.mjs';
import workflowMonitor from './workflow-monitor.mjs';
import workflowExternalSystem from './workflow-external-system.mjs';
import workflowCompensation from './workflow-compensation.mjs';
import workflowAsyncHttp from './workflow-async-http.mjs';
import workflowMultiAppActivity from './workflow-multi-app-activity.mjs';
import workflowMultiAppChildWorkflow from './workflow-multi-app-child-workflow.mjs';
import workflowMultiAppComplex from './workflow-multi-app-complex.mjs';
import workflowCrossAppClient from './workflow-cross-app-client.mjs';
import bindingsOverview from './bindings-overview.mjs';
import bindingOutputKafka from './binding-output-kafka.mjs';
import bindingInputKafka from './binding-input-kafka.mjs';
import serviceInvocationExample from './service-invocation-example.mjs';
import configurationExample from './configuration-example.mjs';
import stateManagementExample from './state-management-example.mjs';
import pubsubPublishRaw from './pubsub-publish-raw.mjs';
import pubsubSubscribeRaw from './pubsub-subscribe-raw.mjs';
import configurationApiOverview from './configuration-api-overview.mjs';
import conversationOverview from './conversation-overview.mjs';
import cryptographyOverview from './cryptography-overview.mjs';
import distributedLockOverview from './distributed-lock-overview.mjs';
import lockExample from './lock-example.mjs';
import lockUnlockExample from './lock-unlock-example.mjs';
import lockMultipleExample from './lock-multiple-example.mjs';

export const scenes = {
  'agents-overview': agentsOverview,
  'building-blocks': buildingBlocks,
  'building-blocks-concept': buildingBlocksConcept,
  'components-concept': componentsConcept,
  'hosting-kubernetes': hostingKubernetes,
  'hosting-standalone': hostingStandalone,
  'hosting-vms': hostingVms,
  overview,
  'sidecar-apis': sidecarApis,
  'scheduler-architecture': schedulerArchitecture,
  'service-mesh': serviceMesh,
  'observability-tracing': observabilityTracing,
  'observability-sidecar': observabilitySidecar,
  'resiliency-policies': resiliencyPolicies,
  'app-health': appHealth,
  'sidecar-health': sidecarHealth,
  'security-end-to-end': securityEndToEnd,
  'sentry-selfhosted': sentrySelfhosted,
  'sentry-kubernetes': sentryKubernetes,
  'mtls-system-services': mtlsSystemServices,
  'api-scoping': apiScoping,
  'security-capabilities': securityCapabilities,
  'security-threat-model': securityThreatModel,
  'sidecar-model': sidecarModel,
  'workflow-task-chaining': workflowTaskChaining,
  'workflow-fan-out-fan-in': workflowFanOutFanIn,
  'workflow-monitor': workflowMonitor,
  'workflow-external-system': workflowExternalSystem,
  'workflow-compensation': workflowCompensation,
  'workflow-async-http': workflowAsyncHttp,
  'workflow-multi-app-activity': workflowMultiAppActivity,
  'workflow-multi-app-child-workflow': workflowMultiAppChildWorkflow,
  'workflow-multi-app-complex': workflowMultiAppComplex,
  'workflow-cross-app-client': workflowCrossAppClient,
  'bindings-overview': bindingsOverview,
  'binding-output-kafka': bindingOutputKafka,
  'binding-input-kafka': bindingInputKafka,
  'service-invocation-example': serviceInvocationExample,
  'configuration-example': configurationExample,
  'state-management-example': stateManagementExample,
  'pubsub-publish-raw': pubsubPublishRaw,
  'pubsub-subscribe-raw': pubsubSubscribeRaw,
  'configuration-api-overview': configurationApiOverview,
  'conversation-overview': conversationOverview,
  'cryptography-overview': cryptographyOverview,
  'distributed-lock-overview': distributedLockOverview,
  'lock-example': lockExample,
  'lock-unlock-example': lockUnlockExample,
  'lock-multiple-example': lockMultipleExample,
};
