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
	if (!core?.wasm_find_hit_collision_name || !Array.isArray(collisions))
		return null;

	const safeX = Math.floor(Math.max(0, Number.isFinite(x) ? x : 0));
	const safeY = Math.floor(Math.max(0, Number.isFinite(y) ? y : 0));

	try {
		const res = core.wasm_find_hit_collision_name(collisions, safeX, safeY);
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
		return core.wasm_advance_animation_frame(def, state, deltaMs) as
			| [unknown, unknown]
			| null;
	} catch (err) {
		console.warn("⚠️ [WASM Surface] advanceAnimationFrame エラー:", err);
		return null;
	}
}

export function processChromaKeyWasm(
	data: Uint8Array,
	width: number,
	height: number,
	pnaData: Uint8Array | null,
	useSelfAlpha: boolean,
	paintBlack: boolean,
): boolean {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_process_chroma_key) return false;

	try {
		core.wasm_process_chroma_key(
			data,
			width,
			height,
			pnaData || undefined,
			useSelfAlpha,
			paintBlack,
		);
		return true;
	} catch (err) {
		console.warn("⚠️ [WASM Surface] processChromaKey エラー:", err);
		return false;
	}
}

export function resolveScopeForSurfaceWasm(surfaceId: number): number {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_resolve_scope_for_surface) {
		return surfaceId < 100 ? 0 : Math.floor(surfaceId / 100);
	}
	try {
		return Number(core.wasm_resolve_scope_for_surface(surfaceId)) || 0;
	} catch (err) {
		console.warn("⚠️ [WASM Surface] resolveScopeForSurface エラー:", err);
		return surfaceId < 100 ? 0 : Math.floor(surfaceId / 100);
	}
}

