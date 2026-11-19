import assert from "node:assert/strict";
import { test } from "vitest";
import type { MenuShellItem } from "../ui/ts/ui/renderers/menu-theme-renderer.js";

globalThis.window = globalThis as unknown as Window & typeof globalThis;
const styleProps: Record<string, string> = {};
const bodyClasses = new Set<string>();
globalThis.document = {
	documentElement: {
		style: {
			setProperty(prop: string, val: string) {
				styleProps[prop] = val;
			},
			removeProperty(prop: string) {
				const prev = styleProps[prop] ?? "";
				delete styleProps[prop];
				return prev;
			},
		},
	},
	body: {
		classList: {
			toggle(c: string, force?: boolean) {
				if (force) bodyClasses.add(c);
				else bodyClasses.delete(c);
				return bodyClasses.has(c);
			},
			contains(c: string) {
				return bodyClasses.has(c);
			},
		},
	},
} as unknown as Document;

const { applyShellMenuTheme } = await import("../ui/ts/ui/submenu-theme.js");

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

	// 2. Theme removal / missing theme properties and frame/font settings
	const shell2 = {
		path: "shells/alt",
		menu_theme: {
			font_color: "#111111",
			frame_color: "rgb(10, 20, 30)",
			font_name: "CustomFont",
			font_height: 14,
			background_bitmap: null,
			foreground_bitmap: null,
			sidebar_bitmap: null,
		},
	} as unknown as MenuShellItem;
	applyShellMenuTheme(shell2);
	assert.equal(styleProps["--balloon-text-color"], "#111111");
	assert.equal(styleProps["--balloon-border-color"], "rgb(10, 20, 30)");
	assert.equal(styleProps["--balloon-font-family"], "CustomFont");
	assert.equal(styleProps["--balloon-font-size"], "14px");
	assert.equal(document.body.classList.contains("has-sidebar"), false);

	// 3. Tauri convertFileSrc test
	const tauriGlobal = globalThis as unknown as {
		__TAURI__?: { core?: { convertFileSrc?: (p: string) => string } };
	};
	tauriGlobal.__TAURI__ = {
		core: {
			convertFileSrc: (p: string) => `tauri://${p}`,
		},
	};
	applyShellMenuTheme(shell1);
	delete tauriGlobal.__TAURI__;

	assert.ok(true);
});
