/**
 * @file wasm-memory.ts
 * @brief wasm-pack 生成パッケージに基づく WASM 初期化管理
 */

import type { InitInput, InitOutput } from "./pkg/nanai_core.js";
import init, * as wasmCore from "./pkg/nanai_core.js";

function isBufferSourceLike(
	value: unknown,
): value is ArrayBuffer | ArrayBufferView {
	return (
		value instanceof ArrayBuffer ||
		ArrayBuffer.isView(value) ||
		(typeof value === "object" &&
			value !== null &&
			"byteLength" in value &&
			typeof (value as { byteLength?: unknown }).byteLength === "number")
	);
}

export class WasmMemoryManager {
	private initialized = false;
	private initPromise: Promise<boolean> | null = null;
	private wasmExports: InitOutput | null = null;

	public async init(bufferOrUrl?: ArrayBuffer | string): Promise<boolean> {
		if (this.initialized) return true;
		if (this.initPromise) return this.initPromise;

		this.initPromise = (async () => {
			try {
				if (isBufferSourceLike(bufferOrUrl)) {
					this.wasmExports = await init({
						module_or_path: bufferOrUrl as InitInput,
					});
				} else if (
					typeof bufferOrUrl === "string" &&
					bufferOrUrl.trim().length > 0
				) {
					try {
						this.wasmExports = await init({ module_or_path: bufferOrUrl });
					} catch (_e) {
						// 引数文字列でのロード失敗時は引数なし init をフォールバック試行
						this.wasmExports = await init();
					}
				} else {
					this.wasmExports = await init();
				}
				this.initialized = true;
				console.log("✨ [WASM Memory] wasm-pack nanai-core 初期化完了");
				return true;
			} catch (err) {
				console.warn(
					"⚠️ [WASM Memory] WASM 初期化失敗 (フォールバック駆動):",
					err,
				);
			}
			return false;
		})();

		return this.initPromise;
	}

	public isReady(): boolean {
		return this.initialized;
	}

	public getWasmCore(): typeof wasmCore | null {
		return this.initialized ? wasmCore : null;
	}

	public getWasmExports(): InitOutput | null {
		return this.initialized ? this.wasmExports : null;
	}

	public alloc(size: number): number | null {
		const exports = this.getWasmExports();
		if (!exports?.wasm_alloc) return null;
		try {
			return exports.wasm_alloc(size);
		} catch (err) {
			console.warn("⚠️ [WASM Memory] alloc エラー:", err);
			return null;
		}
	}

	public free(ptr: number, size: number): void {
		const exports = this.getWasmExports();
		if (!exports?.wasm_free || !ptr) return;
		try {
			exports.wasm_free(ptr, size);
		} catch (err) {
			console.warn("⚠️ [WASM Memory] free エラー:", err);
		}
	}
}

export const wasmMemory = new WasmMemoryManager();
