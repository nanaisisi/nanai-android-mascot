/**
 * @file wasm-protocol.ts
 * @brief SSTP/FMO/descript/プロトコルバインディング
 */

import { parseInstallErrorReason as parseInstallErrorReasonFallback } from "../actions/install-protocol.js";
import { calculateUpdateProgress as calculateUpdateProgressFallback } from "../actions/update-protocol.js";
import { wasmMemory } from "./wasm-memory.js";
import type { DescriptManifest, SstpRequest } from "./wasm-types.js";

export function parseSstpRequestWasm(rawSstp: string): SstpRequest | null {
	if (!wasmMemory.isReady()) return null;

	const exports = wasmMemory.getExports();
	if (!exports?.wasm_parse_sstp_request_json) return null;

	try {
		const { ptr, len } = wasmMemory.encodeString(rawSstp);
		const packed = exports.wasm_parse_sstp_request_json(ptr, len);
		wasmMemory.free(ptr, len);

		if (packed === 0n) return null;

		const jsonPtr = Number(packed >> 32n);
		const jsonLen = Number(packed & 0xffffffffn);
		const jsonStr = wasmMemory.decodeString(jsonPtr, jsonLen);
		wasmMemory.free(jsonPtr, jsonLen);

		return JSON.parse(jsonStr) as SstpRequest;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseSstpRequest エラー:", err);
		return null;
	}
}

export function parseDescriptTextWasm(
	content: string,
): DescriptManifest | null {
	if (!wasmMemory.isReady()) return null;

	const exports = wasmMemory.getExports();
	if (!exports?.wasm_parse_descript_json) return null;

	try {
		const { ptr, len } = wasmMemory.encodeString(content);
		const packed = exports.wasm_parse_descript_json(ptr, len);
		wasmMemory.free(ptr, len);

		if (packed === 0n) return null;

		const jsonPtr = Number(packed >> 32n);
		const jsonLen = Number(packed & 0xffffffffn);
		const jsonStr = wasmMemory.decodeString(jsonPtr, jsonLen);
		wasmMemory.free(jsonPtr, jsonLen);

		return JSON.parse(jsonStr) as DescriptManifest;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseDescriptText エラー:", err);
		return null;
	}
}

export function calculateUpdateProgressWasm(
	current: number,
	total: number,
): { percent: number; isComplete: boolean } {
	if (wasmMemory.isReady()) {
		const exports = wasmMemory.getExports();
		if (exports?.wasm_calculate_update_progress) {
			try {
				const packed = exports.wasm_calculate_update_progress(
					BigInt(current),
					BigInt(total),
				);
				const percent = packed & 0xffff;
				const isComplete = Boolean((packed >> 16) & 0xffff);
				return { percent, isComplete };
			} catch (_err) {
				// Fallback on error
			}
		}
	}
	return calculateUpdateProgressFallback(current, total);
}

export function parseInstallErrorReasonWasm(errMessage: string): string {
	if (wasmMemory.isReady()) {
		const exports = wasmMemory.getExports();
		if (exports?.wasm_parse_install_error_reason) {
			try {
				const { ptr, len } = wasmMemory.encodeString(errMessage);
				const idx = exports.wasm_parse_install_error_reason(ptr, len);
				wasmMemory.free(ptr, len);

				const reasons = [
					"extraction",
					"unsupported",
					"artificial",
					"invalid path",
					"unlha32 error",
					"write error",
				];
				return reasons[idx] || "extraction";
			} catch (_err) {
				// Fallback on error
			}
		}
	}
	return parseInstallErrorReasonFallback(errMessage);
}
