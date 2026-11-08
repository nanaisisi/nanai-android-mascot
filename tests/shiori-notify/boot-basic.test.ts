/**
 * @file tests/shiori-notify/boot-basic.test.ts
 * @description Tests for basic SHIORI notify IPC communication and boot events.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
	createMockController,
	type MockIpcCall,
	setupMockTauriIpc,
	teardownMockTauriIpc,
} from "./helpers.js";

describe("SHIORI Boot & Basic Notify Communication", () => {
	let calls: MockIpcCall[];

	beforeEach(() => {
		calls = [];
		teardownMockTauriIpc();
	});

	afterEach(() => {
		teardownMockTauriIpc();
	});

	it("returns null when Tauri is not available for sendShioriNotify", async () => {
		const controller = createMockController();
		const res = await controller.sendShioriNotify("test", [1, 2]);
		assert.equal(res, null);

		// sendBootNotifyEvents should also run gracefully without errors
		await controller.sendBootNotifyEvents();
	});

	it("sends notify event via Tauri IPC when available", async () => {
		const controller = createMockController();
		setupMockTauriIpc(calls);

		const res = await controller.sendShioriNotify("test", [10, "abc"]);
		assert.equal(res, "ok");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].cmd, "send_shiori_notify");
		assert.equal(calls[0].args.event, "test");
		assert.deepEqual(calls[0].args.references, ["10", "abc"]);
		assert.equal(calls[0].args.ghostId, "main");
	});

	it("handles invoke failure gracefully in sendShioriNotify", async () => {
		const controller = createMockController();
		setupMockTauriIpc(calls, async () => {
			throw new Error("Notify fail");
		});

		const res = await controller.sendShioriNotify("fail_event", [1]);
		assert.equal(res, null);
	});

	it("sends full ghost, shell, balloon, and baseware metadata during sendBootNotifyEvents", async () => {
		const controller = createMockController();
		setupMockTauriIpc(calls);

		await controller.sendBootNotifyEvents();

		const events = calls.map((c) => c.args.event);
		assert.ok(events.includes("capability"));
		assert.ok(events.includes("installedghostname"));
		assert.ok(events.includes("installedkeroname"));
		assert.ok(events.includes("installedshellname"));
		assert.ok(events.includes("ghostpathlist"));
		assert.ok(events.includes("installedballoonname"));
		assert.ok(events.includes("balloonpathlist"));
		assert.ok(events.includes("basewareversion"));
		assert.ok(events.includes("uniqueid"));
	});

	it("sends capability standalone notify event with status and response references", async () => {
		const controller = createMockController();
		setupMockTauriIpc(calls);

		await controller.sendCapabilityNotify();
		assert.equal(calls.length, 1);
		assert.equal(calls[0].args.event, "capability");
		assert.ok(calls[0].args.references?.includes("request.status"));
		assert.ok(calls[0].args.references?.includes("response.value"));
	});
});
