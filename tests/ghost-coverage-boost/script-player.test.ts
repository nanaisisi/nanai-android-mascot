import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";

import { SakuraScriptPlayer } from "../../ui/js/ghost/sakura-script.js";

describe("SakuraScriptPlayer lifecycle & edge cases", () => {
	it("exercises destroy(), sleep cancellation, scheduleSurfaceRestore error handling, and keydown variants in waitForClickOrTimeout", async () => {
		vi.useFakeTimers();

		const eventsSent = [];
		const mockApp = {
			ghostController: {
				sendShioriEvent: async (ev, args) => {
					if (ev === "OnSurfaceRestoreThrow") {
						throw new Error("Restore error");
					}
					eventsSent.push({ ev, args });
				},
			},
			elements: {
				balloonDisplay: { style: {} },
				keroBalloonDisplay: { style: {} },
				balloonText: { innerHTML: "", appendChild() {} },
				keroBalloonText: { innerHTML: "", appendChild() {} },
			},
		};

		const player = new SakuraScriptPlayer(mockApp);

		// 1. sleep with cancellation via destroy()
		let sleepResolved = false;
		const sleepPromise = player.sleep(5000).then(() => {
			sleepResolved = true;
		});

		// Setup timers and active state
		player._restoreTimer = setTimeout(() => {}, 10000);
		player.choiceTimeoutTimer = setTimeout(() => {}, 10000);
		player.balloonTimeoutTimer = setTimeout(() => {}, 10000);
		let pauseResolved = false;
		player._pauseResolver = () => {
			pauseResolved = true;
		};

		// Call destroy()
		player.destroy();
		assert.strictEqual(player.isPlaying, false);
		assert.strictEqual(player._restoreTimer, null);
		assert.strictEqual(player.choiceTimeoutTimer, null);
		assert.strictEqual(player.balloonTimeoutTimer, null);
		assert.strictEqual(pauseResolved, true);

		// Sleep promise should be resolved immediately by cancel
		await sleepPromise;
		assert.strictEqual(sleepResolved, true);

		// 2. onChoiceTimeout error ignoring
		player.choiceTimeoutTimer = setTimeout(() => {}, 1000);
		player.lastScript = "\\0Hello";
		mockApp.ghostController.sendShioriEvent = async () => {
			throw new Error("Network offline");
		};
		await player.onChoiceTimeout();
		assert.strictEqual(player.choiceTimeoutTimer, null);

		// 3. scheduleSurfaceRestore mismatch and exception
		player.playbackId = 10;
		player.isPlaying = false;
		player.scheduleSurfaceRestore(9); // Mismatched ID, should not send
		vi.advanceTimersByTime(8500);
		await vi.advanceTimersByTimeAsync(0);

		// Now matching ID with throwing event
		player.playbackId = 12;
		mockApp.ghostController.sendShioriEvent = async () => {
			throw new Error("Restore boom");
		};
		player.scheduleSurfaceRestore(12);
		vi.advanceTimersByTime(8500);
		await vi.advanceTimersByTimeAsync(0);

		// 4. waitForClickOrTimeout keydown Space, Escape and timeout
		const docListeners = {};
		globalThis.document = {
			addEventListener: (t, cb) => {
				docListeners[t] = cb;
			},
			removeEventListener: () => {},
		};

		// Space key
		const waitPromiseSpace = player.waitForClickOrTimeout(null, 1000);
		docListeners.keydown?.({ key: " " });
		await waitPromiseSpace;

		// Escape key
		const waitPromiseEsc = player.waitForClickOrTimeout(null, 1000);
		docListeners.keydown?.({ key: "Escape" });
		await waitPromiseEsc;

		// Other key (ignored) followed by timeout
		const waitPromiseTimeout = player.waitForClickOrTimeout(null, 500);
		docListeners.keydown?.({ key: "a" });
		vi.advanceTimersByTime(600);
		await waitPromiseTimeout;

		vi.useRealTimers();
	});
});
