/**
 * @file wasm-surface.ts
 * @brief サーフィス定義パース、合成計画 & 当たり判定バインディング (wasm-pack 統合)
 */

import { wasmMemory } from "./wasm-memory.js";
import type { SurfaceCompositionPlan } from "./wasm-types.js";

export function parseSurfacesTxtWasm(text: string): unknown | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_surfaces_txt) return null;

	try {
		return core.wasm_parse_surfaces_txt(text);
	} catch (err) {
		console.warn("⚠️ [WASM Surface] parseSurfacesTxt エラー:", err);
		return null;
	}
}

export function findHitCollisionNameWasm(
	collisions: unknown[],
	x: number,
	y: number,
): string | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_find_hit_collision_name) return null;

	try {
		const res = core.wasm_find_hit_collision_name(collisions, x, y);
		return (res as string) || null;
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
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_compute_surface_composition_plan) return null;

	try {
		return core.wasm_compute_surface_composition_plan(
			surfaceId,
			elements,
			activeBinds,
		) as SurfaceCompositionPlan | null;
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
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_advance_animation_frame) return null;

	try {
		return core.wasm_advance_animation_frame(def, state, deltaMs) as [
			unknown,
			unknown,
		] | null;
	} catch (err) {
		console.warn("⚠️ [WASM Surface] advanceAnimationFrame エラー:", err);
		return null;
	}
}
