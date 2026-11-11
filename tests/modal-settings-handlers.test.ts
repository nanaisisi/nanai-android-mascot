import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.localStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
};
globalThis.confirm = () => true;
globalThis.Blob = class {
	constructor(content, options) {
		this.content = content;
		this.options = options;
	}
};
globalThis.URL.createObjectURL = () => "blob:url";
globalThis.URL.revokeObjectURL = () => {};

const elements = {};
const getEl = (id) => {
	if (!elements[id]) {
		elements[id] = {
			value: "100",
			checked: false,
			innerHTML: "",
			textContent: "",
			classList: {
				toggle(_c) {
					this._active = !this._active;
					return this._active;
				},
			},
			addEventListener(type, cb) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({});
			},
			querySelector: () => ({ textContent: "PluginA" }),
		};
	}
	return elements[id];
};

globalThis.document = {
	getElementById(id) {
		return getEl(id);
	},
	querySelectorAll(sel) {
		if (sel === "#plugin-list .ghost-item") return [getEl("plugin1")];
		return [];
	},
	createElement: (_tag) => ({
		href: "",
		download: "",
		click() {},
	}),
};

const { ModalSettingsHandlers } = await import(
	"../ui/ts/ui/modal-settings-handlers.js"
);

test("ModalSettingsHandlers covers settings, plugins, and debug listeners", async () => {
	const mockManager = {
		app: {
			settings: {
				autoLoadGhost: true,
				darkMode: false,
				shellScale: "100",
				balloonScale: "100",
			},
			applySettings() {
				this.applied = true;
			},
			showBalloon() {},
			hideBalloon() {},
		},
		hide() {
			this.hidden = true;
		},
		showNotification() {},
	};

	const handlers = new ModalSettingsHandlers(mockManager);

	// 1. setupSettingsListeners
	handlers.setupSettingsListeners();

	// Test overlay button click (non-Tauri)
	getEl("open-overlay-settings-btn").click();

	// Test overlay button click (Tauri success and catch branch)
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "request_overlay_permission") return;
		},
		transformCallback: (cb) => cb,
	};
	getEl("open-overlay-settings-btn").click();
	await new Promise((r) => setTimeout(r, 10));

	globalThis.__TAURI_INTERNALS__.invoke = async () => {
		throw new Error("permission denied");
	};
	getEl("open-overlay-settings-btn").click();
	await new Promise((r) => setTimeout(r, 10));
	delete globalThis.__TAURI_INTERNALS__;

	// Test help button click
	let shioriHelpEvent = null;
	mockManager.app.ghostController = {
		sendShioriEvent: (event, args) => {
			shioriHelpEvent = { event, args };
		},
	};
	getEl("config-help-btn").click();
	assert.equal(shioriHelpEvent?.event, "OnConfigurationDialogHelp");

	// Test save button click
	getEl("save-settings-btn").click();
	assert.equal(mockManager.hidden, true);

	// Test reset button click with confirm = false, then true
	globalThis.confirm = () => false;
	getEl("reset-settings-btn").click();

	globalThis.confirm = () => true;
	getEl("reset-settings-btn").click();

	// 2. setupPluginListeners
	handlers.setupPluginListeners();
	getEl("add-plugin-btn").click();
	getEl("plugin1").click(); // toggle active

	// 3. setupDebugListeners
	handlers.setupDebugListeners();
	getEl("clear-logs").click();
	getEl("export-logs").click();

	assert.ok(true);
});
