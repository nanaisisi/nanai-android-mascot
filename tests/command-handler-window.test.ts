import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleWindowState,
	setAlignmentToDesktop,
} from "../ui/js/ghost/command-handler/window.js";

describe("Sakura command window handlers", () => {
	let originalTauri: unknown;

	beforeEach(() => {
		originalTauri = globalThis.__TAURI__;
	});

	afterEach(() => {
		globalThis.__TAURI__ = originalTauri;
		vi.restoreAllMocks();
	});

	describe("handleWindowState", () => {
		it("returns early when globalThis.__TAURI__ is not present", async () => {
			globalThis.__TAURI__ = undefined;
			await expect(handleWindowState("stayontop")).resolves.toBeUndefined();
		});

		it("sets always on top to true for stayontop", async () => {
			const win = {
				setAlwaysOnTop: vi.fn().mockResolvedValue(undefined),
				minimize: vi.fn(),
			};
			globalThis.__TAURI__ = {
				window: {
					getCurrentWindow: () => win,
				},
			};

			await handleWindowState("stayontop");
			expect(win.setAlwaysOnTop).toHaveBeenCalledWith(true);
		});

		it("sets always on top to false for !stayontop", async () => {
			const win = {
				setAlwaysOnTop: vi.fn().mockResolvedValue(undefined),
				minimize: vi.fn(),
			};
			globalThis.__TAURI__ = {
				window: {
					getCurrentWindow: () => win,
				},
			};

			await handleWindowState("!stayontop");
			expect(win.setAlwaysOnTop).toHaveBeenCalledWith(false);
		});

		it("minimizes the window for minimize and sends OnWindowStateMinimize", async () => {
			const win = {
				setAlwaysOnTop: vi.fn(),
				minimize: vi.fn().mockResolvedValue(undefined),
			};
			globalThis.__TAURI__ = {
				window: {
					getCurrentWindow: () => win,
				},
			};
			const handler = {
				app: {
					ghostController: {
						sendShioriEvent: vi.fn().mockResolvedValue(undefined),
					},
				},
			};

			await handleWindowState("minimize", handler);
			expect(win.minimize).toHaveBeenCalled();
			expect(handler.app.ghostController.sendShioriEvent).toHaveBeenCalledWith(
				"OnWindowStateMinimize",
				[],
			);
		});

		it("restores the window for restore and sends OnWindowStateRestore", async () => {
			const win = {
				setAlwaysOnTop: vi.fn(),
				unminimize: vi.fn().mockResolvedValue(undefined),
			};
			globalThis.__TAURI__ = {
				window: {
					getCurrentWindow: () => win,
				},
			};
			const handler = {
				app: {
					ghostController: {
						sendShioriEvent: vi.fn().mockResolvedValue(undefined),
					},
				},
			};

			await handleWindowState("restore", handler);
			expect(win.unminimize).toHaveBeenCalled();
			expect(handler.app.ghostController.sendShioriEvent).toHaveBeenCalledWith(
				"OnWindowStateRestore",
				[],
			);
		});

		it("catches and logs errors when window operation fails", async () => {
			const consoleWarnSpy = vi
				.spyOn(console, "warn")
				.mockImplementation(() => {});
			const win = {
				setAlwaysOnTop: vi.fn().mockRejectedValue(new Error("IPC fail")),
			};
			globalThis.__TAURI__ = {
				window: {
					getCurrentWindow: () => win,
				},
			};

			await handleWindowState("stayontop");
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				"windowstate 失敗:",
				expect.any(Error),
			);
		});
	});

	describe("setAlignmentToDesktop", () => {
		it("sets handler app alignmentToDesktop and returns early for mode 'free'", async () => {
			const handler = { app: {} };
			await setAlignmentToDesktop(handler, "free");
			expect(handler.app.alignmentToDesktop).toBe("free");
		});

		it("returns early when globalThis.__TAURI__ is undefined", async () => {
			globalThis.__TAURI__ = undefined;
			const handler = { app: {} };
			await setAlignmentToDesktop(handler, "bottom");
			expect(handler.app.alignmentToDesktop).toBe("bottom");
		});

		it("returns early when currentMonitor returns null", async () => {
			const win = {
				outerSize: vi.fn(),
				outerPosition: vi.fn(),
				setPosition: vi.fn(),
			};
			globalThis.__TAURI__ = {
				window: {
					getCurrentWindow: () => win,
					currentMonitor: vi.fn().mockResolvedValue(null),
				},
			};

			const handler = { app: {} };
			await setAlignmentToDesktop(handler, "bottom");
			expect(win.setPosition).not.toHaveBeenCalled();
		});

		it("calculates correct positions for bottom, top, left, and right modes", async () => {
			class MockPhysicalPosition {
				constructor(x, y) {
					this.x = x;
					this.y = y;
				}
			}

			const win = {
				outerSize: vi.fn().mockResolvedValue({ width: 200, height: 300 }),
				outerPosition: vi.fn().mockResolvedValue({ x: 50, y: 50 }),
				setPosition: vi.fn().mockResolvedValue(undefined),
			};
			const monitor = {
				position: { x: 0, y: 0 },
				size: { width: 1920, height: 1080 },
			};
			globalThis.__TAURI__ = {
				window: {
					getCurrentWindow: () => win,
					currentMonitor: vi.fn().mockResolvedValue(monitor),
					PhysicalPosition: MockPhysicalPosition,
				},
			};

			const handler = { app: {} };

			// bottom: x remains 50, y = 0 + 1080 - 300 = 780
			await setAlignmentToDesktop(handler, "bottom");
			expect(win.setPosition).toHaveBeenCalledWith(
				new MockPhysicalPosition(50, 780),
			);

			// top: x remains 50, y = 0
			await setAlignmentToDesktop(handler, "top");
			expect(win.setPosition).toHaveBeenCalledWith(
				new MockPhysicalPosition(50, 0),
			);

			// left: x = 0, y remains 50
			await setAlignmentToDesktop(handler, "left");
			expect(win.setPosition).toHaveBeenCalledWith(
				new MockPhysicalPosition(0, 50),
			);

			// right: x = 0 + 1920 - 200 = 1720, y remains 50
			await setAlignmentToDesktop(handler, "right");
			expect(win.setPosition).toHaveBeenCalledWith(
				new MockPhysicalPosition(1720, 50),
			);
		});

		it("catches and logs errors when setPosition fails", async () => {
			const consoleWarnSpy = vi
				.spyOn(console, "warn")
				.mockImplementation(() => {});
			const win = {
				outerSize: vi.fn().mockRejectedValue(new Error("Monitor read error")),
			};
			globalThis.__TAURI__ = {
				window: {
					getCurrentWindow: () => win,
					currentMonitor: vi.fn().mockResolvedValue({
						position: { x: 0, y: 0 },
						size: { width: 1920, height: 1080 },
					}),
				},
			};

			const handler = { app: {} };
			await setAlignmentToDesktop(handler, "bottom");
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				"alignmenttodesktop 失敗:",
				expect.any(Error),
			);
		});
	});
});
