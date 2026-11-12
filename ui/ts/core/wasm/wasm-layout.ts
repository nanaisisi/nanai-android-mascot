/**
 * @file wasm-layout.ts
 * @brief バルーンテキスト折り返し・レイアウト計算バインディング
 */

import { wasmMemory } from "./wasm-memory.js";
import type { BalloonLayoutResult } from "./wasm-types.js";

export function computeBalloonTextLayoutWasm(
	text: string,
	maxWidth: number,
	fontSize: number,
	lineHeight: number,
	paddingX: number,
): BalloonLayoutResult | null {
	if (!wasmMemory.isReady()) return null;

	const exports = wasmMemory.getExports();
	if (!exports?.wasm_compute_balloon_text_layout_json) return null;

	try {
		const { ptr, len } = wasmMemory.encodeString(text);
		const packed = exports.wasm_compute_balloon_text_layout_json(
			ptr,
			len,
			maxWidth,
			fontSize,
			lineHeight,
			paddingX,
		);
		wasmMemory.free(ptr, len);

		if (packed === 0n) return null;

		const jsonPtr = Number(packed >> 32n);
		const jsonLen = Number(packed & 0xffffffffn);
		const jsonStr = wasmMemory.decodeString(jsonPtr, jsonLen);
		wasmMemory.free(jsonPtr, jsonLen);

		return JSON.parse(jsonStr) as BalloonLayoutResult;
	} catch (err) {
		console.warn("⚠️ [WASM Layout] computeBalloonTextLayout エラー:", err);
		return null;
	}
}
