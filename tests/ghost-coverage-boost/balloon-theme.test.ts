import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("balloon-window and balloon-window/theme edge cases", () => {
	it("exercises balloon-window and balloon-window/theme edge branches", async () => {
		const { loadBalloonSkinImages, applyBalloonDescript } = await import(
			"../../ui/ts/ghost/balloon-window/theme.js"
		);

		// 1. loadBalloonSkinImages for scope >= 2 with fallback to balloons0.png/pna
		const tauriInternals = {
			metadata: { currentWindow: { label: "balloon_window_2" } },
			invoke: async (cmd: string, args: { file: string }) => {
				if (cmd === "load_balloon_image") {
					if (args.file.startsWith("balloonp2")) {
						// Simulate missing scope 2 file
						return null;
					}
					if (args.file === "balloons0.png") {
						return "data:image/png;base64,fallback_png";
					}
					if (args.file === "balloons0.pna") {
						return "data:image/png;base64,fallback_pna";
					}
					return null;
				}
				if (cmd === "balloon_manifest") {
					// invalid / empty props
					return null;
				}
				return null;
			},
			transformCallback: (cb: unknown) => cb,
		};
		globalThis.__TAURI_INTERNALS__ = tauriInternals;

		const bgScope2 = await loadBalloonSkinImages("theme_custom", 2);
		// processChromaKey might return null or base64 without canvas DOM, but function executes without throwing
		assert.ok(bgScope2 !== undefined);

		// 2. applyBalloonDescript when props is null
		const nullPropsRes = await applyBalloonDescript({
			theme: "empty_theme",
			scopeId: 0,
			currentUserScale: 1.0,
		});
		assert.strictEqual(nullPropsRes, null);

		// 3. applyBalloonDescript when invoke throws
		tauriInternals.invoke = async () => {
			throw new Error("Manifest error");
		};
		const errRes = await applyBalloonDescript({
			theme: "throw_theme",
			scopeId: 0,
			currentUserScale: 1.0,
		});
		assert.strictEqual(errRes, null);
	});
});

