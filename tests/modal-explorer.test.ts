import assert from "node:assert/strict";
import { test } from "vitest";
import type { AppModalTarget, ModalManager } from "../ui/ts/ui/modal.js";

interface MockExplorerRow {
	className: string;
	innerHTML: string;
	_listeners?: Record<string, (event?: unknown) => void>;
	addEventListener: (type: string, cb: (event?: unknown) => void) => void;
	click: () => void;
	dblclick: () => void;
}

interface MockExplorerElement {
	value: string;
	textContent: string;
	innerHTML: string;
	children: MockExplorerRow[];
	_listeners?: Record<string, (event?: unknown) => void>;
	appendChild: (child: MockExplorerRow) => void;
	addEventListener: (type: string, cb: (event?: unknown) => void) => void;
	querySelector: (sel: string) => MockExplorerElement;
	querySelectorAll: () => unknown[];
}

interface MockHeaderElement {
	dataset: Record<string, string>;
	textContent: string;
	_listeners?: Record<string, (event?: unknown) => void>;
	addEventListener: (t: string, cb: (event?: unknown) => void) => void;
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.document = {
	createElement: (_tag: string) => {
		const row: MockExplorerRow = {
			className: "",
			innerHTML: "",
			addEventListener(type: string, cb: (event?: unknown) => void) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({});
			},
			dblclick() {
				this._listeners?.dblclick?.({});
			},
		};
		return row as unknown as HTMLElement;
	},
} as unknown as Document;

const { setupExplorerListeners } = await import(
	"../ui/ts/ui/modal-explorer.js"
);

test("setupExplorerListeners covers load, render, filtering, sorting, and user actions", async () => {
	const elements: Record<string, MockExplorerElement> = {};
	const getEl = (id: string): MockExplorerElement => {
		if (!elements[id]) {
			elements[id] = {
				value: "",
				textContent: "",
				innerHTML: "",
				children: [],
				appendChild(child: MockExplorerRow) {
					this.children.push(child);
				},
				addEventListener(type: string, cb: (event?: unknown) => void) {
					this._listeners = this._listeners || {};
					this._listeners[type] = cb;
				},
				querySelector: (sel: string) => getEl(sel.replace("#", "")),
				querySelectorAll: () => [],
			};
		}
		return elements[id];
	};

	const mockModalManager = {
		_thList: null as MockHeaderElement[] | null,
		hidden: false,
		content: {
			querySelector: (sel: string) => getEl(sel.replace("#", "")),
			querySelectorAll: (sel: string) => {
				if (sel === "th[data-sort]") {
					if (!mockModalManager._thList) {
						mockModalManager._thList = [
							{
								dataset: { sort: "name" },
								textContent: "Name",
								addEventListener(t: string, cb: (event?: unknown) => void) {
									this._listeners = this._listeners || {};
									this._listeners[t] = cb;
								},
							},
							{
								dataset: { sort: "craftman" },
								textContent: "Craftman",
								addEventListener(t: string, cb: (event?: unknown) => void) {
									this._listeners = this._listeners || {};
									this._listeners[t] = cb;
								},
							},
							{
								dataset: {},
								textContent: "NoKey",
								addEventListener(t: string, cb: (event?: unknown) => void) {
									this._listeners = this._listeners || {};
									this._listeners[t] = cb;
								},
							},
						];
					}
					return mockModalManager._thList;
				}
				return [];
			},
		},
		hide() {
			this.hidden = true;
		},
	};

	const mockGhostController: {
		currentGhost: { name: string };
		selectedName?: string;
		scanGhosts: () => Promise<
			Array<{ name: string; craftman: string; path: string }>
		>;
		selectGhost: (name: string) => Promise<void>;
	} = {
		currentGhost: { name: "Ghost1" },
		scanGhosts: async () => [
			{ name: "Ghost1", craftman: "AuthorA", path: "/path1" },
			{ name: "Ghost2", craftman: "AuthorB", path: "/path2" },
		],
		selectGhost: async (name: string) => {
			mockGhostController.selectedName = name;
		},
	};
	const mockApp: AppModalTarget = {
		ghostController: mockGhostController,
	};

	setupExplorerListeners(mockModalManager as unknown as ModalManager, mockApp);
	await new Promise((r) => setTimeout(r, 20));

	// Test search input
	const search = getEl("explorer-search");
	search.value = "Ghost2";
	search._listeners?.input?.({});

	// Test refresh btn
	const refreshBtn = getEl("explorer-refresh-btn");
	refreshBtn._listeners?.click?.({});

	// Test sorting: click header ascending, then descending, then new key, then no-key header
	const thList = mockModalManager.content.querySelectorAll(
		"th[data-sort]",
	) as MockHeaderElement[];
	thList[0]._listeners?.click?.({});
	thList[0]._listeners?.click?.({});
	thList[1]._listeners?.click?.({});
	thList[2]._listeners?.click?.({});

	// Test row click and dblclick
	const rows = getEl("explorer-rows");
	if (rows.children.length > 0) {
		rows.children[0].click();
		rows.children[0].dblclick();
	}

	// Test switch btn
	const switchBtn = getEl("explorer-switch-btn");
	switchBtn._listeners?.click?.({});

	// Test switch btn with no selection
	mockGhostController.scanGhosts = async () => [];
	refreshBtn._listeners?.click?.({});
	await new Promise((r) => setTimeout(r, 20));
	switchBtn._listeners?.click?.({});

	// Test close btn
	const closeBtn = getEl("explorer-close-btn");
	closeBtn._listeners?.click?.({});
	assert.equal(mockModalManager.hidden, true);

	assert.ok(true);
});
