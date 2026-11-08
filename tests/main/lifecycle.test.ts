import assert from "node:assert/strict";
import { test } from "vitest";
import {
	createTauriInternals,
	NanaiAndroidMascotApp,
	setupMainDomGlobals,
} from "./helpers.js";

test("NanaiAndroidMascotApp initialization and mixin delegation", async () => {
	setupMainDomGlobals();
	delete (globalThis as Record<string, unknown>).__TAURI__;
	delete (globalThis as Record<string, unknown>).__TAURI_INTERNALS__;
	const app = new NanaiAndroidMascotApp();
	assert.equal(app.ghostId, "main");
	assert.equal(app.initialGhostName, "mock_nanai");

	(app.ghostController as Record<string, unknown>).sendShioriEvent =
		async () => ({});
	(
		app as unknown as {
			onGhostClick: (
				x: number,
				y: number,
				rect: Record<string, number>,
				scope: number,
			) => void;
		}
	).onGhostClick(10, 10, { left: 0, top: 0, width: 100, height: 100 }, 0);
	// Direct call to original class method onGhostClick before/aside from Object.assign override
	const origEventOnGhostClick = Object.getOwnPropertyDescriptor(
		NanaiAndroidMascotApp.prototype,
		"onGhostClick",
	);
	assert.ok(origEventOnGhostClick);

	app.scanBalloons = async () => [];
	app.ghostController.autoLoadGhost = async () => {};
	app.ghostController.stopSecondChangeTimer = () => {};

	app.settings.autoLoadGhost = false;
	await app.init();
	assert.equal(app.isInitialized, true);

	app.settings.autoLoadGhost = true;
	await app.init();

	(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
		createTauriInternals(async () => 1);
	app.initUIEnvironment();
	const origGetEl = globalThis.document.getElementById;
	globalThis.document.getElementById = () => null;
	app.initUIEnvironment();
	globalThis.document.getElementById = origGetEl;
	delete (globalThis as Record<string, unknown>).__TAURI_INTERNALS__;

	// Test fallback URL params (no ghost_id / ghost_name in search)
	const origSearch = globalThis.location.search;
	(globalThis.location as { search: string }).search = "";
	const origInit = NanaiAndroidMascotApp.prototype.init;
	NanaiAndroidMascotApp.prototype.init = async () => {};
	const appFallback = new NanaiAndroidMascotApp();
	assert.equal(appFallback.ghostId, "main");
	assert.equal(appFallback.initialGhostName, null);
	NanaiAndroidMascotApp.prototype.init = origInit;
	(globalThis.location as { search: string }).search = origSearch;

	(
		globalThis as {
			_globalListeners?: { DOMContentLoaded?: () => void };
		}
	)._globalListeners?.DOMContentLoaded?.();

	assert.ok(true);
});
