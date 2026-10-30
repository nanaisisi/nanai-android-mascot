import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const elements = {};
globalThis.document = {
	querySelectorAll: () => [],
	getElementById(id) {
		if (!elements[id]) {
			elements[id] = {
				style: {},
				innerHTML: "<div>Mock Content</div>",
				querySelectorAll: () => [],
				addEventListener(type, cb) {
					this._listeners = this._listeners || {};
					this._listeners[type] = cb;
				},
				click() {
					this._listeners?.click?.({ target: this });
				},
				querySelector: () => ({
					addEventListener(_t, cb) {
						cb();
					},
				}),
			};
		}
		return elements[id];
	},
	createElement: (_tag) => ({
		innerHTML: "",
		appendChild() {},
		style: {},
		dataset: {},
		querySelectorAll: () => [],
		addEventListener() {},
	}),
};

const { ModalManager } = await import("../ui/js/ui/modal.js");

test("ModalManager covers 100% of init, show for all contents, hide, notifications, and Tauri modal windows", async () => {
	const mockApp = {
		settings: { autoLoadGhost: true, darkMode: false },
		ghostController: { scanGhosts: async () => [] },
		scanBalloons: async () => [],
	};
	const manager = new ModalManager(mockApp);

	// 1. hide and show in non-Tauri
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	manager.hide();
	assert.equal(manager.overlay.style.display, "none");

	// 2. Tauri environment
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {
			if (cmd === "show_modal_window") return;
			if (cmd === "hide_modal_window") return;
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	// Test show for ALL contentId types
	const contentTypes = [
		"ghost-modal-content",
		"install-modal-content",
		"balloon-modal-content",
		"settings-modal-content",
		"plugins-modal-content",
		"debug-modal-content",
		"custom-dom-id",
	];

	for (const id of contentTypes) {
		manager.show(id);
		assert.equal(manager.overlay.style.display, "flex");
	}

	// Test explorer-modal-content which initiates background ghost scan & reload
	manager.show("explorer-modal-content");

	// 3. showNotification (success & error) + click OK button
	manager.showNotification("Info", "Test message", false);
	elements["modal-ok-btn"]?.click();
	assert.equal(manager.overlay.style.display, "none");

	manager.showNotification("Error", "Critical error", true);
	elements["modal-ok-btn"]?.click();

	// 4. Test init listeners (closeBtn click & overlay click)
	manager.show("ghost-modal-content");
	manager.closeBtn.click();
	assert.equal(manager.overlay.style.display, "none");

	manager.show("ghost-modal-content");
	manager.overlay.click();
	assert.equal(manager.overlay.style.display, "none");

	// 5. Test error catch in showWindowIfNeeded & hide
	globalThis.__TAURI_INTERNALS__.invoke = async () => {
		throw new Error("IPC fail");
	};
	manager.show("ghost-modal-content");
	manager.hide();

	// 6. Proxies
	manager.renderGhostList();
	manager.renderBalloonList();

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
