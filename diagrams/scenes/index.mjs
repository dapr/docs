// Registry of diagram scenes: { '<name>': sceneModuleDefaultExport }.
// <name> becomes daprdocs/assets/diagrams/<name>.svg and the svg() id base.
// Scenes are added here as they are written.
import agentsAugmentedLlm from './agents-augmented-llm.mjs';
import agentsPromptChaining from './agents-prompt-chaining.mjs';
import agentsRouting from './agents-routing.mjs';
import agentsParallelization from './agents-parallelization.mjs';
import agentsOrchestratorWorkers from './agents-orchestrator-workers.mjs';
import agentsEvaluatorOptimizer from './agents-evaluator-optimizer.mjs';
import agentsStatefulLlm from './agents-stateful-llm.mjs';
import agentsPatternsOverview from './agents-patterns-overview.mjs';
import agentsOverview from './agents-overview.mjs';
import agentsLoop from './agents-loop.mjs';
import agentsToolCallFlow from './agents-tool-call-flow.mjs';
import agentsOrchestration from './agents-orchestration.mjs';
import agentsMessageDriven from './agents-message-driven.mjs';
import agentsDecoupledInfrastructure from './agents-decoupled-infrastructure.mjs';
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
import pubsubCompetingConsumers from './pubsub-competing-consumers.mjs';
import pubsubComponents from './pubsub-components.mjs';
import pubsubDeadletter from './pubsub-deadletter.mjs';
import pubsubPublishApi from './pubsub-publish-api.mjs';
import pubsubPattern from './pubsub-pattern.mjs';
import pubsubNamespaceBasic from './pubsub-namespace-basic.mjs';
import pubsubNamespaceWith from './pubsub-namespace-with.mjs';
import pubsubNamespaceWithout from './pubsub-namespace-without.mjs';
import pubsubHowtoOverview from './pubsub-howto-overview.mjs';
import secretsCloudStores from './secrets-cloud-stores.mjs';
import serviceInvocationExampleDetailed from './service-invocation-example-detailed.mjs';
import serviceInvocationMdns from './service-invocation-mdns.mjs';
import serviceInvocationNonDaprEndpoint from './service-invocation-non-dapr-endpoint.mjs';
import serviceInvocationOverview from './service-invocation-overview.mjs';
import serviceInvocationSimple from './service-invocation-simple.mjs';
import secretsMgmtOverview from './secrets-mgmt-overview.mjs';
import secretsAzureAksKeyvault from './secrets-azure-aks-keyvault.mjs';
import secretsKubernetesStore from './secrets-kubernetes-store.mjs';
import pubsubPublishRaw from './pubsub-publish-raw.mjs';
import pubsubSubscribeRaw from './pubsub-subscribe-raw.mjs';
import configurationApiOverview from './configuration-api-overview.mjs';
import conversationOverview from './conversation-overview.mjs';
import cryptographyOverview from './cryptography-overview.mjs';
import distributedLockOverview from './distributed-lock-overview.mjs';
import lockExample from './lock-example.mjs';
import lockUnlockExample from './lock-unlock-example.mjs';
import lockMultipleExample from './lock-multiple-example.mjs';
import stateManagementOutbox from './state-management-outbox.mjs';
import stateManagementOutboxSteps from './state-management-outbox-steps.mjs';
import stateManagementOverview from './state-management-overview.mjs';
import actorReentrancy from './actor-reentrancy.mjs';
import actorsCallingMethod from './actors-calling-method.mjs';
import actorsGameExample from './actors-game-example.mjs';
import actorsCommunication from './actors-communication.mjs';
import actorsPlacementRegistration from './actors-placement-registration.mjs';
import actorsIdHashing from './actors-id-hashing.mjs';
import actorsConcurrency from './actors-concurrency.mjs';
import workflowOverview from './workflow-overview.mjs';
import workflowStatefulClient from './workflow-stateful-client.mjs';
import workflowFastPath from './workflow-fast-path.mjs';
import workflowSigningChain from './workflow-signing-chain.mjs';
import workflowSigningSteps from './workflow-signing-steps.mjs';
import workflowSigningVerify from './workflow-signing-verify.mjs';
import workflowSigningFailure from './workflow-signing-failure.mjs';
import workflowEngineProtocol from './workflow-engine-protocol.mjs';
import workflowActorFlowchart from './workflow-actor-flowchart.mjs';
import workflowActivityActorFlowchart from './workflow-activity-actor-flowchart.mjs';
import workflowActorReminderFlow from './workflow-actor-reminder-flow.mjs';
import workflowStateStoreInteractions from './workflow-state-store-interactions.mjs';
import workflowsArchitectureK8s from './workflows-architecture-k8s.mjs';
import workflowExecution from './workflow-execution.mjs';
import workflowActorScaleOut from './workflow-actor-scale-out.mjs';
import mcpAccessControl from './mcp-access-control.mjs';
import mcpServiceInvocation from './mcp-service-invocation.mjs';
import ragOverview from './rag-overview.mjs';

