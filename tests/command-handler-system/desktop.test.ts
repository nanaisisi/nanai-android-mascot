import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

globalThis.window = globalThis as unknown as Window & typeof globalThis;

import {
	handleExecuteResetBalloonPos,
	handleExecuteResetWindowPos,
	handleSetAlignmentOnDesktop,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
} from "../../ui/ts/ghost/command-handler/system/desktop.js";
import type { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";

describe("system/desktop.js", () => {
	let originalTauri: typeof globalThis.__TAURI__;

	beforeEach(() => {
		originalTauri = globalThis.__TAURI__;
	});

	afterEach(() => {
		globalThis.__TAURI__ = originalTauri;
		vi.restoreAllMocks();
	});

	it("handleSetAlignmentOnDesktop handles positioning and 'free' mode", async () => {
		class MockPhysicalPosition {
			x: number;
			y: number;
			constructor(x: number, y: number) {
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
		} as unknown as typeof globalThis.__TAURI__;

		const handler = { app: {} } as unknown as SakuraCommandHandler;
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
		const dispatched: string[] = [];
		const handler = {
			app: {
				dispatchAction: async (action: string) => {
					dispatched.push(action);
				},
			},
		} as unknown as SakuraCommandHandler;

		await handleExecuteResetWindowPos(handler, []);
		expect(dispatched).toContain("reset-shell-position");

		await handleExecuteResetBalloonPos(handler, []);
		expect(dispatched).toContain("reset-balloon-position");
	});

	it("handleSetTaskTrayIcon & handleSetTrayBalloon invoke Tauri when available", async () => {
		const tauriInternals = {
			invoke: vi.fn().mockResolvedValue(undefined),
		};
		const globalWithInternals = globalThis as unknown as {
			__TAURI_INTERNALS__?: typeof tauriInternals;
		};
		globalWithInternals.__TAURI_INTERNALS__ = tauriInternals;

		await handleSetTaskTrayIcon({} as unknown as SakuraCommandHandler, [
			"set",
			"tasktrayicon",
			"test.ico",
		]);
		expect(tauriInternals.invoke).toHaveBeenCalledWith(
			"set_tray_icon",
			{ iconPath: "test.ico" },
			undefined,
		);

		await handleSetTrayBalloon({} as unknown as SakuraCommandHandler, [
			"set",
			"trayballoon",
			"Sample Title",
			"Sample Msg",
		]);
		expect(tauriInternals.invoke).toHaveBeenCalledWith(
			"show_tray_notification",
			{ title: "Sample Title", text: "Sample Msg" },
			undefined,
		);

		delete globalWithInternals.__TAURI_INTERNALS__;
	});

	it("handleSetTrayBalloon and reset commands trigger SHIORI events", async () => {
		vi.useFakeTimers();
		const events: Array<{ name: string; refs: string[] }> = [];
		const handler = {
			app: {
				dispatchAction: vi.fn(),
				ghostController: {
					sendShioriEvent: vi.fn(async (name: string, refs: string[]) => {
						events.push({ name, refs });
					}),
				},
			},
		} as unknown as SakuraCommandHandler;

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
