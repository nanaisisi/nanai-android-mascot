import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

globalThis.window = globalThis;

import { scriptLifetimeState } from "../ui/js/ghost/command-handler/env.js";
import {
	handleExecuteResetBalloonPos,
	handleExecuteResetWindowPos,
	handleSetAlignmentOnDesktop,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
} from "../ui/js/ghost/command-handler/system/desktop.js";
import {
	handleReloadShiori,
	handleSetShioriDebugMode,
} from "../ui/js/ghost/command-handler/system/shiori.js";
import {
	handleSetAlphaCommand,
	handleSetPositionCommand,
	handleSetPropertyCommand,
	handleSetScalingCommand,
} from "../ui/js/ghost/command-handler/system/surface.js";
import {
	handleBiffCommand,
	handleExecuteSntpCommand,
	handleOpenSystemTarget,
} from "../ui/js/ghost/command-handler/system/target.js";
import {
	clearAllScriptTimers,
	handleNotifyCommand,
	handleTimerRaiseCommand,
} from "../ui/js/ghost/command-handler/system/timer.js";

describe("system/timer.js", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		clearAllScriptTimers();
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("handleNotifyCommand sends notify or event without throwing", async () => {
		const calls = [];
		const handlerWithNotify = {
			app: {
				ghostController: {
					sendShioriNotify: async (ev, refs) => {
						calls.push({ type: "notify", ev, refs });
					},
				},
			},
		};

		await handleNotifyCommand(handlerWithNotify, [
			"notify",
			"OnTest",
			"ref0",
			"ref1",
		]);
		expect(calls).toEqual([
			{ type: "notify", ev: "OnTest", refs: ["ref0", "ref1"] },
		]);

		// Fallback to sendShioriEvent if sendShioriNotify is missing
		calls.length = 0;
		const handlerWithEvent = {
			app: {
				ghostController: {
					sendShioriEvent: async (ev, refs) => {
						calls.push({ type: "event", ev, refs });
					},
				},
			},
		};
		await handleNotifyCommand(handlerWithEvent, [
			"notify",
			"OnTestFallback",
			"a",
		]);
		expect(calls).toEqual([
			{ type: "event", ev: "OnTestFallback", refs: ["a"] },
		]);

		// Empty event does nothing
		await handleNotifyCommand(handlerWithEvent, ["notify"]);
		expect(calls.length).toBe(1);

		// Warning handled if controller rejects
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const handlerFail = {
			app: {
				ghostController: {
					sendShioriNotify: async () => {
						throw new Error("fail");
					},
				},
			},
		};
		await handleNotifyCommand(handlerFail, ["notify", "OnFail"]);
		expect(warnSpy).toHaveBeenCalledWith(
			"Notify event failed (OnFail):",
			expect.any(Error),
		);
	});

	it("handleTimerRaiseCommand schedules timeout and interval correctly", async () => {
		const fired = [];
		const handler = {
			app: {
				ghostController: {
					sendShioriEvent: async (ev, refs) => {
						fired.push({ ev, refs });
					},
				},
			},
		};

		// 1. One-shot timeout (repeatFlag = 1)
		await handleTimerRaiseCommand(handler, [
			"timerraise",
			"500",
			"1",
			"OnTimerOneShot",
			"arg1",
		]);
		expect(fired.length).toBe(0);

		vi.advanceTimersByTime(499);
		expect(fired.length).toBe(0);

		vi.advanceTimersByTime(2);
		expect(fired.length).toBe(1);
		expect(fired[0]).toEqual({ ev: "OnTimerOneShot", refs: ["arg1"] });

		// 2. Interval repeat (repeatFlag = 0)
		fired.length = 0;
		await handleTimerRaiseCommand(handler, [
			"timerraise",
			"200",
			"0",
			"OnTimerInterval",
			"intervalArg",
		]);
		vi.advanceTimersByTime(200);
		expect(fired.length).toBe(1);
		vi.advanceTimersByTime(200);
		expect(fired.length).toBe(2);

		// Cancelling with delay <= 0
		await handleTimerRaiseCommand(handler, [
			"timerraise",
			"0",
			"0",
			"OnTimerInterval",
		]);
		vi.advanceTimersByTime(400);
		expect(fired.length).toBe(2);

		// Empty eventName does nothing
		await handleTimerRaiseCommand(handler, ["timerraise", "200", "1", ""]);
	});
});

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
});

