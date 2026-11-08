/**
 * @file menu-theme-renderer.ts
 * @brief コンテキストメニューのテーマ（BalloonTheme および Shell Menu Theme）適用・アセット事前ロード処理
 */

const imageCache = new Map<string, HTMLImageElement>();

/**
 * 画像アセットをメモリ・GPUへ事前デコード読み込み (初回メニュー表示時のチラつき・ロード不全防止)
 */
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
	 * @param {{ menu_theme?: unknown; path?: string; }} activeShell
	 */

	applyShellTheme(activeShell: unknown) {

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	applyShellTheme(activeShell: any) {

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
							? mt.font_height
							: `${mt.font_height}px`;
				rootStyle.setProperty("--balloon-font-size", heightVal);
			} else {
				rootStyle.removeProperty("--balloon-font-size");
			}

			const shellPath = activeShell.path || "";
			const resolveImg = (relPath: string) => {
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

				return (globalThis as unknown).__TAURI__?.core?.convertFileSrc
					? (globalThis as unknown).__TAURI__.core.convertFileSrc(full)

				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				return (globalThis as any).__TAURI__?.core?.convertFileSrc
					? // biome-ignore lint/suspicious/noExplicitAny: automated fix
						(globalThis as any).__TAURI__.core.convertFileSrc(full)

					: full;
			};

			const applyAlignment = (alignRaw: string, prefix: string) => {
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

			// 初回表示の画像読み込み遅延・非表示防止用プリロード
			void Promise.all([
				preloadImage(bgUrl),
				preloadImage(fgUrl),
				preloadImage(sideUrl),
			]);

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
			document.body.classList.remove("has-sidebar");
		}
	},
};
