import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const styleProps = {};
const createdButtons = [];
let returnNullContainer = false;

const getEl = (_id) => {
	if (returnNullContainer) return null;
	return {
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
	};
};

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
					{
						category: "Hat",
						parts: [
							{ part: "Ribbon", on: true },
							{ part: "Glasses", on: false },
						],
					},
				],
			},
			kero: { categories: [] },
		},
	};

	createdButtons.length = 0;

	// 1. menuBalloonDressupRenderer
	menuBalloonDressupRenderer.renderBalloonSubmenu.call(
		mockContext,
		[
			{ dir_name: "ivory", name: "Ivory" },
			{ dir_name: "pixel", name: "Pixel" },
		],
		"ivory",
	);

	menuBalloonDressupRenderer.renderBalloonSubmenu.call(
		mockContext,
		[],
		"ivory",
	);

	menuBalloonDressupRenderer.renderDressupSubmenu.call(mockContext, null, 0);
	menuBalloonDressupRenderer.renderDressupSubmenu.call(mockContext, null, 1);

	menuBalloonDressupRenderer.renderRecentSubmenu.call(mockContext, ["Ghost1"]);
	menuBalloonDressupRenderer.renderRecentSubmenu.call(mockContext, []);

	// 2. menuGhostShellRenderer
	menuGhostShellRenderer.renderShellSubmenu.call(
		mockContext,
		[
			"master",
			{ display_name: "AltFallback" },
			{ name: "alt", display_name: "Alt" },
		],
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
	menuGhostShellRenderer.renderCallGhostSubmenu.call(mockContext, []);

	for (const btn of createdButtons) {
		btn.click();
	}
	assert.ok(dispatched.length > 0);

	// 3. Null container guards
	returnNullContainer = true;
	menuBalloonDressupRenderer.renderBalloonSubmenu.call(
		mockContext,
		[],
		"default",
	);
	menuBalloonDressupRenderer.renderDressupSubmenu.call(mockContext, null, 0);
	menuBalloonDressupRenderer.renderRecentSubmenu.call(mockContext, []);
	menuGhostShellRenderer.renderShellSubmenu.call(mockContext, [], "master");
	menuGhostShellRenderer.renderGhostSubmenu.call(mockContext, [], null);
	menuGhostShellRenderer.renderCallGhostSubmenu.call(mockContext, []);
	returnNullContainer = false;

	// 4. menuThemeRenderer
	// Test applyTheme with falsy theme
	menuThemeRenderer.applyTheme(null);
	menuThemeRenderer.applyTheme("dark");

	// Test convertFileSrc with globalThis.__TAURI__
	globalThis.__TAURI__ = {
		core: {
			convertFileSrc: (p) => `tauri://${p}`,
		},
	};

	menuThemeRenderer.applyShellTheme({
		path: "shells/master",
		menu_theme: {
			background_color: "#000",
			foreground_color: "#111",
			font_color: "#222",
			foreground_font_color: "#333",
			disable_font_color: "#444",
			separator_color: "#555",
			background_bitmap: "http://example.com/bg.png", // covers http:// prefix (line 63)
			background_alignment: "right bottom, repeat-x repeat-y",
			foreground_bitmap: "https://example.com/fg.png",
			foreground_alignment: "center",
			sidebar_bitmap: "side.png",
			sidebar_alignment: "top",
		},
	});
	assert.equal(styleProps["--menu-bg-position"], "right bottom");
	assert.equal(styleProps["--menu-bg-repeat"], "repeat");
	assert.equal(styleProps["--menu-sidebar-position"], "left top");

	// Test sidebar_alignment = "bottom" & activeShell without path
	menuThemeRenderer.applyShellTheme({
		menu_theme: {
			background_bitmap: "data:image/png;base64,abc",
			background_alignment: "right, repeat-y",
			sidebar_bitmap: "asset://side.png",
			sidebar_alignment: "bottom",
		},
	});
	assert.equal(styleProps["--menu-sidebar-position"], "left bottom");

	// Test sidebar_alignment omitted & background_alignment undefined (covers line 81 & 101 falsy align)
	menuThemeRenderer.applyShellTheme({
		menu_theme: {
			background_bitmap: "bg_no_align.png",
			background_alignment: undefined, // covers alignRaw = undefined branch (line 81 & 101)
			sidebar_bitmap: "side.png",
		},
	});
	assert.equal(styleProps["--menu-sidebar-position"], "left bottom");

	// Test background_alignment = "repeat-x" (covers line 91 repeat-x branch)
	menuThemeRenderer.applyShellTheme({
		menu_theme: {
			background_bitmap: "bg_repeat_x.png",
			background_alignment: "repeat-x",
		},
	});
	assert.equal(styleProps["--menu-bg-repeat"], "repeat-x");

	delete globalThis.__TAURI__;

	// Test relative path without shellPath in non-Tauri environment
	menuThemeRenderer.applyShellTheme({
		path: "",
		menu_theme: {
			background_bitmap: "rel_bg.png",
			background_alignment: "center bottom, repeat-x",
		},
	});
	assert.equal(styleProps["--menu-bg-position"], "center bottom");
	assert.equal(styleProps["--menu-bg-repeat"], "repeat-x");

	// Alignment branch: "center top"
	menuThemeRenderer.applyShellTheme({
		path: "shells/master",
		menu_theme: {
			background_bitmap: "bg3.png",
			background_alignment: "center",
		},
	});
	assert.equal(styleProps["--menu-bg-position"], "center top");

	// Alignment branch: "left bottom" and "no-repeat"
	menuThemeRenderer.applyShellTheme({
		path: "shells/master",
		menu_theme: {
			background_bitmap: "bg4.png",
			background_alignment: "bottom, custom",
		},
	});
	assert.equal(styleProps["--menu-bg-position"], "left bottom");
	assert.equal(styleProps["--menu-bg-repeat"], "no-repeat");

	// Theme with falsy colors and falsy bitmaps
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
