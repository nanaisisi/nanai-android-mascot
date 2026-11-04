import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

globalThis.window = globalThis;

import {
	handleExecuteResetBalloonPos,
	handleExecuteResetWindowPos,
	handleSetAlignmentOnDesktop,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
} from "../../ui/js/ghost/command-handler/system/desktop.js";

describe("system/desktop.js", () => {
	let originalTauri;

	beforeEach(() => {
		originalTauri = globalThis.__TAURI__;
	});

	afterEach(() => {
		globalThis.__TAURI__ = originalTauri;
		vi.restoreAllMocks();
	});

	it("handleSetAlignmentOnDesktop handles positioning and 'free' mode", async () => {
		class MockPhysicalPosition {
			constructor(x, y) {
				this.x = x;
				this.y = y;
			}
		}

		const win = {
			outerSize: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
			outerPosition: vi.fn().mockResolvedValue({ x: 10, y: 10 }),
			setPosition: vi.fn().mockResolvedValue(undefined),
		};
		globalThis.__TAURI__ = {
			window: {
				getCurrentWindow: () => win,
				currentMonitor: vi.fn().mockResolvedValue({
					position: { x: 0, y: 0 },
					size: { width: 1000, height: 800 },
				}),
				PhysicalPosition: MockPhysicalPosition,
			},
		};

		const handler = { app: {} };
		await handleSetAlignmentOnDesktop(handler, [
			"set",
			"alignmentondesktop",
			"bottom",
		]);
		expect(handler.app.alignmentToDesktop).toBe("bottom");
		expect(win.setPosition).toHaveBeenCalledWith(
			new MockPhysicalPosition(10, 700),
		);

		await handleSetAlignmentOnDesktop(handler, [
			"set",
			"alignmentondesktop",
			"free",
		]);
		expect(handler.app.alignmentToDesktop).toBe("free");
	});

	it("handleExecuteResetWindowPos & handleExecuteResetBalloonPos dispatch actions", async () => {
		const dispatched = [];
		const handler = {
			app: {
				dispatchAction: async (action) => {
					dispatched.push(action);
				},
			},
		};

		await handleExecuteResetWindowPos(handler, []);
		expect(dispatched).toContain("reset-shell-position");

		await handleExecuteResetBalloonPos(handler, []);
		expect(dispatched).toContain("reset-balloon-position");
	});

	it("handleSetTaskTrayIcon & handleSetTrayBalloon invoke Tauri when available", async () => {
		globalThis.__TAURI_INTERNALS__ = {
			invoke: vi.fn().mockResolvedValue(undefined),
		};

		await handleSetTaskTrayIcon({}, ["set", "tasktrayicon", "test.ico"]);
		expect(globalThis.__TAURI_INTERNALS__.invoke).toHaveBeenCalledWith(
			"set_tray_icon",
			{ iconPath: "test.ico" },
			undefined,
		);

		await handleSetTrayBalloon({}, [
			"set",
			"trayballoon",
			"Sample Title",
			"Sample Msg",
		]);
		expect(globalThis.__TAURI_INTERNALS__.invoke).toHaveBeenCalledWith(
			"show_tray_notification",
			{ title: "Sample Title", text: "Sample Msg" },
			undefined,
		);

		delete globalThis.__TAURI_INTERNALS__;
	});

	it("handleSetTrayBalloon and reset commands trigger SHIORI events", async () => {
		vi.useFakeTimers();
		const events = [];
		const handler = {
			app: {
				dispatchAction: vi.fn(),
				ghostController: {
					sendShioriEvent: vi.fn(async (name, refs) => {
						events.push({ name, refs });
					}),
				},
			},
		};

		await handleSetTrayBalloon(handler, [
			"set",
			"trayballoon",
			"Test Title",
			"Test Text",
			"500",
		]);
		vi.advanceTimersByTime(500);

		expect(events.some((e) => e.name === "OnTrayBalloonTimeout")).toBe(true);

		await handleExecuteResetWindowPos(handler, []);
		expect(
			events.some(
				(e) => e.name === "OnResetWindowPos" && e.refs[0] === "shell",
			),
		).toBe(true);

		await handleExecuteResetBalloonPos(handler, []);
		expect(
			events.some(
				(e) => e.name === "OnResetWindowPos" && e.refs[0] === "balloon",
			),
		).toBe(true);

		vi.useRealTimers();
	});
});
