/**
 * @file wasm-bridge.ts
 * @brief Rust WASM コアモジュール (`nanai-core`) と TypeScript フロントエンドの透過的接続ブリッジ
 */

import { parseInstallErrorReason as parseInstallErrorReasonFallback } from "./actions/install-protocol.js";
import {
	calculateUpdateProgress as calculateUpdateProgressFallback,
	normalizeUpdateReason as normalizeUpdateReasonFallback,
} from "./actions/update-protocol.js";

export interface SakuraToken {
	type:
		| "Text"
		| "Scope"
		| "Surface"
		| "Balloon"
		| "Animation"
		| "Newline"
		| "Clear"
		| "Wait"
		| "Choice"
		| "Anchor"
		| "Font"
		| "Halt";
	value?: unknown;
}

export interface SstpRequest {
	command: string;
	version: string;
	headers: Record<string, string>;
}

interface NanaiCoreWasmExports {
	memory: WebAssembly.Memory;
	wasm_alloc: (size: number) => number;
	wasm_free: (ptr: number, size: number) => void;
	wasm_calculate_update_progress: (current: bigint, total: bigint) => number;
	wasm_normalize_update_reason: (ptr: number, len: number) => number;
	wasm_parse_install_error_reason: (ptr: number, len: number) => number;
	wasm_parse_sakura_script_json: (ptr: number, len: number) => bigint;
	wasm_parse_sstp_request_json: (ptr: number, len: number) => bigint;
}

class WasmBridgeManager {
	private exports: NanaiCoreWasmExports | null = null;
	private initialized = false;
	private initPromise: Promise<boolean> | null = null;

	/**
	 * WASM モジュールの非同期初期化
	 */
	public async init(bufferOrUrl?: ArrayBuffer | string): Promise<boolean> {
		if (this.initialized) return true;
		if (this.initPromise) return this.initPromise;

		this.initPromise = (async () => {
			try {
				let wasmBuffer: ArrayBuffer | null = null;
				if (bufferOrUrl instanceof ArrayBuffer) {
					wasmBuffer = bufferOrUrl;
				} else if (typeof bufferOrUrl === "string") {
					const res = await fetch(bufferOrUrl);
					wasmBuffer = await res.arrayBuffer();
				}

				if (wasmBuffer) {
					const { instance } = await WebAssembly.instantiate(wasmBuffer);
					this.exports = instance.exports as unknown as NanaiCoreWasmExports;
					this.initialized = true;
					console.log("✨ [WASM Bridge] nanai-core WASM 接続完了");
					return true;
				}
			} catch (err) {
				console.warn(
					"⚠️ [WASM Bridge] WASM モジュール初期化失敗 (フォールバック駆動):",
					err,
				);
			}
			return false;
		})();

		return this.initPromise;
	}

	public isReady(): boolean {
		return this.initialized && this.exports !== null;
	}

	/**
	 * さくらスクリプト文字列を WASM で高速パース
	 */
	public parseSakuraScript(script: string): SakuraToken[] | null {
		if (!this.isReady()) return null;

		try {
			const { ptr, len } = this.encodeString(script);
			const packed = this.exports!.wasm_parse_sakura_script_json(ptr, len);
			this.exports!.wasm_free(ptr, len);

			if (packed === 0n) return null;

			const jsonPtr = Number(packed >> 32n);
			const jsonLen = Number(packed & 0xffffffffn);
			const jsonStr = this.decodeString(jsonPtr, jsonLen);
			this.exports!.wasm_free(jsonPtr, jsonLen);

			return JSON.parse(jsonStr) as SakuraToken[];
		} catch (err) {
			console.warn("⚠️ [WASM Bridge] parseSakuraScript エラー:", err);
			return null;
		}
	}

	/**
	 * SSTP リクエスト文字列を WASM でパース
	 */
	public parseSstpRequest(rawSstp: string): SstpRequest | null {
		if (!this.isReady()) return null;

		try {
			const { ptr, len } = this.encodeString(rawSstp);
			const packed = this.exports!.wasm_parse_sstp_request_json(ptr, len);
			this.exports!.wasm_free(ptr, len);

			if (packed === 0n) return null;

			const jsonPtr = Number(packed >> 32n);
			const jsonLen = Number(packed & 0xffffffffn);
			const jsonStr = this.decodeString(jsonPtr, jsonLen);
			this.exports!.wasm_free(jsonPtr, jsonLen);

			return JSON.parse(jsonStr) as SstpRequest;
		} catch (err) {
			console.warn("⚠️ [WASM Bridge] parseSstpRequest エラー:", err);
			return null;
		}
	}

	/**
	 * アップデート進捗を WASM で高速計算
	 */
	public calculateUpdateProgress(
		current: number,
		total: number,
	): { percent: number; isComplete: boolean } {
		if (this.isReady()) {
			try {
				const packed = this.exports!.wasm_calculate_update_progress(
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
		return calculateUpdateProgressFallback(current, total);
	}

	/**
	 * インストールエラー理由を WASM で高速解決
	 */
	public parseInstallErrorReason(errMessage: string): string {
		if (this.isReady()) {
			try {
				const { ptr, len } = this.encodeString(errMessage);
				const idx = this.exports!.wasm_parse_install_error_reason(ptr, len);
				this.exports!.wasm_free(ptr, len);

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
		return parseInstallErrorReasonFallback(errMessage);
	}

	/**
	 * UTF-8 文字列を WASM メモリへ転送
	 */
	private encodeString(str: string): { ptr: number; len: number } {
		const encoder = new TextEncoder();
		const bytes = encoder.encode(str);
		const ptr = this.exports!.wasm_alloc(bytes.length);
		const memView = new Uint8Array(
			this.exports!.memory.buffer,
			ptr,
			bytes.length,
		);
		memView.set(bytes);
		return { ptr, len: bytes.length };
	}

	/**
	 * WASM メモリ上の UTF-8 バッファを文字列へ復元
	 */
	private decodeString(ptr: number, len: number): string {
		const decoder = new TextDecoder();
		const memView = new Uint8Array(this.exports!.memory.buffer, ptr, len);
		return decoder.decode(memView);
	}
}

export const wasmBridge = new WasmBridgeManager();
