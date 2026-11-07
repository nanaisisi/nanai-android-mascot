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
			balloonTheme: "default",
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
			if (cmd === "show_balloon_window" || cmd === "hide_balloon_window")
				return;
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

	// Test startSecondTimer visibilitychange (visible & hidden branches)
	mockApp.startSecondTimer();
	document.visibilityState = "visible";
	document._listeners?.visibilitychange?.();
	document.visibilityState = "hidden";
	document._listeners?.visibilitychange?.();
	document.visibilityState = "visible";

	assert.ok(true);
});

test("settingsMethods edge branches (missing elements, localStorage error/null, theme fallbacks)", async () => {
	const mockApp = {
		...settingsMethods,
		settings: {},
		elements: {},
		currentBalloonTheme: null,
		setBalloonTheme(theme) {
			this.currentBalloonTheme = theme;
		},
	};

	const origGet = localStorage.getItem;
	localStorage.getItem = () => null;
	mockApp.loadSettings();
	localStorage.getItem = () => "{ invalid json";
	mockApp.loadSettings();
	localStorage.getItem = origGet;

	mockApp.settings = { shellScale: "invalid", balloonScale: "invalid" };
	mockApp.applySettings();

	mockApp.settings = {};
	mockApp.currentBalloonTheme = null;
	mockApp.applyBalloonTheme();
	assert.equal(mockApp.currentBalloonTheme, "default");

	mockApp.elements = {};
	mockApp.showBalloon("no elements");
	mockApp.hideBalloon();

	// Test Tauri success with empty innerHTML and null currentBalloonTheme
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async () => {},
		transformCallback: (cb) => cb,
		plugins: { event: { emit: async () => {} } },
	};
	mockApp.elements = {
		balloonText: { textContent: "", innerHTML: "" },
		balloonDisplay: { style: {} },
	};
	mockApp.currentBalloonTheme = null;
	mockApp.showBalloon("fallback text");
	await new Promise((r) => setTimeout(r, 20));
	delete globalThis.__TAURI_INTERNALS__;

	// Test Tauri error catch for showBalloon, hideBalloon, set_character_scale, & empty innerHTML / null currentBalloonTheme
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "show_balloon_window") throw new Error("show fail");
			if (cmd === "hide_balloon_window") throw new Error("hide fail");
			if (cmd === "set_character_scale") throw new Error("scale fail");
		},
		transformCallback: (cb) => cb,
		plugins: { event: { emit: async () => {} } },
	};
	mockApp.elements = {
		balloonText: { textContent: "", innerHTML: "" },
		balloonDisplay: { style: {} },
	};
	mockApp.currentBalloonTheme = null;
	mockApp.showBalloon("fallback text");
	await new Promise((r) => setTimeout(r, 20));
	mockApp.hideBalloon();
	mockApp.applySettings();
	delete globalThis.__TAURI_INTERNALS__;

	assert.ok(true);
});
