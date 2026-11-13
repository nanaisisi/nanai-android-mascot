/**
 * @file wasm-protocol.ts
 * @brief SSTP/FMO/descript/プロトコルバインディング (wasm-pack 統合)
 */

import { parseInstallErrorReason as parseInstallErrorReasonFallback } from "../actions/install-protocol.js";
import {
	calculateUpdateProgress as calculateUpdateProgressFallback,
	isNoUpdatePath as isNoUpdatePathFallback,
} from "../actions/update-protocol.js";
import { wasmMemory } from "./wasm-memory.js";
import type { DescriptManifest, SstpRequest } from "./wasm-types.js";

export function parseSstpRequestWasm(rawSstp: string): SstpRequest | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_sstp_request) return null;

	try {
		return core.wasm_parse_sstp_request(rawSstp) as SstpRequest | null;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseSstpRequest エラー:", err);
		return null;
	}
}

export function parseDescriptTextWasm(
	content: string,
): DescriptManifest | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_descript) return null;

	try {
		return core.wasm_parse_descript(content) as DescriptManifest | null;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseDescriptText エラー:", err);
		return null;
	}
}

export function calculateUpdateProgressWasm(
	current: number,
	total: number,
): { percent: number; isComplete: boolean } {
	const core = wasmMemory.getWasmCore();
	if (core?.wasm_calculate_update_progress) {
		try {
			const packed = core.wasm_calculate_update_progress(
				BigInt(current),
				BigInt(total),
			);
			const percent = Number(packed & 0xffffn);
			const isComplete = Boolean((packed >> 16n) & 0xffffn);
			return { percent, isComplete };
		} catch (_err) {
			// Fallback on error
		}
	}
	return calculateUpdateProgressFallback(current, total);
}

export function parseInstallErrorReasonWasm(errMessage: string): string {
	const core = wasmMemory.getWasmCore();
	if (core?.wasm_parse_install_error_reason) {
		try {
			const idx = core.wasm_parse_install_error_reason(errMessage);
			const reasons = [
				"extraction",
				"unsupported",
				"artificial",
				"invalid path",
				"unlha32 error",
				"write error",
			];
			return reasons[Number(idx)] || "extraction";
		} catch (_err) {
			// Fallback on error
		}
	}
	return parseInstallErrorReasonFallback(errMessage);
}

export function isNoUpdatePathWasm(path: string, patterns: string[]): boolean {
	const core = wasmMemory.getWasmCore();
	if (core?.wasm_is_no_update_path) {
		try {
			const patStr = patterns.join("\n");
			return Boolean(core.wasm_is_no_update_path(path, patStr));
		} catch (_err) {
			// Fallback on error
		}
	}
	return isNoUpdatePathFallback(path, patterns);
}
