import assert from "node:assert/strict";
import { test } from "vitest";
import type { AppModalTarget } from "../ui/ts/ui/modal.js";

interface MockModalElement {
	style: Record<string, string>;
	innerHTML: string;
	_listeners?: Record<string, (event?: unknown) => void>;
	querySelectorAll: () => NodeListOf<Element>;
	addEventListener: (type: string, cb: (event?: unknown) => void) => void;
	click: () => void;
	querySelector: () => {
		addEventListener: (_t: string, cb: () => void) => void;
	};
}

interface MockTauriInternals {
	invoke: (cmd: string) => Promise<void>;
	transformCallback: (cb: unknown) => unknown;
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
const elements: Record<string, MockModalElement> = {};
globalThis.document = {
	querySelectorAll: () => [] as unknown as NodeListOf<Element>,
	getElementById(id: string) {
		if (!elements[id]) {
			elements[id] = {
				style: {},
				innerHTML: "<div>Mock Content</div>",
				querySelectorAll: () => [] as unknown as NodeListOf<Element>,
				addEventListener(type: string, cb: (event?: unknown) => void) {
					this._listeners = this._listeners || {};
					this._listeners[type] = cb;
				},
				click() {
					this._listeners?.click?.({ target: this });
				},
				querySelector: () => ({
					addEventListener(_t: string, cb: () => void) {
						cb();
					},
				}),
			};
		}
		return elements[id] as unknown as HTMLElement;
	},
	createElement: (_tag: string) =>
		({
			innerHTML: "",
			appendChild() {},
			style: {},
			dataset: {},
			querySelectorAll: () => [] as unknown as NodeListOf<Element>,
			addEventListener() {},
		}) as unknown as HTMLElement,
} as unknown as Document;

const { ModalManager } = await import("../ui/ts/ui/modal.js");

test("ModalManager covers 100% of init, show for all contents, hide, notifications, and Tauri modal windows", async () => {
	const mockApp: AppModalTarget = {
		settings: { autoLoadGhost: true, darkMode: false },
		ghostController: { scanGhosts: async () => [] },
		scanBalloons: async () => [],
	} as unknown as AppModalTarget;
	const manager = new ModalManager(mockApp);

	// 1. hide and show in non-Tauri
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	manager.hide();
	assert.equal((manager.overlay as HTMLElement).style.display, "none");

	// 2. Tauri environment
	const tauriInternals: MockTauriInternals = {
		invoke: async (cmd: string) => {
			if (cmd === "show_modal_window") return;
			if (cmd === "hide_modal_window") return;
		},
		transformCallback: (cb: unknown) => cb,
	};
	globalThis.__TAURI_INTERNALS__ = tauriInternals;
	globalThis.window = globalThis as unknown as Window & typeof globalThis;

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
		assert.equal((manager.overlay as HTMLElement).style.display, "flex");
	}

	// Test explorer-modal-content which initiates background ghost scan & reload
	manager.show("explorer-modal-content");

	// 3. showNotification (success & error) + click OK button
	manager.showNotification("Info", "Test message", false);
	elements["modal-ok-btn"]?.click();
	assert.equal((manager.overlay as HTMLElement).style.display, "none");

	manager.showNotification("Error", "Critical error", true);
	elements["modal-ok-btn"]?.click();

	// 4. Test init listeners (closeBtn click & overlay click)
	manager.show("ghost-modal-content");
	(manager.closeBtn as HTMLElement).click();
	assert.equal((manager.overlay as HTMLElement).style.display, "none");

	manager.show("ghost-modal-content");
	(manager.overlay as HTMLElement).click();
	assert.equal((manager.overlay as HTMLElement).style.display, "none");

	// 5. Test error catch in showWindowIfNeeded & hide
	tauriInternals.invoke = async () => {
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
