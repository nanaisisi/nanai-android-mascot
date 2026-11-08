/**
 * @file tests/shiori-notify/dialog-balloon-surface.test.ts
 * @description Tests for dialog, balloon, surface, and window overlap/offscreen notification methods.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
	createMockController,
	type MockIpcCall,
	setupMockTauriIpc,
	teardownMockTauriIpc,
} from "./helpers.js";

describe("SHIORI Dialog, Balloon, Surface & Overlap Notifications", () => {
	let calls: MockIpcCall[];

	beforeEach(() => {
		calls = [];
		teardownMockTauriIpc();
		setupMockTauriIpc(calls);
	});

	afterEach(() => {
		teardownMockTauriIpc();
	});

	it("dispatches dialog terms accept and decline events", async () => {
		const controller = createMockController();

		await controller.sendGhostTermsAccept("GhostA");
		assert.equal(calls.at(-1)?.args.event, "OnGhostTermsAccept");
		assert.equal(calls.at(-1)?.args.references?.[0], "GhostA");

		await controller.sendGhostTermsDecline("GhostA");
		assert.equal(calls.at(-1)?.args.event, "OnGhostTermsDecline");
		assert.equal(calls.at(-1)?.args.references?.[0], "GhostA");
	});

	it("dispatches balloon close and break events with scope and reason", async () => {
		const controller = createMockController();

		await controller.sendBalloonClose(0, "timeout");
		assert.equal(calls.at(-1)?.args.event, "OnBalloonClose");
		assert.deepEqual(calls.at(-1)?.args.references, ["0", "timeout"]);

		await controller.sendBalloonBreak(1, "user");
		assert.equal(calls.at(-1)?.args.event, "OnBalloonBreak");
		assert.deepEqual(calls.at(-1)?.args.references, ["1", "user"]);
	});

	it("dispatches surface change and other surface change events", async () => {
		const controller = createMockController();

		await controller.sendSurfaceChange(0, 10);
		assert.equal(calls.at(-1)?.args.event, "OnSurfaceChange");
		assert.deepEqual(calls.at(-1)?.args.references, ["0", "10"]);

		await controller.sendOtherSurfaceChange("GhostB", 0, 5);
		assert.equal(calls.at(-1)?.args.event, "OnOtherSurfaceChange");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostB", "0", "5"]);
	});

	it("dispatches overlap and offscreen events for local and other ghosts", async () => {
		const controller = createMockController();

		await controller.sendOverlap(0, 1, "0,0,100,100");
		assert.equal(calls.at(-1)?.args.event, "OnOverlap");
		assert.deepEqual(calls.at(-1)?.args.references, ["0", "1", "0,0,100,100"]);

		await controller.sendOffscreen(0, "0,0,100,100");
		assert.equal(calls.at(-1)?.args.event, "OnOffscreen");
		assert.deepEqual(calls.at(-1)?.args.references, ["0", "0,0,100,100"]);

		await controller.sendOtherOverlap("GhostB", "0,0,100,100");
		assert.equal(calls.at(-1)?.args.event, "OnOtherOverlap");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostB", "0,0,100,100"]);

		await controller.sendOtherOffscreen("GhostB", "0,0,100,100");
		assert.equal(calls.at(-1)?.args.event, "OnOtherOffscreen");
		assert.deepEqual(calls.at(-1)?.args.references, ["GhostB", "0,0,100,100"]);
	});
});
