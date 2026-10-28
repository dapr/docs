// Registry of diagram scenes: { '<name>': sceneModuleDefaultExport }.
// <name> becomes daprdocs/assets/diagrams/<name>.svg and the svg() id base.
// Scenes are added here as they are written.
import buildingBlocks from './building-blocks.mjs';
import overview from './overview.mjs';
import sidecarModel from './sidecar-model.mjs';

export const scenes = { 'building-blocks': buildingBlocks, overview, 'sidecar-model': sidecarModel };
