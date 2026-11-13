/**
 * @file wasm-sakura.ts
 * @brief さくらスクリプトパース & プレイヤーバインディング (wasm-pack 統合)
 */

import { wasmMemory } from "./wasm-memory.js";
import type { SakuraToken } from "./wasm-types.js";

export function parseSakuraScriptWasm(script: string): SakuraToken[] | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_sakura_script) return null;

	try {
		return core.wasm_parse_sakura_script(script) as SakuraToken[] | null;
	} catch (err) {
		console.warn("⚠️ [WASM Sakura] parseSakuraScript エラー:", err);
		return null;
	}
}

export function createSakuraPlayerWasm(script: string): unknown | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.SakuraPlayerEngine) return null;
	try {
		return new core.SakuraPlayerEngine(script);
	} catch (err) {
		console.warn("⚠️ [WASM Sakura] createSakuraPlayer エラー:", err);
		return null;
	}
}

export function stepSakuraPlayerWasm(player: unknown): unknown | null {
	if (
		!player ||
		typeof (player as { step?: () => unknown }).step !== "function"
	)
		return null;
	try {
		return (player as { step: () => unknown }).step();
	} catch (err) {
		console.warn("⚠️ [WASM Sakura] stepSakuraPlayer エラー:", err);
		return null;
	}
}

export function freeSakuraPlayerWasm(player: unknown): void {
	if (!player || typeof (player as { free?: () => void }).free !== "function")
		return;
	try {
		(player as { free: () => void }).free();
	} catch (err) {
		console.warn("⚠️ [WASM Sakura] freeSakuraPlayer エラー:", err);
	}
}
