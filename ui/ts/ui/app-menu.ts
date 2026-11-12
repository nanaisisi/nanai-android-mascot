import { AppConfig } from "../core/config.js";
import { emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { dressupMenuPayload } from "../surface/bind-menu.js";

/** メニュー/クイックパネル関連メソッド (NanaiAndroidMascotApp に mixin) */
export const menuMethods = {
	toggleMenu(
		screenX: number | null = null,
		screenY: number | null = null,
		scope: number = 0,
	) {
		if (isTauriAvailable()) {
			const sX = (globalThis as unknown).screenX ?? 0;
			const sY = (globalThis as unknown).screenY ?? 0;
			const posX = screenX !== null ? screenX : sX + 200;
			const posY = screenY !== null ? screenY : sY + 100;

			invoke("show_menu_window", { x: posX, y: posY, scope })
				.then(() =>
					(
						this as unknown as import("../../main.js").NanaiAndroidMascotApp
					).syncMenuGhosts(scope),
				)
				.catch((err) => {
					console.warn(
						"show_menu_window failed, fallback to toggleHtmlMenu:",
						err,
					);
					(
						this as unknown as import("../../main.js").NanaiAndroidMascotApp
					).toggleHtmlMenu(scope);
				});
			return;
		}
		(
			this as unknown as import("../../main.js").NanaiAndroidMascotApp
		).toggleHtmlMenu(scope);
	},

	toggleHtmlMenu(scope: number = 0) {
		if (
			!(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
				.elements.menuContainer
		)
			return;
		const isVisible =
			(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
				.elements.menuContainer.style.display !== "none";
		const nextState = isVisible ? "none" : "block";
		(
			this as unknown as import("../../main.js").NanaiAndroidMascotApp
		).elements.menuContainer.style.display = nextState;
		if (nextState === "block") {
			(
				this as unknown as import("../../main.js").NanaiAndroidMascotApp
			).syncMenuGhosts(scope);
		}
	},

	syncMenuGhosts(scope: number = 0) {
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;
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

		const dressup = dressupMenuPayload(sm?.shellManifest, sm);

		let recentGhosts: string[] = [];
		try {
			recentGhosts = JSON.parse(
				localStorage.getItem("nanai_recent_ghosts") || "[]",
			);
		} catch (_err) {}

		if (isTauriAvailable()) {
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
			emit(
				"sync-theme",
				(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
					.currentBalloonTheme,
			);
			if (
				(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
					.availableBalloons
			) {
				emit(
					"sync-balloons",
					(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
						.availableBalloons,
				);
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
					captions:
						(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
							.cachedMenuCaptions || {},
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
					theme: (
						this as unknown as import("../../main.js").NanaiAndroidMascotApp
					).currentBalloonTheme,
				},
				"*",
			);
			if (
				(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
					.availableBalloons
			) {
				win.postMessage(
					{
						type: "sync-balloons",
						balloons: (
							this as unknown as import("../../main.js").NanaiAndroidMascotApp
						).availableBalloons,
					},
					"*",
				);
			}
		}
	},

	hideMenu() {
		if (isTauriAvailable()) {
			void invoke("hide_menu_window").catch(() => {});
		}
		if (
			(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
				.elements.menuContainer
		) {
			(
				this as unknown as import("../../main.js").NanaiAndroidMascotApp
			).elements.menuContainer.style.display = "none";
		}
		(
			this as unknown as import("../../main.js").NanaiAndroidMascotApp
		).hideQuickActionsPanel();
	},

	toggleQuickActionsPanel() {
		if (
			!(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
				.elements.quickActionsPanel
		)
			return;
		const isVisible =
			(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
				.elements.quickActionsPanel.style.display !== "none";
		(
			this as unknown as import("../../main.js").NanaiAndroidMascotApp
		).elements.quickActionsPanel.style.display = isVisible ? "none" : "flex";
	},

	hideQuickActionsPanel() {
		if (
			(this as unknown as import("../../main.js").NanaiAndroidMascotApp)
				.elements.quickActionsPanel
		) {
			(
				this as unknown as import("../../main.js").NanaiAndroidMascotApp
			).elements.quickActionsPanel.style.display = "none";
		}
	},
};
