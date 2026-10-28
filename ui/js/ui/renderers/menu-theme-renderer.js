/**
 * @file menu-theme-renderer.js
 * @brief コンテキストメニューのテーマ（BalloonTheme および Shell Menu Theme）適用ロジック
 */
export const menuThemeRenderer = {
	/**
	 * @param {string} theme
	 */
	applyTheme(theme) {
		if (theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			document.body.classList.remove(
				"balloon-theme-ivory",
				"balloon-theme-pixel",
				"balloon-theme-comic",
				"balloon-theme-dark",
			);
			document.body.classList.add(`balloon-theme-${theme}`);
		}
	},

	/**
	 * @param {{ menu_theme: any; path: string; }} activeShell
	 */
	applyShellTheme(activeShell) {
		const rootStyle = document.documentElement.style;
		if (activeShell?.menu_theme) {
			const mt = activeShell.menu_theme;
			if (mt.background_color)
				rootStyle.setProperty("--balloon-bg", mt.background_color);
			else rootStyle.removeProperty("--balloon-bg");

			if (mt.foreground_color)
				rootStyle.setProperty("--balloon-highlight-bg", mt.foreground_color);
			else rootStyle.removeProperty("--balloon-highlight-bg");

			if (mt.background_font_color || mt.font_color) {
				rootStyle.setProperty(
					"--balloon-text-color",
					mt.background_font_color || mt.font_color,
				);
			} else {
				rootStyle.removeProperty("--balloon-text-color");
			}

			if (mt.foreground_font_color)
				rootStyle.setProperty(
					"--balloon-highlight-text",
					mt.foreground_font_color,
				);
			else rootStyle.removeProperty("--balloon-highlight-text");

			if (mt.disable_font_color)
				rootStyle.setProperty("--balloon-disable-text", mt.disable_font_color);
			else rootStyle.removeProperty("--balloon-disable-text");

			if (mt.separator_color)
				rootStyle.setProperty("--balloon-separator-color", mt.separator_color);
			else rootStyle.removeProperty("--balloon-separator-color");

			const shellPath = activeShell.path || "";
			const resolveImg = (relPath) => {
				if (!relPath) return null;
				if (
					relPath.startsWith("data:") ||
					relPath.startsWith("http://") ||
					relPath.startsWith("https://") ||
					relPath.startsWith("asset:")
				) {
					return relPath;
				}
				const full = shellPath
					? `${shellPath.replace(/\\/g, "/")}/${relPath.replace(/\\/g, "/")}`
					: relPath;
				return globalThis.__TAURI__?.core?.convertFileSrc
					? globalThis.__TAURI__.core.convertFileSrc(full)
					: full;
			};

			const applyAlignment = (alignRaw, prefix) => {
				const align = String(alignRaw || "").toLowerCase();
				let pos = "left top";
				if (align.includes("right") && align.includes("bottom")) {
					pos = "right bottom";
				} else if (align.includes("right")) {
					pos = "right top";
				} else if (align.includes("center") && align.includes("bottom")) {
					pos = "center bottom";
				} else if (align.includes("center")) {
					pos = "center top";
				} else if (align.includes("bottom")) {
					pos = "left bottom";
				}
				let repeat = "repeat";
				if (align.includes("repeat-x") && align.includes("repeat-y")) {
					repeat = "repeat";
				} else if (align.includes("repeat-x")) {
					repeat = "repeat-x";
				} else if (align.includes("repeat-y")) {
					repeat = "repeat-y";
				} else if (align) {
					repeat = "no-repeat";
				}
				rootStyle.setProperty(`--${prefix}-position`, pos);
				rootStyle.setProperty(`--${prefix}-repeat`, repeat);
			};

			if (mt.background_bitmap) {
				const bgUrl = resolveImg(mt.background_bitmap);
				rootStyle.setProperty("--menu-bg-image", `url("${bgUrl}")`);
				applyAlignment(mt.background_alignment, "menu-bg");
			} else {
				rootStyle.removeProperty("--menu-bg-image");
				rootStyle.removeProperty("--menu-bg-position");
				rootStyle.removeProperty("--menu-bg-repeat");
			}

			if (mt.foreground_bitmap) {
				const fgUrl = resolveImg(mt.foreground_bitmap);
				rootStyle.setProperty("--menu-fg-image", `url("${fgUrl}")`);
				applyAlignment(mt.foreground_alignment, "menu-fg");
			} else {
				rootStyle.removeProperty("--menu-fg-image");
				rootStyle.removeProperty("--menu-fg-position");
				rootStyle.removeProperty("--menu-fg-repeat");
			}

			if (mt.sidebar_bitmap) {
				const sideUrl = resolveImg(mt.sidebar_bitmap);
				rootStyle.setProperty("--menu-sidebar-image", `url("${sideUrl}")`);
				const sideAlign = String(
					mt.sidebar_alignment || "bottom",
				).toLowerCase();
				rootStyle.setProperty(
					"--menu-sidebar-position",
					sideAlign.includes("top") ? "left top" : "left bottom",
				);
				document.body.classList.add("has-sidebar");
			} else {
				rootStyle.removeProperty("--menu-sidebar-image");
				rootStyle.removeProperty("--menu-sidebar-position");
				document.body.classList.remove("has-sidebar");
			}
		} else {
			rootStyle.removeProperty("--balloon-bg");
			rootStyle.removeProperty("--balloon-highlight-bg");
			rootStyle.removeProperty("--balloon-text-color");
			rootStyle.removeProperty("--balloon-highlight-text");
			rootStyle.removeProperty("--balloon-disable-text");
			rootStyle.removeProperty("--balloon-separator-color");
			rootStyle.removeProperty("--menu-bg-image");
			rootStyle.removeProperty("--menu-bg-position");
			rootStyle.removeProperty("--menu-bg-repeat");
			rootStyle.removeProperty("--menu-fg-image");
			rootStyle.removeProperty("--menu-fg-position");
			rootStyle.removeProperty("--menu-fg-repeat");
			rootStyle.removeProperty("--menu-sidebar-image");
			rootStyle.removeProperty("--menu-sidebar-position");
			document.body.classList.remove("has-sidebar");
		}
	},
};
