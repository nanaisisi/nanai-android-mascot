import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { settingsMethods } from "../ui/ts/core/app-settings.js";
import { shioriNotifyMethods } from "../ui/ts/ghost/shiori-notify.js";

describe("Balloon SHIORI Events and Property Integration (Slot-10)", () => {
	it("sends OnBalloonClose and OnBalloonBreak notifications", async () => {
		const sentEvents: Array<{ event: string; references: string[] }> = [];
		const mockContext = {
			...shioriNotifyMethods,
			sendShioriNotify(event: string, references: Array<string | number>) {
				sentEvents.push({
					event,
					references: references.map(String),
				});
				return Promise.resolve("OK");
			},
		};

		await mockContext.sendBalloonCloseNotify("\\0Hello\\e", 0);
		assert.equal(sentEvents.length, 1);
		assert.equal(sentEvents[0].event, "OnBalloonClose");
		assert.deepEqual(sentEvents[0].references, ["\\0Hello\\e", "0"]);

		await mockContext.sendBalloonBreakNotify("\\0Interrupted\\e", 1);
		assert.equal(sentEvents.length, 2);
		assert.equal(sentEvents[1].event, "OnBalloonBreak");
		assert.deepEqual(sentEvents[1].references, ["\\0Interrupted\\e", "1"]);
	});

	it("triggers OnBalloonClose or OnBalloonBreak in hideBalloon", () => {
		const sentNotifications: Array<{
			type: string;
			script: string;
			scopeId: number | string;
		}> = [];
		const mockApp = {
			elements: {
				balloonDisplay: { style: { display: "block" } },
			},
			sakuraPlayer: {
				lastScript: "\\0Test dialogue\\e",
			},
			ghostController: {
				sendBalloonCloseNotify(script: string, scopeId: number | string) {
					sentNotifications.push({ type: "close", script, scopeId });
				},
				sendBalloonBreakNotify(script: string, scopeId: number | string) {
					sentNotifications.push({ type: "break", script, scopeId });
				},
			},
			...settingsMethods,
		};

		// 1. Hide balloon with default close reason
		mockApp.hideBalloon(0);
		assert.equal(mockApp.elements.balloonDisplay.style.display, "none");
		assert.equal(sentNotifications.length, 1);
		assert.equal(sentNotifications[0].type, "close");
		assert.equal(sentNotifications[0].script, "\\0Test dialogue\\e");
		assert.equal(sentNotifications[0].scopeId, 0);

		// 2. Hide balloon with break reason
		mockApp.hideBalloon(1, "break");
		assert.equal(sentNotifications.length, 2);
		assert.equal(sentNotifications[1].type, "break");
		assert.equal(sentNotifications[1].script, "\\0Test dialogue\\e");
		assert.equal(sentNotifications[1].scopeId, 1);

		// 3. Hide balloon with silent or timeout reason (no close/break notification)
		mockApp.hideBalloon(0, "timeout");
		mockApp.hideBalloon(0, "silent");
		assert.equal(sentNotifications.length, 2);
	});
});
