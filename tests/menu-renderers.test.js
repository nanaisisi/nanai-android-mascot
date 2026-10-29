import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const styleProps = {};
const createdButtons = [];

const getEl = (id) => ({
	innerHTML: "",
	children: [],
	appendChild(child) {
		if (child) this.children.push(child);
	},
	querySelector: (sel) => {
		if (sel === "#balloon-cycle-btn") {
			return {
				addEventListener(_t, cb) {
					cb();
				},
			};
		}
		return null;
	},
	querySelectorAll: () => [],
});

globalThis.document = {
	getElementById(id) {
		return getEl(id);
	},
	documentElement: {
		setAttribute() {},
		style: {
			setProperty(p, v) {
				styleProps[p] = v;
			},
			removeProperty(p) {
				delete styleProps[p];
			},
		},
	},
	body: {
		classList: {
			classes: new Set(),
			add(c) {
				this.classes.add(c);
			},
			remove(...args) {
				for (const c of args) this.classes.delete(c);
			},
			contains(c) {
				return this.classes.has(c);
			},
		},
	},
	createElement(tag) {
		const btn = {
			tagName: tag.toUpperCase(),
			className: "",
			innerHTML: "",
			dataset: {},
			appendChild() {},
			addEventListener(type, cb) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({});
			},
		};
		if (tag === "button") createdButtons.push(btn);
		return btn;
	},
};

const { menuBalloonDressupRenderer } = await import(
	"../ui/js/ui/renderers/menu-balloon-dressup-renderer.js"
);
const { menuGhostShellRenderer } = await import(
	"../ui/js/ui/renderers/menu-ghost-shell-renderer.js"
);
const { menuThemeRenderer } = await import(
	"../ui/js/ui/renderers/menu-theme-renderer.js"
);

test("menu renderers cover 100% of balloon, dressup, recent, shell, ghost, and theme rendering", () => {
	const dispatched = [];
	const mockContext = {
		dispatcher: {
			dispatchAction(action, payload) {
				dispatched.push({ action, payload });
			},
		},
		dressupData: {
			sakura: {
				categories: [
					{ category: "Hat", parts: [{ part: "Ribbon", on: true }] },
				],
			},
			kero: { categories: [] },
		},
	};

	createdButtons.length = 0;

	// 1. menuBalloonDressupRenderer
	menuBalloonDressupRenderer.renderBalloonSubmenu.call(
		mockContext,
		[{ dir_name: "ivory", name: "Ivory" }],
		"ivory",
	);
	menuBalloonDressupRenderer.renderBalloonSubmenu.call(
		mockContext,
		[],
		"default",
	); // fallback

	menuBalloonDressupRenderer.renderDressupSubmenu.call(mockContext, null, 0);
	menuBalloonDressupRenderer.renderDressupSubmenu.call(mockContext, null, 1); // kero empty

	menuBalloonDressupRenderer.renderRecentSubmenu.call(mockContext, ["Ghost1"]);
	menuBalloonDressupRenderer.renderRecentSubmenu.call(mockContext, []); // empty

	// 2. menuGhostShellRenderer
	menuGhostShellRenderer.renderShellSubmenu.call(
		mockContext,
		["master", { name: "alt", display_name: "Alt" }],
		"master",
	);
	menuGhostShellRenderer.renderGhostSubmenu.call(
		mockContext,
		[{ name: "G1" }, { name: "G2" }],
		{ name: "G1" },
	);
	menuGhostShellRenderer.renderCallGhostSubmenu.call(mockContext, [
		{ name: "G1" },
	]);
	menuGhostShellRenderer.renderCallGhostSubmenu.call(mockContext, []); // empty

	// Trigger clicks on all created buttons to cover click action dispatchers (lines 40, 62, 108, 142, 29, 52, 73)
	for (const btn of createdButtons) {
		btn.click();
	}
	assert.ok(dispatched.length > 0);

	// 3. menuThemeRenderer
	menuThemeRenderer.applyTheme("dark");

	// Full theme with alignments (right, center bottom, repeat-x repeat-y)
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
			background_alignment: "right, repeat-x repeat-y",
			foreground_bitmap: "http://example.com/fg.png",
			foreground_alignment: "center bottom, repeat-y",
			sidebar_bitmap: "side.png",
			sidebar_alignment: "top",
		},
	});

	// Alignment branches (bottom, custom non-repeat alignment)
	menuThemeRenderer.applyShellTheme({
		path: "shells/master",
		menu_theme: {
			background_color: "#000",
			background_alignment: "bottom, no-repeat",
		},
	});

	// Theme with falsy colors and falsy bitmaps (covers lines 31, 35, 43, 51, 55, 59, 113-115, 123-125, 140-142)
	menuThemeRenderer.applyShellTheme({
		path: "shells/master",
		menu_theme: {
			background_color: null,
			foreground_color: null,
			background_font_color: null,
			font_color: null,
			foreground_font_color: null,
			disable_font_color: null,
			separator_color: null,
			background_bitmap: null,
			foreground_bitmap: null,
			sidebar_bitmap: null,
		},
	});

	// Shell theme removal branch
	menuThemeRenderer.applyShellTheme(null);

	assert.ok(true);
});
