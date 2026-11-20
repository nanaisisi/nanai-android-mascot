import { assetCache } from "../../core/asset-cache.js";
import { convertFileSrc } from "../../core/tauri-helper.js";

export interface ShellMenuTheme {
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

export interface MenuShellItem {
	name?: string;
	display_name?: string;
	path?: string;
	menu_theme?: ShellMenuTheme | null;
}

let lastValidShellTheme: MenuShellItem | null = null;

/**
 * 画像アセットをメモリ・GPUへ事前デコード読み込み (初回メニュー表示時のチラつき・ロード不全防止)
 */
function preloadImage(url: string | null): Promise<HTMLImageElement | null> {
	return assetCache.preload(url, "menu");
}

export const menuThemeRenderer = {
	/**
	 * @param {string} theme
	 */
	applyTheme(theme: string) {
		if (theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			for (const cls of Array.from(document.body.classList)) {
				if (cls.startsWith("balloon-theme-")) {
					document.body.classList.remove(cls);
				}
			}
			document.body.classList.add(`balloon-theme-${theme}`);
		}
	},

	/**
	 * @param {MenuShellItem | string | null | undefined} activeShell
	 */
	applyShellTheme(activeShell: MenuShellItem | string | null | undefined) {
		const rootStyle = document.documentElement.style;
		let resolvedShell =
			activeShell && typeof activeShell === "object" ? activeShell : null;
		if (resolvedShell?.menu_theme) {
			lastValidShellTheme = resolvedShell;
		} else if (!resolvedShell?.menu_theme && lastValidShellTheme) {
			resolvedShell = lastValidShellTheme;
		}

		if (resolvedShell?.menu_theme) {
			const mt = resolvedShell.menu_theme;
			if (mt.background_color)
				rootStyle.setProperty("--balloon-bg", mt.background_color);
			else rootStyle.removeProperty("--balloon-bg");

			if (mt.foreground_color)
				rootStyle.setProperty("--balloon-highlight-bg", mt.foreground_color);
			else rootStyle.removeProperty("--balloon-highlight-bg");

			if (mt.background_font_color || mt.font_color) {
				rootStyle.setProperty(
					"--balloon-text-color",
					(mt.background_font_color || mt.font_color) ?? "",
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

			if (mt.frame_color)
				rootStyle.setProperty("--balloon-border-color", mt.frame_color);
			else rootStyle.removeProperty("--balloon-border-color");

			if (mt.font_name)
				rootStyle.setProperty("--balloon-font-family", mt.font_name);
			else rootStyle.removeProperty("--balloon-font-family");

			if (mt.font_height) {
				const heightVal =
					typeof mt.font_height === "number"
						? `${mt.font_height}px`
						: String(mt.font_height).includes("px")
							? String(mt.font_height)
							: `${mt.font_height}px`;
				rootStyle.setProperty("--balloon-font-size", heightVal);
			} else {
				rootStyle.removeProperty("--balloon-font-size");
			}

			const shellPath = resolvedShell.path || "";
			const resolveImg = (relPath?: string | null) => {
				if (!relPath) return null;
				if (
					relPath.startsWith("data:") ||
					relPath.startsWith("http://") ||
					relPath.startsWith("https://") ||
					relPath.startsWith("asset:")
				) {
					return relPath;
				}
				const cleanRel = relPath.replace(/\\/g, "/");
				let full = cleanRel;
				if (shellPath) {
					const cleanShell = shellPath.replace(/\\/g, "/");
					full = cleanShell.endsWith("/")
						? `${cleanShell}${cleanRel}`
						: `${cleanShell}/${cleanRel}`;
				}
				if (full.includes(":/") || full.startsWith("/")) {
					return convertFileSrc(full);
				}
				return full;
			};

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

			const bgUrl = resolveImg(mt.background_bitmap);
			const fgUrl = resolveImg(mt.foreground_bitmap);
			const sideUrl = resolveImg(mt.sidebar_bitmap);

			const applyStyles = () => {
				if (bgUrl) {
					rootStyle.setProperty("--menu-bg-image", `url("${bgUrl}")`);
					applyAlignment(mt.background_alignment, "menu-bg");
				} else {
					rootStyle.removeProperty("--menu-bg-image");
					rootStyle.removeProperty("--menu-bg-position");
					rootStyle.removeProperty("--menu-bg-repeat");
				}

				if (fgUrl) {
					rootStyle.setProperty("--menu-fg-image", `url("${fgUrl}")`);
					applyAlignment(mt.foreground_alignment, "menu-fg");
				} else {
					rootStyle.removeProperty("--menu-fg-image");
					rootStyle.removeProperty("--menu-fg-position");
					rootStyle.removeProperty("--menu-fg-repeat");
				}

				if (sideUrl) {
					rootStyle.setProperty("--menu-sidebar-image", `url("${sideUrl}")`);
					const sideAlign = String(mt.sidebar_alignment || "top").toLowerCase();
					rootStyle.setProperty(
						"--menu-sidebar-position",
						sideAlign.includes("bottom") ? "left bottom" : "left top",
					);
					document.body.classList.add("has-sidebar");
					const cachedImg = assetCache.get(sideUrl, "menu");
					if (cachedImg && cachedImg.naturalWidth > 0) {
						rootStyle.setProperty(
							"--menu-sidebar-width",
							`${cachedImg.naturalWidth}px`,
						);
					} else {
						rootStyle.setProperty("--menu-sidebar-width", "28px");
					}
				} else {
					rootStyle.removeProperty("--menu-sidebar-image");
					rootStyle.removeProperty("--menu-sidebar-position");
					rootStyle.removeProperty("--menu-sidebar-width");
					document.body.classList.remove("has-sidebar");
				}
			};

			// 即時適用
			applyStyles();

			// 事前ロード完了時に幅の再計算と確定適用
			void Promise.all([
				preloadImage(bgUrl),
				preloadImage(fgUrl),
				preloadImage(sideUrl),
			]).then(() => {
				applyStyles();
			});
		} else {
			rootStyle.removeProperty("--balloon-bg");
			rootStyle.removeProperty("--balloon-highlight-bg");
			rootStyle.removeProperty("--balloon-text-color");
			rootStyle.removeProperty("--balloon-highlight-text");
			rootStyle.removeProperty("--balloon-disable-text");
			rootStyle.removeProperty("--balloon-separator-color");
			rootStyle.removeProperty("--balloon-border-color");
			rootStyle.removeProperty("--balloon-font-family");
			rootStyle.removeProperty("--balloon-font-size");
			rootStyle.removeProperty("--menu-bg-image");
			rootStyle.removeProperty("--menu-bg-position");
			rootStyle.removeProperty("--menu-bg-repeat");
			rootStyle.removeProperty("--menu-fg-image");
			rootStyle.removeProperty("--menu-fg-position");
			rootStyle.removeProperty("--menu-fg-repeat");
			rootStyle.removeProperty("--menu-sidebar-image");
			rootStyle.removeProperty("--menu-sidebar-position");
			rootStyle.removeProperty("--menu-sidebar-width");
			document.body.classList.remove("has-sidebar");
		}
	},
};