export const scenes = {
  'agents-augmented-llm': agentsAugmentedLlm,
  'agents-prompt-chaining': agentsPromptChaining,
  'agents-routing': agentsRouting,
  'agents-parallelization': agentsParallelization,
  'agents-orchestrator-workers': agentsOrchestratorWorkers,
  'agents-evaluator-optimizer': agentsEvaluatorOptimizer,
  'agents-stateful-llm': agentsStatefulLlm,
  'agents-patterns-overview': agentsPatternsOverview,
  'agents-overview': agentsOverview,
  'agents-loop': agentsLoop,
  'agents-tool-call-flow': agentsToolCallFlow,
  'agents-orchestration': agentsOrchestration,
  'agents-message-driven': agentsMessageDriven,
  'agents-decoupled-infrastructure': agentsDecoupledInfrastructure,
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
  'pubsub-competing-consumers': pubsubCompetingConsumers,
  'pubsub-components': pubsubComponents,
  'pubsub-deadletter': pubsubDeadletter,
  'pubsub-pattern': pubsubPattern,
  'pubsub-publish-api': pubsubPublishApi,
  'pubsub-namespace-basic': pubsubNamespaceBasic,
  'pubsub-namespace-with': pubsubNamespaceWith,
  'pubsub-namespace-without': pubsubNamespaceWithout,
  'pubsub-howto-overview': pubsubHowtoOverview,
  'secrets-cloud-stores': secretsCloudStores,
  'service-invocation-example-detailed': serviceInvocationExampleDetailed,
  'service-invocation-mdns': serviceInvocationMdns,
  'service-invocation-non-dapr-endpoint': serviceInvocationNonDaprEndpoint,
  'service-invocation-overview': serviceInvocationOverview,
  'service-invocation-simple': serviceInvocationSimple,
  'secrets-mgmt-overview': secretsMgmtOverview,
  'secrets-kubernetes-store': secretsKubernetesStore,
  'secrets-azure-aks-keyvault': secretsAzureAksKeyvault,
  'pubsub-publish-raw': pubsubPublishRaw,
  'pubsub-subscribe-raw': pubsubSubscribeRaw,
  'configuration-api-overview': configurationApiOverview,
  'conversation-overview': conversationOverview,
  'cryptography-overview': cryptographyOverview,
  'distributed-lock-overview': distributedLockOverview,
  'lock-example': lockExample,
  'lock-unlock-example': lockUnlockExample,
  'lock-multiple-example': lockMultipleExample,
  'state-management-outbox': stateManagementOutbox,
  'state-management-outbox-steps': stateManagementOutboxSteps,
  'state-management-overview': stateManagementOverview,
  'actor-reentrancy': actorReentrancy,
  'actors-calling-method': actorsCallingMethod,
  'actors-game-example': actorsGameExample,
  'actors-communication': actorsCommunication,
  'actors-placement-registration': actorsPlacementRegistration,
  'actors-id-hashing': actorsIdHashing,
  'actors-concurrency': actorsConcurrency,
  'workflow-overview': workflowOverview,
  'workflow-stateful-client': workflowStatefulClient,
  'workflow-fast-path': workflowFastPath,
  'workflow-signing-chain': workflowSigningChain,
  'workflow-signing-steps': workflowSigningSteps,
  'workflow-signing-verify': workflowSigningVerify,
  'workflow-signing-failure': workflowSigningFailure,
  'workflow-engine-protocol': workflowEngineProtocol,
  'workflow-actor-flowchart': workflowActorFlowchart,
  'workflow-activity-actor-flowchart': workflowActivityActorFlowchart,
  'workflow-actor-reminder-flow': workflowActorReminderFlow,
  'workflow-state-store-interactions': workflowStateStoreInteractions,
  'workflows-architecture-k8s': workflowsArchitectureK8s,
  'workflow-execution': workflowExecution,
  'workflow-actor-scale-out': workflowActorScaleOut,
  'mcp-access-control': mcpAccessControl,
  'mcp-service-invocation': mcpServiceInvocation,
  'rag-overview': ragOverview,
};
