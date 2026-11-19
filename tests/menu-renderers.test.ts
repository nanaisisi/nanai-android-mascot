import assert from "node:assert/strict";
import { test } from "vitest";
import type { ShellMenuTheme } from "../ui/ts/ui/renderers/menu-theme-renderer.js";

interface MockButtonEl {
	tagName: string;
	className: string;
	innerHTML: string;
	dataset: Record<string, string>;
	_listeners?: Record<string, (e?: unknown) => void>;
	appendChild: () => void;
	addEventListener: (type: string, cb: (e?: unknown) => void) => void;
	click: () => void;
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
const styleProps: Record<string, string> = {};
const createdButtons: MockButtonEl[] = [];
let returnNullContainer = false;

const getEl = (_id: string) => {
	if (returnNullContainer) return null;
	const container = {
		innerHTML: "",
		children: [] as unknown[],
		appendChild(child: unknown) {
			if (child) container.children.push(child);
		},
		querySelector: (sel: string) => {
			if (sel === "#balloon-cycle-btn") {
				return {
					addEventListener(_t: string, cb: () => void) {
						cb();
					},
				};
			}
			return null;
		},
		querySelectorAll: () => [],
	};
	return container as unknown as HTMLElement;
};

globalThis.document = {
	getElementById(id: string) {
		return getEl(id);
	},
	documentElement: {
		setAttribute() {},
		style: {
			setProperty(p: string, v: string) {
				styleProps[p] = v;
			},
			removeProperty(p: string) {
				delete styleProps[p];
				return "";
			},
		},
	},
	body: {
		classList: (() => {
			const classes = new Set<string>();
			return {
				classes,
				add(c: string) {
					classes.add(c);
				},
				remove(...args: string[]) {
					for (const c of args) classes.delete(c);
				},
				contains(c: string) {
					return classes.has(c);
				},
			};
		})() as unknown as DOMTokenList,
	},
	createElement(tag: string) {
		const btn: MockButtonEl = {
			tagName: tag.toUpperCase(),
			className: "",
			innerHTML: "",
			dataset: {},
			appendChild() {},
			addEventListener(type: string, cb: (e?: unknown) => void) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({});
			},
		};
		if (tag === "button") createdButtons.push(btn);
		return btn as unknown as HTMLElement;
	},
} as unknown as Document;

const { menuBalloonDressupRenderer } = await import(
	"../ui/ts/ui/renderers/menu-balloon-dressup-renderer.js"
);
const { menuGhostShellRenderer } = await import(
	"../ui/ts/ui/renderers/menu-ghost-shell-renderer.js"
);
const { menuThemeRenderer } = await import(
	"../ui/ts/ui/renderers/menu-theme-renderer.js"
);

test("menu renderers cover 100% of balloon, dressup, recent, shell, ghost, and theme rendering", () => {
	const dispatched: Array<{ action: string; payload: unknown }> = [];
	const mockContext = {
		dispatcher: {
			async dispatchAction(action: string, payload?: unknown) {
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
	menuThemeRenderer.applyTheme(null as unknown as string);
	menuThemeRenderer.applyTheme("dark");

	// Test convertFileSrc with globalThis.__TAURI__
	globalThis.__TAURI__ = {
		core: {
			convertFileSrc: (p: string) => `tauri://${p}`,
		},
	} as unknown as TauriApi;

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

	// Test sidebar_alignment = "top" & activeShell without path
	menuThemeRenderer.applyShellTheme({
		menu_theme: {
			background_bitmap: "data:image/png;base64,abc",
			background_alignment: "right, repeat-y",
			sidebar_bitmap: "asset://side.png",
			sidebar_alignment: "top",
		},
	});
	assert.equal(styleProps["--menu-sidebar-position"], "left top");

	// Test sidebar_alignment omitted & background_alignment undefined (covers line 81 & 101 falsy align)
	menuThemeRenderer.applyShellTheme({
		menu_theme: {
			background_bitmap: "bg_no_align.png",
			background_alignment: undefined, // covers alignRaw = undefined branch (line 81 & 101)
			sidebar_bitmap: "side.png",
		},
	});
	assert.equal(styleProps["--menu-sidebar-position"], "left top");

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
		} as unknown as ShellMenuTheme,
	});

	// Shell theme removal branch
	menuThemeRenderer.applyShellTheme(null);

	assert.ok(true);
});
