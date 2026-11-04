import assert from "node:assert/strict";
import { test } from "vitest";
import { AppConfig, loadAppConfig } from "../ui/js/core/config.js";

test("loadAppConfig covers success with full properties, null config, and error catch handling", async () => {
	// 1. Success with full config
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "get_app_config") {
				return {
					paths: { defaultGhostDir: "custom/ghost" },
					timing: { randomTalkMin: 12345 },
					scale: { ghostDefault: 1.2 },
					shiori: { customField: "val" },
					state: { active: true },
				};
			}
			return null;
		},
	};

	await loadAppConfig();
	assert.equal(AppConfig.paths.defaultGhostDir, "custom/ghost");
	assert.equal(AppConfig.timing.randomTalkMin, 12345);
	assert.equal(AppConfig.scale.ghostDefault, 1.2);
	assert.equal(AppConfig.shiori.customField, "val");
	assert.equal(AppConfig.state.active, true);

	// 2. Success with null config
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async () => null,
	};
	await loadAppConfig();

	// 3. Error catch handling
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async () => {
			throw new Error("config load fail");
		},
	};
	await loadAppConfig();

	// 4. No tauriInternals
	delete globalThis.__TAURI_INTERNALS__;
	await loadAppConfig();

	assert.ok(true);
});
