/**
 * @file tests/shiori-notify/lifecycle.test.ts
 * @description Tests for ghost/shell switching, lifecycle, and system state notifications.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
	createMockController,
	type MockIpcCall,
	setupMockTauriIpc,
	teardownMockTauriIpc,
} from "./helpers.js";

describe("SHIORI Lifecycle & System State Notifications", () => {
	let calls: MockIpcCall[];

	beforeEach(() => {
		calls = [];
		teardownMockTauriIpc();
		setupMockTauriIpc(calls);
	});

	afterEach(() => {
		teardownMockTauriIpc();
	});

	it("dispatches ghost switching and changed notifications", async () => {
		const controller = createMockController();

		await controller.sendGhostChanging("Ghost2", "Ghost1", "manual");
		assert.equal(calls.at(-1)?.args.event, "OnGhostChanging");
		assert.deepEqual(calls.at(-1)?.args.references, [
			"Ghost2",
			"manual",
			"Ghost1",
		]);

		await controller.sendGhostChanged("Ghost2", "Ghost1");
		assert.equal(calls.at(-1)?.args.event, "OnGhostChanged");
		assert.deepEqual(calls.at(-1)?.args.references, ["Ghost2", "Ghost1"]);

		await controller.sendShellChanged("alt", "master");
		assert.equal(calls.at(-1)?.args.event, "OnShellChanged");
		assert.deepEqual(calls.at(-1)?.args.references, ["alt", "master"]);

		await controller.sendCloseAll("user");
		assert.equal(calls.at(-1)?.args.event, "OnCloseAll");
		assert.deepEqual(calls.at(-1)?.args.references, ["user"]);
	});

	it("dispatches multi-ghost calling and remote ghost lifecycle notifications", async () => {
		const controller = createMockController();

		await controller.sendGhostCalling("GhostB");
		assert.equal(calls.at(-1)?.args.event, "OnGhostCalling");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostB"]);

		await controller.sendGhostCalled("GhostA");
		assert.equal(calls.at(-1)?.args.event, "OnGhostCalled");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostA"]);

		await controller.sendGhostCallComplete("GhostB");
		assert.equal(calls.at(-1)?.args.event, "OnGhostCallComplete");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostB"]);

		await controller.sendOtherGhostBooted("GhostC");
		assert.equal(calls.at(-1)?.args.event, "OnOtherGhostBooted");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostC"]);

		await controller.sendOtherGhostChanged("GhostC", "GhostD");
		assert.equal(calls.at(-1)?.args.event, "OnOtherGhostChanged");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostC", "GhostD"]);

		await controller.sendOtherGhostClosed("GhostC");
		assert.equal(calls.at(-1)?.args.event, "OnOtherGhostClosed");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostC"]);
	});

	it("dispatches system suspend, resume, destroy, and initialize notifications", async () => {
		const controller = createMockController();

		await controller.sendSysSuspend();
		assert.equal(calls.at(-1)?.args.event, "OnSysSuspend");

		await controller.sendSysResume();
		assert.equal(calls.at(-1)?.args.event, "OnSysResume");

		await controller.sendDestroy();
		assert.equal(calls.at(-1)?.args.event, "OnDestroy");

		await controller.sendInitialize();
		assert.equal(calls.at(-1)?.args.event, "OnInitialize");
	});

	it("dispatches virtual desktop, fullscreen app, baseware, and cache lifecycle notifications", async () => {
		const controller = createMockController();

		await controller.sendVirtualDesktopChanged(2);
		assert.equal(calls.at(-1)?.args.event, "OnVirtualDesktopChanged");
		assert.deepEqual(calls.at(-1)?.args.references, ["2"]);

		await controller.sendFullScreenAppMinimize();
		assert.equal(calls.at(-1)?.args.event, "OnFullScreenAppMinimize");

		await controller.sendFullScreenAppRestore();
		assert.equal(calls.at(-1)?.args.event, "OnFullScreenAppRestore");

		await controller.sendBasewareUpdating();
		assert.equal(calls.at(-1)?.args.event, "OnBasewareUpdating");

		await controller.sendBasewareUpdated();
		assert.equal(calls.at(-1)?.args.event, "OnBasewareUpdated");

		await controller.sendCacheSuspend();
		assert.equal(calls.at(-1)?.args.event, "OnCacheSuspend");

		await controller.sendCacheRestore();
		assert.equal(calls.at(-1)?.args.event, "OnCacheRestore");
	});
});
