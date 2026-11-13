/**
 * @file wasm-sakura.ts
 * @brief さくらスクリプトパース & プレイヤーバインディング (WASM C-ABI 統合)
 */

import { wasmMemory } from "./wasm-memory.js";
import type { SakuraToken } from "./wasm-types.js";

export function parseSakuraScriptWasm(script: string): SakuraToken[] | null {
	if (!wasmMemory.isReady()) return null;

	const exports = wasmMemory.getExports();
	if (!exports?.wasm_parse_sakura_script_json) return null;

	try {
		const { ptr, len } = wasmMemory.encodeString(script);
		const packed = exports.wasm_parse_sakura_script_json(ptr, len);
		wasmMemory.free(ptr, len);

		if (packed === 0n) return null;

		const jsonPtr = Number(packed >> 32n);
		const jsonLen = Number(packed & 0xffffffffn);
		const jsonStr = wasmMemory.decodeString(jsonPtr, jsonLen);
		wasmMemory.free(jsonPtr, jsonLen);

		return JSON.parse(jsonStr) as SakuraToken[];
	} catch (err) {
		console.warn("⚠️ [WASM Sakura] parseSakuraScript エラー:", err);
		return null;
	}
}

export function createSakuraPlayerWasm(script: string): number {
	if (!wasmMemory.isReady()) return 0;
	const exports = wasmMemory.getExports();
	if (!exports?.wasm_create_player) return 0;
	try {
		const { ptr, len } = wasmMemory.encodeString(script);
		const enginePtr = exports.wasm_create_player(ptr, len);
		wasmMemory.free(ptr, len);
		return enginePtr;
	} catch (err) {
		console.warn("⚠️ [WASM Sakura] createSakuraPlayer エラー:", err);
		return 0;
	}
}

export function stepSakuraPlayerWasm(enginePtr: number): unknown | null {
	if (!wasmMemory.isReady() || enginePtr === 0) return null;
	const exports = wasmMemory.getExports();
	if (!exports?.wasm_player_step) return null;
	try {
		const packed = exports.wasm_player_step(enginePtr);
		if (packed === 0n) return null;
		const jsonPtr = Number(packed >> 32n);
		const jsonLen = Number(packed & 0xffffffffn);
		const jsonStr = wasmMemory.decodeString(jsonPtr, jsonLen);
		wasmMemory.free(jsonPtr, jsonLen);
		return JSON.parse(jsonStr);
	} catch (err) {
		console.warn("⚠️ [WASM Sakura] stepSakuraPlayer エラー:", err);
		return null;
	}
}

export function freeSakuraPlayerWasm(enginePtr: number): void {
	if (!wasmMemory.isReady() || enginePtr === 0) return;
	const exports = wasmMemory.getExports();
	if (!exports?.wasm_free_player) return;
	try {
		exports.wasm_free_player(enginePtr);
	} catch (err) {
		console.warn("⚠️ [WASM Sakura] freeSakuraPlayer エラー:", err);
	}
}
