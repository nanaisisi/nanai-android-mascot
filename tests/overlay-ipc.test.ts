import assert from "node:assert/strict";
import { afterEach, describe, test } from "vitest";
import {
	emit,
	getCurrentWindowPosition,
	getOverlayWindowOrigin,
	invoke,
	isNativeMultiWindow,
	isOverlayIpcAvailable,
	isOverlayWindow,
	isTauriAvailable,
	listen,
	moveCurrentWindowBy,
} from "../ui/ts/core/tauri-helper.js";

type OverlayBridge = {
	invoke: (reqId: string, cmd: string, argsJson: string) => void;
	emitEvent?: (eventName: string, payloadJson: string) => void;
	moveWindowBy?: (dx: number, dy: number) => void;
	getWindowPosition?: () => string;
};

type OverlayGlobals = typeof globalThis & {
	__NANAI_OVERLAY_IPC__?: OverlayBridge;
	__NANAI_OVERLAY_IPC_RESOLVE__?: (
		reqId: string,
		ok: boolean,
		payloadJson: string,
	) => void;
	__NANAI_OVERLAY_EVENT_DISPATCH__?: (
		eventName: string,
		payloadJson: string,
	) => void;
};

const g = globalThis as OverlayGlobals;
const originalTauriInternals = globalThis.__TAURI_INTERNALS__;
const originalLocation = globalThis.location;

afterEach(() => {
	delete g.__NANAI_OVERLAY_IPC__;
	if (originalTauriInternals === undefined) {
		delete globalThis.__TAURI_INTERNALS__;
	} else {
		globalThis.__TAURI_INTERNALS__ = originalTauriInternals;
	}
	if (originalLocation === undefined) {
		delete (globalThis as { location?: Location }).location;
	} else {
		Object.defineProperty(globalThis, "location", {
			configurable: true,
			value: originalLocation,
		});
	}
});

describe("Android overlay IPC", () => {
	test("isOverlayWindow detects ?overlay=1 query parameter", () => {
		Object.defineProperty(globalThis, "location", {
			configurable: true,
			value: { search: "" } as Location,
		});
		assert.equal(isOverlayWindow(), false);

		Object.defineProperty(globalThis, "location", {
			configurable: true,
			value: { search: "?overlay=1" } as Location,
		});
		assert.equal(isOverlayWindow(), true);
	});

	test("isOverlayIpcAvailable and isTauriAvailable detect __NANAI_OVERLAY_IPC__", () => {
		delete globalThis.__TAURI_INTERNALS__;
		delete g.__NANAI_OVERLAY_IPC__;
		assert.equal(isOverlayIpcAvailable(), false);
		assert.equal(isTauriAvailable(), false);

		g.__NANAI_OVERLAY_IPC__ = {
			invoke: () => {},
		};
		assert.equal(isOverlayIpcAvailable(), true);
		assert.equal(isTauriAvailable(), true);
	});

	test("invoke resolves via __NANAI_OVERLAY_IPC_RESOLVE__ on success", async () => {
		delete globalThis.__TAURI_INTERNALS__;
		let capturedCmd = "";
		let capturedArgs = "";

		g.__NANAI_OVERLAY_IPC__ = {
			invoke: (reqId, cmd, argsJson) => {
				capturedCmd = cmd;
				capturedArgs = argsJson;
				queueMicrotask(() => {
					g.__NANAI_OVERLAY_IPC_RESOLVE__?.(
						reqId,
						true,
						JSON.stringify({ ok: true, count: 2 }),
					);
				});
			},
		};

		const result = await invoke<{ ok: boolean; count: number }>("scan_ghosts", {
			dir: "ghosts",
		});
		assert.equal(capturedCmd, "scan_ghosts");
		assert.equal(capturedArgs, JSON.stringify({ dir: "ghosts" }));
		assert.deepEqual(result, { ok: true, count: 2 });
	});

	test("invoke rejects via __NANAI_OVERLAY_IPC_RESOLVE__ on error", async () => {
		delete globalThis.__TAURI_INTERNALS__;
		g.__NANAI_OVERLAY_IPC__ = {
			invoke: (reqId) => {
				queueMicrotask(() => {
					g.__NANAI_OVERLAY_IPC_RESOLVE__?.(
						reqId,
						false,
						JSON.stringify("overlay ipc failed"),
					);
				});
			},
		};

		await assert.rejects(
			() => invoke("get_app_config"),
			(err: unknown) =>
				err instanceof Error && err.message === "overlay ipc failed",
		);
	});

	test("emit and listen relay events via __NANAI_OVERLAY_EVENT_DISPATCH__", async () => {
		delete globalThis.__TAURI_INTERNALS__;
		const received: unknown[] = [];

		g.__NANAI_OVERLAY_IPC__ = {
			invoke: () => {},
			emitEvent: (eventName, payloadJson) => {
				g.__NANAI_OVERLAY_EVENT_DISPATCH__?.(eventName, payloadJson);
			},
			getWindowPosition: () => JSON.stringify({ x: 120, y: 240 }),
		};

		Object.defineProperty(globalThis, "location", {
			configurable: true,
			value: { search: "?overlay=1" } as Location,
		});

		assert.equal(isNativeMultiWindow(), true);
		assert.deepEqual(getOverlayWindowOrigin(), { x: 120, y: 240 });

		const unlisten = await listen("sync-menu-scope", (ev) => {
			received.push((ev as { payload: unknown }).payload);
		});
		await emit("sync-menu-scope", 1);
		unlisten();
		await emit("sync-menu-scope", 2);

		assert.deepEqual(received, [1]);
	});

	test("moveCurrentWindowBy and getCurrentWindowPosition route via __NANAI_OVERLAY_IPC__", async () => {
		delete globalThis.__TAURI_INTERNALS__;
		let posX = 100;
		let posY = 200;

		g.__NANAI_OVERLAY_IPC__ = {
			invoke: () => {},
			getWindowPosition: () => JSON.stringify({ x: posX, y: posY }),
			moveWindowBy: (dx, dy) => {
				posX += dx;
				posY += dy;
			},
		};

		const initial = await getCurrentWindowPosition();
		assert.deepEqual(initial, { x: 100, y: 200 });

		await moveCurrentWindowBy(30, -20, { x: 100, y: 200 });
		assert.deepEqual(await getCurrentWindowPosition(), { x: 130, y: 180 });
	});
});
