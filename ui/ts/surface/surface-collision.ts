/**
 * Surface Collision compatibility facade (delegates hit testing to wasmBridge / shell-manifest)
 */
import { wasmBridge } from "../core/wasm-bridge.js";

export function findHitCollisionName(collisions: unknown[], x: number, y: number): string | null {
	return wasmBridge.findHitCollisionName(collisions, x, y);
}

export const surfaceCollisionMethods = {
	findHitCollisionName,
};
