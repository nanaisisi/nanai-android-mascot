/**
 * @file wasm-memory.ts
 * @brief WASM モジュール初期化およびメモリ転送管理
 */

import type { NanaiCoreWasmExports } from "./wasm-types.js";

export class WasmMemoryManager {
	private exports: NanaiCoreWasmExports | null = null;
	private initialized = false;
	private initPromise: Promise<boolean> | null = null;

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
					console.log("✨ [WASM Memory] nanai-core WASM モジュール初期化完了");
					return true;
				}
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
		return this.initialized && this.exports !== null;
	}

	public getExports(): NanaiCoreWasmExports | null {
		return this.exports;
	}

	public encodeString(str: string): { ptr: number; len: number } {
		if (!this.exports) throw new Error("WASM exports not initialized");
		const encoder = new TextEncoder();
		const bytes = encoder.encode(str);
		const ptr = this.exports.wasm_alloc(bytes.length);
		const memView = new Uint8Array(
			this.exports.memory.buffer,
			ptr,
			bytes.length,
		);
		memView.set(bytes);
		return { ptr, len: bytes.length };
	}

	public decodeString(ptr: number, len: number): string {
		if (!this.exports) throw new Error("WASM exports not initialized");
		const decoder = new TextDecoder();
		const memView = new Uint8Array(this.exports.memory.buffer, ptr, len);
		return decoder.decode(memView);
	}

	public alloc(size: number): number {
		if (!this.exports) throw new Error("WASM exports not initialized");
		return this.exports.wasm_alloc(size);
	}

	public free(ptr: number, size: number): void {
		if (!this.exports) return;
		this.exports.wasm_free(ptr, size);
	}
}

export const wasmMemory = new WasmMemoryManager();
