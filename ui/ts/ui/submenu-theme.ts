/**
 * @file submenu-theme.ts
 * @brief シェルの descript.txt 由来のカスタムメニュー配色・背景ビットマップテーマ適用および画像プリロードモジュール
 */

const imageCache = new Map<string, HTMLImageElement>();

function preloadImage(url: string | null): Promise<void> {
	if (!url) return Promise.resolve();
	if (imageCache.has(url)) return Promise.resolve();
	if (typeof Image === "undefined") return Promise.resolve();

	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			if (img.decode) {
				img
					.decode()
					.then(() => resolve())
					.catch(() => resolve());
			} else {
				resolve();
			}
		};
		img.onerror = () => resolve();
		img.src = url;
		imageCache.set(url, img);
	});
}

<<<<<<< HEAD
interface ShellThemeInfo {
	background_color?: string;
	foreground_color?: string;
	background_font_color?: string;
	font_color?: string;
	foreground_font_color?: string;
	disable_font_color?: string;
	separator_color?: string;
	frame_color?: string;
	font_name?: string;
	font_height?: number | string;
	background_bitmap?: string;
	foreground_bitmap?: string;
	sidebar_bitmap?: string;
	background_alignment?: string;
	foreground_alignment?: string;
	sidebar_alignment?: string;
}

interface ActiveShellInfo {
	path?: string;
	menu_theme?: ShellThemeInfo;
}

export function applyShellMenuTheme(
	activeShell: ActiveShellInfo | null | undefined,
) {
	const rootStyle = document.documentElement.style;
	const _theme = activeShell?.menu_theme;
	const _setOrRemove = (
		property: string,
		value: string | number | null | undefined,
	) => {
		if (value !== null && value !== undefined && value !== "") {
			rootStyle.setProperty(property, String(value));
		} else {
			rootStyle.removeProperty(property);
		}
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _applyShellMenuTheme(activeShell: any) {
	const rootStyle = document.documentElement.style;
	const theme = activeShell?.menu_theme;
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	const setOrRemove = (property: string, value: any) => {
		if (value) rootStyle.setProperty(property, value);
		else rootStyle.removeProperty(property);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
	setOrRemove("--balloon-border-color", theme?.frame_color);
	setOrRemove("--balloon-font-family", theme?.font_name);
	if (theme?.font_height) {
		const h =
			typeof theme.font_height === "number"
				? `${theme.font_height}px`
				: String(theme.font_height).includes("px")
					? theme.font_height
					: `${theme.font_height}px`;
		setOrRemove("--balloon-font-size", h);
	} else {
		setOrRemove("--balloon-font-size", null);
	}

	const shellPath = activeShell?.path?.replace(/\\/g, "/") || "";
	const resolveImg = (relativePath: string | undefined) => {
		if (!relativePath) return null;
		const relStr = String(relativePath);
		if (
			relStr.startsWith("data:") ||
			relStr.startsWith("http://") ||
			relStr.startsWith("https://") ||
			relStr.startsWith("asset:")
		) {
			return relStr;
		}
		const fullPath = shellPath
			? `${shellPath}/${relStr.replace(/\\/g, "/")}`
			: relStr;
<<<<<<< HEAD
		const tauriCore = (
			globalThis as unknown as {
				__TAURI__?: {
					core?: { convertFileSrc?: (p: string) => string };
				};
			}
		).__TAURI__?.core;
		return tauriCore?.convertFileSrc
			? tauriCore.convertFileSrc(fullPath)
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		return (globalThis as any).__TAURI__?.core?.convertFileSrc
			? // biome-ignore lint/suspicious/noExplicitAny: automated fix
				(globalThis as any).__TAURI__.core.convertFileSrc(fullPath)
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			: fullPath;
	};

	const bgUrl = resolveImg(theme?.background_bitmap);
	const fgUrl = resolveImg(theme?.foreground_bitmap);
	const sideUrl = resolveImg(theme?.sidebar_bitmap);

	void Promise.all([
		preloadImage(bgUrl),
		preloadImage(fgUrl),
		preloadImage(sideUrl),
	]);

	const applyAlignment = (alignRaw: string | undefined, prefix: string) => {
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

	if (bgUrl) {
		rootStyle.setProperty("--menu-bg-image", `url("${bgUrl}")`);
		applyAlignment(theme?.background_alignment, "menu-bg");
	} else {
		rootStyle.removeProperty("--menu-bg-image");
		rootStyle.removeProperty("--menu-bg-position");
		rootStyle.removeProperty("--menu-bg-repeat");
	}

	if (fgUrl) {
		rootStyle.setProperty("--menu-fg-image", `url("${fgUrl}")`);
		applyAlignment(theme?.foreground_alignment, "menu-fg");
	} else {
		rootStyle.removeProperty("--menu-fg-image");
		rootStyle.removeProperty("--menu-fg-position");
		rootStyle.removeProperty("--menu-fg-repeat");
	}

	if (sideUrl) {
		rootStyle.setProperty("--menu-sidebar-image", `url("${sideUrl}")`);
		const sideAlign = String(
			theme?.sidebar_alignment || "bottom",
		).toLowerCase();
		rootStyle.setProperty(
			"--menu-sidebar-position",
			sideAlign.includes("top") ? "left top" : "left bottom",
		);
	} else {
		rootStyle.removeProperty("--menu-sidebar-image");
		rootStyle.removeProperty("--menu-sidebar-position");
	}
	document.body.classList.toggle("has-sidebar", Boolean(sideUrl));
}
