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
	ghost_master_path?: string;
	menu_theme?: ShellMenuTheme | null;
}

export const SHIORI_MENU_RESOURCE_MAP: ReadonlyArray<{
	resource: string;
	field: keyof ShellMenuTheme;
}> = [
	{ resource: "menu.background.bitmap.filename", field: "background_bitmap" },
	{ resource: "menu.foreground.bitmap.filename", field: "foreground_bitmap" },
	{ resource: "menu.sidebar.bitmap.filename", field: "sidebar_bitmap" },
	{ resource: "menu.background.alignment", field: "background_alignment" },
	{ resource: "menu.foreground.alignment", field: "foreground_alignment" },
	{ resource: "menu.sidebar.alignment", field: "sidebar_alignment" },
	{ resource: "menu.background.color", field: "background_color" },
	{ resource: "menu.foreground.color", field: "foreground_color" },
	{
		resource: "menu.background.font.color",
		field: "background_font_color",
	},
	{
		resource: "menu.foreground.font.color",
		field: "foreground_font_color",
	},
	{ resource: "menu.disable.font.color", field: "disable_font_color" },
	{ resource: "menu.separator.color", field: "separator_color" },
	{ resource: "menu.frame.color", field: "frame_color" },
	{ resource: "menu.font.name", field: "font_name" },
	{ resource: "menu.font.height", field: "font_height" },
];

export function mergeShioriMenuTheme(
	shellTheme: ShellMenuTheme | null | undefined,
	shioriResources?: Record<string, string> | null,
): ShellMenuTheme | null {
	const base: ShellMenuTheme = shellTheme ? { ...shellTheme } : {};
	let hasAny = Boolean(shellTheme);
	if (shioriResources) {
		for (const { resource, field } of SHIORI_MENU_RESOURCE_MAP) {
			const val = shioriResources[resource]?.trim();
			if (val) {
				(base as Record<string, unknown>)[field] = val;
				hasAny = true;
			}
		}
	}
	return hasAny ? base : null;
}

export function extractEdgeColorFromImage(
	img: HTMLImageElement,
	alignRaw?: string,
): string | null {
	const w = img.naturalWidth;
	const h = img.naturalHeight;
	if (!w || !h || typeof document === "undefined") return null;
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;
	try {
		ctx.drawImage(img, 0, 0, w, h);
		const align = String(alignRaw || "").toLowerCase();
		const sampleX = align.includes("right") ? 0 : w - 1;
		const sampleY = align.includes("bottom") ? 0 : h - 1;
		const data = ctx.getImageData(sampleX, sampleY, 1, 1).data;
		const r = data[0];
		const g = data[1];
		const b = data[2];
		const a = data[3];
		if (a === 0) return null;
		if (a < 255) {
			return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
		}
		return `rgb(${r}, ${g}, ${b})`;
	} catch {
		return null;
	}
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

	async fetchShioriMenuTheme(
		ghostController: unknown,
	): Promise<Record<string, string>> {
		const requester = (
			ghostController as {
				requestShioriResource?: (
					res: string,
					defaultVal: string,
				) => Promise<string>;
			}
		)?.requestShioriResource;
		if (!requester) return {};
		const result: Record<string, string> = {};
		for (const { resource } of SHIORI_MENU_RESOURCE_MAP) {
			try {
				const val = await requester.call(ghostController, resource, "");
				if (val && val !== "0") {
					result[resource] = val;
				}
			} catch {
				// フォールバック継続
			}
		}
		return result;
	},

	/**
	 * @param {MenuShellItem | string | null | undefined} activeShell
	 * @param {Record<string, string> | null | undefined} shioriResources
	 */
	applyShellTheme(
		activeShell: MenuShellItem | string | null | undefined,
		shioriResources?: Record<string, string> | null,
	) {
		const rootStyle = document.documentElement.style;
		let resolvedShell =
			activeShell && typeof activeShell === "object" ? activeShell : null;
		if (resolvedShell?.menu_theme) {
			lastValidShellTheme = resolvedShell;
		} else if (!resolvedShell?.menu_theme && lastValidShellTheme) {
			resolvedShell = lastValidShellTheme;
		}

		const mt = mergeShioriMenuTheme(resolvedShell?.menu_theme, shioriResources);
		if (mt) {
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

			const shellPath = resolvedShell?.path || "";
			const ghostMasterPath =
				resolvedShell?.ghost_master_path ||
				(shellPath
					? shellPath.replace(/[/\\]shell[/\\][^/\\]+[/\\]?$/i, "/ghost/master")
					: "");
			const resolveImg = (
				relPath?: string | null,
				preferGhostMaster = false,
			) => {
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
				const basePath =
					preferGhostMaster && ghostMasterPath ? ghostMasterPath : shellPath;
				if (basePath) {
					const cleanBase = basePath.replace(/\\/g, "/");
					full = cleanBase.endsWith("/")
						? `${cleanBase}${cleanRel}`
						: `${cleanBase}/${cleanRel}`;
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

			const bgUrl = resolveImg(
				mt.background_bitmap,
				Boolean(shioriResources?.["menu.background.bitmap.filename"]?.trim()),
			);
			const fgUrl = resolveImg(
				mt.foreground_bitmap,
				Boolean(shioriResources?.["menu.foreground.bitmap.filename"]?.trim()),
			);
			const sideUrl = resolveImg(
				mt.sidebar_bitmap,
				Boolean(shioriResources?.["menu.sidebar.bitmap.filename"]?.trim()),
			);

			const applyStyles = () => {
				if (bgUrl) {
					rootStyle.setProperty("--menu-bg-image", `url("${bgUrl}")`);
					applyAlignment(mt.background_alignment, "menu-bg");
					if (
						!mt.background_color &&
						rootStyle.getPropertyValue("--menu-bg-repeat") !== "repeat"
					) {
						const cachedBg = assetCache.get(bgUrl, "menu");
						if (cachedBg) {
							const edgeColor = extractEdgeColorFromImage(
								cachedBg,
								mt.background_alignment,
							);
							if (edgeColor) {
								rootStyle.setProperty("--balloon-bg", edgeColor);
							}
						}
					}
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
