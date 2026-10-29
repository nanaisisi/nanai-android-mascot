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
	constructor(content, options) { this.content = content; this.options = options; }
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
				toggle(c) { this._active = !this._active; return this._active; },
			},
			addEventListener(type, cb) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() { this._listeners?.click?.({}); },
			querySelector: () => ({ textContent: "PluginA" }),
		};
	}
	return elements[id];
};

globalThis.document = {
	getElementById(id) { return getEl(id); },
	querySelectorAll(sel) {
		if (sel === "#plugin-list .ghost-item") return [getEl("plugin1")];
		return [];
	},
	createElement: (tag) => ({
		href: "",
		download: "",
		click() {},
	}),
};

const { ModalSettingsHandlers } = await import("../ui/js/ui/modal-settings-handlers.js");

test("ModalSettingsHandlers covers settings, plugins, and debug listeners", async () => {
	const mockManager = {
		app: {
			settings: { autoLoadGhost: true, darkMode: false, shellScale: "100", balloonScale: "100" },
			applySettings() { this.applied = true; },
			showBalloon() {},
			hideBalloon() {},
		},
		hide() { this.hidden = true; },
		showNotification() {},
	};

	const handlers = new ModalSettingsHandlers(mockManager);

	// 1. setupSettingsListeners
	handlers.setupSettingsListeners();

	// Test overlay button click (non-Tauri)
	getEl("open-overlay-settings-btn").click();

	// Test save button click
	getEl("save-settings-btn").click();
	assert.equal(mockManager.hidden, true);

	// Test reset button click
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
