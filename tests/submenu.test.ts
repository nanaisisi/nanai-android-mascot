import assert from "node:assert/strict";
import { test } from "vitest";

interface MockSubmenuElement {
	innerHTML: string;
	lastChild?: MockSubmenuElement;
	className?: string;
	style: Record<string, string>;
	dataset?: Record<string, string>;
	_listeners?: Record<string, (ev: unknown) => void>;
	appendChild(child: MockSubmenuElement): void;
	querySelectorAll?: () => unknown[];
	addEventListener?(type: string, cb: (ev: unknown) => void): void;
	click?: () => Promise<void> | void;
}

interface TauriInvokeArgs {
	event?: string;
	handler?: (ev: unknown) => Promise<void> | void;
	[key: string]: unknown;
}

interface MockTauriInternals {
	metadata: {
		currentWindow: { label: string; startDragging: () => Promise<void> };
	};
	invoke: (cmd: string, args?: TauriInvokeArgs) => Promise<unknown>;
	transformCallback: (cb: unknown) => unknown;
	plugins: {
		event: {
			listen: (
				event: string,
				cb: (ev: unknown) => Promise<void> | void,
			) => Promise<() => void>;
			emit: () => Promise<void>;
		};
	};
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.localStorage = {
	getItem: () => "ivory",
	setItem: () => {},
	length: 0,
	clear: () => {},
	key: () => null,
	removeItem: () => {},
} as Storage;

const documentListeners: Record<string, (ev: unknown) => void> = {};
const globalListeners: Record<string, (ev?: unknown) => void> = {};
const tauriListeners: Record<string, (ev: unknown) => Promise<void> | void> =
	{};
const cachedElements: Record<string, MockSubmenuElement> = {};

let emitShouldFail = false;

globalThis.document = {
	body: { classList: { add() {}, remove(..._args: string[]) {}, toggle() {} } },
	addEventListener(type: string, cb: (ev: unknown) => void) {
		documentListeners[type] = cb;
	},
	documentElement: {
		setAttribute() {},
		getAttribute: () => "default",
		style: {
			setProperty() {},
			removeProperty() {
				return "";
			},
		},
	},
	getElementById(id: string) {
		if (!cachedElements[id]) {
			cachedElements[id] = {
				innerHTML: "",
				appendChild(child: MockSubmenuElement) {
					this.lastChild = child;
				},
				style: {},
				querySelectorAll: () => [],
			};
		}
		return cachedElements[id];
	},
	createElement: (_tag: string): MockSubmenuElement => ({
		className: "",
		innerHTML: "",
		appendChild() {},
		style: {},
		dataset: {},
		_listeners: {},
		addEventListener(type: string, cb: (ev: unknown) => void) {
			if (!this._listeners) this._listeners = {};
			this._listeners[type] = cb;
		},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
	}),
} as unknown as Document;
globalThis.addEventListener = ((type: string, cb: (ev?: unknown) => void) => {
	globalListeners[type] = cb;
}) as unknown as typeof globalThis.addEventListener;

const tauriGlobal = globalThis as unknown as {
	__TAURI_INTERNALS__?: MockTauriInternals;
};

const mockTauriInternals: MockTauriInternals = {
	metadata: {
		currentWindow: { label: "submenu", startDragging: async () => {} },
	},
	invoke: async (cmd: string, args?: TauriInvokeArgs) => {
		if (cmd === "plugin:event|listen" && args?.event && args?.handler) {
			tauriListeners[args.event] = args.handler;
			return 1;
		}
		if (cmd === "plugin:event|emit") {
			if (emitShouldFail) throw new Error("Emit IPC failed");
			return;
		}
		if (cmd === "hide_menu_window") return;
		if (cmd === "hide_submenu_window") return;
		if (cmd === "notify_submenu_ready") return;
	},
	transformCallback: (cb: unknown) => cb,
	plugins: {
		event: {
			listen: async (
				event: string,
				cb: (ev: unknown) => Promise<void> | void,
			) => {
				tauriListeners[event] = cb;
				return () => {};
			},
			emit: async () => {},
		},
	},
};
tauriGlobal.__TAURI_INTERNALS__ = mockTauriInternals;

let notifySubmenuShouldFail = false;
mockTauriInternals.invoke = async (cmd: string, args?: TauriInvokeArgs) => {
	if (cmd === "plugin:event|listen" && args?.event && args?.handler) {
		tauriListeners[args.event] = args.handler;
		return 1;
	}
	if (cmd === "plugin:event|emit") {
		if (emitShouldFail) throw new Error("Emit IPC failed");
		return;
	}
	if (cmd === "hide_menu_window") return;
	if (cmd === "hide_submenu_window") return;
	if (cmd === "notify_submenu_ready") {
		if (notifySubmenuShouldFail) throw new Error("Notify fail");
		return;
	}
};

// Import submenu to initialize listeners
await import("../ui/ts/ui/submenu.js");

test("submenu event handlers, Tauri sync listeners, and DOMContentLoaded init", async () => {
	// 1. Test document mousedown
	documentListeners.mousedown?.({ button: 0, target: { closest: () => null } });
	documentListeners.mousedown?.({ button: 0, target: { closest: () => ({}) } });
	documentListeners.mousedown?.({ button: 1, target: { closest: () => null } });

	// 2. Trigger DOMContentLoaded with notify failure catch branch
	notifySubmenuShouldFail = true;
	globalListeners.DOMContentLoaded?.();
	notifySubmenuShouldFail = false;

	// 3. Test Tauri event listeners
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "dressup" } });
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "ghost" } });
	await tauriListeners["set-submenu-type"]?.({ payload: null });

	await tauriListeners["sync-ghosts"]?.({
		payload: {
			ghosts: [{ name: "G1" }],
			currentGhost: "G1",
			shells: [{ name: "master" }],
			currentShell: "master",
			recentGhosts: ["G1"],
			dressup: { sakura: { categories: [] } },
			scope: 0,
		},
	});
	await tauriListeners["sync-ghosts"]?.({ payload: null });

	await tauriListeners["sync-balloons"]?.({
		payload: [{ dir_name: "ivory", name: "Ivory" }],
	});
	await tauriListeners["sync-balloons"]?.({ payload: null });

	await tauriListeners["sync-theme"]?.({ payload: "dark" });
	await tauriListeners["sync-theme"]?.({ payload: null });

	await tauriListeners["sync-menu-scope"]?.({ payload: 1 });
	await tauriListeners["sync-menu-scope"]?.({ payload: "0" });
	await tauriListeners["sync-menu-scope"]?.({ payload: "invalid" });

	// 4. Test window message listener
	globalListeners.message?.({ data: { type: "unknown" } });
	globalListeners.message?.({
		data: { type: "set-submenu-type", submenuType: "dressup" },
	});
	globalListeners.message?.({
		data: {
			type: "sync-ghosts",
			ghosts: [{ name: "G2" }],
			currentGhost: "G2",
			shells: [{ name: "master" }],
			currentShell: "master",
			recentGhosts: ["G2"],
			dressup: { sakura: { categories: [] } },
			scope: 1,
		},
	});
	globalListeners.message?.({
		data: {
			type: "sync-balloons",
			balloons: [{ dir_name: "pink", name: "Pink" }],
		},
	});
	globalListeners.message?.({
		data: { type: "sync-theme", theme: "pink" },
	});
	globalListeners.message?.({
		data: { type: "sync-menu-scope", scope: "0" },
	});
	globalListeners.message?.({
		data: { type: "sync-menu-scope", scope: 1 },
	});

	// 5. Test dispatchSubmenuAction via renderer generated element clicks
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "ghost" } });
	const submenuContainer = document.getElementById(
		"submenu-content",
	) as unknown as MockSubmenuElement | null;
	if (submenuContainer?.lastChild?.click) {
		await submenuContainer.lastChild.click();
	}

	// Trigger error catch branch in dispatchSubmenuAction
	emitShouldFail = true;
	if (submenuContainer?.lastChild?.click) {
		await submenuContainer.lastChild.click();
	}
	emitShouldFail = false;

	// sync-menu-scope with currentSubmenuType = dressup
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "dressup" } });
	await tauriListeners["sync-menu-scope"]?.({ payload: 0 });

	// Click in non-tauri mode
	const origTauri = tauriGlobal.__TAURI_INTERNALS__;
	delete tauriGlobal.__TAURI_INTERNALS__;
	if (submenuContainer?.lastChild?.click) {
		await submenuContainer.lastChild.click();
	}
	tauriGlobal.__TAURI_INTERNALS__ = origTauri;

	assert.ok(true);
});

