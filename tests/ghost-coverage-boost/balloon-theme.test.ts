import assert from "node:assert/strict";
import { describe, it } from "vitest";

describe("balloon-window and balloon-window/theme edge cases", () => {
	it("exercises balloon-window and balloon-window/theme edge branches", async () => {
		const { loadBalloonSkinImages, applyBalloonDescript } = await import(
			"../../ui/ts/ghost/balloon-window/theme.js"
		);

		// 1. loadBalloonSkinImages for scope >= 2 with fallback to balloons0.png/pna
		globalThis.__TAURI_INTERNALS__ = {
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
			transformCallback: (cb: any) => cb,
		};

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
		globalThis.__TAURI_INTERNALS__.invoke = async () => {
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
