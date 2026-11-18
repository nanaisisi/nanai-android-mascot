import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { SakuraScriptPlayer } from "../ui/ts/ghost/sakura-script.js";

describe("SakuraScriptPlayer Balloon Display Integration", () => {
	it("initializes and handles script loading and play state", () => {
		const player = new SakuraScriptPlayer();
		assert.equal(player.isPlaying, false);

		player.loadScript("\\0Hello World\\e");
		assert.equal(player.lastScript, "\\0Hello World\\e");

		player.stop();
		assert.equal(player.isPlaying, false);
	});

	it("updates balloon display element when processing StepOutput", () => {
		const balloonText = {
			textContent: "",
			innerHTML: "",
			appendChild(node: any) {
				this.textContent += node.textContent || "";
			},
		};
		const balloonDisplay = { style: { display: "none" } };
		const keroBalloonText = {
			textContent: "",
			innerHTML: "",
			appendChild(node: any) {
				this.textContent += node.textContent || "";
			},
		};
		const keroBalloonDisplay = { style: { display: "none" } };
		const keroSlot = { style: { display: "none" } };

		const mockApp = {
			elements: {
				balloonText,
				balloonDisplay,
				keroBalloonText,
				keroBalloonDisplay,
				keroSlot,
			},
			currentBalloonTheme: "default",
			ghostController: {
				updateSurface(_id: number, _scope: number) {},
			},
		};

		const player = new SakuraScriptPlayer("", mockApp);

		// 1. Process TextAppend for scope 0 (sakura)
		(player as any).appendTextToBalloon(mockApp, 0, "Hello Sakura");
		assert.equal(balloonDisplay.style.display, "block");
		assert.ok(balloonText.textContent.includes("Hello Sakura"));

		// 2. Process TextAppend for scope 1 (kero)
		(player as any).appendTextToBalloon(mockApp, 1, "Hello Kero");
		assert.equal(keroDisplayOrSlotStyle(keroBalloonDisplay), "block");
		assert.equal(keroSlot.style.display, "block");
		assert.ok(keroBalloonText.textContent.includes("Hello Kero"));

		// 3. Clear balloon
		(player as any).clearBalloon(mockApp, 0);
		assert.equal(balloonDisplay.style.display, "none");
		assert.equal(balloonText.textContent, "");
	});

	it("hides balloon instead of showing it when appended text is whitespace-only", async () => {
		const invoked: Array<{ cmd: string; args: Record<string, unknown> }> = [];
		const emitted: Array<{ event: string; payload: unknown }> = [];
		const prevWindow = (globalThis as { window?: unknown }).window;
		const prevInternals = (globalThis as { __TAURI_INTERNALS__?: unknown })
			.__TAURI_INTERNALS__;

		(globalThis as { window?: unknown }).window = globalThis;
		(globalThis as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {
			invoke: async (cmd: string, args: Record<string, unknown>) => {
				invoked.push({ cmd, args });
				if (cmd === "plugin:event|emit") {
					emitted.push({
						event: String(args.event),
						payload: args.payload,
					});
				}
			},
			transformCallback: (cb: unknown) => cb,
		};

		try {
			const balloonText = {
				textContent: "",
				innerHTML: "",
				appendChild(node: { textContent?: string | null }) {
					this.textContent += node.textContent || "";
				},
			};
			const balloonDisplay = { style: { display: "block" } };
			const mockApp = {
				elements: {
					balloonText,
					balloonDisplay,
				},
				currentBalloonTheme: "default",
			};

			const player = new SakuraScriptPlayer("", mockApp) as unknown as {
				appendTextToBalloon(app: unknown, scope: number, text: string): void;
			};
			player.appendTextToBalloon(mockApp, 0, "   \n\t ");
			await Promise.resolve();

			assert.equal(balloonDisplay.style.display, "none");
			assert.equal(balloonText.innerHTML, "");
			assert.equal(
				invoked.some((entry) => entry.cmd === "show_balloon_window"),
				false,
			);
			assert.equal(
				invoked.some((entry) => entry.cmd === "hide_balloon_window"),
				true,
			);
			assert.deepEqual(
				emitted.filter((e) => e.event === "update-balloon-content-0"),
				[
					{
						event: "update-balloon-content-0",
						payload: { html: "", theme: "default" },
					},
				],
			);
		} finally {
			if (prevInternals === undefined) {
				delete (globalThis as { __TAURI_INTERNALS__?: unknown })
					.__TAURI_INTERNALS__;
			} else {
				(globalThis as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ =
					prevInternals;
			}
			if (prevWindow === undefined) {
				delete (globalThis as { window?: unknown }).window;
			} else {
				(globalThis as { window?: unknown }).window = prevWindow;
			}
		}
	});
});

function keroDisplayOrSlotStyle(el: any) {
	return el?.style?.display;
}
