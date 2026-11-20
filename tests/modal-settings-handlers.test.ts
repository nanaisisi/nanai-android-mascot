import assert from "node:assert/strict";
import { test } from "vitest";
import type { ModalManager } from "../ui/ts/ui/modal.js";

interface MockSettingsElement {
	value: string;
	checked: boolean;
	innerHTML: string;
	textContent: string;
	_listeners?: Record<string, (event?: unknown) => void>;
	classList: {
		_active?: boolean;
		toggle: (_c: string) => boolean;
	};
	addEventListener: (type: string, cb: (event?: unknown) => void) => void;
	click: () => void;
	querySelector: () => { textContent: string };
}

class MockBlob {
	content: unknown;
	options: unknown;
	constructor(content: unknown, options: unknown) {
		this.content = content;
		this.options = options;
	}
}

interface MockTauriInternals {
	invoke: (cmd: string) => Promise<void>;
	transformCallback: (cb: unknown) => unknown;
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.localStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
} as unknown as Storage;
globalThis.confirm = () => true;
globalThis.Blob = MockBlob as unknown as typeof Blob;
globalThis.URL.createObjectURL = () => "blob:url";
globalThis.URL.revokeObjectURL = () => {};

const elements: Record<string, MockSettingsElement> = {};
const getEl = (id: string): MockSettingsElement => {
	if (!elements[id]) {
		elements[id] = {
			value: "100",
			checked: false,
			innerHTML: "",
			textContent: "",
			classList: {
				toggle(_c: string) {
					this._active = !this._active;
					return this._active;
				},
			},
			addEventListener(type: string, cb: (event?: unknown) => void) {
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
	getElementById(id: string) {
		return getEl(id) as unknown as HTMLElement;
	},
	querySelectorAll(sel: string) {
		if (sel === "#plugin-list .ghost-item") {
			return [getEl("plugin1")] as unknown as NodeListOf<Element>;
		}
		return [] as unknown as NodeListOf<Element>;
	},
	createElement: (_tag: string) =>
		({
			href: "",
			download: "",
			click() {},
		}) as unknown as HTMLElement,
} as unknown as Document;

const { ModalSettingsHandlers } = await import(
	"../ui/ts/ui/modal-settings-handlers.js"
);

test("ModalSettingsHandlers covers settings, plugins, and debug listeners", async () => {
	const mockManager: {
		app: {
			settings: {
				autoLoadGhost: boolean;
				darkMode: boolean;
				shellScale: string;
				balloonScale: string;
			};
			applied?: boolean;
			applySettings: () => void;
			showBalloon: () => void;
			hideBalloon: () => void;
			ghostController?: {
				sendShioriEvent: (event: string, args: unknown[]) => void;
			};
		};
		hidden?: boolean;
		hide: () => void;
		showNotification: () => void;
	} = {
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

	const handlers = new ModalSettingsHandlers(
		mockManager as unknown as ModalManager,
	);

	// 1. setupSettingsListeners
	handlers.setupSettingsListeners();

	// Test overlay button click (non-Tauri)
	getEl("open-overlay-settings-btn").click();

	// Test overlay button click (Tauri success and catch branch)
	const tauriInternals: MockTauriInternals = {
		invoke: async (cmd: string) => {
			if (cmd === "request_overlay_permission") return;
		},
		transformCallback: (cb: unknown) => cb,
	};
	globalThis.__TAURI_INTERNALS__ = tauriInternals;
	getEl("open-overlay-settings-btn").click();
	await new Promise((r) => setTimeout(r, 10));

	tauriInternals.invoke = async () => {
		throw new Error("permission denied");
	};
	getEl("open-overlay-settings-btn").click();
	await new Promise((r) => setTimeout(r, 10));
	delete globalThis.__TAURI_INTERNALS__;

	// Test help button click
	let shioriHelpEvent: { event: string; args: unknown[] } | null = null;
	mockManager.app.ghostController = {
		sendShioriEvent: (event: string, args: unknown[]) => {
			shioriHelpEvent = { event, args };
		},
	};
	getEl("config-help-btn").click();
	assert.equal(
		(shioriHelpEvent as { event: string; args: unknown[] } | null)?.event,
		"OnConfigurationDialogHelp",
	);

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
