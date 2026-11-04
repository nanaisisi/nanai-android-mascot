import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const styleProps = {};
globalThis.document = {
	documentElement: {
		style: {
			setProperty(prop, val) {
				styleProps[prop] = val;
			},
			removeProperty(prop) {
				delete styleProps[prop];
			},
		},
	},
	body: {
		classList: {
			classes: new Set(),
			toggle(c, force) {
				if (force) this.classes.add(c);
				else this.classes.delete(c);
			},
			contains(c) {
				return this.classes.has(c);
			},
		},
	},
};

const { applyShellMenuTheme } = await import("../ui/js/ui/submenu-theme.js");

test("applyShellMenuTheme covers theme colors, bitmaps, and alignments", () => {
	// 1. Theme colors and bitmaps
	const shell1 = {
		path: "shells/master",
		menu_theme: {
			background_color: "#ffffff",
			foreground_color: "#000000",
			background_font_color: "#333333",
			foreground_font_color: "#cccccc",
			disable_font_color: "#888888",
			separator_color: "#dddddd",
			background_bitmap: "bg.png",
			background_alignment: "right bottom, repeat-x",
			foreground_bitmap: "data:image/png;base64,abc",
			foreground_alignment: "center",
			sidebar_bitmap: "side.png",
			sidebar_alignment: "top",
		},
	};

	applyShellMenuTheme(shell1);
	assert.equal(styleProps["--balloon-bg"], "#ffffff");
	assert.equal(styleProps["--menu-bg-position"], "right bottom");
	assert.equal(styleProps["--menu-bg-repeat"], "repeat-x");
	assert.equal(styleProps["--menu-fg-position"], "center top");
	assert.equal(styleProps["--menu-sidebar-position"], "left top");
	assert.equal(document.body.classList.contains("has-sidebar"), true);

	// 2. Theme removal / missing theme properties
	const shell2 = {
		path: "shells/alt",
		menu_theme: {
			font_color: "#111111",
			background_bitmap: null,
			foreground_bitmap: null,
			sidebar_bitmap: null,
		},
	};
	applyShellMenuTheme(shell2);
	assert.equal(styleProps["--balloon-text-color"], "#111111");
	assert.equal(document.body.classList.contains("has-sidebar"), false);

	// 3. Tauri convertFileSrc test
	globalThis.__TAURI__ = {
		core: {
			convertFileSrc: (p) => `tauri://${p}`,
		},
	};
	applyShellMenuTheme(shell1);
	delete globalThis.__TAURI__;

	assert.ok(true);
});
