/**
 * @file wasm-protocol.ts
 * @brief SSTP/FMO/SHIORI/descript/プロトコルバインディング (wasm-pack 統合)
 */

import { parseInstallErrorReasonFallback } from "../actions/install-protocol.js";
import {
	calculateUpdateProgressFallback,
	isNoUpdatePathFallback,
} from "../actions/update-protocol.js";
import type {
	BalloonOptionsManifest,
	DeleteTxtManifest,
	DeveloperOptionsManifest,
	FmoEntry,
	InstallFailureReason,
	SaoriResponse,
} from "./pkg/nanai_core.js";
import { wasmMemory } from "./wasm-memory.js";
import type { DescriptManifest, SstpRequest } from "./wasm-types.js";

/**
 * Rust serde_wasm_bindgen の BTreeMap/HashMap が JS Map として返される場合を Record へ正規化
 */
function toStringRecord(
	raw: Record<string, string> | Map<string, string> | undefined,
): Record<string, string> {
	if (raw instanceof Map) {
		return Object.fromEntries(raw.entries());
	}
	return raw ?? {};
}

export function parseSstpRequestWasm(rawSstp: string): SstpRequest | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_sstp_request) return null;

	try {
		const raw = core.wasm_parse_sstp_request(rawSstp) as {
			command?: string;
			version?: string;
			headers?: Record<string, string> | Map<string, string>;
		} | null;
		if (!raw) return null;
		return {
			command: raw.command ?? "",
			version: raw.version ?? "",
			headers: toStringRecord(raw.headers),
		};
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseSstpRequest エラー:", err);
		return null;
	}
}

export function buildSstpResponseWasm(
	status: number,
	script: string,
	headers: Record<string, string> = {},
): string | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_build_sstp_response) return null;

	try {
		return core.wasm_build_sstp_response(status, script, headers) as string;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] buildSstpResponse エラー:", err);
		return null;
	}
}

export function buildShioriRequestWasm(
	method: string,
	headers: Record<string, string> = {},
): string | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_build_shiori_request) return null;

	try {
		return core.wasm_build_shiori_request(method, headers) as string;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] buildShioriRequest エラー:", err);
		return null;
	}
}

export function buildShioriNotifyWasm(
	eventName: string,
	references: string[] = [],
): string | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_build_shiori_notify) return null;

	try {
		return core.wasm_build_shiori_notify(eventName, references) as string;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] buildShioriNotify エラー:", err);
		return null;
	}
}

const INSTALL_ERROR_REASONS_BY_INDEX: readonly InstallFailureReason[] = [
	"unsupported",
	"extraction",
	"unlha32",
	"unlha32 error",
	"invalid type",
	"password",
	"artificial",
	"write error",
	"invalid path",
	"format error",
];

export function parseDescriptTextWasm(
	content: string,
): DescriptManifest | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_descript) return null;

	try {
		const raw = core.wasm_parse_descript(content) as {
			properties?: Record<string, string> | Map<string, string>;
		} | null;
		if (!raw) return null;
		return {
			properties: toStringRecord(raw.properties),
		};
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
	if (
		core?.wasm_calculate_update_progress &&
		Number.isSafeInteger(current) &&
		Number.isSafeInteger(total)
	) {
		try {
			const packed = core.wasm_calculate_update_progress(
				BigInt(current),
				BigInt(total),
			);
			const percent = packed & 0xffff;
			const isComplete = Boolean((packed >>> 16) & 0xffff);
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
			return INSTALL_ERROR_REASONS_BY_INDEX[idx] ?? "extraction";
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

export function validateBalloonDescriptWasm(
	props: Record<string, string>,
	ghostName: string,
	ghostPath: string,
): { isRecommended: boolean; warningMessage: string | null } | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_validate_balloon_descript) return null;

	try {
		const res = core.wasm_validate_balloon_descript(
			props,
			ghostName,
			ghostPath,
		) as {
			isRecommended?: boolean;
			is_recommended?: boolean;
			warningMessage?: string | null;
			warning_message?: string | null;
		} | null;
		if (!res) return null;
		return {
			isRecommended: Boolean(res.isRecommended ?? res.is_recommended ?? true),
			warningMessage: res.warningMessage ?? res.warning_message ?? null,
		};
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] validateBalloonDescript エラー:", err);
		return null;
	}
}

export function parseBalloonOptionsWasm(
	content: string,
): BalloonOptionsManifest | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_balloon_options) return null;

	try {
		return core.wasm_parse_balloon_options(
			content,
		) as BalloonOptionsManifest | null;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseBalloonOptions エラー:", err);
		return null;
	}
}

export function buildSaoriRequestWasm(
	modulePath: string,
	args: string[] = [],
): string | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_build_saori_request) return null;

	try {
		return core.wasm_build_saori_request(modulePath, args) as string;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] buildSaoriRequest エラー:", err);
		return null;
	}
}

export function parseSaoriResponseWasm(raw: string): SaoriResponse | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_saori_response) return null;

	try {
		return core.wasm_parse_saori_response(raw) as SaoriResponse | null;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseSaoriResponse エラー:", err);
		return null;
	}
}

export function parseFmoStringWasm(
	rawFmo: string,
): Record<string, FmoEntry> | Map<string, FmoEntry> | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_fmo_string) return null;

	try {
		return core.wasm_parse_fmo_string(rawFmo) as
			| Record<string, FmoEntry>
			| Map<string, FmoEntry>
			| null;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseFmoString エラー:", err);
		return null;
	}
}

export function parseDeleteTxtWasm(content: string): DeleteTxtManifest | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_delete_txt) return null;

	try {
		return core.wasm_parse_delete_txt(content) as DeleteTxtManifest | null;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseDeleteTxt エラー:", err);
		return null;
	}
}

export function parseDeveloperOptionsTxtWasm(
	content: string,
): DeveloperOptionsManifest | null {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_parse_developer_options_txt) return null;

	try {
		return core.wasm_parse_developer_options_txt(
			content,
		) as DeveloperOptionsManifest | null;
	} catch (err) {
		console.warn("⚠️ [WASM Protocol] parseDeveloperOptionsTxt エラー:", err);
		return null;
	}
}

export function normalizeUpdateReasonWasm(reason?: string): number {
	const core = wasmMemory.getWasmCore();
	if (!core?.wasm_normalize_update_reason) return 0;

	try {
		return core.wasm_normalize_update_reason(reason);
	} catch (_err) {
		return 0;
	}
}
