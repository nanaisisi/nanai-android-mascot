/**
 * @file wasm-sakura.ts
 * @brief さくらスクリプトパースバインディング
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