describe("balloonp*def* and balloonc* skin loading", () => {
	const origWindow = globalThis.window;
	const origDocument = globalThis.document;
	const origTauriInternals = (globalThis as Record<string, unknown>)
		.__TAURI_INTERNALS__;

	beforeEach(() => {
		if (typeof globalThis.window === "undefined") {
			(globalThis as unknown as Record<string, unknown>).window = globalThis;
		}
		if (typeof globalThis.document === "undefined") {
			const cssMap = new Map<string, string>();
			(globalThis as unknown as Record<string, unknown>).document = {
				documentElement: {
					style: {
						setProperty: (k: string, v: string) => cssMap.set(k, v),
						getPropertyValue: (k: string) => cssMap.get(k) ?? "",
						removeProperty: (k: string) => cssMap.delete(k),
					},
				},
			};
		}
	});

	afterEach(() => {
		(globalThis as unknown as Record<string, unknown>).window = origWindow;
		(globalThis as unknown as Record<string, unknown>).document = origDocument;
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			origTauriInternals;
	});
	it("resolves balloonp2def0.png + balloonp2def0.pna and sets --balloon-inputbox-bg-image from balloonc0.png + balloonc0.pna", async () => {
		const loadedFiles: string[] = [];
		const mockInvoke = vi.fn(async (cmd: string, args?: { file?: string }) => {
			if (cmd === "load_balloon_image" && args?.file) {
				loadedFiles.push(args.file);
				if (args.file === "balloonp2def0.png")
					return "data:image/png;base64,p2def0";
				if (args.file === "balloonp2def0.pna")
					return "data:image/png;base64,p2def0pna";
				if (args.file === "balloonc0.png") return "data:image/png;base64,c0";
				if (args.file === "balloonc0.pna") return "data:image/png;base64,c0pna";
			}
			return null;
		});

		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_2" } },
			invoke: mockInvoke,
		};
		if (typeof window !== "undefined") {
			(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
				metadata: { currentWindow: { label: "balloon_window_2" } },
				invoke: mockInvoke,
			};
		}
		const { loadBalloonSkinImages } = await import(
			"../../ui/ts/ghost/balloon-window/theme.js"
		);

		const bg = await loadBalloonSkinImages("ivory", 2, "right");
		expect(bg).toBe("data:image/png;base64,p2def0");
		expect(loadedFiles).toContain("balloonp2def0.png");
		expect(loadedFiles).toContain("balloonp2def0.pna");
		expect(loadedFiles).toContain("balloonc0.png");
		expect(loadedFiles).toContain("balloonc0.pna");
		expect(
			document.documentElement.style.getPropertyValue(
				"--balloon-inputbox-bg-image",
			),
		).toContain("data:image/png;base64,c0");
	});

	it("reads --balloon-use-self-alpha and --balloon-paint-black during skin loading", async () => {
		document.documentElement.style.setProperty("--balloon-use-self-alpha", "1");
		document.documentElement.style.setProperty("--balloon-paint-black", "1");

		const mockInvoke = vi.fn(async (cmd: string, args?: { file?: string }) => {
			if (cmd === "load_balloon_image" && args?.file === "balloons0.png") {
				return "data:image/png;base64,alpha_black";
			}
			return null;
		});

		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_0" } },
			invoke: mockInvoke,
		};
		(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_0" } },
			invoke: mockInvoke,
		};

		const { loadBalloonSkinImages } = await import(
			"../../ui/ts/ghost/balloon-window/theme.js"
		);
		const bg = await loadBalloonSkinImages("ivory", 0, "left");
		expect(bg).toBe("data:image/png;base64,alpha_black");
	});

	it("applies --balloon-overlay-outside, --balloon-use-input-alpha, and --balloon-disable-font", async () => {
		const cssMap = new Map<string, string>();
		const balloonBox = {
			style: {
				overflow: "",
				backgroundImage: "",
				padding: "",
				setProperty: (k: string, v: string) => cssMap.set(k, v),
				getPropertyValue: (k: string) => cssMap.get(k) ?? "",
				removeProperty: (k: string) => cssMap.delete(k),
			},
			dataset: {} as Record<string, string>,
		};
		(globalThis as unknown as Record<string, unknown>).document = {
			documentElement: {
				setAttribute: () => {},
				style: {
					setProperty: (k: string, v: string) => cssMap.set(k, v),
					getPropertyValue: (k: string) => cssMap.get(k) ?? "",
					removeProperty: (k: string) => cssMap.delete(k),
				},
			},
			body: { className: "" },
			getElementById: (id: string) =>
				id === "balloon-box" ? balloonBox : null,
			querySelector: () => null,
		};

		const mockInvoke = vi.fn(async (cmd: string) => {
			if (cmd === "balloon_manifest") {
				return {
					"font.name": "Meiryo",
					"disable.font": "1",
					use_input_alpha: "1",
					overlay_outside_balloon: "1",
				};
			}
			return null;
		});
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_0" } },
			invoke: mockInvoke,
		};
		(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_0" } },
			invoke: mockInvoke,
		};

		const { applyBalloonDescript } = await import(
			"../../ui/ts/ghost/balloon-window/theme.js"
		);
		await applyBalloonDescript({
			theme: "nam",
			scopeId: 0,
			currentUserScale: 1.0,
		});

		expect(balloonBox.style.overflow).toBe("visible");
		expect(balloonBox.dataset.overlayOutside).toBe("1");
		expect(balloonBox.dataset.useInputAlpha).toBe("1");
		expect(balloonBox.dataset.disableFont).toBe("1");
	});

	it("applies alignment, syncscale, offset, windowposition, and font.outline to balloonBox dataset", async () => {
		const cssMap = new Map<string, string>();
		const balloonBox = {
			style: {
				overflow: "",
				backgroundImage: "",
				padding: "",
				setProperty: (k: string, v: string) => cssMap.set(k, v),
				getPropertyValue: (k: string) => cssMap.get(k) ?? "",
				removeProperty: (k: string) => cssMap.delete(k),
			},
			dataset: {} as Record<string, string>,
		};
		(globalThis as unknown as Record<string, unknown>).document = {
			documentElement: {
				setAttribute: () => {},
				style: {
					setProperty: (k: string, v: string) => cssMap.set(k, v),
					getPropertyValue: (k: string) => cssMap.get(k) ?? "",
					removeProperty: (k: string) => cssMap.delete(k),
				},
			},
			body: { className: "" },
			getElementById: (id: string) =>
				id === "balloon-box" ? balloonBox : null,
			querySelector: () => null,
		};

		const mockInvoke = vi.fn(async (cmd: string) => {
			if (cmd === "balloon_manifest") {
				return {
					"balloon.alignment": "top",
					"balloon.syncscale": "1",
					"balloon.offsetx": "12",
					"balloon.offsety": "-8",
					"windowposition.x": "30",
					"windowposition.y": "40",
					"font.outline": "1",
				};
			}
			return null;
		});
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_0" } },
			invoke: mockInvoke,
		};
		(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_0" } },
			invoke: mockInvoke,
		};

		const { applyBalloonDescript } = await import(
			"../../ui/ts/ghost/balloon-window/theme.js"
		);
		await applyBalloonDescript({
			theme: "nam",
			scopeId: 0,
			currentUserScale: 1.0,
		});

		expect(balloonBox.dataset.balloonAlignment).toBe("top");
		expect(balloonBox.dataset.balloonSyncScale).toBe("1");
		expect(balloonBox.dataset.balloonOffsetX).toBe("12px");
		expect(balloonBox.dataset.balloonOffsetY).toBe("-8px");
		expect(balloonBox.dataset.balloonWindowPosX).toBe("30px");
		expect(balloonBox.dataset.balloonWindowPosY).toBe("40px");
		expect(balloonBox.dataset.fontOutline).toBe("1");
	});

	it("falls back to balloonk0.png when balloonp2def* is absent and clears --balloon-inputbox-bg-image when balloonc0.png is absent", async () => {
		const loadedFiles: string[] = [];
		const mockInvoke = vi.fn(async (cmd: string, args?: { file?: string }) => {
			if (cmd === "load_balloon_image" && args?.file) {
				loadedFiles.push(args.file);
				if (args.file === "balloonk0.png") return "data:image/png;base64,k0";
			}
			return null;
		});

		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "balloon_window_2" } },
			invoke: mockInvoke,
		};
		if (typeof window !== "undefined") {
			(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
				metadata: { currentWindow: { label: "balloon_window_2" } },
				invoke: mockInvoke,
			};
		}
		const { loadBalloonSkinImages } = await import(
			"../../ui/ts/ghost/balloon-window/theme.js"
		);

		const bg = await loadBalloonSkinImages("ivory", 2, "auto");
		expect(bg).toBe("data:image/png;base64,k0");
		expect(loadedFiles).toContain("balloonp2def0.png");
		expect(loadedFiles).toContain("balloonk0.png");
		expect(
			document.documentElement.style.getPropertyValue(
				"--balloon-inputbox-bg-image",
			),
		).toBe("");
	});
});
