import assert from "node:assert/strict";
import { test } from "vitest";

type MockDomListener = (event?: Record<string, unknown>) => unknown;
type MockTauriListener = (event: { payload?: unknown }) => unknown;

interface MockWrapperElement {
	classList: {
		_classes: Set<string>;
		add: (c: string) => void;
		remove: (c: string) => void;
		contains: (c: string) => boolean;
	};
	querySelector: (sel: string) => {
		id: string;
		classList: { contains: (c: string) => boolean };
		getBoundingClientRect: () => { top: number };
	} | null;
	_listeners?: Record<string, () => void>;
	addEventListener: (t: string, cb: () => void) => void;
	mouseenter: () => void;
	mouseleave: () => void;
}

interface MockTauriInternals {
	metadata: { currentWindow: { label: string } };
	invoke: (
		cmd: string,
		args?: { event?: string; handler?: MockTauriListener },
	) => Promise<unknown>;
	transformCallback: (cb: unknown) => unknown;
	plugins: {
		event: {
			listen: (event: string, cb: MockTauriListener) => Promise<() => void>;
			emit: () => Promise<void>;
		};
	};
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.location = { search: "?scope=0" } as unknown as Location;
globalThis.innerWidth = 800;
globalThis.innerHeight = 600;
globalThis.localStorage = {
	length: 0,
	clear: () => {},
	key: () => null,
	removeItem: () => {},
	getItem: () => "ivory",
	setItem: () => {},
} satisfies Storage;

const documentListeners: Record<string, MockDomListener> = {};
const globalListeners: Record<string, MockDomListener> = {};
const tauriListeners: Record<string, MockTauriListener> = {};

let showSubmenuShouldFail = false;

const mockWrapper: MockWrapperElement = {
	classList: {
		_classes: new Set(["menu-item-wrapper"]),
		add(c: string) {
			this._classes.add(c);
		},
		remove(c: string) {
			this._classes.delete(c);
		},
		contains(c: string) {
			return this._classes.has(c);
		},
	},
	querySelector(sel: string) {
		if (sel === ".menu-item.has-submenu" || sel === "#ghost-switch-btn") {
			return {
				id: "ghost-switch-btn",
				classList: { contains: (c: string) => c === "has-submenu" },
				getBoundingClientRect: () => ({ top: 100 }),
			};
		}
		return null;
	},
	addEventListener(t: string, cb: () => void) {
		this._listeners = this._listeners || {};
		this._listeners[t] = cb;
	},
	mouseenter() {
		this._listeners?.mouseenter?.();
	},
	mouseleave() {
		this._listeners?.mouseleave?.();
	},
};

globalThis.document = {
	body: { classList: { add() {}, remove() {} } },
	addEventListener(type: string, cb: MockDomListener) {
		documentListeners[type] = cb;
	},
	getElementById(_id: string) {
		return {
			innerHTML: "",
			appendChild() {},
			classList: { add() {}, remove() {} },
			style: {},
			querySelector: () => null,
			querySelectorAll: () => [],
		};
	},
	createElement: (_tag: string) => ({
		innerHTML: "",
		appendChild() {},
		style: {},
		dataset: {},
		addEventListener() {},
	}),
	querySelector(sel: string) {
		if (sel === ".menu-container") {
			return { getBoundingClientRect: () => ({ right: 700 }) };
		}
		return null;
	},
	querySelectorAll(sel: string) {
		if (sel === ".menu-item-wrapper") {
			return [mockWrapper];
		}
		if (sel === ".menu-item-wrapper.open") {
			return mockWrapper.classList.contains("open") ? [mockWrapper] : [];
		}
		return [];
	},
	documentElement: {
		getAttribute: () => "default",
		setAttribute() {},
		style: { removeProperty() {}, setProperty() {} },
	},
} as unknown as Document;

globalThis.addEventListener = ((type: string, cb: MockDomListener) => {
	globalListeners[type] = cb;
}) as unknown as typeof globalThis.addEventListener;

const tauriInternals: MockTauriInternals = {
	metadata: { currentWindow: { label: "context_menu" } },
	invoke: async (cmd, args) => {
		if (cmd === "plugin:event|listen" && args?.event && args.handler) {
			tauriListeners[args.event] = args.handler;
			return 1;
		}
		if (cmd === "show_submenu_window") {
			if (showSubmenuShouldFail) throw new Error("Submenu IPC failed");
			return;
		}
	},
	transformCallback: (cb: unknown) => cb,
	plugins: {
		event: {
			listen: async (event: string, cb: MockTauriListener) => {
				tauriListeners[event] = cb;
				return () => {};
			},
			emit: async () => {},
		},
	},
};
globalThis.__TAURI_INTERNALS__ = tauriInternals;

// Import context-menu to initialize listeners
const { adjustMenuWindowSize, computeMenuWindowSize } = await import(
	"../ui/ts/ui/context-menu.js"
);

test("context-menu event handlers, sync listeners, mouse events and keyboard shortcuts", async () => {
	// 1. Test document mousedown
	documentListeners.mousedown?.({ button: 0, target: { closest: () => null } });
	documentListeners.mousedown?.({ button: 0, target: { closest: () => ({}) } });
	documentListeners.mousedown?.({ button: 1, target: { closest: () => null } });

	// 2. Test Tauri event listeners with string scope, number scope, and full shells/dressup
	await tauriListeners["sync-menu-scope"]?.({ payload: "1" });
	await tauriListeners["sync-menu-scope"]?.({ payload: 0 });
	await tauriListeners["sync-ghosts"]?.({
		payload: {
			scope: 1,
			ghosts: [{ name: "Ghost1" }],
			currentGhost: { name: "Ghost1" },
			shells: [{ name: "master" }, { name: "alt" }],
			currentShell: "alt",
			dressup: { kero: { categories: [] } },
			recentGhosts: ["Ghost1"],
		},
	});
	await tauriListeners["sync-balloons"]?.({ payload: [{ name: "default" }] });
	await tauriListeners["sync-theme"]?.({ payload: "ivory" });

	// 3. Test window message listener
	globalListeners.message?.({ data: { type: "unknown" } });
	globalListeners.message?.({ data: { type: "sync-scope", scope: "1" } });
	globalListeners.message?.({ data: { type: "sync-scope", scope: 0 } });
	globalListeners.message?.({
		data: {
			type: "sync-ghosts",
			ghosts: [],
			currentGhost: "G1",
			dressup: { sakura: { categories: [] } },
			recentGhosts: ["G1"],
			scope: 0,
		},
	});
	globalListeners.message?.({
		data: {
			type: "sync-shells",
			shells: [{ name: "master" }],
			currentShell: "master",
		},
	});
	globalListeners.message?.({
		data: { type: "sync-balloons", balloons: [{ name: "default" }] },
	});
	globalListeners.message?.({ data: { type: "sync-theme", theme: "ivory" } });

	// DOMContentLoaded test
	globalListeners.DOMContentLoaded?.();

	// 4. Test document click on has-submenu and normal menu item in Tauri
	const mockSubmenuBtn: {
		id: string;
		classList: { contains: (c: string) => boolean };
		getBoundingClientRect: () => { top: number };
		closest: (sel: string) => unknown;
	} = {
		id: "ghost-switch-btn",
		classList: { contains: (c: string) => c === "has-submenu" },
		getBoundingClientRect: () => ({ top: 100 }),
		closest: (sel: string) => {
			if (sel === ".menu-item") return mockSubmenuBtn;
			if (sel === ".menu-item-wrapper") return mockWrapper;
			return null;
		},
	};
	documentListeners.click?.({ target: mockSubmenuBtn });

	// Trigger debounce (< 180ms)
	documentListeners.click?.({ target: mockSubmenuBtn });

	// Advance time to pass debounce threshold (> 180ms)
	await new Promise((r) => setTimeout(r, 200));

	// Submenu window error catch fallback
	showSubmenuShouldFail = true;
	documentListeners.click?.({ target: mockSubmenuBtn });
	await new Promise((r) => setTimeout(r, 20));
	showSubmenuShouldFail = false;

	// Non-Tauri click on has-submenu
	const origTauri = globalThis.__TAURI_INTERNALS__;
	delete globalThis.__TAURI_INTERNALS__;
	mockWrapper.classList.remove("open");
	documentListeners.click?.({ target: mockSubmenuBtn });
	// Click again to close already open submenu
	documentListeners.click?.({ target: mockSubmenuBtn });
	globalThis.__TAURI_INTERNALS__ = origTauri;

	// Click outside menu item
	documentListeners.click?.({ target: { closest: () => null } });

	const mockMenuItem = {
		classList: { contains: () => false },
		dataset: { action: "recommend" },
		id: "",
		closest(sel: string): unknown {
			if (sel === ".menu-item, .submenu-container") return null;
			if (sel === ".menu-item") return this;
			return null;
		},
	};
	documentListeners.click?.({ target: mockMenuItem });

	// 5. Test mouseenter & mouseleave on menu-item-wrapper
	mockWrapper.mouseenter();
	mockWrapper.mouseleave();

	delete globalThis.__TAURI_INTERNALS__;
	mockWrapper.mouseenter();
	mockWrapper.mouseleave();
	globalThis.__TAURI_INTERNALS__ = origTauri;

	// checkSubmenuFlip right boundary test
	const origInnerWidth = globalThis.innerWidth;
	globalThis.innerWidth = 710; // 710 - 700 = 10 < 240 -> flip-left
	mockWrapper.mouseenter();
	assert.ok(mockWrapper.classList.contains("flip-left"));
	globalThis.innerWidth = 1200; // 1200 - 700 = 500 > 240 -> remove flip-left
	mockWrapper.mouseenter();
	assert.ok(!mockWrapper.classList.contains("flip-left"));
	globalThis.innerWidth = origInnerWidth;

	// Null container for checkSubmenuFlip
	const origQuerySelector = globalThis.document.querySelector;
	globalThis.document.querySelector = () => null;
	mockWrapper.mouseenter();
	globalThis.document.querySelector = origQuerySelector;

	// 6. Test document keydown shortcuts
	documentListeners.keydown?.({ key: "Escape" });
	documentListeners.keydown?.({ key: "i", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "w", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "q", metaKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "k", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({
		key: "f12",
		shiftKey: true,
		ctrlKey: true,
		preventDefault() {},
	});
	documentListeners.keydown?.({
		key: "f10",
		shiftKey: true,
		ctrlKey: true,
		preventDefault() {},
	});
	documentListeners.keydown?.({
		key: "Delete",
		shiftKey: true,
		ctrlKey: true,
		preventDefault() {},
	});
	documentListeners.keydown?.({
		key: "d",
		shiftKey: true,
		ctrlKey: true,
		preventDefault() {},
	});
	documentListeners.keydown?.({
		key: "l",
		shiftKey: false,
		ctrlKey: true,
		preventDefault() {},
	});

	// Single accelerator keys
	for (const k of [
		"r",
		"t",
		"u",
		"d",
		"h",
		"p",
		"m",
		"f",
		"o",
		"g",
		"c",
		"b",
		"a",
		"i",
		"w",
		"x",
	]) {
		documentListeners.keydown?.({ key: k, preventDefault() {} });
	}

	assert.ok(true);
});

test("context menu ignores transient blur during grace window, closes on real blur, and resets submenu state on regular hover", async () => {
	const internals = globalThis.__TAURI_INTERNALS__ as MockTauriInternals;
	const origInvoke = internals.invoke;
	const origHasFocus = (document as unknown as { hasFocus?: () => boolean })
		.hasFocus;
	const cmds: string[] = [];
	let docFocused = false;
	(document as unknown as { hasFocus?: () => boolean }).hasFocus = () =>
		docFocused;
	internals.invoke = async (cmd: string, args?: unknown) => {
		cmds.push(cmd);
		return origInvoke(
			cmd,
			args as { event?: string; handler?: MockTauriListener },
		);
	};

	try {
		// 1. Reset menu open state via sync-menu-scope -> blur within grace window (<350ms) must NOT close menu
		await tauriListeners["sync-menu-scope"]?.({ payload: 0 });
		cmds.length = 0;
		globalListeners.blur?.();
		await new Promise((r) => setTimeout(r, 110));
		assert.equal(cmds.includes("hide_menu_window"), false);

		// 2. Hovering submenu activates hasActiveSubmenu; hovering a regular item resets it and hides submenu window
		const mockSubmenuBtn = {
			id: "ghost-switch-btn",
			classList: { contains: (c: string) => c === "has-submenu" },
			getBoundingClientRect: () => ({ top: 100 }),
			closest: (sel: string): unknown =>
				sel === ".menu-item" ? mockSubmenuBtn : null,
		};
		const mockRegularItem = {
			id: "friends-btn",
			classList: { contains: () => false },
			closest: (sel: string): unknown =>
				sel === ".menu-item" ? mockRegularItem : null,
		};
		await new Promise((r) => setTimeout(r, 200));
		documentListeners.mouseover?.({ target: mockSubmenuBtn });
		documentListeners.mouseover?.({ target: mockRegularItem });
		await new Promise((r) => setTimeout(r, 20));
		assert.equal(cmds.includes("hide_submenu_window"), true);

		// 3. After grace window (>350ms), focus cancels pending blur timer; uncancelled blur closes menu
		await new Promise((r) => setTimeout(r, 180));
		cmds.length = 0;
		docFocused = false;
		globalListeners.blur?.();
		globalListeners.focus?.();
		await new Promise((r) => setTimeout(r, 110));
		assert.equal(cmds.includes("hide_menu_window"), false);

		globalListeners.blur?.();
		await new Promise((r) => setTimeout(r, 110));
		assert.equal(cmds.includes("hide_menu_window"), true);
	} finally {
		internals.invoke = origInvoke;
		(document as unknown as { hasFocus?: () => boolean }).hasFocus =
			origHasFocus;
	}
});

test("context menu enforces non-draggable invariant specification", () => {
	let dragCalled = false;
	const internals = globalThis.__TAURI_INTERNALS__ as MockTauriInternals;
	const origInvoke = internals.invoke;
	internals.invoke = async (cmd: string) => {
		if (cmd.includes("drag")) {
			dragCalled = true;
		}
		return origInvoke(cmd, {});
	};

	// Simulating mousedown on document/menu background should NOT trigger dragging
	documentListeners.mousedown?.({ button: 0, target: { closest: () => null } });
	assert.equal(
		dragCalled,
		false,
		"Menu windows must remain non-draggable per design specification",
	);
});

test("computeMenuWindowSize fits sidebar + container width and clamps bounds", () => {
	const origQuerySelector = globalThis.document.querySelector;
	try {
		globalThis.document.querySelector = ((sel: string) => {
			if (sel === ".menu-sidebar") {
				return { getBoundingClientRect: () => ({ width: 20, height: 320 }) };
			}
			if (sel === ".menu-container") {
				return {
					getBoundingClientRect: () => ({
						width: 165,
						height: 320,
						right: 185,
					}),
				};
			}
			return null;
		}) as unknown as typeof globalThis.document.querySelector;

		assert.deepEqual(computeMenuWindowSize(), { width: 185, height: 320 });

		// Clamp minimum width (150) & maximum width (380)
		globalThis.document.querySelector = ((sel: string) => {
			if (sel === ".menu-sidebar") {
				return { getBoundingClientRect: () => ({ width: 10, height: 120 }) };
			}
			if (sel === ".menu-container") {
				return {
					getBoundingClientRect: () => ({ width: 90, height: 120, right: 100 }),
				};
			}
			return null;
		}) as unknown as typeof globalThis.document.querySelector;
		assert.deepEqual(computeMenuWindowSize(), { width: 150, height: 120 });

		globalThis.document.querySelector = ((sel: string) => {
			if (sel === ".menu-sidebar") {
				return { getBoundingClientRect: () => ({ width: 40, height: 700 }) };
			}
			if (sel === ".menu-container") {
				return {
					getBoundingClientRect: () => ({
						width: 400,
						height: 700,
						right: 440,
					}),
				};
			}
			return null;
		}) as unknown as typeof globalThis.document.querySelector;
		assert.deepEqual(computeMenuWindowSize(), { width: 380, height: 650 });
	} finally {
		globalThis.document.querySelector = origQuerySelector;
	}
});

test("_triggerSubmenuWindow positions submenu using actual .menu-container right edge", async () => {
	const origQuerySelector = globalThis.document.querySelector;
	const origScreenX = globalThis.screenX;
	const internals = globalThis.__TAURI_INTERNALS__ as MockTauriInternals;
	const origInvoke = internals.invoke;
	let capturedX: number | undefined;

	globalThis.screenX = 100;
	globalThis.document.querySelector = ((sel: string) => {
		if (sel === ".menu-container") {
			return {
				getBoundingClientRect: () => ({ width: 170, height: 300, right: 190 }),
			};
		}
		return null;
	}) as unknown as typeof globalThis.document.querySelector;
	internals.invoke = async (cmd: string, args?: unknown) => {
		if (cmd === "show_submenu_window") {
			capturedX = (args as { params?: { x?: number } })?.params?.x;
			return;
		}
		return origInvoke(
			cmd,
			args as { event?: string; handler?: MockTauriListener },
		);
	};

	try {
		await new Promise((r) => setTimeout(r, 200));
		const btn = {
			id: "shell-btn",
			classList: { contains: (c: string) => c === "has-submenu" },
			getBoundingClientRect: () => ({ top: 80 }),
			closest: (sel: string): unknown => (sel === ".menu-item" ? btn : null),
		};
		documentListeners.click?.({ target: btn });
		assert.equal(capturedX, 100 + 190 + 2);
	} finally {
		globalThis.document.querySelector = origQuerySelector;
		globalThis.screenX = origScreenX;
		internals.invoke = origInvoke;
	}
});

test("adjustMenuWindowSize invokes resize_menu_window with measured size", async () => {
	const origQuerySelector = globalThis.document.querySelector;
	const internals = globalThis.__TAURI_INTERNALS__ as MockTauriInternals;
	const origInvoke = internals.invoke;
	let capturedArgs: { width?: number; height?: number } | undefined;

	globalThis.document.querySelector = ((sel: string) => {
		if (sel === ".menu-sidebar") {
			return { getBoundingClientRect: () => ({ width: 20, height: 300 }) };
		}
		if (sel === ".menu-container") {
			return {
				getBoundingClientRect: () => ({ width: 168, height: 300, right: 188 }),
			};
		}
		return null;
	}) as unknown as typeof globalThis.document.querySelector;
	internals.invoke = async (cmd: string, args?: unknown) => {
		if (cmd === "resize_menu_window") {
			capturedArgs = args as { width?: number; height?: number };
			return;
		}
		return origInvoke(
			cmd,
			args as { event?: string; handler?: MockTauriListener },
		);
	};

	try {
		await adjustMenuWindowSize(true);
		assert.deepEqual(capturedArgs, { width: 188, height: 300 });
	} finally {
		globalThis.document.querySelector = origQuerySelector;
		internals.invoke = origInvoke;
	}
});

test("mouseover on same active submenu item does not re-trigger show_submenu_window", async () => {
	const internals = globalThis.__TAURI_INTERNALS__ as MockTauriInternals;
	const origInvoke = internals.invoke;
	let showCount = 0;

	internals.invoke = async (cmd: string, args?: unknown) => {
		if (cmd === "show_submenu_window") {
			showCount += 1;
			return;
		}
		return origInvoke(
			cmd,
			args as { event?: string; handler?: MockTauriListener },
		);
	};

	try {
		await new Promise((r) => setTimeout(r, 200));
		const btn = {
			id: "balloon-btn",
			classList: { contains: (c: string) => c === "has-submenu" },
			getBoundingClientRect: () => ({ top: 120 }),
			closest: (sel: string): unknown => (sel === ".menu-item" ? btn : null),
		};
		documentListeners.mouseover?.({ target: btn });
		await new Promise((r) => setTimeout(r, 200));
		documentListeners.mouseover?.({ target: btn });
		assert.equal(showCount, 1);
	} finally {
		internals.invoke = origInvoke;
	}
});
