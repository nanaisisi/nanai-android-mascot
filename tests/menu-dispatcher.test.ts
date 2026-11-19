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
