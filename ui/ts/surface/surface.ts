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
export {
	expandSurfaceRange,
	parseSurfacesTxt,
	SurfaceManager,
} from "./surface-manager.js";
