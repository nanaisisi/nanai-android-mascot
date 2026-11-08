import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;

import {
	convertFileSrc,
	emit,
	getCurrentWindowPosition,
	invoke,
	ipcQueueStats,
	isTauriAvailable,
	listen,
	moveCurrentWindowBy,
	startDraggingWindow,
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
	assert.equal(
		convertFileSrc("image.png", "asset"),
		"asset://custom/image.png",
	);
	delete globalThis.__TAURI_INTERNALS__;

	// 3. Tauri unavailable, startsWith matching
	assert.equal(
		convertFileSrc("http://example.com/img.png"),
		"http://example.com/img.png",
	);
	assert.equal(
		convertFileSrc("https://example.com/img.png"),
		"https://example.com/img.png",
	);
	assert.equal(
		convertFileSrc("asset://localhost/img.png"),
		"asset://localhost/img.png",
	);
	assert.equal(convertFileSrc("./img.png"), "./img.png");
	assert.equal(convertFileSrc("/img.png"), "/img.png");

	// 4. Fallback normalization (Windows path or relative file)
	const res = convertFileSrc("C:\\folder\\image.png");
	assert.ok(res.startsWith("asset://localhost/"));

	// 5. listen and emit when Tauri unavailable
	const dummyUnlisten = await listen("test-event", () => {});
	assert.equal(typeof dummyUnlisten, "function");
	dummyUnlisten();
	await emit("test-event", {});

	// 6. startDraggingWindow when Tauri unavailable
	await startDraggingWindow();

	// 7. startDraggingWindow when Tauri available (success and catch error)
	let dragCalled = false;
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd) => {
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

test("invoke, listen, emit, moveCurrentWindowBy, getCurrentWindowPosition, and ipcQueueStats coverage", async () => {
	// Verify __NANAI_IPC_QUEUE_STATS__ attachment
	assert.equal(
		(globalThis as unknown as Record<string, unknown>)
			.__NANAI_IPC_QUEUE_STATS__,
		ipcQueueStats,
	);

	// 1. invoke when Tauri unavailable (throws error)
	delete globalThis.__TAURI_INTERNALS__;
	await assert.rejects(async () => {
		await invoke("test_cmd");
	}, /Tauri is not available/);

	// 2. moveCurrentWindowBy & getCurrentWindowPosition when Tauri unavailable
	await moveCurrentWindowBy(10, 10, { x: 0, y: 0 });
	assert.equal(await getCurrentWindowPosition(), null);

	// 3. Tauri available tests
	let invokedCmd = "";
	let _invokedArgs = null;
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd, args) => {
			invokedCmd = cmd;
			_invokedArgs = args;
			if (cmd === "plugin:window|outer_position") {
				return { x: 150, y: 250 };
			}
			if (cmd === "plugin:event|listen") {
				return 100;
			}
			return "cmd_ok";
		},
		transformCallback: (cb) => cb,
		plugins: {
			event: {
				listeners: {},
				listen: async () => 1,
				emit: async () => {},
				unregisterListener: () => {},
			},
		},
	};

	// Successful invoke
	ipcQueueStats.reset();
	const invokeRes = await invoke("test_cmd", { a: 1 });
	assert.equal(invokeRes, "cmd_ok");
	assert.equal(ipcQueueStats.totalCalls, 1);

	// Invoke when pendingCount <= peakPendingCount
	ipcQueueStats.peakPendingCount = 10;
	ipcQueueStats.pendingCount = 1;
	await invoke("normal_cmd");

	// Queue alerts at 100, 1000, 5000
	ipcQueueStats.pendingCount = 99;
	await invoke("alert_100");
	assert.equal(ipcQueueStats.peakPendingCount, 100);

	ipcQueueStats.pendingCount = 999;
	await invoke("alert_1000");
	assert.equal(ipcQueueStats.peakPendingCount, 1000);

	ipcQueueStats.pendingCount = 4999;
	await invoke("alert_5000");
	assert.equal(ipcQueueStats.peakPendingCount, 5000);

	ipcQueueStats.reset();

	// listen and emit when Tauri available
	const unlistenFn = await listen("custom-event", () => {});
	assert.equal(typeof unlistenFn, "function");
	await emit("custom-event", { data: 123 });

	// moveCurrentWindowBy when Tauri available
	await moveCurrentWindowBy(20, 30, { x: 100, y: 200 });
	assert.equal(invokedCmd, "plugin:window|set_position");

	// getCurrentWindowPosition when Tauri available
	const pos = await getCurrentWindowPosition();
	assert.equal(pos?.x, 150);
	assert.equal(pos?.y, 250);

	// Error catch branches for moveCurrentWindowBy and getCurrentWindowPosition
	globalThis.__TAURI_INTERNALS__.invoke = async () => {
		throw new Error("window error");
	};
	await moveCurrentWindowBy(10, 10, { x: 0, y: 0 });
	assert.equal(await getCurrentWindowPosition(), null);

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
