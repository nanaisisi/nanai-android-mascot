/**
 * @file submenu-theme.js
 * @brief シェルの descript.txt 由来のカスタムメニュー配色・背景ビットマップテーマ適用モジュール
 */
export function applyShellMenuTheme(activeShell) {
	const rootStyle = document.documentElement.style;
	const theme = activeShell?.menu_theme;
	const setOrRemove = (property, value) => {
		if (value) rootStyle.setProperty(property, value);
		else rootStyle.removeProperty(property);
	};

	setOrRemove("--balloon-bg", theme?.background_color);
	setOrRemove("--balloon-highlight-bg", theme?.foreground_color);
	setOrRemove(
		"--balloon-text-color",
		theme?.background_font_color || theme?.font_color,
	);
	setOrRemove("--balloon-highlight-text", theme?.foreground_font_color);
	setOrRemove("--balloon-disable-text", theme?.disable_font_color);
	setOrRemove("--balloon-separator-color", theme?.separator_color);

	const shellPath = activeShell?.path?.replace(/\\/g, "/") || "";
	const setImage = (property, relativePath) => {
		if (!relativePath) {
			rootStyle.removeProperty(property);
			return;
		}
		const relStr = String(relativePath);
		if (
			relStr.startsWith("data:") ||
			relStr.startsWith("http://") ||
			relStr.startsWith("https://") ||
			relStr.startsWith("asset:")
		) {
			rootStyle.setProperty(property, `url("${relStr}")`);
			return;
		}
		const fullPath = shellPath
			? `${shellPath}/${relStr.replace(/\\/g, "/")}`
			: relStr;
		const url = globalThis.__TAURI__?.core?.convertFileSrc
			? globalThis.__TAURI__.core.convertFileSrc(fullPath)
			: fullPath;
		rootStyle.setProperty(property, `url("${url}")`);
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

	setImage("--menu-bg-image", theme?.background_bitmap);
	if (theme?.background_bitmap) {
		applyAlignment(theme.background_alignment, "menu-bg");
	} else {
		rootStyle.removeProperty("--menu-bg-position");
		rootStyle.removeProperty("--menu-bg-repeat");
	}

	setImage("--menu-fg-image", theme?.foreground_bitmap);
	if (theme?.foreground_bitmap) {
		applyAlignment(theme.foreground_alignment, "menu-fg");
	} else {
		rootStyle.removeProperty("--menu-fg-position");
		rootStyle.removeProperty("--menu-fg-repeat");
	}

	setImage("--menu-sidebar-image", theme?.sidebar_bitmap);
	if (theme?.sidebar_bitmap) {
		const sideAlign = String(theme.sidebar_alignment || "bottom").toLowerCase();
		rootStyle.setProperty(
			"--menu-sidebar-position",
			sideAlign.includes("top") ? "left top" : "left bottom",
		);
	} else {
		rootStyle.removeProperty("--menu-sidebar-position");
	}
	document.body.classList.toggle("has-sidebar", Boolean(theme?.sidebar_bitmap));
}
