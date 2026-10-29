import assert from "node:assert/strict";
import { test } from "vitest";

import { actionMethods } from "../ui/js/core/app-actions.js";
import { eventMethods } from "../ui/js/core/app-events.js";
import { settingsMethods } from "../ui/js/core/app-settings.js";
import { updateMethods } from "../ui/js/core/app-update.js";
import { AppConfig, loadAppConfig } from "../ui/js/core/config.js";
import { emit, invoke, isTauriAvailable, listen } from "../ui/js/core/tauri-helper.js";

test("AppConfig test", async () => {
	assert.ok(AppConfig.paths.defaultGhostDir);
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "get_app_config") {
				return { paths: { defaultGhostDir: "test_dir" } };
			}
			return null;
		},
	};
	await loadAppConfig();
	assert.equal(AppConfig.paths.defaultGhostDir, "test_dir");
});

test("tauri-helper test", async () => {
	globalThis.window = globalThis;
	assert.equal(typeof isTauriAvailable(), "boolean");
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => `ok_${cmd}`,
		transformCallback: (cb) => cb,
	};
	assert.equal(isTauriAvailable(), true);

	const invRes = await invoke("test_cmd", { a: 1 });
	assert.equal(invRes, "ok_test_cmd");

	let emited = null;
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd, args) => {
		emited = { cmd, args };
	};
	await emit("test-event", { payload: 123 });
	assert.equal(emited.cmd, "plugin:event|emit");

	await listen("test-event", () => {});
});

test("AppEvents, AppSettings, AppUpdate, actionMethods test", async () => {
	const mockEl = {
		addEventListener() {},
		style: {},
		classList: { toggle() {} },
	};
	globalThis.document = {
		body: { classList: { toggle() {} } },
		addEventListener() {},
		getElementById() {
			return mockEl;
		},
	};
	globalThis.localStorage = {
		getItem() {
			return null;
		},
		setItem() {},
	};
	globalThis.addEventListener = () => {};

	const mockApp = {
		...eventMethods,
		...settingsMethods,
		...updateMethods,
		...actionMethods,
		ghostController: {
			currentGhost: { name: "g", path: "/path" },
			selectGhost: async () => {},
			sendShioriEvent: async () => ({}),
			scanGhosts: async () => {},
		},
		modalManager: {
			show() {},
		},
		interactionManager: {
			setupDragging() {},
		},
		elements: {
			ghostDisplay: mockEl,
			balloonDisplay: mockEl,
			balloonText: { textContent: "" },
		},
		showBalloon() {},
		hideBalloon() {},
		currentBalloonTheme: "default",
		settings: { darkMode: true, shellScale: 100, balloonScale: 100 },
		setBalloonTheme() {},
	};

	mockApp.setupEventListeners();
	mockApp.onGhostClick(0, 0, { left: 0, top: 0, width: 100, height: 100 }, 0);
	mockApp.onGhostStroke(0, 0, { left: 0, top: 0, width: 100, height: 100 }, 0);

	mockApp.loadSettings();
	mockApp.applySettings();
	mockApp.showBalloon("test");
	mockApp.hideBalloon();

	mockApp.handleMenuAction("ghost-info");

	await mockApp.sendUpdateResultSummary("g", true, 0, null);
});
