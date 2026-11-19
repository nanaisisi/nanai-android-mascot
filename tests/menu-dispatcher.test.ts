import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.location = { search: "?scope=0" } as unknown as Location;
const classList = {
	classes: new Set<string>(),
	add(c: string) {
		this.classes.add(c);
	},
	remove(c: string) {
		this.classes.delete(c);
	},
	contains(c: string) {
		return this.classes.has(c);
	},
};
globalThis.document = {
	body: { classList: classList as unknown as DOMTokenList },
} as unknown as Document;
globalThis.parent = globalThis as unknown as Window;

const { MenuDispatcher } = await import("../ui/ts/ui/menu-dispatcher.js");

test("MenuDispatcher covers constructor, setScope, and dispatchAction", async () => {
	const dispatcher = new MenuDispatcher();
	assert.equal(dispatcher.currentScope, 0);

	// 1. setScope (scope > 0 adds subchar-mode, scope 0 removes)
	dispatcher.setScope(1);
	assert.equal(classList.contains("subchar-mode"), true);
	dispatcher.setScope(0);
	assert.equal(classList.contains("subchar-mode"), false);

	// 2. dispatchAction with empty action
	await dispatcher.dispatchAction("");

	// 3. dispatchAction with null payload
	await dispatcher.dispatchAction("talk", null);

	// 4. dispatchAction with object payload
	await dispatcher.dispatchAction("switch-ghost", { name: "Ghost2" });

	// 5. dispatchAction with Tauri available (emit & invoke hide_menu_window)
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string) => {
			if (cmd === "hide_menu_window") return;
		},
		transformCallback: (cb: unknown) => cb,
	};
	globalThis.window = globalThis as unknown as Window & typeof globalThis;

	await dispatcher.dispatchAction("balloon");
	await dispatcher.dispatchAction("request-sync");

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});

test("showDevPalette shows and hides modal host window in Tauri and handles dev-palette/open-dev actions", async () => {
	const origDocument = globalThis.document;
	const origTauri = globalThis.__TAURI_INTERNALS__;
	const invoked: string[] = [];
	const elements = new Map<string, MockPaletteElement>();

	interface MockPaletteElement {
		id: string;
		className: string;
		innerHTML: string;
		style: { cssText: string; display?: string };
		children: MockPaletteElement[];
		_listeners: Record<string, () => void>;
		appendChild(child: MockPaletteElement): void;
		querySelector(sel: string): MockPaletteElement | null;
		addEventListener(type: string, cb: () => void): void;
		remove(): void;
		click(): void;
	}

	const createMockEl = (tag: string): MockPaletteElement => ({
		id: tag,
		className: "",
		innerHTML: "",
		style: { cssText: "" },
		children: [],
		_listeners: {},
		appendChild(child: MockPaletteElement) {
			this.children.push(child);
			if (child.id) elements.set(child.id, child);
		},
		querySelector(sel: string): MockPaletteElement | null {
			if (sel === "#close-dev-palette-btn") {
				return closeBtn;
			}
			return null;
		},
		addEventListener(type: string, cb: () => void) {
			this._listeners[type] = cb;
		},
		remove() {
			if (this.id) elements.delete(this.id);
		},
		click() {
			this._listeners.click?.();
		},
	});

	const closeBtn = createMockEl("close-dev-palette-btn");
	const modalOverlay = createMockEl("modal-overlay");
	modalOverlay.style.display = "none";

	globalThis.document = {
		body: {
			classList: classList as unknown as DOMTokenList,
			appendChild(el: MockPaletteElement) {
				if (el.id) elements.set(el.id, el);
			},
		},
		getElementById(id: string) {
			if (id === "modal-overlay") return modalOverlay;
			if (id === "close-dev-palette-btn") return closeBtn;
			return elements.get(id) ?? null;
		},
		createElement(tag: string) {
			return createMockEl(tag);
		},
	} as unknown as Document;

	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string) => {
			invoked.push(cmd);
		},
		transformCallback: (cb: unknown) => cb,
	};

	try {
		const { showDevPalette } = await import("../ui/ts/ui/dev-palette.js");
		const { handleMenuActionImpl } = await import(
			"../ui/ts/core/actions/menu-action-dispatcher.js"
		);

		// 1. handleMenuActionImpl("dev-palette") opens palette and shows main modal host window
		handleMenuActionImpl(
			{
				ghostController: { currentGhost: { name: "TestGhost" } },
				elements: {},
			},
			"dev-palette",
		);
		assert.ok(elements.has("nanai-dev-palette-window"));
		assert.deepEqual(invoked, ["show_modal_window"]);

		// 2. Clicking close button removes palette and hides modal host window when modal-overlay is closed
		invoked.length = 0;
		closeBtn.click();
		assert.equal(elements.has("nanai-dev-palette-window"), false);
		assert.deepEqual(invoked, ["hide_modal_window"]);

		// 3. handleMenuActionImpl("open-dev") opens palette, and keeps modal window open if modal-overlay is active on toggle-close
		invoked.length = 0;
		handleMenuActionImpl(
			{
				ghostController: { currentGhost: { name: "TestGhost" } },
				elements: {},
			},
			"open-dev",
		);
		assert.ok(elements.has("nanai-dev-palette-window"));
		assert.deepEqual(invoked, ["show_modal_window"]);

		invoked.length = 0;
		modalOverlay.style.display = "flex";
		showDevPalette({ ghostName: "TestGhost" });
		assert.equal(elements.has("nanai-dev-palette-window"), false);
		assert.deepEqual(invoked, []);
	} finally {
		globalThis.document = origDocument;
		if (origTauri === undefined) {
			delete globalThis.__TAURI_INTERNALS__;
		} else {
			globalThis.__TAURI_INTERNALS__ = origTauri;
		}
	}
});

