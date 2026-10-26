/**
 * Nanai Android Mascot - SurfaceManager 外部公開 facade
 *
 * - `surface-manager.js`: SurfaceManager クラス本体（状態・アニメーション制御）
 * - `surface-load.js`: surfaces.txt 読み込み・パース系 mixin
 * - `surface-render.js`: 当たり判定・着せ替え・合成系 mixin
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
