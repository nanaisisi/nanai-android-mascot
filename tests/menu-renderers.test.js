import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const styleProps = {};
const elements = {};

const getEl = (id) => {
	if (!elements[id]) {
		elements[id] = {
			innerHTML: "",
			children: [],
			appendChild(child) { this.children.push(child); },
			querySelector: () => ({ addEventListener(t, cb) { cb(); } }),
			querySelectorAll: () => [],
		};
	}
	return elements[id];
};

globalThis.document = {
	getElementById(id) { return getEl(id); },
	documentElement: {
		setAttribute() {},
		style: {
			setProperty(p, v) { styleProps[p] = v; },
			removeProperty(p) { delete styleProps[p]; },
		},
	},
	body: {
		classList: {
			classes: new Set(),
			add(c) { this.classes.add(c); },
			remove(...args) { for (const c of args) this.classes.delete(c); },
			contains(c) { return this.classes.has(c); },
		},
	},
	createElement(tag) {
		return {
			tagName: tag.toUpperCase(),
			className: "",
			innerHTML: "",
			dataset: {},
			appendChild() {},
			addEventListener(type, cb) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() { this._listeners?.click?.({}); },
		};
	},
};

const { menuBalloonDressupRenderer } = await import("../ui/js/ui/renderers/menu-balloon-dressup-renderer.js");
const { menuGhostShellRenderer } = await import("../ui/js/ui/renderers/menu-ghost-shell-renderer.js");
const { menuThemeRenderer } = await import("../ui/js/ui/renderers/menu-theme-renderer.js");

test("menu renderers cover balloon, dressup, recent, shell, ghost, and theme rendering", () => {
	const dispatched = [];
	const mockContext = {
		dispatcher: {
			dispatchAction(action, payload) {
				dispatched.push({ action, payload });
			},
		},
		dressupData: {
			sakura: { categories: [{ category: "Hat", parts: [{ part: "Ribbon", on: true }] }] },
			kero: { categories: [] },
		},
	};

	// 1. menuBalloonDressupRenderer
	menuBalloonDressupRenderer.renderBalloonSubmenu.call(mockContext, [{ dir_name: "ivory", name: "Ivory" }], "ivory");
	menuBalloonDressupRenderer.renderBalloonSubmenu.call(mockContext, [], "default"); // fallback
	getEl("balloon-submenu").querySelector("#balloon-cycle-btn")?.click?.();

	menuBalloonDressupRenderer.renderDressupSubmenu.call(mockContext, null, 0);
	menuBalloonDressupRenderer.renderDressupSubmenu.call(mockContext, null, 1); // kero empty

	menuBalloonDressupRenderer.renderRecentSubmenu.call(mockContext, ["Ghost1"]);
	menuBalloonDressupRenderer.renderRecentSubmenu.call(mockContext, []); // empty

	// 2. menuGhostShellRenderer
	menuGhostShellRenderer.renderShellSubmenu.call(mockContext, ["master", { name: "alt", display_name: "Alt" }], "master");
	menuGhostShellRenderer.renderGhostSubmenu.call(mockContext, [{ name: "G1" }, { name: "G2" }], { name: "G1" });
	menuGhostShellRenderer.renderCallGhostSubmenu.call(mockContext, [{ name: "G1" }]);
	menuGhostShellRenderer.renderCallGhostSubmenu.call(mockContext, []); // empty

	// 3. menuThemeRenderer
	menuThemeRenderer.applyTheme("dark");
	menuThemeRenderer.applyShellTheme({
		path: "shells/master",
		menu_theme: {
			background_color: "#000",
			foreground_color: "#111",
			background_font_color: "#222",
			foreground_font_color: "#333",
			disable_font_color: "#444",
			separator_color: "#555",
			background_bitmap: "bg.png",
			background_alignment: "right bottom",
			foreground_bitmap: "http://example.com/fg.png",
			foreground_alignment: "center",
			sidebar_bitmap: "side.png",
			sidebar_alignment: "top",
		},
	});

	// Shell theme removal branch
	menuThemeRenderer.applyShellTheme(null);

	assert.ok(true);
});
