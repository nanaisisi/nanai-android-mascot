import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const children = [];
globalThis.document = {
	getElementById(id) {
		if (id === "submenu-content") {
			return {
				innerHTML: "",
				children,
				appendChild(child) { this.children.push(child); },
			};
		}
		return null;
	},
	createElement(tag) {
		return {
			tagName: tag.toUpperCase(),
			className: "",
			innerHTML: "",
			addEventListener(type, cb) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() { this._listeners?.click?.({}); },
		};
	},
};

const { renderSubmenuContent } = await import("../ui/js/ui/submenu-renderer.js");

test("renderSubmenuContent covers all submenu types (ghost, shell, dressup, balloon, recent)", () => {
	const dispatched = [];
	const dispatchSubmenuAction = (action, payload) => {
		dispatched.push({ action, payload });
	};

	// 1. type = "ghost"
	children.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "ghost",
		cachedGhosts: ["Ghost1", { name: "Ghost2" }],
		currentGhostName: "Ghost1",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[0].click();
	assert.equal(dispatched[0].action, "switch-ghost");

	// 2. type = "shell"
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "shell",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: ["master", { name: "alt", display_name: "Alternative" }],
		currentShellName: "alt",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[1].click();
	assert.equal(dispatched[0].action, "switch-shell");

	// 3. type = "dressup" (Sakura & Kero, empty categories)
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "dressup",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: {
			sakura: {
				categories: [
					{ category: "Hat", parts: [{ part: "Ribbon", on: true }] },
				],
			},
			kero: { categories: [] },
		},
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[1].click(); // click part button
	assert.equal(dispatched[0].action, "dressup-toggle");

	// Test kero empty dressup
	children.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "dressup",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: { sakura: { categories: [] }, kero: { categories: [] } },
		dressupScope: 1,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0); // shows "(着せ替えパーツなし)"

	// 4. type = "balloon"
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "balloon",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [{ dir_name: "ivory", name: "Ivory" }],
		currentBalloonTheme: "ivory",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[0].click();
	assert.equal(dispatched[0].action, "balloon-theme-ivory");

	// 5. type = "recent" (with items and empty)
	children.length = 0;
	dispatched.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "recent",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: ["Ghost1"],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);
	children[0].click();
	assert.equal(dispatched[0].action, "recent-ghost");

	// Empty recent
	children.length = 0;
	renderSubmenuContent({
		currentSubmenuType: "recent",
		cachedGhosts: [],
		currentGhostName: "",
		cachedShells: [],
		currentShellName: "",
		cachedDressup: null,
		dressupScope: 0,
		cachedBalloons: [],
		currentBalloonTheme: "",
		cachedRecentGhosts: [],
		dispatchSubmenuAction,
	});
	assert.ok(children.length > 0);

	assert.ok(true);
});