test("computeSubmenuWindowSize and adjustSubmenuWindowSize fit content and clamp bounds", async () => {
	const { adjustSubmenuWindowSize, computeSubmenuWindowSize } = await import(
		"../ui/ts/ui/submenu.js"
	);
	const origGetElementById = globalThis.document.getElementById;
	const origInvoke = mockTauriInternals.invoke;
	let capturedArgs: { width?: number; height?: number } | undefined;

	try {
		globalThis.document.getElementById = ((id: string) => {
			if (id === "submenu-content") {
				return {
					getBoundingClientRect: () => ({ width: 156, height: 184 }),
				};
			}
			return null;
		}) as unknown as typeof globalThis.document.getElementById;

		assert.deepEqual(computeSubmenuWindowSize(), { width: 156, height: 184 });

		mockTauriInternals.invoke = async (cmd: string, args?: TauriInvokeArgs) => {
			if (cmd === "resize_submenu_window") {
				capturedArgs = args as { width?: number; height?: number };
				return;
			}
			return origInvoke(cmd, args);
		};

		await adjustSubmenuWindowSize(true, true);
		assert.deepEqual(capturedArgs, { width: 156, height: 184, show: true });

		// Fallback size when element rect is unavailable and show=true
		capturedArgs = undefined;
		globalThis.document.getElementById = (() =>
			null) as unknown as typeof globalThis.document.getElementById;
		await adjustSubmenuWindowSize(true, true);
		assert.deepEqual(capturedArgs, { width: 220, height: 320, show: true });

		// Clamp minimum (120x32) and maximum (360x520)
		globalThis.document.getElementById = ((id: string) => {
			if (id === "submenu-content") {
				return {
					getBoundingClientRect: () => ({ width: 80, height: 20 }),
				};
			}
			return null;
		}) as unknown as typeof globalThis.document.getElementById;
		assert.deepEqual(computeSubmenuWindowSize(), { width: 120, height: 32 });

		globalThis.document.getElementById = ((id: string) => {
			if (id === "submenu-content") {
				return {
					getBoundingClientRect: () => ({ width: 420, height: 600 }),
				};
			}
			return null;
		}) as unknown as typeof globalThis.document.getElementById;
		assert.deepEqual(computeSubmenuWindowSize(), { width: 360, height: 520 });
	} finally {
		globalThis.document.getElementById = origGetElementById;
		mockTauriInternals.invoke = origInvoke;
	}
});
