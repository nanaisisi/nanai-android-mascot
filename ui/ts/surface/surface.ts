/**
 * Nanai Android Mascot - SurfaceManager 外部公開 facade
 */

export {
	collisionContains,
	getShellManifest,
	manifestToSurfaceData,
} from "./shell-manifest.js";
export {
	composeSurfaceElements,
	processChromaKey,
} from "./surface-compositor.js";
export { SurfaceManager } from "./surface-manager.js";
export { expandSurfaceRange, parseSurfacesTxt } from "./surface-parser.js";