test("dev-palette collision checkbox toggles showCollisionArea without double-flipping and emits subchar collisions", async () => {
	const origDocument = globalThis.document;
	const origTauri = globalThis.__TAURI_INTERNALS__;
	const elements = new Map<string, MockEl>();
	const emitted: Array<{ event: string; payload: unknown }> = [];

	interface MockEl {
		id: string;
		className: string;
		checked: boolean;
		style: { cssText: string; display?: string };
		children: MockEl[];
		_innerHTML: string;
		_listeners: Record<string, Array<() => void>>;
		innerHTML: string;
		appendChild(child: MockEl): void;
		querySelector(sel: string): MockEl | null;
		addEventListener(type: string, cb: () => void): void;
		dispatch(type: string): void;
		remove(): void;
	}

	const createMockEl = (tag: string): MockEl => {
		const el: MockEl = {
			id: tag,
			className: "",
			checked: false,
			style: { cssText: "" },
			children: [],
			_innerHTML: "",
			_listeners: {},
			get innerHTML() {
				return this._innerHTML;
			},
			set innerHTML(val: string) {
				this._innerHTML = val;
				const idMatch = val.match(/id="([^"]+)"/);
				if (idMatch && val.includes("<input")) {
					const inputEl = createMockEl("input");
					inputEl.id = idMatch[1];
					inputEl.checked = val.includes("checked");
					elements.set(inputEl.id, inputEl);
					this.children.push(inputEl);
				}
			},
			appendChild(child: MockEl) {
				this.children.push(child);
				if (child.id) elements.set(child.id, child);
			},
			querySelector(sel: string): MockEl | null {
				if (sel === "input") {
					return (
						this.children.find((c) => c.id.startsWith("dev-check-")) ?? null
					);
				}
				if (sel.startsWith("#")) {
					return elements.get(sel.slice(1)) ?? null;
				}
				return null;
			},
			addEventListener(type: string, cb: () => void) {
				this._listeners[type] ??= [];
				this._listeners[type].push(cb);
			},
			dispatch(type: string) {
				for (const cb of this._listeners[type] ?? []) {
					cb();
				}
			},
			remove() {
				if (this.id) elements.delete(this.id);
			},
		};
		return el;
	};

	const modalOverlay = createMockEl("modal-overlay");
	modalOverlay.style.display = "none";

	globalThis.document = {
		body: {
			classList: classList as unknown as DOMTokenList,
			appendChild(el: MockEl) {
				if (el.id) elements.set(el.id, el);
			},
		},
		getElementById(id: string) {
			if (id === "modal-overlay") return modalOverlay;
			return elements.get(id) ?? null;
		},
		querySelector() {
			return null;
		},
		createElement(tag: string) {
			return createMockEl(tag);
		},
	} as unknown as Document;

	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd: string, args?: unknown) => {
			if (cmd === "plugin:event|emit") {
				const a = args as { event: string; payload: unknown };
				emitted.push({ event: a.event, payload: a.payload });
			}
		},
		transformCallback: (cb: unknown) => cb,
	};

	try {
		const { showDevPalette } = await import("../ui/ts/ui/dev-palette.js");
		const { handleMenuActionImpl } = await import(
			"../ui/ts/core/actions/menu-action-dispatcher.js"
		);

		const col0 = {
			name: "Head",
			shape: "rect",
			x1: 10,
			y1: 10,
			x2: 50,
			y2: 50,
		};
		const col1 = { name: "Face", shape: "rect", x1: 5, y1: 5, x2: 20, y2: 20 };

		const app: {
			settings: { showCollisionArea: boolean };
			showCollisionArea: boolean;
			surfaceManager: {
				currentSurfaceId: number;
				keroSurfaceId: number;
				collisions: Record<string, unknown[]>;
			};
			handleMenuAction: (action: string, payload?: unknown) => void;
		} = {
			settings: { showCollisionArea: false },
			showCollisionArea: false,
			surfaceManager: {
				currentSurfaceId: 0,
				keroSurfaceId: 10,
				collisions: {
					"0": [col0],
					"10": [col1],
				},
			},
			handleMenuAction(action: string, payload?: unknown) {
				handleMenuActionImpl(
					this as unknown as Parameters<typeof handleMenuActionImpl>[0],
					action,
					payload,
				);
			},
		};

		showDevPalette({ ghostName: "TestGhost", app });
		const colCheckbox = elements.get("dev-check-collision");
		assert.ok(colCheckbox);
		assert.equal(colCheckbox.checked, false);

		// 1. Checking the checkbox enables collision display (must not flip back to false)
		colCheckbox.checked = true;
		colCheckbox.dispatch("change");
		assert.equal(app.settings.showCollisionArea, true);
		assert.equal(app.showCollisionArea, true);
		assert.deepEqual(
			emitted.filter((e) => e.event === "update-subchar-collisions-0").at(-1),
			{
				event: "update-subchar-collisions-0",
				payload: { visible: true, surfaceId: 0, collisions: [col0] },
			},
		);
		assert.deepEqual(
			emitted.filter((e) => e.event === "update-subchar-collisions-1").at(-1),
			{
				event: "update-subchar-collisions-1",
				payload: { visible: true, surfaceId: 10, collisions: [col1] },
			},
		);

		// 2. Unchecking the checkbox disables collision display and clears subchar overlays
		emitted.length = 0;
		colCheckbox.checked = false;
		colCheckbox.dispatch("change");
		assert.equal(app.settings.showCollisionArea, false);
		assert.equal(app.showCollisionArea, false);
		assert.deepEqual(
			emitted.filter((e) => e.event === "update-subchar-collisions-0").at(-1),
			{
				event: "update-subchar-collisions-0",
				payload: { visible: false, surfaceId: 0, collisions: [] },
			},
		);
		assert.deepEqual(
			emitted.filter((e) => e.event === "update-subchar-collisions-1").at(-1),
			{
				event: "update-subchar-collisions-1",
				payload: { visible: false, surfaceId: 10, collisions: [] },
			},
		);

		// 3. Direct handleMenuActionImpl works with both `{ app }` context and direct `app` context
		handleMenuActionImpl(
			app as unknown as Parameters<typeof handleMenuActionImpl>[0],
			"toggle-collision-area",
		);
		assert.equal(app.settings.showCollisionArea, true);
		assert.equal(colCheckbox.checked, true);

		handleMenuActionImpl(
			{
				app,
				elements: {},
			},
			"show-collision-area",
			{ enabled: false },
		);
		assert.equal(app.settings.showCollisionArea, false);
		assert.equal(colCheckbox.checked, false);
	} finally {
		globalThis.document = origDocument;
		if (origTauri === undefined) {
			delete globalThis.__TAURI_INTERNALS__;
		} else {
			globalThis.__TAURI_INTERNALS__ = origTauri;
		}
	}
});
