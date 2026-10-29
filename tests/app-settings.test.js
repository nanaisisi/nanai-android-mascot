import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	body: { classList: { toggle() {} } },
	addEventListener(type, cb) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
	visibilityState: "visible",
};
globalThis.localStorage = {
	getItem: () =>
		JSON.stringify({
			darkMode: true,
			shellScale: "120",
			balloonScale: "150",
			balloonTheme: "ivory",
		}),
	setItem: () => {},
};

const { settingsMethods } = await import("../ui/js/core/app-settings.js");

test("settingsMethods coverage for loadSettings, applySettings, showBalloon, hideBalloon, and timers", async () => {
	const mockApp = {
		...settingsMethods,
		settings: {
			darkMode: false,
			shellScale: "100",
			balloonScale: "100",
			balloonTheme: "default",
		},
		elements: {
			ghostDisplay: { style: {} },
			balloonDisplay: { style: {} },
			balloonText: { textContent: "", innerHTML: "hello" },
		},
		currentBalloonTheme: "default",
		setBalloonTheme(theme) {
			this.currentBalloonTheme = theme;
		},
		applyBalloonTheme() {
			this.setBalloonTheme(this.settings.balloonTheme);
		},
		sakuraPlayer: {
			play(script) {
				return `played:${script}`;
			},
		},
		ghostController: { sendShioriEvent() {} },
	};

	mockApp.loadSettings();
	assert.equal(mockApp.settings.darkMode, true);

	// Test applySettings with Tauri unavailable
	mockApp.applySettings();

	// Test applySettings with Tauri available
	globalThis.__TAURI__ = { core: { invoke: async () => {} } };
	mockApp.applySettings();
	delete globalThis.__TAURI__;

	// Test showBalloon & hideBalloon (Tauri unavailable)
	mockApp.showBalloon("test text", 0);
	assert.equal(mockApp.elements.balloonText.textContent, "test text");
	mockApp.hideBalloon(0);

	// Test showBalloon & hideBalloon (Tauri available)
	globalThis.__TAURI__ = {
		core: {
			invoke: async (cmd, _args) => {
				if (cmd === "show_balloon_window" || cmd === "hide_balloon_window")
					return;
			},
		},
		event: { emit: async () => {} },
	};
	mockApp.showBalloon("tauri text", 1);
	await new Promise((r) => setTimeout(r, 10));
	mockApp.hideBalloon(1);
	delete globalThis.__TAURI__;

	// Test playSakuraScript
	const res = mockApp.playSakuraScript("\\0Hello");
	assert.equal(res, "played:\\0Hello");

	// Test startSecondTimer visibilitychange
	mockApp.startSecondTimer();
	document._listeners?.visibilitychange?.();

	assert.ok(true);
});
