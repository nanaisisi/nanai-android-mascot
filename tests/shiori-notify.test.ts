import assert from "node:assert/strict";
import { test } from "vitest";

const { shioriNotifyMethods } = await import("../ui/js/ghost/shiori-notify.js");

test("shioriNotifyMethods covers sendShioriNotify and sendBootNotifyEvents", async () => {
	const calls = [];
	const controller = {
		...shioriNotifyMethods,
		app: { ghostId: "main" },
		currentGhost: {
			name: "Ghost1",
			sakura_name: "Sakura1",
			kero_name: "Kero1",
			path: "/assets/ghost/ghost1",
		},
		ghosts: [
			{
				name: "Ghost1",
				sakura_name: "Sakura1",
				kero_name: "Kero1",
				path: "/assets/ghost/ghost1",
			},
			{
				name: "Ghost2",
				sakura_name: "Sakura2",
				kero_name: "",
				path: "/assets/ghost/ghost2",
			},
		],
		shells: ["master", "alt"],
		balloons: ["default", "modern"],
		balloonPaths: ["assets/balloon/default", "assets/balloon/modern"],
	};

	// 1. Non-Tauri environment (sendShioriNotify / sendBootNotifyEvents)
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	const res1 = await controller.sendShioriNotify("test", [1, 2]);
	assert.equal(res1, null);
	await controller.sendBootNotifyEvents();

	// 2. Tauri environment
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, args) => {
			calls.push({ cmd, args });
			if (cmd === "send_shiori_notify") return "ok";
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	calls.length = 0;
	await controller.sendShioriNotify("test", [10, "abc"]);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.references[0], "10");

	// 3. sendBootNotifyEvents with full ghost/shell metadata
	calls.length = 0;
	await controller.sendBootNotifyEvents();
	assert.ok(calls.some((c) => c.args.event === "capability"));
	assert.ok(calls.some((c) => c.args.event === "installedghostname"));
	assert.ok(calls.some((c) => c.args.event === "installedkeroname"));
	assert.ok(calls.some((c) => c.args.event === "installedshellname"));
	assert.ok(calls.some((c) => c.args.event === "ghostpathlist"));
	assert.ok(calls.some((c) => c.args.event === "installedballoonname"));
	assert.ok(calls.some((c) => c.args.event === "balloonpathlist"));
	assert.ok(calls.some((c) => c.args.event === "basewareversion"));
	assert.ok(calls.some((c) => c.args.event === "uniqueid"));

	// capability 単体送信の確認
	calls.length = 0;
	await controller.sendCapabilityNotify();
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.event, "capability");
	assert.ok(calls[0].args.references.includes("request.status"));
	assert.ok(calls[0].args.references.includes("response.value"));

	// Extended Notify helper methods
	calls.length = 0;
	await controller.notifyOSInfo("Linux", "6.1");
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.event, "OnNotifyOSInfo");
	assert.equal(calls[0].args.references[0], "Linux");

	calls.length = 0;
	await controller.notifySelfInfo("Ghost1", "master", "default");
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.event, "OnNotifySelfInfo");
	assert.equal(calls[0].args.references[0], "Ghost1");

	calls.length = 0;
	await controller.notifyBalloonInfo("default", "assets/balloon/default");
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.event, "OnNotifyBalloonInfo");
	assert.equal(calls[0].args.references[0], "default");

	// New Cycle 6 UKADOC Notify & OS State helper methods
	calls.length = 0;
	await controller.notifyShellInfo("master", "shell/master");
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.event, "OnNotifyShellInfo");
	assert.equal(calls[0].args.references[0], "master");

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

	calls.length = 0;
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

	calls.length = 0;
	await controller.notifyVanishEvent("OnVanished", ["Ghost1"]);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.event, "OnVanished");

	calls.length = 0;
	await controller.notifyUrlDropEvent("OnURLDropped", ["https://example.com"]);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.event, "OnURLDropped");

	calls.length = 0;
	await controller.notifyHeadlineRssEvent("OnHeadlinesenseBegin", ["Feed1"]);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].args.event, "OnHeadlinesenseBegin");

	// 4. sendShioriNotify with invoke error (catch branch)
	globalThis.__TAURI_INTERNALS__.invoke = async () => {
		throw new Error("Notify fail");
	};
	const res2 = await controller.sendShioriNotify("fail_event", [1]);
	assert.equal(res2, null);

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
