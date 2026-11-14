/**
 * Surface Compositor facade (powered by Pure Rust / WASM surface compositor)
 */
import { wasmBridge } from "../core/wasm-bridge.js";

export async function processChromaKey(
	imageRaw: any,
	_pnaImage?: any,
): Promise<any> {
	// Compatibility stub for UI balloon theme image processing
	return imageRaw;
}

export function computeSurfaceCompositionPlan(
	surfaceId: number,
	elements: unknown[],
	activeBinds: number[] = [],
) {
	return wasmBridge.computeSurfaceCompositionPlan(
		surfaceId,
		elements,
		activeBinds,
	);
}

export const composeSurfaceElements = computeSurfaceCompositionPlan;
