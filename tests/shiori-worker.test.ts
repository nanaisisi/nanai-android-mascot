import assert from "node:assert/strict";
import { test } from "vitest";

interface WorkerMessage {
	type: string;
	success?: boolean;
	[key: string]: unknown;
}

type WorkerListener = (ev: { data: unknown }) => Promise<void> | void;

interface MockWorkerSelf {
	_listener?: WorkerListener;
	addEventListener(_type: string, cb: WorkerListener): void;
	postMessage(msg: WorkerMessage): void;
}

class MockMemory {
	buffer = new ArrayBuffer(1024);
}

// Mock WebAssembly and self (Worker global scope)
const postedMessages: WorkerMessage[] = [];
const mockSelf: MockWorkerSelf = {
	addEventListener(_type: string, cb: WorkerListener) {
		this._listener = cb;
	},
	postMessage(msg: WorkerMessage) {
		postedMessages.push(msg);
	},
};
globalThis.self = mockSelf as unknown as Window & typeof globalThis;

globalThis.WebAssembly = {
	Memory: MockMemory as unknown as typeof WebAssembly.Memory,
	instantiate: (async () => ({
		instance: {
			exports: {
				memory: new MockMemory(),
				load: () => {},
				request: (ptr: number) => ptr,
				malloc: (_size: number) => 10,
				free: () => {},
				unload: () => {},
			},
		},
	})) as unknown as typeof WebAssembly.instantiate,
} as unknown as typeof WebAssembly;

// Import shiori-worker to register listener
await import("../ui/ts/ghost/shiori-worker.js");

test("shiori-worker message handler covers LOAD, REQUEST, UNLOAD, and default actions", async () => {
	const listener = mockSelf._listener;
	assert.ok(listener);

	// 1. REQUEST when not loaded
	postedMessages.length = 0;
	await listener({
		data: { type: "REQUEST", id: 1, payload: { request: "GET" } },
	});
	assert.equal(postedMessages.length, 1);
	assert.equal(postedMessages[0].type, "REQUEST_RESULT");

	// 2. LOAD valid wasmBytes
	postedMessages.length = 0;
	await listener({
		data: {
			type: "LOAD",
			id: 2,
			payload: { wasmBytes: new Uint8Array([0, 1, 2, 3]) },
		},
	});
	assert.ok(postedMessages.some((m) => m.type === "LOAD_RESULT" && m.success));

	// 3. REQUEST when loaded
	postedMessages.length = 0;
	await listener({
		data: {
			type: "REQUEST",
			id: 3,
			payload: { request: "GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n" },
		},
	});
	assert.ok(postedMessages.some((m) => m.type === "REQUEST_RESULT"));

	// 4. UNLOAD
	postedMessages.length = 0;
	await listener({ data: { type: "UNLOAD", id: 4 } });
	assert.ok(
		postedMessages.some((m) => m.type === "UNLOAD_RESULT" && m.success),
	);

	// 5. Unknown message type
	postedMessages.length = 0;
	await listener({ data: { type: "UNKNOWN", id: 5 } });
	assert.ok(postedMessages.some((m) => m.type === "ERROR"));

	// 6. LOAD failure catch branch
	globalThis.WebAssembly.instantiate = (async () => {
		throw new Error("Instantiate fail");
	}) as unknown as typeof WebAssembly.instantiate;
	postedMessages.length = 0;
	await listener({
		data: { type: "LOAD", id: 6, payload: { wasmBytes: new Uint8Array([0]) } },
	});
	assert.ok(postedMessages.some((m) => m.type === "LOAD_RESULT" && !m.success));
});
