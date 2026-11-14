import assert from "node:assert/strict";
import { beforeEach, describe, it, vi } from "vitest";
import {
	getCurrentWindowPosition,
	invoke,
	ipcQueueStats,
	moveCurrentWindowBy,
	startDraggingWindow,
} from "../../ui/ts/core/tauri-helper.js";

describe("core-coverage-boost: tauri-helper edge cases", () => {
	beforeEach(() => {
		ipcQueueStats.reset();
		delete globalThis.__TAURI__;
		delete globalThis.__TAURI_INTERNALS__;
	});

	it("throws when Tauri is not available on invoke", async () => {
		await assert.rejects(
			() => invoke("non_existent_command"),
			/WasmHostBridge|Tauri is not available/,
		);
	});

	it("logs warnings on IPC queue alerts for 100, 1000, 5000 pending items", async () => {
		globalThis.window = globalThis;
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		globalThis.__TAURI_INTERNALS__ = {
			invoke: async () => "ok",
		};

		// Simulate 100 pending
		ipcQueueStats.pendingCount = 99;
		await invoke("cmd_100");
		assert.ok(warnSpy.mock.calls.some((c) => c[0].includes("100件到達")));

		// Simulate 1000 pending
		ipcQueueStats.pendingCount = 999;
		await invoke("cmd_1000");
		assert.ok(warnSpy.mock.calls.some((c) => c[0].includes("1000件到達")));

		// Simulate 5000 pending
		ipcQueueStats.pendingCount = 4999;
		await invoke("cmd_5000");
		assert.ok(errorSpy.mock.calls.some((c) => c[0].includes("5000件到達")));

		warnSpy.mockRestore();
		errorSpy.mockRestore();
		logSpy.mockRestore();
	});

	it("handles errors gracefully in startDraggingWindow, moveCurrentWindowBy, getCurrentWindowPosition", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		globalThis.__TAURI_INTERNALS__ = {};
		// Mock window without required methods
		globalThis.__TAURI_PATTERN__ = { pattern: "all" };

		await startDraggingWindow();
		assert.ok(
			warnSpy.mock.calls.some((c) =>
				c[0].includes("startDraggingWindow failed:"),
			),
		);

		await moveCurrentWindowBy(5, 5, { x: 0, y: 0 });
		assert.ok(
			warnSpy.mock.calls.some((c) =>
				c[0].includes("moveCurrentWindowBy failed:"),
			),
		);

		const pos = await getCurrentWindowPosition();
		assert.equal(pos, null);
		assert.ok(
			warnSpy.mock.calls.some((c) =>
				c[0].includes("getCurrentWindowPosition failed:"),
			),
		);

		warnSpy.mockRestore();
	});
});
