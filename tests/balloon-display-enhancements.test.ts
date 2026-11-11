import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { handlePause } from "../ui/ts/ghost/sakura-play/handlers/control.js";
import { createEl, setupMockDom } from "./sakura-play/helpers.js";

setupMockDom();

describe("Balloon Display Enhancements (Slot-10)", () => {
	it("inserts clickwait marker during pause and removes it afterwards", async () => {
		const balloonText = createEl("div");
		const childSpan = createEl("span");
		childSpan.textContent = "Hello";
		balloonText.appendChild(childSpan);

		let flushed = false;
		let pauseNotified = false;
		let scheduledSync = false;

		const context = {
			currentBalloonText: balloonText,
			sakuraText: balloonText,
			sakuraDisplay: createEl("div"),
			keroDisplay: createEl("div"),
			isQuickMode: false,
			flushDesktopBalloon: () => {
				flushed = true;
			},
			scheduleDesktopBalloonSync: () => {
				scheduledSync = true;
			},
		};

		// Define parentNode on created marker elements so removeChild works
		const origCreateElement = globalThis.document.createElement;
		globalThis.document.createElement = (tag: string) => {
			const el = origCreateElement(tag);
			el.parentNode = balloonText;
			return el;
		};
		balloonText.removeChild = (child: unknown) => {
			const idx = balloonText.children.indexOf(child);
			if (idx !== -1) {
				balloonText.children.splice(idx, 1);
			}
		};

		const player = {
			skipRequested: false,
			currentScope: 0,
			playbackController: {
				notifyPause: () => {
					pauseNotified = true;
				},
			},
			waitForClickOrTimeout: async () => {
				// While waiting, the marker should exist in the DOM
				const marker = balloonText.children.find(
					(c: { className?: string }) => c.className === "clickwait-marker",
				);
				assert.ok(marker, "clickwait marker should be present during pause");
				assert.equal(marker["aria-hidden"], "true");
			},
		};

		const token = { noClear: true };
		try {
			await handlePause(player, {}, token, context);
		} finally {
			globalThis.document.createElement = origCreateElement;
		}

		assert.ok(flushed);
		assert.ok(pauseNotified);
		assert.ok(scheduledSync);

		// After pause finishes, marker must be removed
		const markerAfter = balloonText.children.find(
			(c: { className?: string }) => c.className === "clickwait-marker",
		);
		assert.equal(
			markerAfter,
			undefined,
			"clickwait marker should be removed after pause",
		);
	});

	it("removes clickwait marker and clears text when noClear is false", async () => {
		const balloonText = createEl("div");
		balloonText.innerHTML = "<span>Initial text</span>";

		const context = {
			currentBalloonText: balloonText,
			sakuraText: balloonText,
			sakuraDisplay: createEl("div"),
			keroDisplay: createEl("div"),
			isQuickMode: false,
			flushDesktopBalloon: () => {},
			scheduleDesktopBalloonSync: () => {},
		};

		const player = {
			skipRequested: false,
			currentScope: 0,
			playbackController: {
				notifyPause: () => {},
			},
			waitForClickOrTimeout: async () => {},
		};

		const token = { noClear: false };
		await handlePause(player, {}, token, context);

		assert.equal(balloonText.innerHTML, "");
	});
});
