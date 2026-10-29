import assert from "node:assert/strict";
import { test } from "vitest";

// Mock WebAssembly and self (Worker global scope)
const postedMessages = [];
globalThis.self = {
	addEventListener(type, cb) {
		this._listener = cb;
	},
	postMessage(msg) {
		postedMessages.push(msg);
	},
};

globalThis.WebAssembly = {
	Memory: class {
		constructor() {
			this.buffer = new ArrayBuffer(1024);
		}
	},
	instantiate: async () => ({
		instance: {
			exports: {
				memory: new globalThis.WebAssembly.Memory(),
				load: () => {},
				request: (ptr) => ptr,
				malloc: (size) => 10,
				free: () => {},
				unload: () => {},
			},
		},
	}),
};

// Import shiori-worker to register listener
await import("../ui/js/ghost/shiori-worker.js");

test("shiori-worker message handler covers LOAD, REQUEST, UNLOAD, and default actions", async () => {
	const listener = globalThis.self._listener;
	assert.ok(listener);

	// 1. REQUEST when not loaded
	postedMessages.length = 0;
	await listener({ data: { type: "REQUEST", id: 1, payload: { request: "GET" } } });
	assert.equal(postedMessages.length, 1);
	assert.equal(postedMessages[0].type, "REQUEST_RESULT");

	// 2. LOAD valid wasmBytes
	postedMessages.length = 0;
	await listener({ data: { type: "LOAD", id: 2, payload: { wasmBytes: new Uint8Array([0, 1, 2, 3]) } } });
	assert.ok(postedMessages.some(m => m.type === "LOAD_RESULT" && m.success));

	// 3. REQUEST when loaded
	postedMessages.length = 0;
	await listener({ data: { type: "REQUEST", id: 3, payload: { request: "GET SHIORI/3.0\r\nID: OnBoot\r\n\r\n" } } });
	assert.ok(postedMessages.some(m => m.type === "REQUEST_RESULT"));

	// 4. UNLOAD
	postedMessages.length = 0;
	await listener({ data: { type: "UNLOAD", id: 4 } });
	assert.ok(postedMessages.some(m => m.type === "UNLOAD_RESULT" && m.success));

	// 5. Unknown message type
	postedMessages.length = 0;
	await listener({ data: { type: "UNKNOWN", id: 5 } });
	assert.ok(postedMessages.some(m => m.type === "ERROR"));

	// 6. LOAD failure catch branch
	globalThis.WebAssembly.instantiate = async () => { throw new Error("Instantiate fail"); };
	postedMessages.length = 0;
	await listener({ data: { type: "LOAD", id: 6, payload: { wasmBytes: new Uint8Array([0]) } } });
	assert.ok(postedMessages.some(m => m.type === "LOAD_RESULT" && !m.success));
});
