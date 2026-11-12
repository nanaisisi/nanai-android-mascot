/**
 * @file wasm-surface.ts
 * @brief サーフィス合成計画 & 当たり判定バインディング
 */

import { wasmMemory } from "./wasm-memory.js";
import type { SurfaceCompositionPlan } from "./wasm-types.js";

export function findHitCollisionNameWasm(
	collisions: unknown[],
	x: number,
	y: number,
): string | null {
	if (!wasmMemory.isReady()) return null;

	const exports = wasmMemory.getExports();
	if (!exports?.wasm_find_hit_collision_name_json) return null;

	try {
		const jsonStr = JSON.stringify(collisions);
		const { ptr, len } = wasmMemory.encodeString(jsonStr);
		const packed = exports.wasm_find_hit_collision_name_json(ptr, len, x, y);
		wasmMemory.free(ptr, len);

		if (packed === 0n) return null;

		const namePtr = Number(packed >> 32n);
		const nameLen = Number(packed & 0xffffffffn);
		const hitName = wasmMemory.decodeString(namePtr, nameLen);
		wasmMemory.free(namePtr, nameLen);

		return hitName || null;
	} catch (err) {
		console.warn("⚠️ [WASM Surface] findHitCollisionName エラー:", err);
		return null;
	}
}

export function computeSurfaceCompositionPlanWasm(
	surfaceId: number,
	elements: unknown[],
	activeBinds: number[] = [],
): SurfaceCompositionPlan | null {
	if (!wasmMemory.isReady()) return null;

	const exports = wasmMemory.getExports();
	if (!exports?.wasm_compute_surface_composition_plan_json) return null;

	try {
		const jsonStr = JSON.stringify(elements);
		const { ptr: elemPtr, len: elemLen } = wasmMemory.encodeString(jsonStr);

		let bindsPtr = 0;
		const bindsLen = activeBinds.length;
		if (bindsLen > 0) {
			bindsPtr = wasmMemory.alloc(bindsLen * 4);
			const bindsView = new Uint32Array(
				exports.memory.buffer,
				bindsPtr,
				bindsLen,
			);
			bindsView.set(activeBinds);
		}

		const packed = exports.wasm_compute_surface_composition_plan_json(
			surfaceId,
			elemPtr,
			elemLen,
			bindsPtr,
			bindsLen,
		);

		wasmMemory.free(elemPtr, elemLen);
		if (bindsPtr > 0) {
			wasmMemory.free(bindsPtr, bindsLen * 4);
		}

		if (packed === 0n) return null;

		const planPtr = Number(packed >> 32n);
		const planLen = Number(packed & 0xffffffffn);
		const planJson = wasmMemory.decodeString(planPtr, planLen);
		wasmMemory.free(planPtr, planLen);

		return JSON.parse(planJson) as SurfaceCompositionPlan;
	} catch (err) {
		console.warn("⚠️ [WASM Surface] computeSurfaceCompositionPlan エラー:", err);
		return null;
	}
}

export function advanceAnimationFrameWasm(
	def: unknown,
	state: unknown,
	deltaMs: number,
): [unknown, unknown] | null {
	if (!wasmMemory.isReady()) return null;

	const exports = wasmMemory.getExports();
	if (!exports?.wasm_advance_animation_frame_json) return null;

	try {
		const { ptr: defPtr, len: defLen } = wasmMemory.encodeString(
			JSON.stringify(def),
		);
		const { ptr: statePtr, len: stateLen } = wasmMemory.encodeString(
			JSON.stringify(state),
		);

		const packed = exports.wasm_advance_animation_frame_json(
			defPtr,
			defLen,
			statePtr,
			stateLen,
			deltaMs,
		);

		wasmMemory.free(defPtr, defLen);
		wasmMemory.free(statePtr, stateLen);

		if (packed === 0n) return null;

		const jsonPtr = Number(packed >> 32n);
		const jsonLen = Number(packed & 0xffffffffn);
		const jsonStr = wasmMemory.decodeString(jsonPtr, jsonLen);
		wasmMemory.free(jsonPtr, jsonLen);

		return JSON.parse(jsonStr);
	} catch (err) {
		console.warn("⚠️ [WASM Surface] advanceAnimationFrame エラー:", err);
		return null;
	}
}
