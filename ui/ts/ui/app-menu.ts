import type { NanaiAndroidMascotApp } from "../../main.js";
import { AppConfig } from "../core/config.js";
import {
	emit,
	getOverlayWindowOrigin,
	invoke,
	isNativeMultiWindow,
	isOverlayWindow,
	isTauriAvailable,
} from "../core/tauri-helper.js";
import { dressupMenuPayload } from "../surface/bind-menu.js";

type MenuAppContext = NanaiAndroidMascotApp & {
	cachedMenuCaptions?: Record<string, string>;
	availablePlugins?: unknown[];
	_menuIframeLoadBound?: boolean;
};

/** メニュー/クイックパネル関連メソッド (NanaiAndroidMascotApp に mixin) */
export const menuMethods = {
	toggleMenu(
		screenX: number | null = null,
		screenY: number | null = null,
		scope: number = 0,
	) {
		const app = this as unknown as MenuAppContext;
		if (isTauriAvailable() && isNativeMultiWindow()) {
			const { x: sX, y: sY } = getOverlayWindowOrigin();
			const defaultOffsetX = isOverlayWindow() ? 40 : 200;
			const defaultOffsetY = isOverlayWindow() ? 48 : 100;
			const posX = screenX !== null ? screenX : sX + defaultOffsetX;
			const posY = screenY !== null ? screenY : sY + defaultOffsetY;

			invoke("show_menu_window", {
				params: {
					x: posX,
					y: posY,
					scope,
				},
			})
				.then(() => app.syncMenuGhosts(scope))
				.catch((err) => {
					console.warn(
						"show_menu_window failed, fallback to toggleHtmlMenu:",
						err,
					);
					app.toggleHtmlMenu(scope);
				});
			return;
		}
		app.toggleHtmlMenu(scope);
	},

	toggleHtmlMenu(scope: number = 0) {
		const app = this as unknown as MenuAppContext;
		const menuContainer = app.elements.menuContainer;
		if (!menuContainer) return;
		const isVisible = menuContainer.style.display !== "none";
		const nextState = isVisible ? "none" : "block";
		menuContainer.style.display = nextState;
		if (nextState === "block") {
			if (app.elements.androidMenuPanel) {
				app.elements.androidMenuPanel.hidden = true;
			}
			app.elements.androidMenuBtn?.setAttribute?.("aria-expanded", "false");
			const iframeEl = document.getElementById("menu-iframe");
			if (
				iframeEl &&
				!app._menuIframeLoadBound &&
				typeof iframeEl.addEventListener === "function"
			) {
				app._menuIframeLoadBound = true;
				iframeEl.addEventListener("load", () => {
					void app.syncMenuGhosts(scope, { resetSubmenu: false });
				});
			}
			void app.syncMenuGhosts(scope, { resetSubmenu: true });
		}
	},

	async syncMenuGhosts(
		scope: number = 0,
		options: { resetSubmenu?: boolean } = {},
	) {
		const app = this as unknown as MenuAppContext;
		const gc = app.ghostController;
		const sm = app.surfaceManager;
		if (
			(!Array.isArray(gc.ghosts) || gc.ghosts.length === 0) &&
			typeof (gc as { scanGhosts?: () => Promise<unknown> }).scanGhosts ===
				"function"
		) {
			await (gc as { scanGhosts: () => Promise<unknown> }).scanGhosts();
		}
		const ghosts =
			Array.isArray(gc.ghosts) && gc.ghosts.length > 0
				? gc.ghosts
				: gc.currentGhost
					? [gc.currentGhost]
					: [{ name: AppConfig.paths.fallbackGhostName }];
		const currentShellName = gc.currentShell || "master";
		const matchedGhost = Array.isArray(gc.ghosts)
			? gc.ghosts.find((g) => g?.name === gc.currentGhost?.name)
			: undefined;
		let rawShells: unknown[] = [];
		if (
			Array.isArray(gc.currentGhost?.shells) &&
			gc.currentGhost.shells.length > 0
		) {
			rawShells = gc.currentGhost.shells;
		} else if (
			Array.isArray(matchedGhost?.shells) &&
			matchedGhost.shells.length > 0
		) {
			rawShells = matchedGhost.shells;
		} else if (isTauriAvailable()) {
			const targetGhostName =
				gc.currentGhost?.name ||
				(typeof ghosts[0] === "object" && ghosts[0] !== null
					? ghosts[0].name
					: undefined);
			if (targetGhostName) {
				try {
					const info = await invoke<{
						path?: string;
						shells?: unknown[];
					}>("get_ghost_info", { ghostName: targetGhostName });
					if (Array.isArray(info?.shells) && info.shells.length > 0) {
						rawShells = info.shells;
						if (gc.currentGhost) {
							gc.currentGhost.shells = info.shells as NonNullable<
								typeof gc.currentGhost
							>["shells"];
							if (typeof info.path === "string" && info.path.length > 0) {
								gc.currentGhost.path = info.path;
							}
						}
						gc.shells = info.shells.map((s) =>
							typeof s === "object" && s !== null && "name" in s
								? String((s as { name: unknown }).name)
								: String(s),
						);
					}
				} catch (_err) {}
			}
		}
		if (rawShells.length === 0) {
			rawShells =
				Array.isArray(gc.shells) && gc.shells.length > 0
					? gc.shells
					: [currentShellName];
		}

		const manifestDescript = (sm?.shellManifest?.descript || {}) as Record<
			string,
			string
		>;
		let shellPath = sm?.shellPath || "";
		if (!shellPath && gc.currentGhost?.path) {
			shellPath = `${gc.currentGhost.path}/shell/${currentShellName}`;
		}
		if (!shellPath && sm?.shellManifest?.directory) {
			shellPath = sm.shellManifest.directory;
		}

		// descript 内のメニュースキン設定を自動抽出して構造化
		const menuThemeFromManifest = {
			background_bitmap:
				manifestDescript["menu.background.bitmap.filename"] ||
				manifestDescript["menu.background.bitmap"] ||
				manifestDescript["menu.bg.bitmap"] ||
				"",
			sidebar_bitmap:
				manifestDescript["menu.sidebar.bitmap.filename"] ||
				manifestDescript["menu.sidebar.bitmap"] ||
				"",
			foreground_bitmap:
				manifestDescript["menu.foreground.bitmap.filename"] ||
				manifestDescript["menu.foreground.bitmap"] ||
				"",
			background_color: manifestDescript["menu.background.color"] || "",
			foreground_color: manifestDescript["menu.foreground.color"] || "",
			sidebar_color: manifestDescript["menu.sidebar.color"] || "",
			sidebar_font_color: manifestDescript["menu.sidebar.font.color"] || "",
			sidebar_text: manifestDescript["menu.sidebar.text"] || "",
			sidebar_width: manifestDescript["menu.sidebar.width"] || "",
			background_alignment:
				manifestDescript["menu.background.alignment"] || "top,left",
			sidebar_alignment:
				manifestDescript["menu.sidebar.alignment"] || "top,left",
		};

		const fullShells = (
			rawShells.length > 0 ? rawShells : [currentShellName]
		).map((s) => {
			if (typeof s === "object" && s !== null) return s;
			return {
				name: String(s),
				path: shellPath,
				menu_theme: menuThemeFromManifest,
			};
		});

		const dressup = dressupMenuPayload(
			sm?.shellManifest,
			sm as unknown as Parameters<typeof dressupMenuPayload>[1],
		);

		let recentGhosts: string[] = [];
		try {
			recentGhosts = JSON.parse(
				localStorage.getItem("nanai_recent_ghosts") || "[]",
			);
		} catch (_err) {}

		if (!app.availableBalloons || app.availableBalloons.length === 0) {
			await app.scanBalloons?.();
		}

		if (isTauriAvailable() && isNativeMultiWindow()) {
			emit("sync-ghosts", {
				ghosts,
				currentGhost: gc.currentGhost?.name || gc.currentGhost,
				shells: fullShells,
				currentShell: currentShellName,
				scope,
				dressup,
				recentGhosts,
				plugins: app.availablePlugins || [],
				captions: app.cachedMenuCaptions || {},
			});
			emit("sync-theme", app.currentBalloonTheme);
			if (app.availableBalloons) {
				emit("sync-balloons", app.availableBalloons);
			}
		}

		const win = (document.getElementById("menu-iframe") as HTMLIFrameElement)
			?.contentWindow;
		if (win) {
			win.postMessage(
				{
					type: "sync-scope",
					scope,
					resetSubmenu: Boolean(options.resetSubmenu),
				},
				"*",
			);
			win.postMessage(
				{
					type: "sync-ghosts",
					ghosts,
					currentGhost: gc.currentGhost,
					shells: fullShells,
					currentShell: currentShellName,
					scope,
					dressup,
					recentGhosts,
					plugins: app.availablePlugins || [],
					captions: app.cachedMenuCaptions || {},
				},
				"*",
			);
			win.postMessage(
				{
					type: "sync-shells",
					shells: fullShells,
					currentShell: currentShellName,
					currentGhost: gc.currentGhost?.name || gc.currentGhost,
				},
				"*",
			);
			win.postMessage(
				{
					type: "sync-theme",
					theme: app.currentBalloonTheme,
				},
				"*",
			);
			if (app.availableBalloons) {
				win.postMessage(
					{
						type: "sync-balloons",
						balloons: app.availableBalloons,
					},
					"*",
				);
			}
		}
	},

	hideMenu() {
		const app = this as unknown as MenuAppContext;
		if (isTauriAvailable() && isNativeMultiWindow()) {
			void invoke("hide_menu_window").catch(() => {});
		}
		const menuContainer = app.elements.menuContainer;
		if (menuContainer) {
			menuContainer.style.display = "none";
		}
		const androidMenuPanel = app.elements.androidMenuPanel;
		if (androidMenuPanel) {
			androidMenuPanel.hidden = true;
		}
		app.elements.androidMenuBtn?.setAttribute?.("aria-expanded", "false");
		app.hideQuickActionsPanel();
	},

	toggleQuickActionsPanel() {
		const app = this as unknown as MenuAppContext;
		const panel = app.elements.quickActionsPanel;
		if (!panel) return;
		const isVisible = panel.style.display !== "none";
		panel.style.display = isVisible ? "none" : "flex";
	},

	hideQuickActionsPanel() {
		const app = this as unknown as MenuAppContext;
		const panel = app.elements.quickActionsPanel;
		if (panel) {
			panel.style.display = "none";
		}
	},
};
