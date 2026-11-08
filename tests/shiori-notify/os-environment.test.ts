/**
 * @file tests/shiori-notify/os-environment.test.ts
 * @description Tests for UKADOC OS environment, device status, and external notifications.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
	createMockController,
	type MockIpcCall,
	setupMockTauriIpc,
	teardownMockTauriIpc,
} from "./helpers.js";

describe("SHIORI OS Environment & Status Notifications", () => {
	let calls: MockIpcCall[];

	beforeEach(() => {
		calls = [];
		teardownMockTauriIpc();
		setupMockTauriIpc(calls);
	});

	afterEach(() => {
		teardownMockTauriIpc();
	});

	it("notifies OS, self, and balloon information", async () => {
		const controller = createMockController();

		await controller.notifyOSInfo("Linux", "6.1");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifyOSInfo");
		assert.equal(calls[0].args.references?.[0], "Linux");

		calls.length = 0;
		await controller.notifySelfInfo("Ghost1", "master", "default");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifySelfInfo");
		assert.equal(calls[0].args.references?.[0], "Ghost1");

		calls.length = 0;
		await controller.notifyBalloonInfo("default", "assets/balloon/default");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifyBalloonInfo");
		assert.equal(calls[0].args.references?.[0], "default");
	});

	it("notifies shell, dressup, user, font, and holiday information", async () => {
		const controller = createMockController();

		await controller.notifyShellInfo("master", "shell/master");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifyShellInfo");
		assert.equal(calls[0].args.references?.[0], "master");

		calls.length = 0;
		await controller.notifyDressupInfo(["head,hat,1"]);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifyDressupInfo");

		calls.length = 0;
		await controller.notifyUserInfo("User", "2000-01-01", "other");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifyUserInfo");

		calls.length = 0;
		await controller.notifyFontInfo("Monospace", 14);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifyFontInfo");

		calls.length = 0;
		await controller.notifyHolidayInfo("New Year", "2026-01-01");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifyHolidayInfo");

		calls.length = 0;
		await controller.notifyInternationalInfo("ja-JP", "Asia/Tokyo");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnNotifyInternationalInfo");
	});

	it("notifies battery, OS theme, screensaver, device change, and session lock", async () => {
		const controller = createMockController();

		await controller.notifyBatteryState("critical", 5, "0");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnBatteryCritical");

		calls.length = 0;
		await controller.notifyOsEnvironment("OnDarkTheme", ["1"]);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnDarkTheme");

		calls.length = 0;
		await controller.notifyScreenSaver(true);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnScreenSaverStart");

		calls.length = 0;
		await controller.notifyDeviceChange("arrival", "USB Device");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnDeviceArrival");

		calls.length = 0;
		await controller.notifySessionState("lock");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnSessionLock");

		calls.length = 0;
		await controller.notifySystemStatus("OnCPULoadHigh", ["95"]);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnCPULoadHigh");
	});

	it("notifies vanish, URL dropped, and headline RSS events", async () => {
		const controller = createMockController();

		await controller.notifyVanishEvent("OnVanished", ["Ghost1"]);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnVanished");

		calls.length = 0;
		await controller.notifyUrlDropEvent("OnURLDropped", [
			"https://example.com",
		]);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnURLDropped");

		calls.length = 0;
		await controller.notifyHeadlineRssEvent("OnHeadlinesenseBegin", ["Feed1"]);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "OnHeadlinesenseBegin");
	});
});
