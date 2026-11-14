/**
 * @file wasm-memory.ts
 * @brief wasm-pack 生成パッケージに基づく WASM 初期化管理
 */

import init, * as wasmCore from "./pkg/nanai_core.js";

export class WasmMemoryManager {
	private initialized = false;
	private initPromise: Promise<boolean> | null = null;

	public async init(bufferOrUrl?: ArrayBuffer | string): Promise<boolean> {
		if (this.initialized) return true;
		if (this.initPromise) return this.initPromise;

		this.initPromise = (async () => {
			try {
				if (
					bufferOrUrl instanceof ArrayBuffer ||
					(bufferOrUrl &&
						(bufferOrUrl as any).byteLength !== undefined &&
						typeof bufferOrUrl !== "string")
				) {
					await init(bufferOrUrl as InitInput);
				} else if (typeof bufferOrUrl === "string") {
					await init(bufferOrUrl);
				} else {
					await init();
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

	public alloc(size: number): number | null {
		const core = this.getWasmCore();
		if (!core?.wasm_alloc) return null;
		try {
			return core.wasm_alloc(size);
		} catch (err) {
			console.warn("⚠️ [WASM Memory] alloc エラー:", err);
			return null;
		}
	}

	public free(ptr: number, size: number): void {
		const core = this.getWasmCore();
		if (!core?.wasm_free || !ptr) return;
		try {
			core.wasm_free(ptr, size);
		} catch (err) {
			console.warn("⚠️ [WASM Memory] free エラー:", err);
		}
	}
}

export const wasmMemory = new WasmMemoryManager();
