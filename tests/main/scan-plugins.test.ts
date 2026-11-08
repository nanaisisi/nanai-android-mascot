import assert from "node:assert/strict";
import { test } from "vitest";
import {
	clearTauriGlobals,
	createTauriInternals,
	NanaiAndroidMascotApp,
	setupMainDomGlobals,
} from "./helpers.js";

test("NanaiAndroidMascotApp scanPlugins covers success and error branches", async () => {
	setupMainDomGlobals();
	const origInit = NanaiAndroidMascotApp.prototype.init;
	NanaiAndroidMascotApp.prototype.init = async () => {};

	try {
		const app = new NanaiAndroidMascotApp();

		// 1. Tauri environment success with plugins
		clearTauriGlobals();
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			createTauriInternals(async (cmd) => {
				if (cmd === "scan_plugins") return ["pluginA", "pluginB"];
			});

		await app.scanPlugins();
		assert.deepEqual(app.availablePlugins, ["pluginA", "pluginB"]);

		// 2. Tauri environment error
		clearTauriGlobals();
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			createTauriInternals(async (cmd) => {
				if (cmd === "scan_plugins") throw new Error("scan error");
			});

		await app.scanPlugins();

		// 3. Tauri environment empty plugins (branch coverage)
		clearTauriGlobals();
		(globalThis as Record<string, unknown>).__TAURI_INTERNALS__ =
			createTauriInternals(async (cmd) => {
				if (cmd === "scan_plugins") return [];
			});

		app.availablePlugins = undefined;
		await app.scanPlugins();
		assert.equal(app.availablePlugins, undefined);
	} finally {
		NanaiAndroidMascotApp.prototype.init = origInit;
		clearTauriGlobals();
	}
});