describe("system/target.js", () => {
	it("handleBiffCommand triggers email check", async () => {
		let checked = false;
		const handler = {
			app: {
				networkActions: {
					checkEmail: async () => {
						checked = true;
					},
				},
			},
		};

		await handleBiffCommand(handler, ["biff"]);
		expect(checked).toBe(true);
	});

	it("handleExecuteSntpCommand fires OnSNTPCompare", async () => {
		const events = [];
		const handler = {
			app: {
				ghostController: {
					sendShioriEvent: async (ev, args) => {
						events.push({ ev, args });
					},
				},
			},
		};

		await handleExecuteSntpCommand(handler, ["executesntp"]);
		expect(events.length).toBe(1);
		expect(events[0].ev).toBe("OnSNTPCompare");
	});

	it("handleOpenSystemTarget handles explorer, browser, and modal dialogs", async () => {
		let menuToggled = false;
		let modalShown = "";
		let openedUrl = "";

		const originalOpen = globalThis.open;
		globalThis.open = (url) => {
			openedUrl = url;
		};

		const handler = {
			app: {
				toggleMenu: () => {
					menuToggled = true;
				},
				modalManager: {
					show: (id) => {
						modalShown = id;
					},
				},
			},
		};

		try {
			await handleOpenSystemTarget(handler, ["open", "ghostexplorer"]);
			expect(menuToggled).toBe(true);

			await handleOpenSystemTarget(handler, [
				"open",
				"browser",
				"https://example.com/test",
			]);
			expect(openedUrl).toBe("https://example.com/test");

			await handleOpenSystemTarget(handler, ["open", "configurationdialog"]);
			expect(modalShown).toBe("settings-modal-content");
		} finally {
			globalThis.open = originalOpen;
		}
	});
});

describe("system/surface.js", () => {
	it("handleSetPropertyCommand sets property in scriptLifetimeState", async () => {
		await handleSetPropertyCommand({}, [
			"set",
			"property",
			"testKey",
			"testVal",
		]);
		expect(scriptLifetimeState.getVariable("testKey")).toBe("testVal");
	});

	it("handleSetScalingCommand, handleSetAlphaCommand, handleSetPositionCommand apply to surfaceManager", async () => {
		let scale = null;
		let alpha = null;
		let position = null;

		const handler = {
			player: { currentScope: 1 },
			app: {
				surfaceManager: {
					setScale: (sx, sy, scope) => {
						scale = { sx, sy, scope };
					},
					setAlpha: (val, scope) => {
						alpha = { val, scope };
					},
					setPosition: (x, y, scope) => {
						position = { x, y, scope };
					},
				},
			},
		};

		await handleSetScalingCommand(handler, ["set", "scaling", "120", "120"]);
		expect(scale).toEqual({ sx: 120, sy: 120, scope: 1 });

		await handleSetAlphaCommand(handler, ["set", "alpha", "80"]);
		expect(alpha).toEqual({ val: 80, scope: 1 });

		await handleSetPositionCommand(handler, [
			"set",
			"position",
			"50",
			"60",
			"0",
		]);
		expect(position).toEqual({ x: 50, y: 60, scope: 0 });
	});
});

describe("system/shiori.js", () => {
	it("handleSetShioriDebugMode updates ghostController", async () => {
		const handler = {
			app: {
				ghostController: {
					shioriDebugMode: false,
				},
			},
		};

		await handleSetShioriDebugMode(handler, ["set", "shioridebugmode", "true"]);
		expect(handler.app.ghostController.shioriDebugMode).toBe(true);

		await handleSetShioriDebugMode(handler, [
			"set",
			"shioridebugmode",
			"false",
		]);
		expect(handler.app.ghostController.shioriDebugMode).toBe(false);
	});

	it("handleReloadShiori reloads current ghost SHIORI", async () => {
		let reloadedGhost = null;
		const ghost = { name: "TestGhost" };
		const handler = {
			app: {
				ghostController: {
					currentGhost: ghost,
					initializeGhostSHIORI: async (g) => {
						reloadedGhost = g;
					},
				},
			},
		};

		await handleReloadShiori(handler, ["reload", "shiori"]);
		expect(reloadedGhost).toBe(ghost);
	});
});
