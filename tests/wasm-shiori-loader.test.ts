import assert from "node:assert/strict";
import { describe, expect, it, vi } from "vitest";
import { executeWasmRequest } from "../ui/ts/ghost/shiori-worker.js";
import { WasmShioriLoader } from "../ui/ts/ghost/wasm-shiori-loader.js";

describe("executeWasmRequest C ABI execution", () => {
	it("should handle mock fallback when exports are missing", () => {
		const dummyInstance = {
			exports: {},
		} as unknown as WebAssembly.Instance;

		const response = executeWasmRequest(
			dummyInstance,
			"GET SHIORI/3.0\r\n\r\n",
		);
		assert.ok(response.includes("WASM SHIORI response (mock)"));
	});

	it("should properly exchange strings and memory with C ABI functions", () => {
		const memory = new WebAssembly.Memory({ initial: 1 });
		const memoryBuffer = new Uint8Array(memory.buffer);
		let allocatedOffset = 100;

		const mockExports = {
			memory,
			malloc: vi.fn((size: number) => {
				const current = allocatedOffset;
				allocatedOffset += size;
				return current;
			}),
			free: vi.fn(),
			request: vi.fn((reqPtr: number, lenPtr: number) => {
				const dataView = new DataView(memory.buffer);
				const inLen = dataView.getUint32(lenPtr, true);
				const reqBytes = memoryBuffer.subarray(reqPtr, reqPtr + inLen);
				const reqStr = new TextDecoder().decode(reqBytes);

				assert.ok(reqStr.includes("OnTestEvent"));

				const resStr =
					"SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: Success\r\n\r\n";
				const resBytes = new TextEncoder().encode(resStr);
				const resPtr = 500;
				memoryBuffer.set(resBytes, resPtr);
				dataView.setUint32(lenPtr, resBytes.length, true);
				return resPtr;
			}),
		};

		const instance = {
			exports: mockExports,
		} as unknown as WebAssembly.Instance;
		const res = executeWasmRequest(
			instance,
			"GET SHIORI/3.0\r\nID: OnTestEvent\r\n\r\n",
		);

		assert.ok(res.includes("200 OK"));
		assert.ok(res.includes("Success"));
		assert.ok(mockExports.malloc.mock.calls.length >= 2);
		assert.ok(mockExports.free.mock.calls.length >= 2);
	});
});

describe("WasmShioriLoader lifecycle and operations", () => {
	it("should support virtual file management", () => {
		const loader = new WasmShioriLoader();
		const data = new Uint8Array([1, 2, 3]);

		loader.mountVirtualFile("dic/main.txt", data);
		assert.equal(loader.getVirtualFiles().size, 1);
		assert.deepEqual(loader.getVirtualFiles().get("dic/main.txt"), data);

		assert.equal(loader.removeVirtualFile("dic/main.txt"), true);
		assert.equal(loader.removeVirtualFile("non_existent"), false);
		assert.equal(loader.getVirtualFiles().size, 0);

		loader.mountVirtualFile("a.txt", new Uint8Array([1]));
		loader.clearVirtualFiles();
		assert.equal(loader.getVirtualFiles().size, 0);
	});

	it("should handle direct load, request, suspend, resume and unload without worker", async () => {
		const loader = new WasmShioriLoader();
		assert.equal(loader.loaded, false);
		assert.equal(loader.suspended, false);

		// Request before load throws
		await expect(loader.request("GET")).rejects.toThrow("not loaded");

		const loaded = await loader.load({
			dirPath: "ghost/master",
			virtualFiles: new Map([["test.txt", new Uint8Array([65])]]),
		});
		assert.equal(loaded, true);
		assert.equal(loader.loaded, true);

		// Direct fallback request
		const resNotify = await loader.request("NOTIFY SHIORI/3.0\r\n\r\n");
		assert.ok(resNotify.includes("204 No Content"));

		const resGet = await loader.request("GET SHIORI/3.0\r\n\r\n");
		assert.ok(resGet.includes("200 OK"));

		// Suspend & Resume
		loader.suspend();
		assert.equal(loader.suspended, true);
		await expect(loader.request("GET")).rejects.toThrow("suspended");

		loader.resume();
		assert.equal(loader.suspended, false);
		const resAfterResume = await loader.request("GET SHIORI/3.0\r\n\r\n");
		assert.ok(resAfterResume.includes("200 OK"));

		// Unload
		const unloaded = await loader.unload();
		assert.equal(unloaded, true);
		assert.equal(loader.loaded, false);
	});

	it("should communicate with WebWorker when available", async () => {
		// Mock Worker class
		class MockWorker {
			public onmessage: ((e: MessageEvent) => void) | null = null;
			public onerror: ((e: ErrorEvent) => void) | null = null;
			public posted: Array<{ type: string; id: number; payload?: unknown }> =
				[];

			postMessage(msg: { type: string; id: number; payload?: unknown }) {
				this.posted.push(msg);
				setTimeout(() => {
					if (!this.onmessage) return;
					if (msg.type === "LOAD") {
						this.onmessage({
							data: { type: "LOAD_RESULT", id: msg.id, success: true },
						} as MessageEvent);
					} else if (msg.type === "REQUEST") {
						this.onmessage({
							data: {
								type: "REQUEST_RESULT",
								id: msg.id,
								response: "SHIORI/3.0 200 OK\r\nValue: worker\r\n\r\n",
							},
						} as MessageEvent);
					} else if (msg.type === "UNLOAD") {
						this.onmessage({
							data: { type: "UNLOAD_RESULT", id: msg.id, success: true },
						} as MessageEvent);
					}
				}, 5);
			}

			terminate() {}
		}

		const originalWorker = globalThis.Worker;
		(globalThis as unknown as Record<string, unknown>).Worker = MockWorker;

		try {
			const loader = new WasmShioriLoader("mock-worker.js");
			const loaded = await loader.load({
				wasmUrl: "http://example.com/shiori.wasm",
			});
			assert.equal(loaded, true);
			assert.equal(loader.loaded, true);

			const res = await loader.request("GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n");
			assert.ok(res.includes("worker"));

			await loader.unload();
			assert.equal(loader.loaded, false);
		} finally {
			(globalThis as unknown as Record<string, unknown>).Worker =
				originalWorker;
		}
	});
});
