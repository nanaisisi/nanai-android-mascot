import type { NanaiAndroidMascotApp } from "../../main.js";
import { AppConfig } from "../core/config.js";
import { emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { dressupMenuPayload } from "../surface/bind-menu.js";

type MenuAppContext = NanaiAndroidMascotApp & {
	cachedMenuCaptions?: Record<string, string>;
};

/** メニュー/クイックパネル関連メソッド (NanaiAndroidMascotApp に mixin) */
export const menuMethods = {
	toggleMenu(
		screenX: number | null = null,
		screenY: number | null = null,
		scope: number = 0,
	) {
		const app = this as unknown as MenuAppContext;
		if (isTauriAvailable()) {
			const winCoords = globalThis as unknown as {
				screenX?: number;
				screenY?: number;
			};
			const sX = winCoords.screenX ?? 0;
			const sY = winCoords.screenY ?? 0;
			const posX = screenX !== null ? screenX : sX + 200;
			const posY = screenY !== null ? screenY : sY + 100;

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
			app.syncMenuGhosts(scope);
		}
	},

	async syncMenuGhosts(scope: number = 0) {
		const app = this as unknown as MenuAppContext;
		const gc = app.ghostController;
		const sm = app.surfaceManager;
		const shellNames = gc.shells || ["master"];
		const currentShellName = gc.currentShell || "master";
		const ghosts = gc.ghosts || [{ name: AppConfig.paths.fallbackGhostName }];
		const rawShells = gc.currentGhost?.shells || shellNames;

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
				manifestDescript["menu.background.bitmap"] ||
				manifestDescript["menu.bg.bitmap"] ||
				"menu_background.png",
			sidebar_bitmap:
				manifestDescript["menu.sidebar.bitmap"] || "menu_sidebar.png",
			foreground_bitmap: manifestDescript["menu.foreground.bitmap"] || "",
			background_color: manifestDescript["menu.background.color"] || "",
			foreground_color: manifestDescript["menu.foreground.color"] || "",
			background_alignment:
				manifestDescript["menu.background.alignment"] || "top,left",
			sidebar_alignment:
				manifestDescript["menu.sidebar.alignment"] || "top,left",
		};

		const fullShells = (Array.isArray(rawShells) ? rawShells : [rawShells]).map(
			(s) => {
				if (typeof s === "object" && s !== null) return s;
				return {
					name: String(s),
					path: shellPath,
					menu_theme: menuThemeFromManifest,
				};
			},
		);

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

		if (isTauriAvailable()) {
			if (!app.availableBalloons || app.availableBalloons.length === 0) {
				await app.scanBalloons?.();
			}

			emit("sync-ghosts", {
				ghosts,
				currentGhost: gc.currentGhost?.name || gc.currentGhost,
				shells: fullShells,
				currentShell: currentShellName,
				scope,
				dressup,
				recentGhosts,
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
			win.postMessage({ type: "sync-scope", scope }, "*");
			win.postMessage(
				{
					type: "sync-ghosts",
					ghosts,
					currentGhost: gc.currentGhost,
					scope,
					dressup,
					recentGhosts,
					captions: app.cachedMenuCaptions || {},
				},
				"*",
			);
			win.postMessage(
				{
					type: "sync-shells",
					shells: fullShells,
					currentShell: currentShellName,
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
		if (isTauriAvailable()) {
			void invoke("hide_menu_window").catch(() => {});
		}
		const menuContainer = app.elements.menuContainer;
		if (menuContainer) {
			menuContainer.style.display = "none";
		}
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
