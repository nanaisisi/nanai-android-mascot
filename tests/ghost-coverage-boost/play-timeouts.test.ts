import assert from "node:assert/strict";
import { describe, it, vi } from "vitest";

import { SakuraScriptPlayer } from "../../ui/js/ghost/sakura-script.js";

describe("sakura-play timeouts", () => {
	it("exercises playScript choiceTimeout and balloonTimeout timers and OnBalloonTimeout notification", async () => {
		vi.useFakeTimers();

		const eventsSent = [];
		const mockApp = {
			elements: {
				balloonDisplay: { style: { display: "block" } },
				keroBalloonDisplay: { style: { display: "block" } },
				balloonText: { innerHTML: "", appendChild() {} },
				keroBalloonText: { innerHTML: "", appendChild() {} },
			},
			ghostController: {
				sendShioriEvent: async (ev, args) => {
					eventsSent.push({ ev, args });
				},
			},
			surfaceManager: {
				onCharSpoken: () => {},
				onTalkEnd: () => {},
				onScriptEnd: () => {},
			},
		};

		const player = new SakuraScriptPlayer(mockApp);

		globalThis.document = {
			createElement: () => ({
				style: {},
				appendChild: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				setAttribute: () => {},
				remove: () => {},
				focus: () => {},
			}),
		};

		// 1. playScript with choiceTimeout
		player.choiceTimeout = 3000;
		player.parse = async () => [
			{ type: "scope", value: 0 },
			{ type: "choice", id: "c1", text: "Choice 1" },
		];
		const playPromise1 = player.play("\\0\\q[Choice 1,c1]");
		await vi.advanceTimersByTimeAsync(100);
		await playPromise1;
		assert.ok(player.choiceTimeoutTimer != null);

		// Trigger choice timeout timer
		vi.advanceTimersByTime(3100);
		await vi.advanceTimersByTimeAsync(0);
		assert.ok(eventsSent.some((e) => e.ev === "OnChoiceTimeout"));

		// 2. playScript with balloonTimeout (no choices)
		player.choiceTimeout = 0;
		player.balloonTimeout = 4000;
		player.parse = async () => [
			{ type: "scope", value: 0 },
			{ type: "char", value: "A" },
		];
		const playPromise2 = player.play("\\0Hello");
		await vi.advanceTimersByTimeAsync(100);
		await playPromise2;
		assert.ok(player.balloonTimeoutTimer != null);

		// Trigger balloon timeout timer
		vi.advanceTimersByTime(4100);
		await vi.advanceTimersByTimeAsync(0);
		assert.strictEqual(mockApp.elements.balloonDisplay.style.display, "none");
		assert.strictEqual(
			mockApp.elements.keroBalloonDisplay.style.display,
			"none",
		);
		assert.ok(eventsSent.some((e) => e.ev === "OnBalloonTimeout"));

		// 3. Clear existing timers branch: re-running playScript clears previous timers
		player.balloonTimeoutTimer = setTimeout(() => {}, 5000);
		player.choiceTimeoutTimer = setTimeout(() => {}, 5000);
		player.balloonTimeout = 0;
		player.choiceTimeout = 0;
		const playPromise3 = player.play("\\0Next");
		await vi.runAllTimersAsync();
		await playPromise3;

		vi.useRealTimers();
	});
});
