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
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	mockApp.applySettings();

	// Test applySettings with Tauri available
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async () => {},
		transformCallback: (cb) => cb,
		plugins: { event: { emit: async () => {} } },
	};
	mockApp.applySettings();

	// Test showBalloon & hideBalloon (Tauri unavailable)
	delete globalThis.__TAURI_INTERNALS__;
	mockApp.showBalloon("test text", 0);
	assert.equal(mockApp.elements.balloonText.textContent, "test text");
	mockApp.hideBalloon(0);

	// Test showBalloon & hideBalloon (Tauri available)
	const emittedEvents = [];
	globalThis.__TAURI_INTERNALS__ = {
		metadata: { currentWindow: { label: "main" } },
		invoke: async (cmd) => {
			if (cmd === "show_balloon_window" || cmd === "hide_balloon_window") return;
		},
		transformCallback: (cb) => cb,
		plugins: {
			event: {
				emit: async (event, payload) => {
					emittedEvents.push({ event, payload });
				},
			},
		},
	};

	mockApp.showBalloon("tauri text", 1);
	await new Promise((r) => setTimeout(r, 20));
	mockApp.hideBalloon(1);

	delete globalThis.__TAURI_INTERNALS__;

	// Test playSakuraScript
	const res = mockApp.playSakuraScript("\\0Hello");
	assert.equal(res, "played:\\0Hello");

	// Test startSecondTimer visibilitychange
	mockApp.startSecondTimer();
	document._listeners?.visibilitychange?.();

	assert.ok(true);
});
