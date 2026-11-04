import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;

import {
	convertFileSrc,
	listen,
	emit,
	startDraggingWindow,
	isTauriAvailable,
} from "../ui/js/core/tauri-helper.js";

test("convertFileSrc covers empty path, Tauri available, protocol startsWith branches, and fallback normalization", async () => {
	// 1. Empty path
	assert.equal(convertFileSrc(""), "");
	assert.equal(convertFileSrc(null), "");

	// 2. Tauri available
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		convertFileSrc: (p, proto) => `${proto}://custom/${p}`,
	};
	assert.equal(convertFileSrc("image.png", "asset"), "asset://custom/image.png");
	delete globalThis.__TAURI_INTERNALS__;

	// 3. Tauri unavailable, startsWith matching
	assert.equal(convertFileSrc("http://example.com/img.png"), "http://example.com/img.png");
	assert.equal(convertFileSrc("https://example.com/img.png"), "https://example.com/img.png");
	assert.equal(convertFileSrc("asset://localhost/img.png"), "asset://localhost/img.png");
	assert.equal(convertFileSrc("./img.png"), "./img.png");
	assert.equal(convertFileSrc("/img.png"), "/img.png");

	// 4. Fallback normalization (Windows path or relative file)
	const res = convertFileSrc("C:\\folder\\image.png");
	assert.ok(res.startsWith("asset://localhost/"));

	// 5. listen and emit when Tauri unavailable
	assert.ok(await listen("test-event", () => {}) instanceof Function);
	await emit("test-event", {});

	// 6. startDraggingWindow when Tauri unavailable
	await startDraggingWindow();

	// 7. startDraggingWindow when Tauri available (success and catch error)
	let dragCalled = false;
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd, args) => {
			if (cmd === "plugin:window|start_dragging") {
				dragCalled = true;
			}
		},
		transformCallback: (cb) => cb,
	};
	assert.equal(isTauriAvailable(), true);
	await startDraggingWindow();
	assert.equal(dragCalled, true);

	// Error catch branch in startDraggingWindow
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async () => {
			throw new Error("drag error");
		},
		transformCallback: (cb) => cb,
	};
	await startDraggingWindow();

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
