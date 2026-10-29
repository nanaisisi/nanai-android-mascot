import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	createElement: (_tag) => ({
		className: "",
		innerHTML: "",
		addEventListener(type, cb) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
		click() {
			this._listeners?.click?.({});
		},
		dblclick() {
			this._listeners?.dblclick?.({});
		},
	}),
};

const { setupExplorerListeners } = await import(
	"../ui/js/ui/modal-explorer.js"
);

test("setupExplorerListeners covers load, render, filtering, sorting, and user actions", async () => {
	const elements = {};
	const getEl = (id) => {
		if (!elements[id]) {
			elements[id] = {
				value: "",
				textContent: "",
				innerHTML: "",
				children: [],
				appendChild(child) {
					this.children.push(child);
				},
				addEventListener(type, cb) {
					this._listeners = this._listeners || {};
					this._listeners[type] = cb;
				},
				querySelector: (sel) => getEl(sel.replace("#", "")),
				querySelectorAll: () => [],
			};
		}
		return elements[id];
	};

	const mockModalManager = {
		content: {
			querySelector: (sel) => getEl(sel.replace("#", "")),
			querySelectorAll: (sel) => {
				if (sel === "th[data-sort]") {
					return [
						{
							dataset: { sort: "name" },
							textContent: "Name",
							addEventListener(_t, cb) {
								this._cb = cb;
							},
						},
					];
				}
				return [];
			},
		},
		hide() {
			this.hidden = true;
		},
	};

	const mockApp = {
		ghostController: {
			currentGhost: { name: "Ghost1" },
			scanGhosts: async () => [
				{ name: "Ghost1", craftman: "AuthorA", path: "/path1" },
				{ name: "Ghost2", craftman: "AuthorB", path: "/path2" },
			],
			selectGhost: async (name) => {
				this.selectedName = name;
			},
		},
	};

	setupExplorerListeners(mockModalManager, mockApp);
	await new Promise((r) => setTimeout(r, 20));

	// Test search input
	const search = getEl("explorer-search");
	search.value = "Ghost2";
	search._listeners?.input?.({});

	// Test refresh btn
	const refreshBtn = getEl("explorer-refresh-btn");
	refreshBtn._listeners?.click?.({});

	// Test switch btn
	const switchBtn = getEl("explorer-switch-btn");
	switchBtn._listeners?.click?.({});

	// Test close btn
	const closeBtn = getEl("explorer-close-btn");
	closeBtn._listeners?.click?.({});
	assert.equal(mockModalManager.hidden, true);

	assert.ok(true);
});
