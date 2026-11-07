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

test("shioriNotifyMethods covers lifecycle, dialog, balloon, surface, and overlap events", async () => {
	const calls: any[] = [];
	const controller = {
		...shioriNotifyMethods,
		app: { ghostId: "main" },
	};

	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string, args: any) => {
			calls.push({ cmd, args });
			return "ok";
		},
		transformCallback: (cb: any) => cb,
	};
	globalThis.window = globalThis;

	// Dialogbox events
	await controller.sendGhostTermsAccept("GhostA");
	assert.equal(calls.at(-1).args.event, "OnGhostTermsAccept");
	assert.equal(calls.at(-1).args.references[0], "GhostA");

	await controller.sendGhostTermsDecline("GhostA");
	assert.equal(calls.at(-1).args.event, "OnGhostTermsDecline");
	assert.equal(calls.at(-1).args.references[0], "GhostA");

	// Balloon events
	await controller.sendBalloonClose(0, "timeout");
	assert.equal(calls.at(-1).args.event, "OnBalloonClose");
	assert.deepEqual(calls.at(-1).args.references, ["0", "timeout"]);

	await controller.sendBalloonBreak(1, "user");
	assert.equal(calls.at(-1).args.event, "OnBalloonBreak");
	assert.deepEqual(calls.at(-1).args.references, ["1", "user"]);

	// Surface events
	await controller.sendSurfaceChange(0, 10);
	assert.equal(calls.at(-1).args.event, "OnSurfaceChange");
	assert.deepEqual(calls.at(-1).args.references, ["0", "10"]);

	await controller.sendOtherSurfaceChange("GhostB", 0, 5);
	assert.equal(calls.at(-1).args.event, "OnOtherSurfaceChange");
	assert.deepEqual(calls.at(-1).args.references, ["GhostB", "0", "5"]);

	// Boot-close-change lifecycle events
	await controller.sendGhostChanging("Ghost2", "Ghost1", "manual");
	assert.equal(calls.at(-1).args.event, "OnGhostChanging");
	assert.deepEqual(calls.at(-1).args.references, [
		"Ghost2",
		"manual",
		"Ghost1",
	]);

	await controller.sendGhostChanged("Ghost2", "Ghost1");
	assert.equal(calls.at(-1).args.event, "OnGhostChanged");
	assert.deepEqual(calls.at(-1).args.references, ["Ghost2", "Ghost1"]);

	await controller.sendShellChanged("alt", "master");
	assert.equal(calls.at(-1).args.event, "OnShellChanged");
	assert.deepEqual(calls.at(-1).args.references, ["alt", "master"]);

	await controller.sendCloseAll("user");
	assert.equal(calls.at(-1).args.event, "OnCloseAll");
	assert.deepEqual(calls.at(-1).args.references, ["user"]);

	await controller.sendGhostCalling("GhostB");
	assert.equal(calls.at(-1).args.event, "OnGhostCalling");
	assert.deepEqual(calls.at(-1).args.references, ["GhostB"]);

	await controller.sendGhostCalled("GhostA");
	assert.equal(calls.at(-1).args.event, "OnGhostCalled");
	assert.deepEqual(calls.at(-1).args.references, ["GhostA"]);

	await controller.sendGhostCallComplete("GhostB");
	assert.equal(calls.at(-1).args.event, "OnGhostCallComplete");
	assert.deepEqual(calls.at(-1).args.references, ["GhostB"]);

	await controller.sendOtherGhostBooted("GhostC");
	assert.equal(calls.at(-1).args.event, "OnOtherGhostBooted");
	assert.deepEqual(calls.at(-1).args.references, ["GhostC"]);

	await controller.sendOtherGhostChanged("GhostC", "GhostD");
	assert.equal(calls.at(-1).args.event, "OnOtherGhostChanged");
	assert.deepEqual(calls.at(-1).args.references, ["GhostC", "GhostD"]);

	await controller.sendOtherGhostClosed("GhostC");
	assert.equal(calls.at(-1).args.event, "OnOtherGhostClosed");
	assert.deepEqual(calls.at(-1).args.references, ["GhostC"]);

	await controller.sendSysSuspend();
	assert.equal(calls.at(-1).args.event, "OnSysSuspend");

	await controller.sendSysResume();
	assert.equal(calls.at(-1).args.event, "OnSysResume");

	await controller.sendDestroy();
	assert.equal(calls.at(-1).args.event, "OnDestroy");

	await controller.sendInitialize();
	assert.equal(calls.at(-1).args.event, "OnInitialize");

	await controller.sendVirtualDesktopChanged(2);
	assert.equal(calls.at(-1).args.event, "OnVirtualDesktopChanged");
	assert.deepEqual(calls.at(-1).args.references, ["2"]);

	await controller.sendFullScreenAppMinimize();
	assert.equal(calls.at(-1).args.event, "OnFullScreenAppMinimize");

	await controller.sendFullScreenAppRestore();
	assert.equal(calls.at(-1).args.event, "OnFullScreenAppRestore");

	await controller.sendBasewareUpdating();
	assert.equal(calls.at(-1).args.event, "OnBasewareUpdating");

	await controller.sendBasewareUpdated();
	assert.equal(calls.at(-1).args.event, "OnBasewareUpdated");

	await controller.sendCacheSuspend();
	assert.equal(calls.at(-1).args.event, "OnCacheSuspend");

	await controller.sendCacheRestore();
	assert.equal(calls.at(-1).args.event, "OnCacheRestore");

	// Overlap events
	await controller.sendOverlap(0, 1, "0,0,100,100");
	assert.equal(calls.at(-1).args.event, "OnOverlap");
	assert.deepEqual(calls.at(-1).args.references, ["0", "1", "0,0,100,100"]);

	await controller.sendOffscreen(0, "0,0,100,100");
	assert.equal(calls.at(-1).args.event, "OnOffscreen");
	assert.deepEqual(calls.at(-1).args.references, ["0", "0,0,100,100"]);

	await controller.sendOtherOverlap("GhostB", "0,0,100,100");
	assert.equal(calls.at(-1).args.event, "OnOtherOverlap");
	assert.deepEqual(calls.at(-1).args.references, ["GhostB", "0,0,100,100"]);

	await controller.sendOtherOffscreen("GhostB", "0,0,100,100");
	assert.equal(calls.at(-1).args.event, "OnOtherOffscreen");
	assert.deepEqual(calls.at(-1).args.references, ["GhostB", "0,0,100,100"]);

	delete (globalThis as any).__TAURI_INTERNALS__;
});
