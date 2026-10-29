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
import sidecarModel from './sidecar-model.mjs';

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
  'sidecar-model': sidecarModel,
};
